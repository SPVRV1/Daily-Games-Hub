import { Router } from 'express';
import { getNotificationsCollection } from '../db.js';
import { verifyToken, AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../models/notificationFactory.js';
import type { Filter } from 'mongodb';
import type { AppNotification } from '../models/user.js';

const router = Router();

// GET /api/notifications
router.get('/', verifyToken, async (_req: AuthRequest, res) => {
    try {
        //const { id } = _req.user?.userId;
        const userId = _req.user?.userId;

        if (!userId || isNaN(userId)) {
            return res.status(400).json({ ok: false, error: 'Invalid user ID : ' + _req.user?.userId });
        }

        const collection = await getNotificationsCollection();
        const notifications = await collection
            .find({ user_id: userId })
            .sort({ created_at: -1 })
            .limit(20)
            .toArray();

        return res.json({ ok: true, notifications });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ ok: false, error: message });
    }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', verifyToken, async (req: AuthRequest, res) => {
    try {
        const userId = Number(req.user?.userId);
        const notifId = Number(req.params.id);

        const collection = await getNotificationsCollection();
        const filter: Filter<AppNotification> = { _id: notifId, user_id: userId };
        await collection.updateOne(
            filter,
            { $set: { read: true } }
        );

        return res.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ ok: false, error: message });
    }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', verifyToken, async (req: AuthRequest, res) => {
    try {
        const userId = Number(req.user?.userId);

        const collection = await getNotificationsCollection();
        await collection.updateMany(
            { user_id: userId },
            { $set: { read: true } }
        );

        return res.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ ok: false, error: message });
    }
});

// DELETE /api/notifications/:id
router.delete('/:id', verifyToken, async (_req: AuthRequest, res) => {
    try {
        const userId = Number(_req.user?.userId);
        const notifId = Number(_req.params.id);

        const collection = await getNotificationsCollection();
        const filter: Filter<AppNotification> = { _id: notifId, user_id: userId };
        await collection.deleteOne(filter);

        return res.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ ok: false, error: message });
    }
});

// DELETE /api/notifications  (clear all)
router.delete('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        const userId = Number(req.user?.userId);

        const collection = await getNotificationsCollection();
        await collection.deleteMany({ user_id: userId });

        return res.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ ok: false, error: message });
    }
});

export default router;