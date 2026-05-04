import mongoose, { Schema, Document } from 'mongoose';

// Done after ER model
export interface IGameResultDocument extends Document {
  user_id: mongoose.Types.ObjectId;
  challenge_id: mongoose.Types.ObjectId;
  completed: boolean;
  attempts_used?: number;
  correct_answers?: number;
  time_seconds?: number;
  score: number;
  played_at: Date;
}

const GameResultsSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  challenge_id: { type: Schema.Types.ObjectId, ref: 'DailyChallenge', required: true },
  completed: { type: Boolean, default: false },
  attempts_used: { type: Number },
  correct_answers: { type: Number },
  time_seconds: { type: Number },
  score: { type: Number, default: 0 },
  played_at: { type: Date, default: Date.now },
});

GameResultsSchema.index({ user_id: 1, challenge_id: 1 }, { unique: true });

export default mongoose.model<IGameResultDocument>('GameResult', GameResultsSchema);