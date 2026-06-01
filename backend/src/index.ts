import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import path from "path";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import worldleRoutes from "./routes/worldle.routes.js";
import gameRoutes from "./routes/game.routes.js";
import countriesRoutes from "./routes/countries.routes.js";
import statsRoutes from "./routes/stats.routes.js";

import friendsRoutes from "./routes/friends.js";
import userRoutes from "./routes/user.js";
import gamesRoutes from "./routes/games.js";
import notificationRoutes from './routes/notification.js';


import testRouter from "./routes/test.js";

mongoose.connect(process.env.MONGO_URI!).catch(console.error);

export const app = express();
const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGO_URI;
const mongoDbName = process.env.MONGO_DB_NAME;

let mongoClient: MongoClient | null = null;

app.use(cors());
app.use(express.json());
// Serve user-supplied music in src/data/music at /audio/songless
app.use(
    "/audio/songless",
    express.static(path.join(process.cwd(), "src", "data", "music"))
);
// Serve local audio files placed in backend/public/audio at /audio/*
app.use("/audio", express.static(path.join(process.cwd(), "public", "audio")));
app.use("/api/user", userRoutes);
app.use("/api/games", worldleRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/countries", countriesRoutes);
app.use("/api/stats", statsRoutes);
app.use('/api/notifications', notificationRoutes);

app.use("/api/friends", async (req, res, next) => {
    try {
        const db = await getMongoDb();
        return friendsRoutes(db)(req, res, next);
    } catch (error) {
        return res.status(503).json({
            ok: false,
            error: "Database connection failed",
        });
    }
});

app.use("/api/games", async (req, res, next) => {
    try {
        const db = await getMongoDb();
        return gamesRoutes(db)(req, res, next);
    } catch (error) {
        return res.status(503).json({
            ok: false,
            error: "Database connection failed",
        });
    }
});

const getMongoClient = async (): Promise<MongoClient> => {
    if (!mongoUri) {
        throw new Error("MONGO_URI is not configured");
    }

    if (!mongoClient) {
        mongoClient = new MongoClient(mongoUri);
    }

    await mongoClient.connect();

    return mongoClient;
};

const getMongoDb = async () => {
    const client = await getMongoClient();
    return client.db(mongoDbName);
};

app.get("/api/health", (_req, res) => {
    res.json({
        ok: true,
        service: "backend",
        timestamp: new Date().toISOString(),
    });
});

app.get("/api/health/mongo", async (_req, res) => {
    const startedAt = Date.now();

    try {
        const client = await getMongoClient();
        const db = client.db(mongoDbName);
        const collection = db.collection("_health_checks");

        const probeDoc = {
            type: "mongo-health-probe",
            createdAt: new Date(),
        };

        const insertResult = await collection.insertOne(probeDoc);
        const deleteResult = await collection.deleteOne({
            _id: insertResult.insertedId,
        });

        const writeDeleteSucceeded = deleteResult.deletedCount === 1;

        res.status(writeDeleteSucceeded ? 200 : 503).json({
            ok: writeDeleteSucceeded,
            service: "backend",
            mongo: {
                db: mongoDbName,
                collection: "_health_checks",
                insertedId: insertResult.insertedId,
                deletedCount: deleteResult.deletedCount,
            },
            durationMs: Date.now() - startedAt,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown MongoDB error";

        res.status(503).json({
            ok: false,
            service: "backend",
            mongo: {
                db: mongoDbName,
                error: message,
            },
            durationMs: Date.now() - startedAt,
            timestamp: new Date().toISOString(),
        });
    }
});

app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
});
