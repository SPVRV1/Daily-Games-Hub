import { describe, it, expect } from 'vitest';
import { buildUserStats, computeAverages, computePerGameStats, computeStreaks, filterGamesByStatsQuery, normalizeStatsPeriod } from '../../utils/gameHelpers.js';

describe('stats helpers', () => {
    const now = new Date('2026-05-31T12:00:00.000Z');

    const games = [
        { title: 'wordle', attempts: 3, timeTaken: 60, completed: true, datePlayed: '2026-05-31T10:00:00.000Z' },
        { title: 'wordle', attempts: 4, timeTaken: 80, completed: false, datePlayed: '2026-05-30T10:00:00.000Z' },
        { title: 'flagle', attempts: 2, timeTaken: 40, completed: true, datePlayed: '2026-05-29T10:00:00.000Z' },
    ];

    it('normalizes period values', () => {
        expect(normalizeStatsPeriod('week')).toBe('week');
        expect(normalizeStatsPeriod('invalid')).toBe('all');
    });

    it('filters by title and period', () => {
        const filtered = filterGamesByStatsQuery(games as any, { period: 'week', gameType: 'wordle' }, now);
        expect(filtered).toHaveLength(2);
    });

    it('computes streaks and averages', () => {
        expect(computeStreaks(games as any, now)).toEqual({ currentStreak: 3, longestStreak: 3 });
        expect(computeAverages(games as any)).toEqual({
            gamesPlayed: 3,
            completedGames: 2,
            completionRate: 66.67,
            averageAttempts: 3,
            averageTime: 60,
        });
    });

    it('groups per game stats', () => {
        expect(computePerGameStats(games as any)).toEqual([
            {
                title: 'wordle',
                gamesPlayed: 2,
                completedGames: 1,
                completionRate: 50,
                averageAttempts: 3.5,
                averageTime: 70,
            },
            {
                title: 'flagle',
                gamesPlayed: 1,
                completedGames: 1,
                completionRate: 100,
                averageAttempts: 2,
                averageTime: 40,
            },
        ]);
    });

    it('builds combined user stats', () => {
        expect(buildUserStats(games as any, now).gamesPlayed).toBe(3);
    });
});
