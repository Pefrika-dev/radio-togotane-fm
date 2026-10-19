import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { config } from "../config";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log error
  if (config.nodeEnv === "development") {
    console.error("Error:", err);
  }

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({ success: false, message: "A record with this value already exists" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, message: "Record not found" });
  }

  // App errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors?.map((e: any) => ({ path: e.path.join("."), message: e.message })),
    });
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "File too large" });
  }

  // Default
  const statusCode = err.statusCode || 500;
  const message = config.nodeEnv === "production" ? "Internal server error" : err.message || "Internal server error";
  return res.status(statusCode).json({ success: false, message });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
}
