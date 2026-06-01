import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { getLeaderboard, getMyStats } from '../../controllers/stats.controller.js';

vi.mock('../../db.js', () => ({
    getUsersCollection: vi.fn(),
}));

import { getUsersCollection } from '../../db.js';

describe('stats controller', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    const dayMs = 24 * 60 * 60 * 1000;
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const makeDate = (daysAgo: number) => new Date(today.getTime() - daysAgo * dayMs);

    beforeEach(() => {
        vi.clearAllMocks();
        mockReq = {
            query: {},
            userId: 123,
        };
        mockRes = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };
    });

    it('returns user stats from saved games', async () => {
        const collection = {
            findOne: vi.fn().mockResolvedValue({
                _id: 123,
                username: 'alice',
                email: 'alice@example.com',
                avatar_url: '/avatar.png',
                current_streak: 2,
                longest_streak: 4,
                games_played: 3,
                num_achievements: 1,
                global_rank: 7,
                created_at: new Date(),
                games: [
                    { title: 'wordle', attempts: 3, timeTaken: 60, completed: true, datePlayed: makeDate(0) },
                    { title: 'wordle', attempts: 4, timeTaken: 80, completed: false, datePlayed: makeDate(1) },
                    { title: 'flagle', attempts: 2, timeTaken: 40, completed: true, datePlayed: makeDate(2) },
                ],
            }),
        };

        (getUsersCollection as any).mockResolvedValue(collection);

        await getMyStats(mockReq as Request, mockRes as Response);

        expect(collection.findOne).toHaveBeenCalledWith({ _id: 123 }, expect.any(Object));
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            ok: true,
            user: expect.objectContaining({ username: 'alice' }),
            filters: { period: 'all', gameType: null },
            stats: expect.objectContaining({
                gamesPlayed: 3,
                completedGames: 2,
            }),
        }));

        const payload = (mockRes.json as any).mock.calls[0][0];
        expect(payload.history).toHaveLength(3);
        expect(payload.history[0].datePlayed.getTime()).toBeGreaterThan(payload.history[1].datePlayed.getTime());
    });

    it('returns sorted leaderboard users', async () => {
        const collection = {
            find: vi.fn().mockReturnValue({
                toArray: vi.fn().mockResolvedValue([
                    { _id: 2, username: 'bob', current_streak: 1, longest_streak: 2, games_played: 5, num_achievements: 0, global_rank: 0, avatar_url: null },
                    { _id: 1, username: 'alice', current_streak: 3, longest_streak: 5, games_played: 10, num_achievements: 2, global_rank: 0, avatar_url: null },
                ]),
            }),
        };

        (getUsersCollection as any).mockResolvedValue(collection);

        await getLeaderboard(mockReq as Request, mockRes as Response);

        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            ok: true,
            leaderboard: [
                expect.objectContaining({ username: 'alice', rank: 1, games_played: 10 }),
                expect.objectContaining({ username: 'bob', rank: 2, games_played: 5 }),
            ],
        }));
    });
});
