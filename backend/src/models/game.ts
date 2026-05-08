import mongoose, { Schema, Document } from 'mongoose';

import { GameType, IGameChallange } from '../types/game.types.js';

export interface Game extends Document {
    game_id: number;
    name: GameType;
    description?: string;
    challenges: IGameChallange[];
    max_attempts?: number | null;
    time_limit_seconds?: number | null;
    is_active: boolean;
}

const gameSchema = new Schema<Game>({
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

export const GameModel = mongoose.model<Game>('Game', gameSchema);