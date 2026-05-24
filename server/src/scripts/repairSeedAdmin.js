import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@suugaanta.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Super Admin";

const repairSeedAdmin = async () => {
  if (!MONGO_URI) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env before running this script.");
  }

  await mongoose.connect(MONGO_URI);

  const existingAdmins = await User.find({ role: "admin" }).select("_id email role");
  const seedEmailUser = await User.findOne({ email: ADMIN_EMAIL }).select("+password");

  if (existingAdmins.length > 0) {
    const sameEmailAdmin = existingAdmins.find((admin) => admin.email === ADMIN_EMAIL);

    if (!sameEmailAdmin) {
      console.log("An admin already exists with a different email. No changes were made.");
      console.log(`Admin count: ${existingAdmins.length}`);
      await mongoose.disconnect();
      return;
    }

    sameEmailAdmin.password = ADMIN_PASSWORD;
    await sameEmailAdmin.save();
    console.log("Seed admin already exists. Password was refreshed for the configured seed admin email.");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    await mongoose.disconnect();
    return;
  }

  if (seedEmailUser) {
    seedEmailUser.name = seedEmailUser.name || ADMIN_NAME;
    seedEmailUser.role = "admin";
    seedEmailUser.password = ADMIN_PASSWORD;
    await seedEmailUser.save();

    console.log("Existing seed email user was repaired and promoted to admin.");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    await mongoose.disconnect();
    return;
  }

  const adminUser = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
  });

  console.log("No admin or seed email user existed. A single seed admin was created.");
  console.log(`Admin ID: ${adminUser._id}`);
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
};

repairSeedAdmin().catch(async (error) => {
  console.error("Failed to repair seed admin:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
