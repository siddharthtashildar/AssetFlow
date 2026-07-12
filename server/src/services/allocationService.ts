import { prisma } from "../config/prisma";
import { AllocationStatus, TransferStatus, AssetStatus } from "@prisma/client";

export class AllocationService {
  static async getAllocations(userId?: string) {
    const whereClause: any = userId ? { userId } : {};
    whereClause.asset = { isBookable: false };
    
    const allocations = await prisma.allocation.findMany({
      where: whereClause,
      include: {
        asset: {
          select: { id: true, name: true, assetTag: true, status: true, condition: true, location: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add isOverdue field for allocations
    return allocations.map((alloc) => ({
      ...alloc,
      isOverdue:
        alloc.status === AllocationStatus.ACTIVE &&
        alloc.expectedReturnDate &&
        new Date(alloc.expectedReturnDate) < new Date(),
    }));
  }

  static async getTransfers(userId?: string) {
    const whereClause: any = userId
      ? {
          OR: [
            { requestedById: userId },
            { targetUserId: userId },
            { allocation: { userId } },
          ],
        }
      : {};
    whereClause.allocation = {
      ...whereClause.allocation,
      asset: { isBookable: false },
    };

    return prisma.transferRequest.findMany({
      where: whereClause,
      include: {
        allocation: {
          include: {
            asset: { select: { id: true, name: true, assetTag: true } },
            user: { select: { id: true, name: true } },
          },
        },
        requestedBy: { select: { id: true, name: true, email: true } },
        targetUser: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createAllocation(data: {
    assetId: string;
    userId: string;
    expectedReturnDate?: string | Date;
  }) {
    const { assetId, userId, expectedReturnDate } = data;

    if (!assetId || !userId) {
      throw new Error("Missing required fields: assetId, userId");
    }

    // 1. Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("Target user not found");
    }

    // 2. Verify asset is available and exists
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      throw new Error("Asset not found");
    }

    // Conflict Rule: cannot allocate asset that is already taken
    if (asset.status !== AssetStatus.AVAILABLE) {
      // Find the current active allocation to show who holds it
      const activeAlloc = await prisma.allocation.findFirst({
        where: { assetId, status: { in: [AllocationStatus.ACTIVE, AllocationStatus.RETURN_REQUESTED] } },
        include: { user: { select: { name: true } } },
      });
      const holderName = activeAlloc?.user?.name ?? "another employee";
      throw new Error(`Conflict: Asset '${asset.name}' is already taken (currently held by ${holderName})`);
    }

    // 3. Create allocation and update asset status to ALLOCATED
    return prisma.$transaction(async (tx) => {
      const allocation = await tx.allocation.create({
        data: {
          assetId,
          userId,
          expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
          status: AllocationStatus.ACTIVE,
        },
        include: {
          asset: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      await tx.asset.update({
        where: { id: assetId },
        data: { status: AssetStatus.ALLOCATED },
      });

      return allocation;
    });
  }

  static async requestReturn(allocationId: string) {
    const allocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
    });

    if (!allocation) {
      throw new Error("Allocation record not found");
    }

    if (allocation.status !== AllocationStatus.ACTIVE) {
      throw new Error(`Cannot request return on an allocation with status: ${allocation.status}`);
    }

    return prisma.allocation.update({
      where: { id: allocationId },
      data: { status: AllocationStatus.RETURN_REQUESTED },
      include: { asset: true, user: true },
    });
  }

  static async completeReturn(allocationId: string, checkInNotes?: string) {
    const allocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
    });

    if (!allocation) {
      throw new Error("Allocation record not found");
    }

    if (allocation.status !== AllocationStatus.ACTIVE && allocation.status !== AllocationStatus.RETURN_REQUESTED) {
      throw new Error(`Cannot complete return on allocation with status: ${allocation.status}`);
    }

    return prisma.$transaction(async (tx) => {
      const updatedAlloc = await tx.allocation.update({
        where: { id: allocationId },
        data: {
          status: AllocationStatus.RETURNED,
          returnedAt: new Date(),
          checkInNotes: checkInNotes ? checkInNotes.trim() : null,
        },
        include: { asset: true, user: true },
      });

      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { status: AssetStatus.AVAILABLE },
      });

      return updatedAlloc;
    });
  }

  static async requestTransfer(data: {
    allocationId: string;
    requestedById: string;
    targetUserId: string;
  }) {
    const { allocationId, requestedById, targetUserId } = data;

    if (!allocationId || !requestedById || !targetUserId) {
      throw new Error("Missing required fields: allocationId, requestedById, targetUserId");
    }

    // 1. Verify requester (requestedById) exists
    const requester = await prisma.user.findUnique({ where: { id: requestedById } });
    if (!requester) {
      throw new Error("Requester user not found");
    }

    // 2. Verify allocation is active and get full details
    const allocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
      include: { asset: true, user: true },
    });
    if (!allocation || (allocation.status !== AllocationStatus.ACTIVE && allocation.status !== AllocationStatus.RETURN_REQUESTED)) {
      throw new Error("Active allocation not found");
    }

    // 3. Verify target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    // 4. Prevent self-transfer (cannot transfer to the same person who currently holds it)
    if (allocation.userId === targetUserId) {
      throw new Error(`Asset '${allocation.asset.name}' is already with ${allocation.user.name}. Cannot transfer to the same user.`);
    }

    // 5. Create transfer request
    return prisma.transferRequest.create({
      data: {
        allocationId,
        requestedById,
        targetUserId,
        status: TransferStatus.REQUESTED,
      },
      include: {
        allocation: { include: { asset: true, user: true } },
        requestedBy: true,
        targetUser: true,
      },
    });
  }

  static async processTransfer(
    transferId: string,
    approvedById: string,
    action: "APPROVE" | "REJECT"
  ) {
    const transfer = await prisma.transferRequest.findUnique({
      where: { id: transferId },
      include: { allocation: true },
    });

    if (!transfer) {
      throw new Error("Transfer request not found");
    }

    if (transfer.status !== TransferStatus.REQUESTED) {
      throw new Error(`Transfer request is already ${transfer.status}`);
    }

    if (action === "REJECT") {
      return prisma.transferRequest.update({
        where: { id: transferId },
        data: {
          status: TransferStatus.REJECTED,
          approvedById,
        },
        include: { allocation: true },
      });
    }

    // Action is APPROVE
    return prisma.$transaction(async (tx) => {
      // 1. Mark transfer request as APPROVED
      const approvedTransfer = await tx.transferRequest.update({
        where: { id: transferId },
        data: {
          status: TransferStatus.APPROVED,
          approvedById,
        },
      });

      // 2. Complete previous allocation
      await tx.allocation.update({
        where: { id: transfer.allocationId },
        data: {
          status: AllocationStatus.RETURNED,
          returnedAt: new Date(),
          checkInNotes: `Transferred to other user via request ${transferId}`,
        },
      });

      // 3. Create new allocation for target user
      await tx.allocation.create({
        data: {
          assetId: transfer.allocation.assetId,
          userId: transfer.targetUserId,
          status: AllocationStatus.ACTIVE,
        },
      });

      return approvedTransfer;
    });
  }
}
