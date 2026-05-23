import { getNotificationsCollection } from '../db.js';
import { createNotification } from '../models/notificationFactory.js';
import { AppNotification, NotificationType } from '../models/user.js';

export async function sendNotification(params: {
    userId: number;
    type: NotificationType;
    message: string;
    actor?: string;
    actionUrl?: string;
}): Promise<void> {
    try {
        const collection = await getNotificationsCollection();
        const notification = createNotification({
            user_id: params.userId,
            type: params.type,
            message: params.message,
            actor: params.actor,
            action_url: params.actionUrl,
        });
        await collection.insertOne(notification);
    } catch (error) {
        console.error('Failed to send notification:', error);
        // not critical — don't crash the main request
    }
}