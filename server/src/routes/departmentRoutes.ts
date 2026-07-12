import { Router } from "express";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../controllers/departmentController";
import { authenticate, authorize } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

// Everyone can view departments
router.get("/departments", authenticate, getDepartments);

// Only admins can modify departments
router.post("/departments", authenticate, authorize([Role.ADMIN]), createDepartment);
router.put("/departments/:id", authenticate, authorize([Role.ADMIN]), updateDepartment);
router.delete("/departments/:id", authenticate, authorize([Role.ADMIN]), deleteDepartment);

export default router;
