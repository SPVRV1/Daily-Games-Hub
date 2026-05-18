export type GameType = "wordle" | "flagle" | "worldle" | "moreless" | "songless" | "mathsprint";
export type MathSprintDifficulty = 'easy' | 'medium' | 'hard';

export interface IGameChallange {
    gameType: GameType,
    date: string, // DD-MM-YYYY
    difficulty?: MathSprintDifficulty,
    challengeData: any;
}

export interface IGameResult {
    userId: string,
    gameType: GameType,
    date: string, // DD-MM-YYYY
    difficulty?: MathSprintDifficulty,
    completed: boolean,
    attempts: number,
    timeSpent?: number, // in sec
    score: number
}
