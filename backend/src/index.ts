import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGO_URI;
const mongoDbName = process.env.MONGO_DB_NAME;

let mongoClient: MongoClient | null = null;

app.use(cors());
app.use(express.json());

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
