import { Router } from "express";
import GameResult from "../models/gameResult.js";
import { getTodayDate } from "../utils/gameHelpers.js";
import { generateWorldleChallenge } from "../utils/worldle.js";
import { verifyToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/worldle/today", (_req, res) => {
    res.json(generateWorldleChallenge(getTodayDate()));
});

router.get("/worldle/date/:date", (req, res) => {
    res.json(generateWorldleChallenge(req.params.date));
});

router.get("/worldle/played-today", verifyToken, async (req: AuthRequest, res) => {
    const today = getTodayDate();

    const result = await GameResult.findOne({
        user_id: req.userId,
        gameType: "worldle",
        challenge_id: today,
    });

    res.json({ played: !!result, result: result ?? null });
});

router.post("/worldle/result", verifyToken, async (req: AuthRequest, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

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

    const existing = await GameResult.findOne({
        user_id: req.userId,
        gameType: "worldle",
        challenge_id: resolvedChallengeId,
    });

    if (existing) {
        return res.status(409).json({ message: "Already submitted today" });
    }

    const result = await GameResult.create({
        user_id: req.userId,
        gameType: "worldle",
        challenge_id: resolvedChallengeId,
        completed,
        attempts_used,
        correct_answers,
        time_seconds,
        score: typeof score === "number" ? score : 0,
    });

    return res.status(201).json(result);
});

export default router;
