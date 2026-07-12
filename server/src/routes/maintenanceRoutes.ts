import { Router } from "express";
import { MaintenanceController } from "../controllers/maintenanceController";
import { authenticate, authorize } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

// Read requests - authenticated users
router.get("/maintenance", authenticate as any, MaintenanceController.getRequests);

// Create request - authenticated users
router.post("/maintenance", authenticate as any, MaintenanceController.createRequest);

// Perform workflow actions - only Asset Manager role
router.post(
  "/maintenance/:id/action",
  authenticate as any,
  authorize([Role.ASSET_MANAGER, Role.ADMIN]) as any,
  MaintenanceController.updateRequestStatus
);

export default router;
