import { Request, Response } from "express";
import { AssetService } from "../services/assetService";

export class AssetController {
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await AssetService.getCategories();
      res.status(200).json(categories);
    } catch (error: any) {
      console.error("Error getting categories:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const category = await AssetService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error: any) {
      console.error("Error creating category:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async getAssets(req: Request, res: Response) {
    try {
      const { status, category, search } = req.query;
      const assets = await AssetService.getAssets({
        status: status ? String(status) : undefined,
        category: category ? String(category) : undefined,
        search: search ? String(search) : undefined,
      });
      res.status(200).json(assets);
    } catch (error: any) {
      console.error("Error getting assets:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async createAsset(req: Request, res: Response) {
    try {
      const asset = await AssetService.createAsset(req.body);
      res.status(201).json(asset);
    } catch (error: any) {
      console.error("Error creating asset:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await AssetService.deleteCategory(id);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error deleting category:", error.message);
      res.status(400).json({ error: error.message });
    }
  }
}
