import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { GameModel } from "../models/game.js";
import { type IGameChallange } from "../types/game.types.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const countries: { id: string; name: string; cca2: string }[] =
    require("../data/countries.json");

// Deterministic pick per date so the same country always shows for a given day
function pickForDate(date: string): number {
    let hash = 0;
    for (let i = 0; i < date.length; i++) {
        hash = (hash << 5) - hash + date.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// Matches getTodayDate() format in gameHelpers.ts (0-indexed month)
function formatDate(d: Date): string {
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth()).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
}

async function seed() {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI not set in .env");

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // Only use sovereign/recognised nations that have coordinates in the frontend map
    const knownCoords = new Set(["af","al","dz","ad","ao","ag","ar","am","au","at","az","bs","bh","bd","bb","by","be","bz","bj","bt","bo","ba","bw","br","bn","bg","bf","bi","cv","kh","cm","ca","cf","td","cl","cn","co","km","cd","cg","cr","ci","hr","cu","cy","cz","dk","dj","dm","do","ec","eg","sv","gq","er","ee","sz","et","fj","fi","fr","ga","gm","ge","de","gh","gr","gd","gt","gn","gw","gy","ht","hn","hu","is","in","id","ir","iq","ie","il","it","jm","jp","jo","kz","ke","ki","kw","kg","la","lv","lb","ls","lr","ly","li","lt","lu","mg","mw","my","mv","ml","mt","mh","mr","mu","mx","fm","md","mc","mn","me","ma","mz","mm","na","nr","np","nl","nz","ni","ne","ng","no","om","pk","pw","pa","pg","py","pe","ph","pl","pt","qa","ro","ru","rw","kn","lc","vc","ws","sm","st","sa","sn","rs","sc","sl","sg","sk","si","sb","so","za","ss","es","lk","sd","sr","se","ch","sy","tw","tj","tz","th","tl","tg","to","tt","tn","tr","tm","tv","ug","ua","ae","gb","us","uy","uz","vu","ve","vn","ye","zm","zw","kr","kp","mk","xk","ps","va","gl"]);
    const playable = countries.filter((c) => c.cca2 && c.name && knownCoords.has(c.cca2.toLowerCase()));
    const validCountries = playable.map((country) => ({
        name: country.name,
        code: country.cca2.toLowerCase(),
    }));

    // Generate challenges: 7 days back + today + 60 days ahead
    const challenges: IGameChallange[] = [];
    for (let offset = -7; offset <= 60; offset++) {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + offset);
        const date = formatDate(d);
        const country = playable[pickForDate(date) % playable.length];

        challenges.push({
            gameType: "flagle",
            date,
            challengeData: {
                challengeId: `flagle-${date}`,
                country: country.name,
                countryCode: country.cca2.toLowerCase(),
                flagUrl: `https://flagcdn.com/w320/${country.cca2.toLowerCase()}.png`,
                validCountries,
            },
        });
    }

    const existing = await GameModel.findOne({ name: "flagle" });

    // Dates that already exist with a valid country code — skip these
    const validExistingDates = new Set(
        existing?.challenges
            .filter((c) => knownCoords.has((c.challengeData as any).countryCode))
            .map((c) => c.date) ?? []
    );

    const newChallenges = challenges.filter((c) => !validExistingDates.has(c.date));

    if (existing) {
        // Remove any challenges with territory country codes first
        await GameModel.updateOne(
            { name: "flagle" },
            { $pull: { challenges: { "challengeData.countryCode": { $nin: [...knownCoords] } } } }
        );
        await GameModel.updateOne(
            { name: "flagle" },
            { $push: { challenges: { $each: newChallenges } } }
        );
        console.log(`Added/replaced ${newChallenges.length} Flagle challenges`);
    } else {
        await GameModel.create({
            game_id: 2,
            name: "flagle",
            description: "Identify the country from its flag",
            max_attempts: 6,
            is_active: true,
            challenges: newChallenges,
        });
        console.log(`Created Flagle game with ${newChallenges.length} challenges`);
    }

    await mongoose.disconnect();
    console.log("Done");
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
