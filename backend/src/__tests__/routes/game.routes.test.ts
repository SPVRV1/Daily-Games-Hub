import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../models/gameResult.js", () => ({
    default: {
        collection: {
            findOne: vi.fn(),
            insertOne: vi.fn(),
        },
    },
}));

vi.mock("../../utils/gameHelpers.js", () => ({
    getTodayDate: vi.fn(() => "18-05-2026"),
    generateMathSprintChallenge: vi.fn(),
    generateMathSprintChallengeId: vi.fn(),
    normalizeMathSprintDifficulty: vi.fn(),
}));

vi.mock("../../utils/worldle.js", () => ({
    generateWorldleChallenge: vi.fn((date: string) => ({
        gameType: "worldle",
        date,
        challengeData: {
            challengeId: `worldle-${date}`,
            answer: "Slovenia",
            countryCode: "svn",
            validCountries: ["Slovenia", "Croatia"],
            silhouette: "M0 0 L1 1 Z",
        },
    })),
}));

import GameResult from "../../models/gameResult.js";
import worldleRoutes from "../../routes/worldle.routes.js";
import { generateWorldleChallenge } from "../../utils/worldle.js";

const app = express();
app.use(express.json());
app.use("/api/games", worldleRoutes);

describe("Worldle routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("serves Worldle today without the database", async () => {
        const response = await request(app).get("/api/games/worldle/today");

        expect(response.status).toBe(200);
        expect(generateWorldleChallenge).toHaveBeenCalledWith("18-05-2026");
        expect(response.body).toEqual({
            gameType: "worldle",
            date: "18-05-2026",
            challengeData: {
                challengeId: "worldle-18-05-2026",
                answer: "Slovenia",
                countryCode: "svn",
                validCountries: ["Slovenia", "Croatia"],
                silhouette: "M0 0 L1 1 Z",
            },
        });
    });

    it("returns Worldle played state from the result store", async () => {
        (GameResult.collection.findOne as any).mockResolvedValue({
            _id: "result-1",
            challenge_id: "18-05-2026",
        });

        const response = await request(app).get(
            "/api/games/worldle/played-today",
        );

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            played: true,
            result: {
                _id: "result-1",
                challenge_id: "18-05-2026",
            },
        });
    });

    it("stores a Worldle result using the current challenge id", async () => {
        (GameResult.collection.findOne as any).mockResolvedValue(null);
        (GameResult.collection.insertOne as any).mockResolvedValue({
            insertedId: "result-1",
        });

        const response = await request(app)
            .post("/api/games/worldle/result")
            .send({
                challenge_id: "18-05-2026",
                completed: true,
                attempts_used: 3,
                correct_answers: 1,
                time_seconds: 0,
                score: 100,
            });

        expect(response.status).toBe(201);
        expect(GameResult.collection.insertOne).toHaveBeenCalledWith({
            user_id: undefined,
            gameType: "worldle",
            challenge_id: "18-05-2026",
            completed: true,
            attempts_used: 3,
            correct_answers: 1,
            time_seconds: 0,
            score: 100,
        });
    });
});
