export const createUser = (data) => {
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
        createdAt: now,
        updatedAt: now,
        resetPasswordExpires: undefined,
        resetPasswordToken: undefined
    };
};
