import { Router } from "express";
import { NotificationController } from "../controllers/notificationController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/notifications", authenticate as any, NotificationController.getNotifications);
router.post("/notifications/read-all", authenticate as any, NotificationController.markAllAsRead);
router.patch("/notifications/:id/read", authenticate as any, NotificationController.markAsRead);

export default router;
