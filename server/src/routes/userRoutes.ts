import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticate, authorize } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

// Public auth routes
router.get("/auth/status", UserController.getSystemStatus);
router.post("/auth/signup", UserController.signup);
router.post("/auth/login", UserController.login);

// Retrieve users - authenticated users
router.get("/users", authenticate as any, UserController.getUsers);

// Admin-only user management routes
router.post(
  "/users/promote",
  authenticate as any,
  authorize([Role.ADMIN]) as any,
  UserController.promoteUser
);

export default router;
