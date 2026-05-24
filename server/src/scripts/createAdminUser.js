import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const { MONGODB_URI } = process.env;
const mongoUri = MONGODB_URI || "mongodb://localhost:27017/suugaanta-soomaliyeed";

const run = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    let user = await User.findOne({ email: "admin@suugaanta.com" });
    if (user) {
      user.password = "adminpassword123";
      user.role = "admin";
      await user.save();
      console.log("Updated existing admin user password to: adminpassword123");
    } else {
      user = await User.create({
        name: "Admin Suugaanta",
        email: "admin@suugaanta.com",
        password: "adminpassword123",
        role: "admin",
      });
      console.log("Created new admin user with email: admin@suugaanta.com and password: adminpassword123");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
};

run();
