import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { prisma } from "../config/prisma";

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { dbUser?: any };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Check cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    const payload = verifyToken(token);

    // Verify user still exists and is active
    const user = await prisma.adminUser.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedError("User not found or inactive");
    }

    req.user = { ...payload, dbUser: user };
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Invalid or expired token"));
    } else {
      next(err);
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }
    next();
  };
}

// Need to import jwt for error types
import jwt from "jsonwebtoken";
