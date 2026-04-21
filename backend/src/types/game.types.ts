export type GameType = "wordle" | "flagle" | "worldle" | "moreless" | "songless" | "mathsprint";

export interface IGameChallange {
    gameType: GameType,
    date: string, // DD-MM-YYYY
    challengeData: Record<string, number>;
}

export interface IGameResult {
    userId: string,
    gameType: GameType,
    date: string, // DD-MM-YYYY
    completed: boolean,
    attempts: number,
    timeSpent?: number, // v sekundah
    score: number
}
