import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { verifyToken } from "../utils/auth";
import { AuthenticatedRequest } from "../middleware/auth";

export class UserController {
  static async getSystemStatus(req: Request, res: Response) {
    try {
      const userCount = await prisma.user.count();
      res.status(200).json({ hasUsers: userCount > 0 });
    } catch (error: any) {
      console.error("Status error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getUsers();
      res.status(200).json(users);
    } catch (error: any) {
      console.error("Get users error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async getDepartments(req: Request, res: Response) {
    try {
      const departments = await UserService.getDepartments();
      res.status(200).json(departments);
    } catch (error: any) {
      console.error("Get departments error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async signup(req: Request, res: Response) {
    try {
      const userCount = await prisma.user.count();
      let requesterRole: Role | undefined = undefined;

      if (userCount > 0) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          res.status(401).json({ error: "Access token is missing. Only Admins can register new employees." });
          return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== Role.ADMIN) {
          res.status(403).json({ error: "Forbidden: Only Admins can register employees." });
          return;
        }
        requesterRole = decoded.role as Role;
      }

      const result = await UserService.signup(req.body, requesterRole);
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Signup error:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await UserService.login(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Login error:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async promoteUser(req: Request, res: Response) {
    try {
      const { targetUserId, role } = req.body;
      if (!targetUserId || !role) {
        res.status(400).json({ error: "Missing required fields: targetUserId, role" });
        return;
      }

      const updatedUser = await UserService.promoteUser(targetUserId, role as Role);
      res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error("Promotion error:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const updatedUser = await UserService.updateProfile(req.user.userId, req.body);
      res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error("Update profile error:", error.message);
      res.status(400).json({ error: error.message });
    }
  }
}
