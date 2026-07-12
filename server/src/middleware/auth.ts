import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Access token is missing or invalid" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: "Access token is expired or invalid" });
    return;
  }

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!userExists) {
      res.status(401).json({ error: "User session is invalid. Please log in again." });
      return;
    }
  } catch (err: any) {
    res.status(500).json({ error: "Database error during authentication: " + err.message });
    return;
  }

  req.user = decoded;
  next();
}

export function authorize(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "User is not authenticated" });
      return;
    }

    const hasRole = allowedRoles.includes(req.user.role as Role);
    if (!hasRole) {
      res.status(403).json({ error: "Forbidden: You do not have permission to access this resource" });
      return;
    }

    next();
  };
}
