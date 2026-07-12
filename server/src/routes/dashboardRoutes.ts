import { Router } from "express";
import { DashboardController } from "../controllers/dashboardController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/dashboard/stats", authenticate as any, DashboardController.getStats as any);

export default router;
