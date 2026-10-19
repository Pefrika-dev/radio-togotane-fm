import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp(): Application {
  const app = express();

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Rate limiting
  const generalLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later" },
  });
  app.use(generalLimiter);

  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  // Logging
  if (config.nodeEnv === "development") {
    app.use(morgan("dev"));
  }

  // Static uploads
  app.use("/uploads", express.static(config.uploadDir));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "Radio Togotane FM API is running", timestamp: new Date().toISOString() });
  });

  // Routes will be mounted here
  // (imported in index.ts)

  // Note: 404 and error handlers are added in index.ts after routes are mounted
  return app;
}
