import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import mongoose from "mongoose";
import { GameModel } from "../models/game.js";
import { getTodayDate } from "../utils/gameHelpers.js";

async function seed() {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI missing");

    await mongoose.connect(uri);

    const answers = fs
        .readFileSync("./src/data/wordle-answers.txt", "utf-8")
        .split("\n")
        .map(w => w.trim().toUpperCase())
        .filter(Boolean);

    const validGuesses = fs
        .readFileSync("./src/data/wordle-valid-guesses.txt", "utf-8")
        .split("\n")
        .map(w => w.trim().toUpperCase())
        .filter(Boolean);

    const answer = answers[Math.floor(Math.random() * answers.length)];

    const today = getTodayDate();

    const challenges = [
        {
            gameType: "wordle",
            date: today,
            challengeData: {
                challengeId: `wordle-${today}`,
                answer,
                validGuesses,
            }
        }
    ];

    const existing = await GameModel.findOne({ name: "wordle" });

    if (existing) {
        await GameModel.updateOne(
            { name: "wordle" },
            { $set: { challenges: challenges } }
        );
    } else {
        await GameModel.create({
            game_id: 1,
            name: "wordle",
            description: "Guess the hidden word",
            max_attempts: 6,
            is_active: true,
            challenges: challenges
        });
    }

    await mongoose.disconnect();
    console.log("Wordle seeded");
}

seed().catch(console.error);