export type Achievement = {
    title: string;
    description?: string;
    unlockedAt?: Date;
};

export type Friend ={
    _id: number;
};

export type U_Game = {
    _id: number;
    title: string;
    attempts: number;
    timeTaken: number;
    completed: boolean;
    datePlayed: Date;
};

export interface User {
    _id: number;
    username: string;
    email: string;
    password_hash: string;
    avatar_url?: string;
    avatar_file_id?: string;
    current_streak: number;
    longest_streak: number;
    games_played: number;
    num_achievements: number;
    global_rank: number;
    created_at: Date;
    updated_at: Date;

    achievements: Achievement[];
    friends: Friend[];

    games: U_Game[];
    
    createdAt: Date;
    updatedAt?: Date;

    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

export type NotificationType = 'friend_request' | 'game_played' | 'new_record';

export type AppNotification = {
    _id: number;
    user_id: number;
    type: NotificationType;
    message: string;
    actor?: string;
    action_url?: string;
    read: boolean;
    created_at: Date;
};