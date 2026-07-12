import { Router } from "express";
import { AllocationController } from "../controllers/allocationController";
import { authenticate, authorize } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

// Read operations - authenticated users
router.get("/allocations", authenticate as any, AllocationController.getAllocations);
router.get("/transfers", authenticate as any, AllocationController.getTransfers);

// Allocate asset - Admin & Asset Managers
router.post(
  "/allocations",
  authenticate as any,
  authorize([Role.ADMIN, Role.ASSET_MANAGER]) as any,
  AllocationController.createAllocation
);

// Initiate return request - Authenticated users
router.post(
  "/allocations/:id/return-request",
  authenticate as any,
  AllocationController.requestReturn
);

// Complete/Approve return - Admin & Asset Managers (approves returns & check-in condition notes)
router.post(
  "/allocations/:id/return",
  authenticate as any,
  authorize([Role.ADMIN, Role.ASSET_MANAGER]) as any,
  AllocationController.completeReturn
);

// Request asset transfer - Authenticated users
router.post(
  "/transfers",
  authenticate as any,
  AllocationController.requestTransfer
);

// Process transfer (Approve/Reject) - Admin, Asset Manager, or Department Head
router.post(
  "/transfers/:id/process",
  authenticate as any,
  authorize([Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD]) as any,
  AllocationController.processTransfer
);

export default router;
