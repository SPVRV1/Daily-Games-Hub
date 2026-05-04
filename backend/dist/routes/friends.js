import { ObjectId } from "mongodb";
import { Router } from "express";
const router = Router();
export default function friendsRoutes(db) {
    const friendships = db.collection("friendships");
    // send friend request
    router.post("/request", async (req, res) => {
        try {
            const { requester_id, receiver_id } = req.body;
            if (!requester_id || !receiver_id) {
                return res.status(400).json({
                    ok: false,
                    error: "requester_id and receiver_id are required",
                });
            }
            if (requester_id === receiver_id) {
                return res.status(400).json({
                    ok: false,
                    error: "You cannot send a friend request to yourself",
                });
            }
            const existing = await friendships.findOne({
                $or: [
                    { requester_id, receiver_id },
                    { requester_id: receiver_id, receiver_id: requester_id },
                ],
            });
            if (existing) {
                return res.status(409).json({
                    ok: false,
                    error: "Friendship or request already exists",
                });
            }
            const result = await friendships.insertOne({
                requester_id,
                receiver_id,
                status: "pending",
                created_at: new Date(),
            });
            res.status(201).json({
                ok: true,
                friendship_id: result.insertedId,
            });
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to send friend request",
            });
        }
    });
    // accept/reject request
    router.patch("/:friendshipId/status", async (req, res) => {
        try {
            const { friendshipId } = req.params;
            const { status } = req.body;
            if (!["accepted", "rejected"].includes(status)) {
                return res.status(400).json({
                    ok: false,
                    error: "Status must be accepted or rejected",
                });
            }
            if (!ObjectId.isValid(friendshipId)) {
                return res.status(400).json({
                    ok: false,
                    error: "Invalid friendship id",
                });
            }
            const result = await friendships.updateOne({ _id: new ObjectId(friendshipId), status: "pending" }, {
                $set: {
                    status,
                    updated_at: new Date(),
                },
            });
            if (result.matchedCount === 0) {
                return res.status(404).json({
                    ok: false,
                    error: "Pending friendship request not found",
                });
            }
            res.json({ ok: true, status });
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to update friendship status",
            });
        }
    });
    //list accepted friends
    router.get("/:userId", async (req, res) => {
        try {
            const userId = Number(req.params.userId);
            if (Number.isNaN(userId)) {
                return res.status(400).json({
                    ok: false,
                    error: "Invalid user id",
                });
            }
            const result = await friendships
                .find({
                status: "accepted",
                $or: [
                    { requester_id: userId },
                    { receiver_id: userId },
                ],
            })
                .toArray();
            res.json({
                ok: true,
                friends: result,
            });
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to fetch friends",
            });
        }
    });
    // list pending requests for user
    router.get("/:userId/requests", async (req, res) => {
        try {
            const userId = Number(req.params.userId);
            if (Number.isNaN(userId)) {
                return res.status(400).json({
                    ok: false,
                    error: "Invalid user id",
                });
            }
            const result = await friendships
                .find({
                receiver_id: userId,
                status: "pending",
            })
                .toArray();
            res.json({
                ok: true,
                requests: result,
            });
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to fetch friend requests",
            });
        }
    });
    // remove accepted friendship
    router.delete("/:friendshipId", async (req, res) => {
        try {
            const { friendshipId } = req.params;
            if (!ObjectId.isValid(friendshipId)) {
                return res.status(400).json({
                    ok: false,
                    error: "Invalid friendship id",
                });
            }
            const result = await friendships.deleteOne({
                _id: new ObjectId(friendshipId),
                status: "accepted",
            });
            if (result.deletedCount === 0) {
                return res.status(404).json({
                    ok: false,
                    error: "Accepted friendship not found",
                });
            }
            res.json({
                ok: true,
                deletedCount: result.deletedCount,
            });
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to remove friend",
            });
        }
    });
    return router;
}
