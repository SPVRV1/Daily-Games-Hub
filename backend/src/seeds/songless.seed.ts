import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { GameModel } from "../models/game.js";
import { type IGameChallange } from "../types/game.types.js";

// Songs that have actual audio files in src/data/music/
const SONGS = [
    {
        title: "(It Goes Like) Nanana",
        artist: "Peggy Gou",
        previewUrl: "/audio/songless/%28It%20Goes%20Like%29%20Nanana%20-%20Edit.mp3",
    },
    {
        title: "I Gotta Feeling",
        artist: "The Black Eyed Peas",
        previewUrl: "/audio/songless/I%20Gotta%20Feeling.mp3",
    },
    {
        title: "Prada",
        artist: "cassö, RAYE, D-Block Europe",
        previewUrl: "/audio/songless/Prada%20%28feat.%20D-Block%20Europe%29%20-%20Valexus%20Remix.mp3",
    },
    {
        title: "The Rhythm of the Night",
        artist: "Corona",
        previewUrl: "/audio/songless/The%20Rhythm%20of%20the%20Night.mp3",
    },
    {
        title: "Titanium",
        artist: "David Guetta ft. Sia",
        previewUrl: "/audio/songless/Titanium%20%28feat.%20Sia%29%20-%20David%20Guetta%20%26%20MORTEN%20Future%20Rave%20Remix.mp3",
    },
    {
        title: "Gorenjska ljubljena",
        artist: "Ansambel Roka Žlindre",
        previewUrl: "/audio/songless/%5BSPOTDOWNLOADER.COM%5D%20Gorenjska%20ljubljena.mp3",
    },
    {
        title: "Moje sonce",
        artist: "Magnifico",
        previewUrl: "/audio/songless/%5BSPOTDOWNLOADER.COM%5D%20Moje%20sonce.mp3",
    },
    {
        title: "Siva pot",
        artist: "Terrafolk",
        previewUrl: "/audio/songless/%5BSPOTDOWNLOADER.COM%5D%20Siva%20pot.mp3",
    },
    {
        title: "Soba 102",
        artist: "Joker Out",
        previewUrl: "/audio/songless/%5BSPOTDOWNLOADER.COM%5D%20Soba%20102.mp3",
    },
];

// All songs shown in the autocomplete (title + artist, no previewUrl needed)
const ALL_SONGS = SONGS.map(({ title, artist }) => ({ title, artist }));

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

    // Generate challenges: 7 days back + today + 60 days ahead
    const challenges: IGameChallange[] = [];
    for (let offset = -7; offset <= 60; offset++) {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + offset);
        const date = formatDate(d);
        const song = SONGS[pickForDate(date) % SONGS.length];

        challenges.push({
            gameType: "songless",
            date,
            challengeData: {
                challengeId: `songless-${date}`,
                previewUrl: song.previewUrl,
                title: song.title,
                artist: song.artist,
                allSongs: ALL_SONGS,
            },
        });
    }

    const existing = await GameModel.findOne({ name: "songless" });
    const existingDates = new Set(existing?.challenges.map((c) => c.date) ?? []);
    const newChallenges = challenges.filter((c) => !existingDates.has(c.date));

    if (existing) {
        await GameModel.updateOne(
            { name: "songless" },
            { $push: { challenges: { $each: newChallenges } } }
        );
        console.log(`Added ${newChallenges.length} Songless challenges`);
    } else {
        await GameModel.create({
            game_id: 6,
            name: "songless",
            description: "Guess the song from a short audio snippet",
            max_attempts: 6,
            is_active: true,
            challenges: newChallenges,
        });
        console.log(`Created Songless game with ${newChallenges.length} challenges`);
    }

    await mongoose.disconnect();
    console.log("Done");
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
