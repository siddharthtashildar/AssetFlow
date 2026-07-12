import { prisma } from "../config/prisma";
import { AssetCondition, AssetStatus } from "@prisma/client";

export class AssetService {
  static async getCategories() {
    const list = await prisma.assetCategory.findMany({
      include: {
        _count: {
          select: { assets: true },
        },
      },
      orderBy: { name: "asc" },
    });

    if (list.length === 0) {
      const defaults = [
        { name: "Laptops", description: "Straight line (3 years)" },
        { name: "Servers & Network", description: "Straight line (5 years)" },
        { name: "Monitors & Displays", description: "Straight line (4 years)" },
        { name: "Mobile Devices", description: "Straight line (2 years)" },
        { name: "Office Furniture", description: "None" },
      ];
      await prisma.assetCategory.createMany({
        data: defaults,
      });
      return prisma.assetCategory.findMany({
        include: {
          _count: {
            select: { assets: true },
          },
        },
        orderBy: { name: "asc" },
      });
    }

    return list;
  }

  static async createCategory(data: { name: string; description?: string; depreciation?: string }) {
    const { name, description, depreciation } = data;
    if (!name) {
      throw new Error("Category name is required");
    }
    const trimmed = name.trim();
    const existing = await prisma.assetCategory.findFirst({
      where: { name: { equals: trimmed, mode: "insensitive" } },
    });
    if (existing) {
      throw new Error(`Category '${trimmed}' already exists`);
    }
    return prisma.assetCategory.create({
      data: {
        name: trimmed,
        description: (description || depreciation || "").trim() || null,
      },
    });
  }

  static async deleteCategory(id: string) {
    if (!id) {
      throw new Error("Category ID is required");
    }
    const category = await prisma.assetCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });
    if (!category) {
      throw new Error("Category not found");
    }
    if (category._count.assets > 0) {
      throw new Error(`Cannot delete category '${category.name}' because it contains ${category._count.assets} asset(s).`);
    }
    return prisma.assetCategory.delete({
      where: { id },
    });
  }

  static async getAssets(filters: {
    status?: string;
    category?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters.status && filters.status !== "all") {
      where.status = filters.status.toUpperCase() as AssetStatus;
    }

    if (filters.category && filters.category !== "all") {
      // filters.category could be category ID or category name
      where.category = {
        name: filters.category,
      };
    }

    if (filters.search) {
      const query = filters.search.trim().toLowerCase();
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { assetTag: { contains: query, mode: "insensitive" } },
        { serialNumber: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
      ];
    }

    return prisma.asset.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
        allocations: {
          where: {
            status: {
              in: ["ACTIVE", "RETURN_REQUESTED", "OVERDUE"],
            },
          },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createAsset(data: any) {
    const {
      name,
      categoryName,
      serialNumber,
      condition,
      status,
      location,
      acquisitionCost,
      acquisitionDate,
      isBookable,
      assetTag,
    } = data;

    if (!name || !categoryName || !condition) {
      throw new Error("Missing required fields: name, categoryName, condition");
    }

    // Resolve Category
    const trimmedCategory = categoryName.trim();
    let category = await prisma.assetCategory.findFirst({
      where: { name: { equals: trimmedCategory, mode: "insensitive" } },
    });

    if (!category) {
      category = await prisma.assetCategory.create({
        data: { name: trimmedCategory },
      });
    }

    // Validate Condition
    const conditionUpper = condition.toUpperCase().trim();
    const validConditions = Object.values(AssetCondition) as string[];
    if (!validConditions.includes(conditionUpper)) {
      throw new Error(`Invalid condition. Must be one of: ${validConditions.join(", ")}`);
    }

    // Validate Status
    let statusEnum: AssetStatus = AssetStatus.AVAILABLE;
    if (status) {
      const statusUpper = status.toUpperCase().trim();
      const validStatuses = Object.values(AssetStatus) as string[];
      if (validStatuses.includes(statusUpper)) {
        statusEnum = statusUpper as AssetStatus;
      }
    }

    // Generate or Validate Asset Tag
    let resolvedTag = assetTag ? assetTag.trim() : "";
    if (!resolvedTag) {
      const count = await prisma.asset.count();
      resolvedTag = `AF-${(count + 1001).toString()}`;
    }

    // Check if tag already exists
    const existingAssetByTag = await prisma.asset.findUnique({
      where: { assetTag: resolvedTag },
    });
    if (existingAssetByTag) {
      if (assetTag) {
        throw new Error(`Asset Tag '${resolvedTag}' already exists`);
      }
      // If auto-generated, append a unique timestamp to prevent race condition collision
      resolvedTag = `AF-${Date.now().toString().slice(-6)}`;
    }

    // Check unique serial number if provided
    if (serialNumber && serialNumber.trim()) {
      const existingBySerial = await prisma.asset.findUnique({
        where: { serialNumber: serialNumber.trim() },
      });
      if (existingBySerial) {
        throw new Error(`Serial Number '${serialNumber}' is already registered`);
      }
    }

    // Create the asset
    return prisma.asset.create({
      data: {
        name: name.trim(),
        assetTag: resolvedTag,
        serialNumber: serialNumber ? serialNumber.trim() : null,
        categoryId: category.id,
        condition: conditionUpper as AssetCondition,
        status: statusEnum,
        location: location ? location.trim() : null,
        acquisitionCost: acquisitionCost ? parseFloat(acquisitionCost) : null,
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : null,
        isBookable: Boolean(isBookable),
      },
      include: {
        category: true,
      },
    });
  }
}
