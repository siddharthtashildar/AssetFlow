import { Request, Response } from "express";
import { ReportService } from "../services/reportService";

export class ReportController {
  static async getAnalyticsSummary(req: Request, res: Response) {
    try {
      const data = await ReportService.getAnalyticsSummary();
      res.status(200).json(data);
    } catch (error: any) {
      console.error("Get analytics summary error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
}
