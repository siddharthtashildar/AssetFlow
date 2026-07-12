import { Response } from "express";
import { NotificationService } from "../services/notificationService";
import { AuthenticatedRequest } from "../middleware/auth";

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const list = await NotificationService.getNotifications(req.user.userId);
      res.status(200).json(list);
    } catch (error: any) {
      console.error("Get notifications error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      await NotificationService.markAllAsRead(req.user.userId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Mark all notifications as read error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const { id } = req.params;
      const updated = await NotificationService.markAsRead(id as string, req.user.userId);
      res.status(200).json(updated);
    } catch (error: any) {
      console.error("Mark notification as read error:", error.message);
      res.status(400).json({ error: error.message });
    }
  }
}
