import { Request, Response } from 'express';
import GameResult from '../models/gameResult.js';
import { generateMathSprintChallenge, generateMathSprintChallengeId, getTodayDate } from '../utils/gameHelpers.js';
import { GameType } from '../types/game.types.js';
import { AuthRequest } from '../middleware/auth.js';
import { GameModel as Game } from '../models/game.js';

// GET /api/games/:gameType/today
// it returns the todays chalange for specific game (there needs to be a challange in database with todays date)
export const getTodayChallenge = async (req: Request, res: Response) => {
    try {
        const { gameType } = req.params as { gameType: GameType }
        const today = getTodayDate()

        if (gameType === 'mathsprint') {
            return res.json(generateMathSprintChallenge(today));
        }

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

// GET /api/games/:gameType/played-today
// it checks if user has already finished the game for certian type, if he has finished then it returns the reuslts
export const getPlayedToday = async (req: AuthRequest, res: Response) => {
    try {
        const { gameType } = req.params as { gameType: GameType };
        const today = getTodayDate();

        let result;

        if (gameType === 'mathsprint') {
            const challengeId = generateMathSprintChallengeId(today);
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
// saves game reuslts
export const submitResult = async (req: AuthRequest, res: Response) => {
    try {
        const { gameType } = req.params as { gameType: GameType };
        const today = getTodayDate();
        const { challenge_id, completed, attempts_used, correct_answers, time_seconds, score } = req.body;
        const resolvedChallengeId = gameType === 'mathsprint'
            ? generateMathSprintChallengeId(today)
            : challenge_id;

        const existing = gameType === 'mathsprint'
            ? await GameResult.findOne({ user_id: req.user?._id, challenge_id: resolvedChallengeId })
            : await GameResult.findOne({ user_id: req.user?._id, challenge_id });

        if (existing) return res.status(409).json({ message: 'Already submitted today' });

        // Compute authoritative score for mathsprint: primary factor = correct answers, secondary = time bonus
        let finalScore = typeof score === 'number' ? score : 0;
        if (gameType === 'mathsprint') {
            const challenge = generateMathSprintChallenge(today);
            const timeLimit = challenge.challengeData.time_limit_seconds ?? 60;
            const correct = Number(correct_answers ?? 0);
            const timeUsed = Number(time_seconds ?? timeLimit);

            const base = correct * 100; // 100 points per correct answer
            const timeFactor = Math.max(0, (timeLimit - Math.min(timeUsed, timeLimit)) / timeLimit);
            const timeBonus = Math.round(timeFactor * 50); // up to 50 bonus points for speed

            finalScore = base + timeBonus;
        }

        const result = await GameResult.create({
            user_id: req.user?._id,
            challenge_id: resolvedChallengeId,
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