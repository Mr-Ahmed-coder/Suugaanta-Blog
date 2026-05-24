import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const adminName = process.env.SEED_ADMIN_NAME || "Admin Suugaanta";
const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@suugaanta.com";
const adminPassword = process.env.SEED_ADMIN_PASSWORD;

const run = async () => {
  try {
    if (!mongoUri) {
      throw new Error("MONGODB_URI is required.");
    }

    if (!adminPassword) {
      throw new Error("SEED_ADMIN_PASSWORD is required.");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    let user = await User.findOne({ email: adminEmail });
    if (user) {
      user.password = adminPassword;
      user.role = "admin";
      await user.save();
      console.log(`Updated existing admin user: ${adminEmail}`);
    } else {
      user = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      });
      console.log(`Created new admin user: ${adminEmail}`);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
};

run();
