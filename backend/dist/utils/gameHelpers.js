export const getTodayDate = () => {
    const d = new Date();
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth()).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
};
const mathSprintDifficultyOperators = {
    easy: ['+'],
    medium: ['+', '-'],
    hard: ['+', '-', '*'],
};
export const normalizeMathSprintDifficulty = (difficulty) => {
    if (difficulty === undefined || difficulty === null || difficulty === '') {
        return 'easy';
    }
    if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
        return difficulty;
    }
    return null;
};
export const generateMathSprintChallengeId = (date, difficulty) => {
    let state = 2166136261;
    const seed = `mathsprint:${date}:${difficulty}`;
    for (let index = 0; index < seed.length; index += 1) {
        state ^= seed.charCodeAt(index);
        state = Math.imul(state, 16777619);
    }
    const hex = (state >>> 0).toString(16).padStart(8, '0');
    return `${hex}${hex}${hex}`;
};
const createSeededRandom = (seed) => {
    let state = 0;
    for (let index = 0; index < seed.length; index += 1) {
        state = (state * 31 + seed.charCodeAt(index)) >>> 0;
    }
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
    };
};
const randomInt = (random, min, max) => {
    return Math.floor(random() * (max - min + 1)) + min;
};
const pickOperator = (random, difficulty) => {
    const operators = mathSprintDifficultyOperators[difficulty];
    return operators[Math.floor(random() * operators.length)];
};
const buildQuestion = (id, random, difficulty) => {
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
export const generateMathSprintChallenge = (date, difficulty = 'easy') => {
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
