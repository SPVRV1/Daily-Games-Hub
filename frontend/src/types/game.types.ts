export type GameType = 'wordle' | 'flagle' | 'worldle' | 'moreless' | 'songless' | 'mathsprint';

export interface GameChallenge<T = Record<string, unknown>> {
  gameType: GameType;
  date: string;
  challengeData: T;
}

export interface GameResult {
  challenge_id: string;
  completed: boolean;
  attempts_used?: number;
  correct_answers?: number;
  time_seconds?: number;
  score: number;
}

export interface GameState {
  status: 'loading' | 'playing' | 'finished' | 'already_played';
  challenge: GameChallenge | null;
  result: GameResult | null;
}


