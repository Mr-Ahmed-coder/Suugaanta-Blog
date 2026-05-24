import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRouter from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import env from "./config/env.js";
import path from "path";

const app = express();

app.set("trust proxy", 1);

// Serve local uploads folder publicly for fallback media storage
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Cross-origin settings are centralized here so frontend deployment changes stay easy to manage.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

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

// Keep terminal middleware last so all unmatched routes and thrown errors funnel consistently.
app.use(notFound);
app.use(errorHandler);

export default app;
