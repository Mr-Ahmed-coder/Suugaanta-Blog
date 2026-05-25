import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRouter from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import env from "./config/env.js";
import path from "path";
import fs from "fs";

const app = express();
const clientBuildPath = [
  path.resolve(process.cwd(), "client", "dist"),
  path.resolve(process.cwd(), "..", "client", "dist"),
].find((candidatePath) => fs.existsSync(path.join(candidatePath, "index.html")));

app.set("trust proxy", 1);

// Serve local uploads folder publicly for fallback media storage
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Cross-origin settings are centralized here so frontend deployment changes stay easy to manage.
const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = origin ? env.normalizeOrigin(origin) : "";

    if (!origin || env.allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    environment: env.nodeEnv,
  });
});

app.use("/api", apiRouter);

if (clientBuildPath) {
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }

    return res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Suugaanta Soomaliyeed API is running",
      health: "/api/health",
      documentation: "Build client/dist to serve the frontend from this service.",
      environment: env.nodeEnv,
    });
  });
}

// Keep terminal middleware last so all unmatched routes and thrown errors funnel consistently.
app.use(notFound);
app.use(errorHandler);

export default app;
