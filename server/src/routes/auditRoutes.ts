import { Router } from "express";
import { AuditController } from "../controllers/auditController";
import { authenticate, authorize } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

// Retrieve all audit cycles - authenticated users
router.get("/audits", authenticate as any, AuditController.getAudits);

// Create new audit cycle - Admins & Asset Managers
router.post(
  "/audits",
  authenticate as any,
  authorize([Role.ADMIN, Role.ASSET_MANAGER]) as any,
  AuditController.createAuditCycle
);

// Update a single audit item's result/remarks - authenticated users (service verifies auditor status or role)
router.patch(
  "/audits/items/:itemId",
  authenticate as any,
  AuditController.updateAuditItem
);

// Close and lock audit cycle - Admins & Asset Managers
router.post(
  "/audits/:id/close",
  authenticate as any,
  authorize([Role.ADMIN, Role.ASSET_MANAGER]) as any,
  AuditController.closeAuditCycle
);

export default router;
