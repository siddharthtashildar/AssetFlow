import { Router } from "express";
import { ReportController } from "../controllers/reportController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/reports/summary", authenticate as any, ReportController.getAnalyticsSummary);

export default router;
