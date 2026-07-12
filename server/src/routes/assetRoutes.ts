import { Router } from "express";
import { AssetController } from "../controllers/assetController";
import { authenticate, authorize } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

// Retrieve categories - authenticated users
router.get("/categories", authenticate as any, AssetController.getCategories);
router.post(
  "/categories",
  authenticate as any,
  authorize([Role.ADMIN, Role.ASSET_MANAGER]) as any,
  AssetController.createCategory
);
router.delete(
  "/categories/:id",
  authenticate as any,
  authorize([Role.ADMIN, Role.ASSET_MANAGER]) as any,
  AssetController.deleteCategory
);

// Asset directory routes - authenticated users can read, only admin & asset managers can register
router.get("/assets", authenticate as any, AssetController.getAssets);
router.post(
  "/assets",
  authenticate as any,
  authorize([Role.ADMIN, Role.ASSET_MANAGER]) as any,
  AssetController.createAsset
);

export default router;
