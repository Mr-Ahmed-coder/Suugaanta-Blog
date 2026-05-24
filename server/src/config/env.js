import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const configuredOrigins = clientUrl
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins =
  nodeEnv === "production"
    ? configuredOrigins
    : Array.from(new Set([...configuredOrigins, "http://localhost:5173", "http://localhost:5174"]));

const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  clientUrl,
  allowedOrigins,
  serverUrl:
    process.env.SERVER_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${Number(process.env.PORT) || 5000}`,
  awsBucketName: process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || "",
};

export default env;
