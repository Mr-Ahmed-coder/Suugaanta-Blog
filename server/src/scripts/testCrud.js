import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import User from "../models/User.js";

dotenv.config();

const { MONGODB_URI, JWT_SECRET, PORT } = process.env;
const port = PORT || 5000;
const mongoUri = MONGODB_URI || "mongodb://localhost:27017/suugaanta-soomaliyeed";

console.log("Database URI:", mongoUri);
console.log("JWT Secret:", JWT_SECRET || "your_jwt_secret_key");

const runTest = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully.");

    // 2. Find an admin or editor user
    let user = await User.findOne({ role: { $in: ["admin", "editor"] } });
    if (!user) {
      console.log("No admin/editor found in database. Searching for any user...");
      user = await User.findOne({});
    }

    if (!user) {
      console.log("No user found at all! Creating a temporary admin user...");
      user = await User.create({
        name: "Test Admin",
        email: "testadmin@gmail.com",
        password: "password123",
        role: "admin",
      });
      console.log("Created temp admin user:", user.email);
    } else {
      console.log(`Using user: ${user.email} (Role: ${user.role})`);
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "1h" }
    );
    console.log("Generated token:", token);

    // 4. Send POST request to /api/songs
    const songPayload = {
      title: "Test Song Title",
      artist: "Test Artist",
      description: "Test description that is long enough.",
      lyrics: "Test lyrics.",
      category: "Classic",
      tags: "patriotic, classic",
    };

    console.log("Sending GET request to /api/authors?sort=newest...");
    try {
      const response = await axios.get(`http://localhost:${port}/api/authors?sort=newest`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("GET Success! Authors count retrieved:", response.data.data.length);
    } catch (apiError) {
      console.error("GET Failed!");
      if (apiError.response) {
        console.error("Status:", apiError.response.status);
        console.error("Data:", JSON.stringify(apiError.response.data, null, 2));
      } else {
        console.error("Error Message:", apiError.message);
      }
    }

  } catch (err) {
    console.error("Execution error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
};

runTest();
