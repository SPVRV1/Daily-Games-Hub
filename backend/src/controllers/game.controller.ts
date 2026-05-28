import { Request, Response } from 'express';
import GameResult from '../models/gameResult.js';
import { generateMathSprintChallenge, generateMathSprintChallengeId, getTodayDate, normalizeMathSprintDifficulty, generateSonglessChallenge } from '../utils/gameHelpers.js';
import { GameType } from '../types/game.types.js';
import { AuthRequest } from '../middleware/auth.js';
import { GameModel as Game } from '../models/game.js';

// GET /api/games/:gameType/today
export const getTodayChallenge = async (req: Request, res: Response) => {
    try {
        const { gameType } = req.params as { gameType: GameType };
        const today = (req.query.date as string) || getTodayDate()

        if (gameType === 'mathsprint') {
            const difficulty = normalizeMathSprintDifficulty(req.query.difficulty as string | undefined);
            if (!difficulty) return res.status(400).json({ message: 'Invalid difficulty' });
            return res.json(generateMathSprintChallenge(today, difficulty));
        }

        if (gameType === 'songless') {
            return res.json(generateSonglessChallenge(today));
        }

        const game = await Game.findOne({ name: gameType });
        if (!game) return res.status(404).json({ message: 'Game not found' });

        const todayChallenge = game.challenges.find(c => c.date === today);
        if (!todayChallenge) return res.status(404).json({ message: 'No challenge for today' });

        res.json({ gameType, date: today, challengeData: todayChallenge.challengeData });
    } catch (error) {
        console.error('Error fetching today challenge:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// GET /api/games/:gameType/date/:date
export const getChallengeByDate = async (req: Request, res: Response) => {
    try {
        const { gameType, date } = req.params as { gameType: GameType; date: string };

        if (gameType === 'songless') {
            return res.json(generateSonglessChallenge(date));
        }

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
export const getPlayedToday = async (req: AuthRequest, res: Response) => {
    try {
        const { gameType } = req.params as { gameType: GameType };
        const today = getTodayDate();

        let result;

        if (gameType === 'mathsprint') {
            const difficulty = normalizeMathSprintDifficulty(req.query.difficulty as string | undefined);
            if (!difficulty) return res.status(400).json({ message: 'Invalid difficulty' });
            const challengeId = generateMathSprintChallengeId(today, difficulty);
            result = await GameResult.findOne({ user_id: req.user?._id, challenge_id: challengeId });
        } else if (gameType === 'songless') {
            const challengeId = `songless-${today}`;
            result = await GameResult.findOne({ user_id: req.user?._id, challenge_id: challengeId });
        } else {
            result = await GameResult.findOne({ userId: req.user?._id, gameType, date: today } as any);
        }

        res.json({ played: !!result, result: result ?? null });
    } catch (error) {
        console.error('Error fetching played today status:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// POST /api/games/:gameType/result
export const submitResult = async (req: AuthRequest, res: Response) => {
    try {
        const { gameType } = req.params as { gameType: GameType };
        const today = getTodayDate();
        const { challenge_id, completed, attempts_used, correct_answers, time_seconds, score, difficulty: rawDifficulty } = req.body;

        const difficulty = gameType === 'mathsprint' ? normalizeMathSprintDifficulty(rawDifficulty) : undefined;
        if (gameType === 'mathsprint' && !difficulty) return res.status(400).json({ message: 'Invalid difficulty' });

        const resolvedDifficulty = difficulty ?? undefined;

        let resolvedChallengeId: string;
        if (gameType === 'mathsprint') {
            resolvedChallengeId = generateMathSprintChallengeId(today, resolvedDifficulty as 'easy' | 'medium' | 'hard');
            if (challenge_id && challenge_id !== resolvedChallengeId) {
                return res.status(400).json({ message: 'Challenge id does not match difficulty' });
            }
        } else if (gameType === 'songless') {
            resolvedChallengeId = `songless-${today}`;
        } else {
            resolvedChallengeId = challenge_id;
        }

        const existing = await GameResult.findOne({ user_id: req.user?._id, challenge_id: resolvedChallengeId });
        if (existing) return res.status(409).json({ message: 'Already submitted today' });

        let finalScore = typeof score === 'number' ? score : 0;
        if (gameType === 'mathsprint') {
            const challenge = generateMathSprintChallenge(today);
            const timeLimit = challenge.challengeData.time_limit_seconds ?? 60;
            const correct = Number(correct_answers ?? 0);
            const timeUsed = Number(time_seconds ?? timeLimit);
            const base = correct * 100;
            const timeFactor = Math.max(0, (timeLimit - Math.min(timeUsed, timeLimit)) / timeLimit);
            const timeBonus = Math.round(timeFactor * 50);
            finalScore = base + timeBonus;
        }

        const result = await GameResult.create({
            user_id: req.user?._id,
            challenge_id: resolvedChallengeId,
            difficulty: resolvedDifficulty,
            completed,
            attempts_used,
            correct_answers,
            time_seconds,
            score: finalScore,
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error submitting game result:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};