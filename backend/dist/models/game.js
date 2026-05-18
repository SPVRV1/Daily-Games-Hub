import mongoose, { Schema } from 'mongoose';
const gameSchema = new Schema({
    game_id: { type: Number, required: true },
    name: {
        type: String,
        enum: ["wordle", "flagle", "worldle", "moreless", "songless", "mathsprint"],
        required: true
    },
    description: String,
    challenges: [{
            gameType: String,
            date: String,
            challengeData: Schema.Types.Mixed
        }],
    max_attempts: { type: Number, default: null },
    time_limit_seconds: { type: Number, default: null },
    is_active: { type: Boolean, required: true }
});
export const GameModel = mongoose.model('Game', gameSchema);
