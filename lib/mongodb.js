import { MongoClient } from "mongodb";

let clientPromise = global._mongoClientPromise;
if (!clientPromise) {
  clientPromise = new MongoClient(process.env.MONGODB_URI).connect();
  global._mongoClientPromise = clientPromise;
}
export default clientPromise;