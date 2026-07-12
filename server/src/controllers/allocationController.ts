import { Response } from "express";
import { AllocationService } from "../services/allocationService";
import { AuthenticatedRequest } from "../middleware/auth";
import { Role } from "@prisma/client";

export class AllocationController {
  static async getAllocations(req: AuthenticatedRequest, res: Response) {
    try {
      // Employees only see their own allocations; Admin/AssetManager see all
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const isManagerialRole = userRole && [Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD].includes(userRole as any);
      
      const allocations = await AllocationService.getAllocations(
        isManagerialRole ? undefined : userId
      );
      res.status(200).json(allocations);
    } catch (error: any) {
      console.error("Error getting allocations:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async getTransfers(req: AuthenticatedRequest, res: Response) {
    try {
      // Employees see transfers related to them; managers see all
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const isManagerialRole = userRole && [Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD].includes(userRole as any);
      
      const transfers = await AllocationService.getTransfers(
        isManagerialRole ? undefined : userId
      );
      res.status(200).json(transfers);
    } catch (error: any) {
      console.error("Error getting transfers:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async createAllocation(req: AuthenticatedRequest, res: Response) {
    try {
      const allocation = await AllocationService.createAllocation(req.body);
      res.status(201).json(allocation);
    } catch (error: any) {
      console.error("Error creating allocation:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async requestReturn(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const allocation = await AllocationService.requestReturn(String(id));
      res.status(200).json(allocation);
    } catch (error: any) {
      console.error("Error requesting return:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async completeReturn(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { checkInNotes } = req.body;
      const allocation = await AllocationService.completeReturn(String(id), checkInNotes);
      res.status(200).json(allocation);
    } catch (error: any) {
      console.error("Error completing return:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async requestTransfer(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { allocationId, targetUserId } = req.body;
      const transfer = await AllocationService.requestTransfer({
        allocationId,
        requestedById: req.user.userId,
        targetUserId,
      });
      res.status(201).json(transfer);
    } catch (error: any) {
      console.error("Error requesting transfer:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async processTransfer(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { id } = req.params;
      const { action } = req.body; // "APPROVE" or "REJECT"

      if (action !== "APPROVE" && action !== "REJECT") {
        res.status(400).json({ error: "Invalid action. Must be APPROVE or REJECT" });
        return;
      }

      const transfer = await AllocationService.processTransfer(
        String(id),
        req.user.userId,
        action
      );
      res.status(200).json(transfer);
    } catch (error: any) {
      console.error("Error processing transfer:", error.message);
      res.status(400).json({ error: error.message });
    }
  }
}
