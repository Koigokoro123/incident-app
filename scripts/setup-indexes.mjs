import { MongoClient } from "mongodb";

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const reports = client.db().collection("reports");
await reports.createIndex({ trackingCode: 1 }, { unique: true });
await reports.createIndex({ location: "2dsphere" });
await reports.createIndex({ type: 1, status: 1, createdAt: -1 });
console.log("Indexes created");
await client.close();