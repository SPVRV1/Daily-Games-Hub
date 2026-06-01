import { MongoClient, Db } from "mongodb";
import { AppNotification, User } from "./models/user.js";

let client: MongoClient | null = null;

export const getDb = async (): Promise<Db> => {
    const mongoUri = process.env.MONGO_URI;
    const mongoDbName = process.env.MONGO_DB_NAME;
    
    if (!mongoUri || !mongoDbName) {
        throw new Error("MONGO_URI or MONGO_DB_NAME is not configured");
    }

    if (!client) {
        client = new MongoClient(mongoUri);
        await client.connect();
    }

    return client.db(mongoDbName);
};

export const getUsersCollection = async () => {
    const db = await getDb();
    return db.collection<User>("Users");
};

export async function getNotificationsCollection() {
    const db = await getDb(); 
    return db.collection<AppNotification>('notifications');
}