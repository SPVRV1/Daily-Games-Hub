import { Request, Response } from 'express';
import GameResult from '../models/gameResult.js';
import { AuthRequest } from '../middleware/auth.js';
import { computeAverages, computeStreaks } from '../utils/gameHelpers.js';

const resolvePeriodStart = (period: string) => {
    const now = new Date();

    if (period === 'day') {
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }

    if (period === 'week') {
        const currentDay = now.getUTCDay();
        const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        monday.setUTCDate(monday.getUTCDate() - diffToMonday);
        return monday;
    }

    if (period === 'month') {
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    }

    return null;
};

export const getUserStats = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const results = await GameResult.find({ user_id: userId as any }).sort({ played_at: 1 }).lean();
        const streaks = computeStreaks(results.map((r: any) => ({ played_at: r.played_at, completed: !!r.completed })));
        const averages = computeAverages(results.map((r: any) => ({
            completed: !!r.completed,
            score: Number(r.score ?? 0),
            attempts_used: r.attempts_used,
            time_seconds: r.time_seconds,
        })));

        return res.json({
            userId,
            ...streaks,
            ...averages,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const getMyStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const results = await GameResult.find({ user_id: userId as any }).sort({ played_at: 1 }).lean();
        const streaks = computeStreaks(results.map((r: any) => ({ played_at: r.played_at, completed: !!r.completed })));
        const averages = computeAverages(results.map((r: any) => ({
            completed: !!r.completed,
            score: Number(r.score ?? 0),
            attempts_used: r.attempts_used,
            time_seconds: r.time_seconds,
        })));

        return res.json({
            userId,
            ...streaks,
            ...averages,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const period = String(req.query.period ?? 'all');
        const allowedPeriods = new Set(['day', 'week', 'month', 'all']);
        if (!allowedPeriods.has(period)) {
            return res.status(400).json({ message: 'Invalid period. Use day|week|month|all' });
        }

        const rawLimit = Number(req.query.limit ?? 50);
        const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;

        const start = resolvePeriodStart(period);
        const matchStage = start ? { played_at: { $gte: start } } : {};

        const leaderboard = await GameResult.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$user_id',
                    totalScore: { $sum: '$score' },
                    gamesPlayed: { $sum: 1 },
                    completedGames: {
                        $sum: {
                            $cond: [{ $eq: ['$completed', true] }, 1, 0],
                        },
                    },
                    avgScore: { $avg: '$score' },
                },
            },
            { $sort: { totalScore: -1, avgScore: -1 } },
            { $limit: limit },
        ]);

        const ranked = leaderboard.map((entry: any, index: number) => ({
            rank: index + 1,
            userId: String(entry._id),
            totalScore: Number(entry.totalScore ?? 0),
            gamesPlayed: Number(entry.gamesPlayed ?? 0),
            completedGames: Number(entry.completedGames ?? 0),
            averageScore: Number(Number(entry.avgScore ?? 0).toFixed(2)),
        }));

        return res.json({
            period,
            limit,
            leaderboard: ranked,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
