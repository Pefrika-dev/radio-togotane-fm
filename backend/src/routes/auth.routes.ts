import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { authenticate, authorize } from "../middleware/auth";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";
import { sendSuccess } from "../utils/response";
import { config } from "../config";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

// POST /api/auth/login
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }
    if (!user.isActive) {
      throw new AppError("Account is disabled", 403);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        entityType: "AdminUser",
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    sendSuccess(res, {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  })
);

// POST /api/auth/logout
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    res.clearCookie("token");
    sendSuccess(res, null, "Logged out");
  })
);

// GET /api/auth/me
router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.adminUser.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
    });
    sendSuccess(res, user);
  })
);

// POST /api/auth/change-password
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.adminUser.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError("User not found", 404);

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) throw new AppError("Current password is incorrect", 400);

    const newHash = await hashPassword(newPassword);
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_CHANGE",
        entityType: "AdminUser",
        entityId: user.id,
      },
    });

    sendSuccess(res, null, "Password changed successfully");
  })
);

export { router as authRoutes };
export default router;
