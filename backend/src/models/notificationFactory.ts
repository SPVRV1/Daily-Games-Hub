import { AppNotification, NotificationType } from '../models/user.js';

type CreateNotificationInput = {
    user_id: number;
    type: NotificationType;
    message: string;
    actor?: string;
    action_url?: string;
};

export function createNotification(input: CreateNotificationInput): AppNotification {
    return {
        _id: Date.now(),
        user_id: input.user_id,
        type: input.type,
        message: input.message,
        actor: input.actor,
        action_url: input.action_url,
        read: false,
        created_at: new Date(),
    };
}