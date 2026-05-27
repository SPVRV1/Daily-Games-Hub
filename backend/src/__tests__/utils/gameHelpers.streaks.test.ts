import { describe, it, expect } from 'vitest';
import { computeAverages, computeStreaks } from '../../utils/gameHelpers.js';

const dateDaysAgo = (n: number) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString();
};

describe('computeStreaks', () => {
    it('returns zeros for empty input', () => {
        expect(computeStreaks([])).toEqual({ currentStreak: 0, longestStreak: 0 });
    });

    it('single completed today => current 1, longest 1', () => {
        const res = [{ played_at: dateDaysAgo(0), completed: true }];
        expect(computeStreaks(res)).toEqual({ currentStreak: 1, longestStreak: 1 });
    });

    it('consecutive 4 days ending today', () => {
        const res = [0, 1, 2, 3].map((d) => ({ played_at: dateDaysAgo(d), completed: true }));
        expect(computeStreaks(res)).toEqual({ currentStreak: 4, longestStreak: 4 });
    });

    it('break in middle and not played earlier than yesterday', () => {
        const res = [0, 1, 3, 4].map((d) => ({ played_at: dateDaysAgo(d), completed: true }));
        // dates: today(0), yesterday(1) => current 2; sequences [3,4] => longest 2
        expect(computeStreaks(res)).toEqual({ currentStreak: 2, longestStreak: 2 });
    });

    it('no play today => current 0, longest computed', () => {
        const res = [2, 3, 4].map((d) => ({ played_at: dateDaysAgo(d), completed: true }));
        expect(computeStreaks(res)).toEqual({ currentStreak: 0, longestStreak: 3 });
    });
});

describe('computeAverages', () => {
    it('returns zeros on empty input', () => {
        expect(computeAverages([])).toEqual({
            gamesPlayed: 0,
            completedGames: 0,
            completionRate: 0,
            averageScore: 0,
            averageAttempts: 0,
            averageTimeSeconds: 0,
        });
    });

    it('computes aggregate averages and completion rate', () => {
        const res = [
            { completed: true, score: 100, attempts_used: 2, time_seconds: 30 },
            { completed: false, score: 50, attempts_used: 4, time_seconds: 45 },
            { completed: true, score: 150 },
        ];

        expect(computeAverages(res)).toEqual({
            gamesPlayed: 3,
            completedGames: 2,
            completionRate: 66.67,
            averageScore: 100,
            averageAttempts: 3,
            averageTimeSeconds: 37.5,
        });
    });
});
