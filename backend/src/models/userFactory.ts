import { User } from "./user.js";

export const createUser = (
    data: {
        _id: number;
        username: string;
        email: string;
        password_hash: string;
    }
): User => {
    const now = new Date();

    return {
        _id: data._id,
        username: data.username,
        email: data.email,
        password_hash: data.password_hash,

        avatar_url: "",

        current_streak: 0,
        longest_streak: 0,
        games_played: 0,
        num_achievements: 0,
        global_rank: 0,

        created_at: now,
        updated_at: now,

        achievements: [],
        friends: [],

        games: [],

        createdAt: now,
        updatedAt: now,

        resetPasswordExpires: undefined,
        resetPasswordToken: undefined
    };
};