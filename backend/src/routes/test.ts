import { Router } from 'express';
import { sendNotification } from '../utils/notification.js';

const router = Router();
//TEST ENDPOINTS FOR INSERTING NEW NOTIFICATIONS IN BACKEND AND USE CASE EXAMPLE
/*
// Test friend request notification
router.post('/test/notif-friend', async (req, res) => {
    await sendNotification({
        userId: 1779136936992,
        type: 'friend_request',
        message: 'Alex sent you a friend request',
        actor: 'Alex',
        actionUrl: '/friends',
    });
    return res.json({ ok: true, message: 'Friend request notification sent' });
});

// Test game played notification
router.post('/test/notif-game', async (req, res) => {
    await sendNotification({
        userId: 1779136936992,
        type: 'game_played',
        message: 'Jordan completed Wordle',
        actor: 'Jordan',
    });
    return res.json({ ok: true, message: 'Game played notification sent' });
});

// Test new record notification
router.post('/test/notif-record', async (req, res) => {
    await sendNotification({
        userId: 1779136936992,
        type: 'new_record',
        message: 'You set a new record in Flagle!',
    });
    return res.json({ ok: true, message: 'New record notification sent' });
});
*/
export default router;