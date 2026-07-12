import { prisma } from "../config/prisma";
import { MaintenanceStatus, Priority, AssetStatus, Role } from "@prisma/client";

export class MaintenanceService {
  static async getRequests() {
    return prisma.maintenanceRequest.findMany({
      include: {
        asset: {
          select: { id: true, name: true, assetTag: true, status: true },
        },
        raisedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createRequest(data: {
    assetId: string;
    description: string;
    priority: string;
    raisedById: string;
    photoUrl?: string;
  }) {
    const { assetId, description, priority, raisedById, photoUrl } = data;

    if (!assetId || !description || !priority) {
      throw new Error("Missing required fields: assetId, description, priority");
    }

    // 1. Verify asset exists
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      throw new Error("Asset not found");
    }

    // 2. Validate priority
    const priorityUpper = priority.toUpperCase().trim();
    const validPriorities = Object.values(Priority) as string[];
    if (!validPriorities.includes(priorityUpper)) {
      throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(", ")}`);
    }

    // 3. Create the maintenance request
    return prisma.maintenanceRequest.create({
      data: {
        assetId,
        description: description.trim(),
        priority: priorityUpper as Priority,
        raisedById,
        status: MaintenanceStatus.PENDING,
        photoUrl: photoUrl ? photoUrl.trim() : null,
      },
      include: {
        asset: true,
        raisedBy: { select: { id: true, name: true, email: true } },
      },
    });

  }

  static async updateRequestStatus(
    id: string,
    action: "APPROVE" | "REJECT" | "ASSIGN_TECHNICIAN" | "START_WORK" | "RESOLVE",
    userRole: string,
    payload?: { technician?: string; resolutionDetails?: string }
  ) {
    // Enforce role-based permission
    if (userRole !== Role.ASSET_MANAGER && userRole !== Role.ADMIN) {
      throw new Error("Forbidden: Only Asset Managers and Admins can execute workflow actions.");
    }

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!request) {
      throw new Error("Maintenance request not found");
    }

    switch (action) {
      case "APPROVE": {
        if (request.status !== MaintenanceStatus.PENDING) {
          throw new Error(`Cannot approve a request with status: ${request.status}`);
        }

        return prisma.$transaction(async (tx) => {
          const updatedRequest = await tx.maintenanceRequest.update({
            where: { id },
            data: { status: MaintenanceStatus.APPROVED },
            include: { asset: true, raisedBy: true },
          });

          await tx.asset.update({
            where: { id: request.assetId },
            data: { status: AssetStatus.UNDER_MAINTENANCE },
          });

          return updatedRequest;
        });
      }

      case "REJECT": {
        if (request.status !== MaintenanceStatus.PENDING) {
          throw new Error(`Cannot reject a request with status: ${request.status}`);
        }

        return prisma.maintenanceRequest.update({
          where: { id },
          data: { status: MaintenanceStatus.REJECTED },
          include: { asset: true, raisedBy: true },
        });
      }

      case "ASSIGN_TECHNICIAN": {
        if (request.status !== MaintenanceStatus.APPROVED) {
          throw new Error(`Cannot assign a technician to a request with status: ${request.status}`);
        }

        const technician = payload?.technician?.trim();
        if (!technician) {
          throw new Error("Technician name is required");
        }

        return prisma.maintenanceRequest.update({
          where: { id },
          data: {
            status: MaintenanceStatus.ASSIGNED,
            technician,
          },
          include: { asset: true, raisedBy: true },
        });
      }

      case "START_WORK": {
        if (request.status !== MaintenanceStatus.ASSIGNED) {
          throw new Error(`Cannot start work on a request with status: ${request.status}`);
        }

        return prisma.maintenanceRequest.update({
          where: { id },
          data: { status: MaintenanceStatus.IN_PROGRESS },
          include: { asset: true, raisedBy: true },
        });
      }

      case "RESOLVE": {
        if (request.status !== MaintenanceStatus.IN_PROGRESS) {
          throw new Error(`Cannot resolve a request with status: ${request.status}`);
        }

        const resolutionDetails = payload?.resolutionDetails?.trim() || "Resolved successfully";

        return prisma.$transaction(async (tx) => {
          const updatedRequest = await tx.maintenanceRequest.update({
            where: { id },
            data: {
              status: MaintenanceStatus.RESOLVED,
              resolutionDetails,
            },
            include: { asset: true, raisedBy: true },
          });

          await tx.asset.update({
            where: { id: request.assetId },
            data: { status: AssetStatus.AVAILABLE },
          });

          return updatedRequest;
        });
      }

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  }
}
