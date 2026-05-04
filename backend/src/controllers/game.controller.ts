import { Request, Response } from 'express';
//import Game from '../models/Game';
import GameResult from '../models/gameResult.js';
import { getTodayDate } from '../utils/gameHelpers.js';
import { GameType } from '../types/game.types.js';
import { AuthRequest } from '../middleware/auth.js';

// models yet not implemented
// import Game from '../models/Game';
// import DailyChallenge from '../models/DailyChallenge';
const Game = { findOne: async (_: any) => null } as any;

// GET /api/games/:gameType/today
// it returns the todays chalange for specific game (there needs to be a challange in database with todays date)
export const getTodayChallenge = async (req: Request, res: Response) => {
    const { gameType } = req.params as { gameType: GameType }
    const today = getTodayDate()

    const challenge = await Game.findOne({ gameType, date: today })
    if (!challenge) return res.status(404).json({ message: 'No challenge for today' });

    res.json({ gameType, date: today, challengeData: challenge.challengeData });
}

// GET /api/games/:gameType/played-today
// it checks if user has already finished the game for certian type, if he has finished then it returns the reuslts
export const getPlayedToday = async (req: AuthRequest, res: Response) => {
    const { gameType } = req.params as { gameType: GameType };
    const today = getTodayDate();

    const result = await GameResult.findOne({ userId: req.user?._id, gameType, date: today });

    res.json({ played: !!result, result: result ?? null });
};

// POST /api/games/:gameType/result
// saves game reuslts
export const submitResult = async (req: AuthRequest, res: Response) => {
    const { challenge_id, completed, attempts_used, correct_answers, time_seconds, score } = req.body;

    const existing = await GameResult.findOne({ user_id: req.user?._id, challenge_id });
    if (existing) return res.status(409).json({ message: 'Already submitted today' });

    const result = await GameResult.create({
        user_id: req.user?._id,
        challenge_id,
        completed,
        attempts_used,
        correct_answers,
        time_seconds,
        score,
    });

    res.status(201).json(result);
};