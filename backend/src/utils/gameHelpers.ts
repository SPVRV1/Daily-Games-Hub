export const getTodayDate = (): string => {
    const d = new Date();
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth()).padStart(2, '0');
    const year = d.getUTCFullYear()
    return `${day}-${month}-${year}`
}

type MathOperator = '+' | '-' | '*';
export type MathSprintDifficulty = 'easy' | 'medium' | 'hard';
const MATH_SPRINT_QUESTIONS_PER_ROUND = 15;

const mathSprintDifficultyOperators: Record<MathSprintDifficulty, MathOperator[]> = {
    easy: ['+'],
    medium: ['+', '-'],
    hard: ['+', '-', '*'],
};

export const normalizeMathSprintDifficulty = (difficulty?: string): MathSprintDifficulty | null => {
    if (difficulty === undefined || difficulty === null || difficulty === '') {
        return 'easy';
    }

    if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
        return difficulty;
    }

    return null;
};

export interface MathSprintQuestion {
    id: number;
    left: number;
    right: number;
    operator: MathOperator;
    expression: string;
    answer: number;
}

export interface MathSprintChallenge {
    challenge_id: string;
    gameType: 'mathsprint';
    date: string;
    difficulty: MathSprintDifficulty;
    challengeData: {
        title: string;
        difficulty: MathSprintDifficulty;
        total_questions: number;
        time_limit_seconds: number;
        questions: MathSprintQuestion[];
    };
}

export const generateMathSprintChallengeId = (date: string, difficulty: MathSprintDifficulty): string => {
    let state = 2166136261;
    const seed = `mathsprint:${date}:${difficulty}`;

    for (let index = 0; index < seed.length; index += 1) {
        state ^= seed.charCodeAt(index);
        state = Math.imul(state, 16777619);
    }

    const hex = (state >>> 0).toString(16).padStart(8, '0');
    return `${hex}${hex}${hex}`;
};

const createSeededRandom = (seed: string) => {
    let state = 0;

    for (let index = 0; index < seed.length; index += 1) {
        state = (state * 31 + seed.charCodeAt(index)) >>> 0;
    }

    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
    };
};

const randomInt = (random: () => number, min: number, max: number) => {
    return Math.floor(random() * (max - min + 1)) + min;
};

const pickOperator = (random: () => number, difficulty: MathSprintDifficulty): MathOperator => {
    const operators = mathSprintDifficultyOperators[difficulty];
    return operators[Math.floor(random() * operators.length)];
};

const buildQuestion = (id: number, random: () => number, difficulty: MathSprintDifficulty): MathSprintQuestion => {
    const operator = pickOperator(random, difficulty);

    if (operator === '+') {
        const left = randomInt(random, 5, 25);
        const right = randomInt(random, 5, 25);

        return {
            id,
            left,
            right,
            operator,
            expression: `${left} + ${right}`,
            answer: left + right,
        };
    }

    if (operator === '-') {
        const left = randomInt(random, 10, 40);
        const right = randomInt(random, 1, left);

        return {
            id,
            left,
            right,
            operator,
            expression: `${left} - ${right}`,
            answer: left - right,
        };
    }

    const left = randomInt(random, 2, 12);
    const right = randomInt(random, 2, 12);

    return {
        id,
        left,
        right,
        operator,
        expression: `${left} * ${right}`,
        answer: left * right,
    };
};

export const generateMathSprintChallenge = (date: string, difficulty: MathSprintDifficulty = 'easy'): MathSprintChallenge => {
    const random = createSeededRandom(`mathsprint:${date}:${difficulty}`);
    const questions = Array.from({ length: MATH_SPRINT_QUESTIONS_PER_ROUND }, (_, index) => buildQuestion(index + 1, random, difficulty));

    return {
        challenge_id: generateMathSprintChallengeId(date, difficulty),
        gameType: 'mathsprint',
        date,
        difficulty,
        challengeData: {
            title: 'Math Sprint',
            difficulty,
            total_questions: MATH_SPRINT_QUESTIONS_PER_ROUND,
            time_limit_seconds: 60,
            questions,
        },
    };
};

export type UserGameStat = {
    title: string;
    attempts: number;
    timeTaken: number;
    completed: boolean;
    datePlayed: Date | string;
};

export type StatsPeriod = 'day' | 'week' | 'month' | 'all';

export type UserStatsFilters = {
    period?: StatsPeriod;
    gameType?: string;
};

const startOfDay = (date: Date) => {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
};

export const normalizeStatsPeriod = (period?: string): StatsPeriod => {
    if (period === 'day' || period === 'week' || period === 'month' || period === 'all') {
        return period;
    }

    return 'all';
};

