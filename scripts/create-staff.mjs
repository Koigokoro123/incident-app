import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const [email, password, types] = process.argv.slice(2);
if (!email || !password || !types) {
  console.log("Usage: node --env-file=.env.local scripts/create-staff.mjs EMAIL PASSWORD TYPES");
  process.exit(1);
}

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const staff = client.db().collection("staff");
await staff.createIndex({ email: 1 }, { unique: true });
await staff.insertOne({
  email: email.toLowerCase().trim(),
  passwordHash: await bcrypt.hash(password, 10),
  types: types.split(",").map((t) => t.trim()),
  createdAt: new Date(),
});
console.log("Created staff:", email);
await client.close();