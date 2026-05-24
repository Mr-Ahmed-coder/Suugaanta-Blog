import mongoose from "mongoose";
import env from "./env.js";

const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to the server environment file.");
  }

  // Mongoose manages connection pooling for the app, which is a good production default.
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected successfully");
};

export default connectDatabase;
