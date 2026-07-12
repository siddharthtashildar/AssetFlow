import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { DashboardService } from "../services/dashboardService";

export class DashboardController {
  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "User is not authenticated" });
        return;
      }
      const stats = await DashboardService.getStats(userId);
      res.status(200).json(stats);
    } catch (error: any) {
      console.error("Error getting dashboard stats:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
}
