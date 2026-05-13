import { ObjectId } from "mongodb";
import { Router } from "express";
import type { Collection, Db } from "mongodb";
import type { User } from "../models/user.js";
import { sendNewFriendEmail } from "../utils/mailer.js";

type FriendshipStatus = "pending" | "accepted" | "rejected";

type Friendship = {
    _id?: ObjectId;
    requester_id: number;
    receiver_id: number;
    pair_key: string;
    status: FriendshipStatus;
    created_at: Date;
    updated_at?: Date;
};

let indexesReady: Promise<void> | null = null;

const createPairKey = (userA: number, userB: number) =>
    [userA, userB].sort((a, b) => a - b).join(":");

const escapeRegex = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ensureIndexes = (friendships: Collection<Friendship>) => {
    if (!indexesReady) {
        indexesReady = Promise.all([
            friendships.createIndex({ pair_key: 1 }, { unique: true }),
            friendships.createIndex({ receiver_id: 1, status: 1 }),
            friendships.createIndex({ requester_id: 1, status: 1 }),
        ]).then(() => undefined);
    }

    return indexesReady;
};

export default function friendsRoutes(db: Db) {
    const router = Router();
    const friendships = db.collection<Friendship>("friendships");
    const users = db.collection<User>("Users");

    router.get("/search/users", async (req, res) => {
        try {
            const userId = Number(req.query.userId);
            const query =
                typeof req.query.query === "string" ? req.query.query.trim() : "";

            if (Number.isNaN(userId)) {
                return res.status(400).json({
                    ok: false,
                    error: "Invalid user id",
                });
            }

            if (!query) {
                return res.json({
                    ok: true,
                    users: [],
                });
            }

            const matches = await users
                .find({
                    _id: { $ne: userId },
                    username: { $regex: escapeRegex(query), $options: "i" },
                })
                .project({ _id: 1, username: 1, email: 1, avatar_url: 1 })
                .limit(20)
                .toArray();

            const pairKeys = matches.map((user) => createPairKey(userId, user._id));
            const relations = await friendships
                .find({ pair_key: { $in: pairKeys } })
                .project({ _id: 1, pair_key: 1, status: 1, requester_id: 1, receiver_id: 1 })
                .toArray();

            const relationMap = new Map(
                relations.map((relation) => [relation.pair_key, relation])
            );

            const result = matches.map((user) => {
                const relation = relationMap.get(createPairKey(userId, user._id));

                return {
                    user,
                    relation: relation
                        ? {
                              friendship_id: relation._id,
                              status: relation.status,
                              requester_id: relation.requester_id,
                              receiver_id: relation.receiver_id,
                          }
                        : null,
                };
            });

            return res.json({
                ok: true,
                users: result,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                error: "Failed to search users",
            });
        }
    });

    // send friend request
    router.post("/request", async (req, res) => {
        try {
            await ensureIndexes(friendships);
            const { requester_id, receiver_id } = req.body;

            if (
                typeof requester_id !== "number" ||
                typeof receiver_id !== "number"
            ) {
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

            const [requester, receiver] = await Promise.all([
                users.findOne({ _id: requester_id }),
                users.findOne({ _id: receiver_id }),
            ]);

            if (!requester || !receiver) {
                return res.status(404).json({
                    ok: false,
                    error: "Requester or receiver not found",
                });
            }

            const pair_key = createPairKey(requester_id, receiver_id);

            const existing = await friendships.findOne({ pair_key });

            if (existing) {
                if (existing.status === "rejected") {
                    await friendships.updateOne(
                        { _id: existing._id },
                        {
                            $set: {
                                requester_id,
                                receiver_id,
                                status: "pending",
                                created_at: new Date(),
                                updated_at: new Date(),
                            },
                        },
                    );

                    return res.status(200).json({
                        ok: true,
                        friendship_id: existing._id,
                        message: "Friend request sent again",
                    });
                }

                return res.status(409).json({
                    ok: false,
                    error: "Friendship or request already exists",
                });
            }

            try {
                const result = await friendships.insertOne({
                    requester_id,
                    receiver_id,
                    pair_key,
                    status: "pending",
                    created_at: new Date(),
                });

                return res.status(201).json({
                    ok: true,
                    friendship_id: result.insertedId,
                });
            } catch (error) {
                if (error && typeof error === "object" && "code" in error && error.code === 11000) {
                    return res.status(409).json({
                        ok: false,
                        error: "Friendship or request already exists",
                    });
                }

                throw error;
            }
        } catch (error) {
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

            const existing = await friendships.findOne({
                _id: new ObjectId(friendshipId),
                status: "pending",
            });

            if (!existing) {
                return res.status(404).json({
                    ok: false,
                    error: "Pending friendship request not found",
                });
            }

            await friendships.updateOne(
                { _id: existing._id },
                {
                    $set: {
                        status,
                        updated_at: new Date(),
                    },
                },
            );

            if (status === "accepted") {
                const [requester, receiver] = await Promise.all([
                    users.findOne({ _id: existing.requester_id }),
                    users.findOne({ _id: existing.receiver_id }),
                ]);

                if (requester && receiver) {
                    await Promise.all([
                        sendNewFriendEmail(
                            requester.email,
                            requester.username,
                            receiver.username
                        ),
                        sendNewFriendEmail(
                            receiver.email,
                            receiver.username,
                            requester.username
                        ),
                    ]);
                }
            }

            res.json({ ok: true, status });
        } catch (error) {
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

            const friendIds = result.map((friendship) =>
                friendship.requester_id === userId
                    ? friendship.receiver_id
                    : friendship.requester_id
            );

            const friendUsers = await users
                .find({ _id: { $in: friendIds } })
                .project({ _id: 1, username: 1, email: 1, avatar_url: 1 })
                .toArray();

            const friendMap = new Map(friendUsers.map((user) => [user._id, user]));

            const friends = result.map((friendship) => {
                const friendId =
                    friendship.requester_id === userId
                        ? friendship.receiver_id
                        : friendship.requester_id;

                return {
                    friendship_id: friendship._id,
                    user: friendMap.get(friendId) ?? { _id: friendId },
                    created_at: friendship.created_at,
                    updated_at: friendship.updated_at,
                };
            });

            res.json({
                ok: true,
                friends,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to fetch friends",
            });
        }
    });

    // list pending incoming requests for user
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

            const requesterIds = result.map((friendship) => friendship.requester_id);
            const requesters = await users
                .find({ _id: { $in: requesterIds } })
                .project({ _id: 1, username: 1, email: 1, avatar_url: 1 })
                .toArray();

            const requesterMap = new Map(
                requesters.map((user) => [user._id, user])
            );

            const requests = result.map((friendship) => ({
                friendship_id: friendship._id,
                requester: requesterMap.get(friendship.requester_id) ?? {
                    _id: friendship.requester_id,
                },
                receiver_id: friendship.receiver_id,
                status: friendship.status,
                created_at: friendship.created_at,
            }));

            res.json({
                ok: true,
                requests,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to fetch friend requests",
            });
        }
    });

    // list pending outgoing requests for user
    router.get("/:userId/requests/sent", async (req, res) => {
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
                    requester_id: userId,
                    status: "pending",
                })
                .toArray();

            const receiverIds = result.map((friendship) => friendship.receiver_id);
            const receivers = await users
                .find({ _id: { $in: receiverIds } })
                .project({ _id: 1, username: 1, email: 1, avatar_url: 1 })
                .toArray();

            const receiverMap = new Map(receivers.map((user) => [user._id, user]));

            const requests = result.map((friendship) => ({
                friendship_id: friendship._id,
                receiver: receiverMap.get(friendship.receiver_id) ?? {
                    _id: friendship.receiver_id,
                },
                requester_id: friendship.requester_id,
                status: friendship.status,
                created_at: friendship.created_at,
            }));

            res.json({
                ok: true,
                requests,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to fetch sent friend requests",
            });
        }
    });

    // cancel pending request
    router.delete("/:friendshipId/request", async (req, res) => {
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
                status: "pending",
            });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    ok: false,
                    error: "Pending friendship request not found",
                });
            }

            res.json({
                ok: true,
                deletedCount: result.deletedCount,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to cancel friend request",
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
        } catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to remove friend",
            });
        }
    });

    return router;
}
