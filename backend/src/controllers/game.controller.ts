import { Request, Response } from 'express';
import GameResult from '../models/gameResult.js';
import { getTodayDate } from '../utils/gameHelpers.js';
import { GameType } from '../types/game.types.js';
import { AuthRequest } from '../middleware/auth.js';
import { GameModel as Game } from '../models/game.js';

// GET /api/games/:gameType/today
// it returns the todays chalange for specific game (there needs to be a challange in database with todays date)
export const getTodayChallenge = async (req: Request, res: Response) => {
    try {
        const { gameType } = req.params as { gameType: GameType }
        const today = getTodayDate()

        const game = await Game.findOne({ name: gameType })
        if (!game) return res.status(404).json({ message: 'Game not found' });

        const todayChallenge = game.challenges.find(c => c.date === today)
        if (!todayChallenge) return res.status(404).json({ message: 'No challenge for today' });

        res.json({ gameType, date: today, challengeData: todayChallenge.challengeData });
    } catch (error) {
        console.error('Error fetching today challenge:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
}

// GET /api/games/:gameType/date/:date
export const getChallengeByDate = async (req: Request, res: Response) => {
    try {
        const { gameType, date } = req.params as { gameType: GameType; date: string };

        const game = await Game.findOne({ name: gameType });
        if (!game) return res.status(404).json({ message: 'Game not found' });

        const challenge = game.challenges.find(c => c.date === date);
        if (!challenge) return res.status(404).json({ message: 'No challenge for that date' });

        res.json({ gameType, date, challengeData: challenge.challengeData });
    } catch (error) {
        console.error('Error fetching challenge by date:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/games/:gameType/played-today
// it checks if user has already finished the game for certian type, if he has finished then it returns the reuslts
export const getPlayedToday = async (req: AuthRequest, res: Response) => {
    try {
        const { gameType } = req.params as { gameType: GameType };
        const today = getTodayDate();

        const result = await GameResult.findOne({ userId: req.user?._id, gameType, date: today });

        res.json({ played: !!result, result: result ?? null });
    } catch (error) {
        console.error('Error fetching played today status:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// POST /api/games/:gameType/result
// saves game reuslts
export const submitResult = async (req: AuthRequest, res: Response) => {
    try {
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
    } catch (error) {
        console.error('Error submitting game result:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};