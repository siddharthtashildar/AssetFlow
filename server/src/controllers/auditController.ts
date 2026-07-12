import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { AuditService } from "../services/auditService";

export class AuditController {
  static async getAudits(req: AuthenticatedRequest, res: Response) {
    try {
      const audits = await AuditService.getAudits();
      res.status(200).json(audits);
    } catch (error: any) {
      console.error("Error getting audits:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async createAuditCycle(req: AuthenticatedRequest, res: Response) {
    try {
      const cycle = await AuditService.createAuditCycle(req.body);
      res.status(201).json(cycle);
    } catch (error: any) {
      console.error("Error creating audit cycle:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async updateAuditItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { itemId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const item = await AuditService.updateAuditItem(itemId as string, userId, userRole, req.body);
      res.status(200).json(item);
    } catch (error: any) {
      console.error("Error updating audit item:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async closeAuditCycle(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const cycle = await AuditService.closeAuditCycle(id as string, userRole);
      res.status(200).json(cycle);
    } catch (error: any) {
      console.error("Error closing audit cycle:", error.message);
      res.status(400).json({ error: error.message });
    }
  }
}
