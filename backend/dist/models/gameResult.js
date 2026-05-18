import mongoose, { Schema } from 'mongoose';
const GameResultsSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    challenge_id: { type: Schema.Types.ObjectId, ref: 'DailyChallenge', required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    completed: { type: Boolean, default: false },
    attempts_used: { type: Number },
    correct_answers: { type: Number },
    time_seconds: { type: Number },
    score: { type: Number, default: 0 },
    played_at: { type: Date, default: Date.now },
});
GameResultsSchema.index({ user_id: 1, challenge_id: 1 }, { unique: true });
export default mongoose.model('GameResult', GameResultsSchema);
