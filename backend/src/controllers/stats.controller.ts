import { Response } from 'express';
import { getUsersCollection } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { buildUserStats, filterGamesByStatsQuery, normalizeStatsPeriod, type UserGameStat } from '../utils/gameHelpers.js';

const userProjection = {
    _id: 1,
    username: 1,
    email: 1,
    avatar_url: 1,
    current_streak: 1,
    longest_streak: 1,
    games_played: 1,
    num_achievements: 1,
    global_rank: 1,
    created_at: 1,
    games: 1,
};

export const getMyStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ ok: false, error: 'Unauthorized' });
        }

        const collection = await getUsersCollection();
        const user = await collection.findOne({ _id: userId }, { projection: userProjection });

        if (!user) {
            return res.status(404).json({ ok: false, error: 'User not found' });
        }

        const games = (user.games ?? []) as UserGameStat[];
        const period = normalizeStatsPeriod(req.query.period as string | undefined);
        const gameType = typeof req.query.gameType === 'string' ? req.query.gameType : undefined;
        const filteredGames = filterGamesByStatsQuery(games, { period, gameType });
        const stats = buildUserStats(filteredGames);

        return res.json({
            ok: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url,
                current_streak: user.current_streak,
                longest_streak: user.longest_streak,
                games_played: user.games_played,
                num_achievements: user.num_achievements,
                global_rank: user.global_rank,
                created_at: user.created_at,
            },
            filters: {
                period,
                gameType: gameType ?? null,
            },
            stats,
            history: filteredGames.sort((a, b) => new Date(b.datePlayed).getTime() - new Date(a.datePlayed).getTime()),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ ok: false, error: message });
    }
};

export const getLeaderboard = async (_req: AuthRequest, res: Response) => {
    try {
        const collection = await getUsersCollection();

        const users = await collection.find({}, {
            projection: {
                _id: 1,
                username: 1,
                avatar_url: 1,
                current_streak: 1,
                longest_streak: 1,
                games_played: 1,
                num_achievements: 1,
                global_rank: 1,
            },
        }).toArray();

        const leaderboard = users
            .sort((a, b) => {
                const gamesDiff = (b.games_played ?? 0) - (a.games_played ?? 0);
                if (gamesDiff !== 0) return gamesDiff;

                const currentDiff = (b.current_streak ?? 0) - (a.current_streak ?? 0);
                if (currentDiff !== 0) return currentDiff;

                return (b.longest_streak ?? 0) - (a.longest_streak ?? 0);
            })
            .map((user, index) => ({
                rank: index + 1,
                _id: user._id,
                username: user.username,
                avatar_url: user.avatar_url ?? null,
                current_streak: user.current_streak ?? 0,
                longest_streak: user.longest_streak ?? 0,
                games_played: user.games_played ?? 0,
                num_achievements: user.num_achievements ?? 0,
                global_rank: user.global_rank ?? 0,
            }));

        return res.json({
            ok: true,
            leaderboard,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ ok: false, error: message });
    }
};
