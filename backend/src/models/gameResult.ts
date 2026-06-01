import mongoose, { Schema, Document } from 'mongoose';

export interface IGameResultDocument extends Document {
  user_id: number;
  gameType: string;
  challenge_id: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  completed: boolean;
  attempts_used?: number;
  correct_answers?: number;
  time_seconds?: number;
  score: number;
  played_at: Date;
}

const GameResultsSchema = new Schema({
  user_id: { type: Number, required: true },
  gameType: { type: String, required: true },
  challenge_id: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  completed: { type: Boolean, default: false },
  attempts_used: { type: Number },
  correct_answers: { type: Number },
  time_seconds: { type: Number },
  score: { type: Number, default: 0 },
  played_at: { type: Date, default: Date.now },
});

// Unique per user + game type + challenge (one play per day per game)
GameResultsSchema.index({ user_id: 1, gameType: 1, challenge_id: 1 }, { unique: true });

export default mongoose.model<IGameResultDocument>('GameResult', GameResultsSchema);
