import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { createRequire } from "module";
import { GameModel } from "../models/game.js";

const require = createRequire(import.meta.url);
const countries: { name: string; population?: number }[] =
    require("../data/more-less.json");

const rounds = 5;

function pickForDate(date: string): number {
    let hash = 0;
    for (let i = 0; i < date.length; i++) {
        hash = (hash << 5) - hash + date.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function formatDate(d: Date): string {
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth()).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
}

function getItemsForDate(date: string) {
    const playable = countries.filter(
        (country) =>
            country.name &&
            typeof country.population === "number" &&
            country.population > 0
    );

    const startIndex = pickForDate(date) % playable.length;

    return Array.from({ length: rounds + 1 }, (_, index) => {
        const country = playable[(startIndex + index) % playable.length];

        return {
            name: country.name,
            value: country.population as number,
        };
    });
}

async function seed() {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI not set in .env");

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const challenges = [];

    for (let offset = -7; offset <= 60; offset++) {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + offset);
        const date = formatDate(d);

        challenges.push({
            gameType: "moreless" as const,
            date,
            challengeData: {
                challengeId: `moreless-${date}`,
                label: "Population",
                items: getItemsForDate(date),
            },
        });
    }

    const existing = await GameModel.findOne({ name: "moreless" });

    if (existing) {
        await GameModel.updateOne(
            { name: "moreless" },
            { $set: { challenges } }
        );
        console.log(`Updated More/Less with ${challenges.length} challenges`);
    } else {
        await GameModel.create({
            game_id: 6,
            name: "moreless",
            description: "Compare countries and guess which has the higher population",
            max_attempts: rounds,
            is_active: true,
            challenges,
        });
        console.log(`Created More/Less game with ${challenges.length} challenges`);
    }

    await mongoose.disconnect();
    console.log("Done");
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
