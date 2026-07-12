import { Response } from "express";
import { MaintenanceService } from "../services/maintenanceService";
import { AuthenticatedRequest } from "../middleware/auth";

export class MaintenanceController {
  static async getRequests(req: AuthenticatedRequest, res: Response) {
    try {
      const requests = await MaintenanceService.getRequests();
      res.status(200).json(requests);
    } catch (error: any) {
      console.error("Error getting maintenance requests:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async createRequest(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { assetId, description, priority, photoUrl } = req.body;
      const request = await MaintenanceService.createRequest({
        assetId,
        description,
        priority,
        raisedById: req.user.userId,
        photoUrl,
      });

      res.status(201).json(request);
    } catch (error: any) {
      console.error("Error creating maintenance request:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async updateRequestStatus(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { id } = req.params;
      const { action, technician, resolutionDetails } = req.body;

      if (!action) {
        res.status(400).json({ error: "Action is required" });
        return;
      }

      const request = await MaintenanceService.updateRequestStatus(
        id as string,
        action as any,
        req.user.role,
        { technician, resolutionDetails }
      );

      res.status(200).json(request);
    } catch (error: any) {
      console.error("Error updating maintenance request status:", error.message);
      res.status(400).json({ error: error.message });
    }
  }
}
