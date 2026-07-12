import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { Role } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export function authenticate(
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
