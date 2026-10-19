import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "10", 10),
  adminEmail: process.env.ADMIN_EMAIL || "admin@radiotogotane.co.ke",
  adminPassword: process.env.ADMIN_PASSWORD || "ChangeMe123!",
  adminName: process.env.ADMIN_NAME || "Station Administrator",
};
