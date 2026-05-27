import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { getLeaderboard, getUserStats } from '../../controllers/stats.controller.js';

vi.mock('../../models/gameResult.js', () => ({
    default: {
        find: vi.fn(),
        aggregate: vi.fn(),
    },
}));

import GameResult from '../../models/gameResult.js';

describe('Stats Controller', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockReq = {};
        mockRes = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };
    });

    it('getUserStats returns aggregated stats for user', async () => {
        mockReq.params = { userId: 'u1' } as any;

        const sort = vi.fn().mockReturnThis();
        const lean = vi.fn().mockResolvedValue([
            { played_at: new Date(), completed: true, score: 100, attempts_used: 2, time_seconds: 30 },
            { played_at: new Date(), completed: false, score: 50, attempts_used: 4, time_seconds: 45 },
        ]);

        (GameResult.find as any).mockReturnValue({ sort, lean });

        await getUserStats(mockReq as Request, mockRes as Response);

        expect(GameResult.find).toHaveBeenCalledWith({ user_id: 'u1' });
        expect(mockRes.json).toHaveBeenCalled();
        const payload = (mockRes.json as any).mock.calls[0][0];
        expect(payload.userId).toBe('u1');
        expect(payload.gamesPlayed).toBe(2);
        expect(payload.averageScore).toBe(75);
    });

    it('getLeaderboard returns ranked list', async () => {
        mockReq.query = { period: 'all', limit: '2' } as any;

        (GameResult.aggregate as any).mockResolvedValue([
            { _id: 'u1', totalScore: 300, gamesPlayed: 3, completedGames: 2, avgScore: 100 },
            { _id: 'u2', totalScore: 250, gamesPlayed: 4, completedGames: 3, avgScore: 62.5 },
        ]);

        await getLeaderboard(mockReq as Request, mockRes as Response);

        expect(GameResult.aggregate).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({
            period: 'all',
            limit: 2,
            leaderboard: [
                {
                    rank: 1,
                    userId: 'u1',
                    totalScore: 300,
                    gamesPlayed: 3,
                    completedGames: 2,
                    averageScore: 100,
                },
                {
                    rank: 2,
                    userId: 'u2',
                    totalScore: 250,
                    gamesPlayed: 4,
                    completedGames: 3,
                    averageScore: 62.5,
                },
            ],
        });
    });
});
