export type Achievement = {
    title: string;
    description?: string;
    unlockedAt?: Date;
};

export type Friend ={
    _id: number;
};

export interface User {
    _id: number;
    username: string;
    email: string;
    password_hash: string;
    avatar_url?: string;
    current_streak: number;
    longest_streak: number;
    games_played: number;
    num_achievements: number;
    global_rank: number;
    created_at: Date;
    updated_at: Date;

    achievements: Achievement[];
    friends: Friend[];

    createdAt: Date;
    updatedAt?: Date;

    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}