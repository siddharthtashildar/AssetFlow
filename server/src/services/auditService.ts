import { prisma } from "../config/prisma";
import { AuditStatus, AuditResult, AssetStatus, AssetCondition } from "@prisma/client";

export class AuditService {
  static async getAudits() {
    return prisma.auditCycle.findMany({
      include: {
        department: {
          select: { id: true, name: true }
        },
        auditItems: {
          include: {
            asset: {
              select: {
                id: true,
                name: true,
                assetTag: true,
                serialNumber: true,
                status: true,
                condition: true,
                location: true,
                category: {
                  select: { id: true, name: true }
                }
              }
            },
            auditor: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async createAuditCycle(data: {
    title: string;
    startDate: string;
    endDate: string;
    departmentId?: string;
    categoryId?: string;
    auditorId: string;
  }) {
    const { title, startDate, endDate, departmentId, categoryId, auditorId } = data;

    if (!title || !startDate || !endDate || !auditorId) {
      throw new Error("Missing required fields for audit cycle");
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
      throw new Error("Please provide valid start and end dates");
    }

    if (parsedEndDate < parsedStartDate) {
      throw new Error("End date cannot be earlier than the start date");
    }

    // Ensure auditor exists
    const auditor = await prisma.user.findUnique({
      where: { id: auditorId }
    });
    if (!auditor) {
      throw new Error("Auditor user not found");
    }

    // Find scoped assets
    const whereClause: any = {};
    if (departmentId && departmentId !== "all") {
      whereClause.departmentId = departmentId;
    }
    if (categoryId && categoryId !== "all") {
      whereClause.categoryId = categoryId;
    }
    // Only audit assets that are not retired or disposed
    whereClause.status = {
      notIn: [AssetStatus.RETIRED, AssetStatus.DISPOSED]
    };

    const assets = await prisma.asset.findMany({
      where: whereClause
    });

    // Create audit cycle even if no assets match the selected scope.
    const cycle = await prisma.auditCycle.create({
      data: {
        title: title.trim(),
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        departmentId: (departmentId && departmentId !== "all") ? departmentId : null,
      }
    });

    if (assets.length > 0) {
      // Prepare audit items data
      const auditItemsData = assets.map((asset) => ({
        auditCycleId: cycle.id,
        assetId: asset.id,
        auditorId: auditorId,
        result: AuditResult.PENDING,
      }));

      // Try bulk insert first, but fall back to individual creates on failure
      try {
        await prisma.auditItem.createMany({
          data: auditItemsData,
        });
      } catch (err) {
        console.error("prisma.auditItem.createMany failed - falling back to individual creates:", err);
        for (const itemData of auditItemsData) {
          try {
            await prisma.auditItem.create({ data: itemData });
          } catch (err2: any) {
            console.error("Failed to create audit item for asset", itemData.assetId, err2?.message || err2);

            // If the error indicates an invalid enum input, retry using a lowercased enum string (some DBs store enums in lowercase)
            const msg = String(err2?.message || "").toLowerCase();
            if (msg.includes("invalid input value") && msg.includes("enum") && msg.includes("auditresult")) {
              try {
                const retryData = {
                  ...itemData,
                  // force result to a lowercased string and bypass TS enum typing
                  result: (String(itemData.result).toLowerCase() as unknown) as any,
                };
                await prisma.auditItem.create({ data: retryData as any });
                console.info("Created audit item with lowercased enum fallback for asset", itemData.assetId);
              } catch (err3) {
                console.error("Retry create with lowercased enum also failed for asset", itemData.assetId, err3);
              }
            }
          }
        }
      }

      // Create notification for the assigned auditor (best-effort)
      try {
        await prisma.notification.create({
          data: {
            userId: auditorId,
            type: "AUDIT",
            title: "New Audit Cycle Assigned",
            message: `You have been assigned as the auditor for cycle "${title.trim()}" (${assets.length} assets).`,
            link: "/audits",
          },
        });
      } catch (err) {
        console.error("Failed to create audit notification:", err);
      }
    }

    return prisma.auditCycle.findUnique({
      where: { id: cycle.id },
      include: {
        department: {
          select: { id: true, name: true }
        },
        auditItems: {
          include: {
            asset: true,
            auditor: true
          }
        }
      }
    });
  }

  static async updateAuditItem(
    itemId: string,
    userId: string,
    userRole: string,
    data: { result: AuditResult; remarks?: string }
  ) {
    const { result, remarks } = data;

    const auditItem = await prisma.auditItem.findUnique({
      where: { id: itemId },
      include: {
        auditCycle: true,
        asset: true
      }
    });

    if (!auditItem) {
      throw new Error("Audit item not found");
    }

    if (auditItem.auditCycle.status === AuditStatus.CLOSED) {
      throw new Error("Cannot update items in a closed audit cycle");
    }

    // Verify user is assigned auditor or has admin/manager role
    const isAssignedAuditor = auditItem.auditorId === userId;
    const isManagerOrAdmin = userRole === "ADMIN" || userRole === "ASSET_MANAGER";

    if (!isAssignedAuditor && !isManagerOrAdmin) {
      throw new Error("Unauthorized: You are not assigned to audit this asset");
    }

    // Validate result
    if (!Object.values(AuditResult).includes(result)) {
      throw new Error("Invalid audit result");
    }

    const updatedItem = await prisma.auditItem.update({
      where: { id: itemId },
      data: {
        result,
        remarks: remarks !== undefined ? remarks.trim() || null : undefined,
      },
      include: {
        asset: {
          select: { id: true, name: true, assetTag: true }
        },
        auditor: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // If marked as MISSING or DAMAGED, notify Admin & Asset Manager
    if (result === AuditResult.MISSING || result === AuditResult.DAMAGED) {
      const severityText = result === AuditResult.MISSING ? "MISSING" : "DAMAGED";
      const managers = await prisma.user.findMany({
        where: {
          role: { in: ["ADMIN", "ASSET_MANAGER"] }
        }
      });

      await Promise.all(
        managers.map((mgr) =>
          prisma.notification.create({
            data: {
              userId: mgr.id,
              type: "AUDIT",
              title: `Audit Discrepancy Flagged: ${severityText}`,
              message: `Asset ${auditItem.asset.assetTag} (${auditItem.asset.name}) marked as ${severityText} in cycle "${auditItem.auditCycle.title}".`,
              link: "/audits"
            }
          })
        )
      );
    }

    return updatedItem;
  }

  static async closeAuditCycle(cycleId: string, userRole: string) {
    if (userRole !== "ADMIN" && userRole !== "ASSET_MANAGER") {
      throw new Error("Unauthorized: Only Admins or Asset Managers can close audit cycles");
    }

    const cycle = await prisma.auditCycle.findUnique({
      where: { id: cycleId },
      include: {
        auditItems: {
          include: {
            asset: true
          }
        }
      }
    });

    if (!cycle) {
      throw new Error("Audit cycle not found");
    }

    if (cycle.status === AuditStatus.CLOSED) {
      throw new Error("Audit cycle is already closed");
    }

    // Update status to CLOSED
    const updatedCycle = await prisma.auditCycle.update({
      where: { id: cycleId },
      data: { status: AuditStatus.CLOSED }
    });

    // Process each audit item
    for (const item of cycle.auditItems) {
      if (item.result === AuditResult.MISSING) {
        await prisma.asset.update({
          where: { id: item.assetId },
          data: { status: AssetStatus.LOST }
        });
      } else if (item.result === AuditResult.DAMAGED) {
        await prisma.asset.update({
          where: { id: item.assetId },
          data: { condition: AssetCondition.DAMAGED }
        });
      }
    }

    return updatedCycle;
  }
}
