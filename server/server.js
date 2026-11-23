import "dotenv/config";
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { createApp } from "./app.js";

const { MONGODB_URI, MONGODB_DB, JWT_SECRET } = process.env;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required. Add your MongoDB Atlas connection string to server/.env.");
}
if (!MONGODB_DB) {
  throw new Error("MONGODB_DB is required.");
}
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set to a random secret of at least 32 characters.");
}

const dnsServers = process.env.MONGODB_DNS_SERVERS
  ?.split(",")
  .map((server) => server.trim())
  .filter(Boolean);
if (dnsServers?.length) setServers(dnsServers);

await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
console.log("Connected to MongoDB.");

const app = createApp();
const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`FYP Management API listening on port ${port}.`);
});
