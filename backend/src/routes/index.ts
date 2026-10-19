import { Express } from "express";
import { authRoutes } from "./auth.routes";
import { publicRoutes } from "./public.routes";
import { adminRoutes } from "./admin.routes";
import { uploadRoutes } from "./upload.routes";

export function mountRoutes(app: Express) {
  app.use("/api/auth", authRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/upload", uploadRoutes);
}
