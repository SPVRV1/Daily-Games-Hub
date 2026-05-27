import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { GameModel } from "../models/game.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const songs: { id: string; title: string; artist: string; previewUrl: string }[] =
    require("../data/songless.json");

// Strip the SpotDownloader prefix from titles
function cleanTitle(title: string): string {
    return title.replace(/^\[SPOTDOWNLOADER\.COM\]\s*/i, "").trim();
}

// Deterministic pick per date (same algorithm as Flagle seed)
function pickForDate(date: string): number {
    let hash = 0;
    for (let i = 0; i < date.length; i++) {
        hash = (hash << 5) - hash + date.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// Matches getTodayDate() format in gameHelpers.ts (0-indexed month, no +1)
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

    // Build the allSongs list once (cleaned titles)
    const allSongs = songs.map((s) => ({
        title: cleanTitle(s.title),
        artist: s.artist,
    }));

    // Generate challenges: 7 days back + today + 60 days ahead
    const challenges = [];
    for (let offset = -7; offset <= 60; offset++) {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + offset);
        const date = formatDate(d);
        const song = songs[pickForDate(date) % songs.length];

        challenges.push({
            gameType: "songless",
            date,
            challengeData: {
                challengeId: `songless-${date}`,
                previewUrl: song.previewUrl,
                title: cleanTitle(song.title),
                artist: song.artist,
                allSongs,
            },
        });
    }

    const existing = await GameModel.findOne({ name: "songless" });

    const existingDates = new Set(
        existing?.challenges.map((c) => c.date) ?? []
    );

    const newChallenges = challenges.filter((c) => !existingDates.has(c.date));

    if (existing) {
        await GameModel.updateOne(
            { name: "songless" },
            { $push: { challenges: { $each: newChallenges } } }
        );
        console.log(`Added ${newChallenges.length} new Songless challenges`);
    } else {
        await GameModel.create({
            game_id: 6,
            name: "songless",
            description: "Guess the song from a short snippet",
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
