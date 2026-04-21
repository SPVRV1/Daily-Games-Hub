import { Request, Response } from 'express';
//import Game from '../models/Game';
import GameResult from '../models/GameResult.js';
import { getTodayDate } from '../utils/gameHelpers.js';
import { GameType } from '../types/game.types.js';

// matic AuthRequest mankja, spodaj le začasno
//import { AuthRequest } from '../middleware/auth';
interface AuthRequest extends Request {
    userId?: string;
    params: any;
}

// zamenjaj z importom ko Tjaš naredi modele, spodaj le začasno
// import Game from '../models/Game';
// import DailyChallenge from '../models/DailyChallenge';
const Game = { findOne: async (_: any) => null } as any;

// GET /api/games/:gameType/today
// Vrne današnji challenge za določeno igro 
export const getTodayChallenge = async (req: Request, res: Response) => {
    const { gameType } = req.params as { gameType: GameType }
    const today = getTodayDate()

    const challenge = await Game.findOne({ gameType, date: today })
    if (!challenge) return res.status(404).json({ message: 'No challenge for today' });

    res.json({ gameType, date: today, challengeData: challenge.challengeData });
}

// GET /api/games/:gameType/played-today
// Preveri ali je user danes že igral določeno igro, vrne rezultat če jo je
export const getPlayedToday = async (req: AuthRequest, res: Response) => {
    const { gameType } = req.params as { gameType: GameType };
    const today = getTodayDate();

    const result = await GameResult.findOne({ userId: req.userId, gameType, date: today });

    res.json({ played: !!result, result: result ?? null });
};

// POST /api/games/:gameType/result
// Shrani rezultat igre, prepreči dvojno oddajo za isti dan
export const submitResult = async (req: AuthRequest, res: Response) => {
    const { challenge_id, completed, attempts_used, correct_answers, time_seconds, score } = req.body;

    const existing = await GameResult.findOne({ user_id: req.userId, challenge_id });
    if (existing) return res.status(409).json({ message: 'Already submitted today' });

    const result = await GameResult.create({
        user_id: req.userId,
        challenge_id,
        completed,
        attempts_used,
        correct_answers,
        time_seconds,
        score,
    });

    res.status(201).json(result);
};