export const getPeriodStart = (period: StatsPeriod, now = new Date()) => {
    if (period === 'day') {
        return startOfDay(now);
    }

    if (period === 'week') {
        const day = now.getDay();
        const offset = day === 0 ? -6 : 1 - day;
        const monday = startOfDay(now);
        monday.setDate(monday.getDate() + offset);
        return monday;
    }

    if (period === 'month') {
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return null;
};

export const filterGamesByStatsQuery = (
    games: UserGameStat[],
    filters: UserStatsFilters = {},
    now = new Date(),
) => {
    const normalizedPeriod = filters.period ?? 'all';
    const titleFilter = filters.gameType?.trim().toLowerCase();
    const periodStart = getPeriodStart(normalizedPeriod, now);

    return games.filter((game) => {
        const playedAt = new Date(game.datePlayed);
        const matchesPeriod = periodStart ? playedAt >= periodStart : true;
        const matchesTitle = titleFilter ? game.title.toLowerCase() === titleFilter : true;

        return matchesPeriod && matchesTitle;
    });
};

const toLocalDayKey = (date: Date | string) => {
    const value = typeof date === 'string' ? new Date(date) : date;
    return startOfDay(value).getTime();
};

export const computeStreaks = (games: UserGameStat[], now = new Date()) => {
    if (!games || games.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    const uniqueDays = Array.from(
        new Set(games.map((game) => toLocalDayKey(game.datePlayed))),
    ).sort((a, b) => a - b);

    if (uniqueDays.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    const oneDay = 24 * 60 * 60 * 1000;
    let longestStreak = 1;
    let currentRun = 1;

    for (let index = 1; index < uniqueDays.length; index += 1) {
        if (uniqueDays[index] - uniqueDays[index - 1] === oneDay) {
            currentRun += 1;
            longestStreak = Math.max(longestStreak, currentRun);
        } else {
            currentRun = 1;
        }
    }

    const today = startOfDay(now).getTime();
    const yesterday = today - oneDay;
    const lastDay = uniqueDays[uniqueDays.length - 1];

    let currentStreak = 0;
    if (lastDay === today || lastDay === yesterday) {
        currentStreak = 1;
        let cursor = lastDay;

        for (let index = uniqueDays.length - 2; index >= 0; index -= 1) {
            cursor -= oneDay;

            if (uniqueDays[index] === cursor) {
                currentStreak += 1;
            } else {
                break;
            }
        }
    }

    return { currentStreak, longestStreak };
};

export const computeAverages = (games: UserGameStat[]) => {
    if (!games || games.length === 0) {
        return {
            gamesPlayed: 0,
            completedGames: 0,
            completionRate: 0,
            averageAttempts: 0,
            averageTime: 0,
        };
    }

    const gamesPlayed = games.length;
    const completedGames = games.filter((game) => game.completed).length;
    const totalAttempts = games.reduce((sum, game) => sum + Number(game.attempts ?? 0), 0);
    const totalTime = games.reduce((sum, game) => sum + Number(game.timeTaken ?? 0), 0);

    return {
        gamesPlayed,
        completedGames,
        completionRate: Number(((completedGames / gamesPlayed) * 100).toFixed(2)),
        averageAttempts: Number((totalAttempts / gamesPlayed).toFixed(2)),
        averageTime: Number((totalTime / gamesPlayed).toFixed(2)),
    };
};

export const computePerGameStats = (games: UserGameStat[]) => {
    const map = new Map<string, { attempts: number; timeTaken: number; gamesPlayed: number; completedGames: number }>();

    for (const game of games) {
        const key = game.title;
        const entry = map.get(key) ?? { attempts: 0, timeTaken: 0, gamesPlayed: 0, completedGames: 0 };

        entry.attempts += Number(game.attempts ?? 0);
        entry.timeTaken += Number(game.timeTaken ?? 0);
        entry.gamesPlayed += 1;
        entry.completedGames += game.completed ? 1 : 0;

        map.set(key, entry);
    }

    return Array.from(map.entries())
        .map(([title, entry]) => ({
            title,
            gamesPlayed: entry.gamesPlayed,
            completedGames: entry.completedGames,
            completionRate: Number(((entry.completedGames / entry.gamesPlayed) * 100).toFixed(2)),
            averageAttempts: Number((entry.attempts / entry.gamesPlayed).toFixed(2)),
            averageTime: Number((entry.timeTaken / entry.gamesPlayed).toFixed(2)),
        }))
        .sort((a, b) => b.gamesPlayed - a.gamesPlayed);
};

export const buildUserStats = (games: UserGameStat[], now = new Date()) => {
    const streaks = computeStreaks(games, now);
    const averages = computeAverages(games);
    const perGame = computePerGameStats(games);

    return {
        ...streaks,
        ...averages,
        perGame,
    };
};