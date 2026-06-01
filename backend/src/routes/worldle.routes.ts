import { Router } from "express";
import GameResult from "../models/gameResult.js";
import { getTodayDate } from "../utils/gameHelpers.js";
import { generateWorldleChallenge } from "../utils/worldle.js";

const router = Router();
const gameResults = GameResult.collection;

router.get("/worldle/today", (_req, res) => {
    res.json(generateWorldleChallenge(getTodayDate()));
});

router.get("/worldle/date/:date", (req, res) => {
    res.json(generateWorldleChallenge(req.params.date));
});

router.get("/worldle/played-today", async (req, res) => {
    const today = getTodayDate();
    const result = await gameResults.findOne({
        user_id: req.user?._id,
        gameType: "worldle",
        challenge_id: today,
    });

    res.json({ played: !!result, result: result ?? null });
});

router.post("/worldle/result", async (req, res) => {
    const today = getTodayDate();
    const {
        challenge_id,
        completed,
        attempts_used,
        correct_answers,
        time_seconds,
        score,
    } = req.body;

    const resolvedChallengeId =
        typeof challenge_id === "string" && challenge_id.trim() !== ""
            ? challenge_id.trim()
            : today;

    const existing = await gameResults.findOne({
        user_id: req.user?._id,
        gameType: "worldle",
        challenge_id: resolvedChallengeId,
    });

    if (existing) {
        return res.status(409).json({ message: "Already submitted today" });
    }

    const inserted = await gameResults.insertOne({
        user_id: req.user?._id,
        gameType: "worldle",
        challenge_id: resolvedChallengeId,
        completed,
        attempts_used,
        correct_answers,
        time_seconds,
        score: typeof score === "number" ? score : 0,
    });

    return res.status(201).json({
        _id: inserted.insertedId,
        user_id: req.user?._id,
        gameType: "worldle",
        challenge_id: resolvedChallengeId,
        completed,
        attempts_used,
        correct_answers,
        time_seconds,
        score: typeof score === "number" ? score : 0,
    });
});

export default router;
