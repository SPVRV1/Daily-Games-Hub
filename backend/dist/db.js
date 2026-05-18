import { MongoClient } from "mongodb";
let client = null;
export const getDb = async () => {
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
    return db.collection("Users");
};
