import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Super Admin";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@suugaanta.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin123!";

const seedAdmin = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGODB_URI is missing. Add it to server/.env or your deployment environment.");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully.");

    // Check if an admin already exists
    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      console.log("⚠️ An admin user already exists in the system. Seed script safely aborted to prevent duplicate root admins.");
      process.exit(0);
    }

    console.log("No admin found. Creating initial root admin...");

    // Create the first admin manually.
    // The pre-save hook in User model will automatically hash the password.
    const adminUser = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // Can be changed by the admin later
      role: "admin",
    });

    await adminUser.save();
    
    console.log("✅ Root admin created successfully!");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log("Password: [configured SEED_ADMIN_PASSWORD]");
    console.log("Please log in and change this password immediately in production.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed admin:", error);
    process.exit(1);
  }
};

seedAdmin();
