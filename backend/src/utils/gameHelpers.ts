export const getTodayDate = (): string => {
    const d = new Date();
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth()).padStart(2, '0');
    const year = d.getUTCFullYear()
    return `${day}-${month}-${year}`
}

type MathOperator = '+' | '-' | '*';
export type MathSprintDifficulty = 'easy' | 'medium' | 'hard';

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
    const questions = Array.from({ length: 5 }, (_, index) => buildQuestion(index + 1, random, difficulty));

    return {
        challenge_id: generateMathSprintChallengeId(date, difficulty),
        gameType: 'mathsprint',
        date,
        difficulty,
        challengeData: {
            title: 'Math Sprint',
            difficulty,
            total_questions: 5,
            time_limit_seconds: 60,
            questions,
        },
    };
};

export type ResultForStats = { played_at: Date | string; completed: boolean };

const toUTCDateKey = (d: Date | string) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const addDaysUTC = (dKey: string, delta: number) => {
    const [y, m, day] = dKey.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, day));
    date.setUTCDate(date.getUTCDate() + delta);
    const yy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
};

export const computeStreaks = (results: ResultForStats[]) => {
    if (!results || results.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const completedDates = new Set<string>();
    for (const r of results) {
        if (r.completed) {
            completedDates.add(toUTCDateKey(r.played_at));
        }
    }

    if (completedDates.size === 0) return { currentStreak: 0, longestStreak: 0 };

    // Longest streak
    const sortedDates = Array.from(completedDates).sort();
    let longest = 0;
    let cur = 0;
    let prev: string | null = null;
    for (const d of sortedDates) {
        if (prev === null) {
            cur = 1;
        } else {
            const expected = addDaysUTC(prev, 1);
            if (d === expected) {
                cur += 1;
            } else {
                cur = 1;
            }
        }
        if (cur > longest) longest = cur;
        prev = d;
    }

    // Current streak: consecutive days ending today (UTC)
    const today = new Date();
    const todayKey = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;
    let current = 0;
    let cursor = todayKey;
    while (completedDates.has(cursor)) {
        current += 1;
        cursor = addDaysUTC(cursor, -1);
    }

    return { currentStreak: current, longestStreak: longest };
};

export type ResultForAverages = {
    completed: boolean;
    score: number;
    attempts_used?: number;
    time_seconds?: number;
};

export const computeAverages = (results: ResultForAverages[]) => {
    if (!results || results.length === 0) {
        return {
            gamesPlayed: 0,
            completedGames: 0,
            completionRate: 0,
            averageScore: 0,
            averageAttempts: 0,
            averageTimeSeconds: 0,
        };
    }

    const gamesPlayed = results.length;
    const completedGames = results.filter((r) => r.completed).length;
    const completionRate = Number(((completedGames / gamesPlayed) * 100).toFixed(2));

    const totalScore = results.reduce((sum, r) => sum + (Number.isFinite(r.score) ? r.score : 0), 0);
    const averageScore = Number((totalScore / gamesPlayed).toFixed(2));

    const withAttempts = results.filter((r) => typeof r.attempts_used === 'number');
    const totalAttempts = withAttempts.reduce((sum, r) => sum + Number(r.attempts_used), 0);
    const averageAttempts = withAttempts.length === 0 ? 0 : Number((totalAttempts / withAttempts.length).toFixed(2));

    const withTime = results.filter((r) => typeof r.time_seconds === 'number');
    const totalTime = withTime.reduce((sum, r) => sum + Number(r.time_seconds), 0);
    const averageTimeSeconds = withTime.length === 0 ? 0 : Number((totalTime / withTime.length).toFixed(2));

    return {
        gamesPlayed,
        completedGames,
        completionRate,
        averageScore,
        averageAttempts,
        averageTimeSeconds,
    };
};