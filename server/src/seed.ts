import { prisma } from "./config/prisma";
import { hashPassword } from "./utils/auth";
import { Role, AssetStatus, AssetCondition, AllocationStatus, TransferStatus } from "@prisma/client";

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Clean existing allocations, transfers, assets, categories, users, departments, and audit cycles
  console.log("🧹 Cleaning existing data...");
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  // Delete maintenance requests first because they reference assets
  await prisma.maintenanceRequest.deleteMany();
  await prisma.auditItem.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.transferRequest.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 2. Create Users
  console.log("👤 Creating mock users...");
  const hashedPassword = await hashPassword("password123");

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@assetflow.io",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Sarah Jenkins",
      email: "manager@assetflow.io",
      password: hashedPassword,
      role: Role.ASSET_MANAGER,
    },
  });

  const emp1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@assetflow.io",
      password: hashedPassword,
      role: Role.EMPLOYEE,
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane.smith@assetflow.io",
      password: hashedPassword,
      role: Role.EMPLOYEE,
    },
  });

  console.log("   ✅ Users created.");

  // 3. Create Categories
  console.log("📦 Creating asset categories...");
  const catLaptops = await prisma.assetCategory.create({
    data: { name: "Laptops", description: "Straight line (3 years)" },
  });

  const catMobile = await prisma.assetCategory.create({
    data: { name: "Mobile Devices", description: "Straight line (2 years)" },
  });

  const catMonitors = await prisma.assetCategory.create({
    data: { name: "Monitors & Displays", description: "Straight line (4 years)" },
  });

  const catFurniture = await prisma.assetCategory.create({
    data: { name: "Office Furniture", description: "None" },
  });

  console.log("   ✅ Categories created.");

  // 4. Create Assets
  console.log("💻 Creating mock assets...");
  const asset1 = await prisma.asset.create({
    data: {
      name: 'MacBook Pro 16" M3 Max',
      assetTag: "AF-1001",
      serialNumber: "SN-MAC-001",
      categoryId: catLaptops.id,
      condition: AssetCondition.EXCELLENT,
      status: AssetStatus.ALLOCATED,
      acquisitionCost: 3499.00,
      acquisitionDate: new Date("2026-01-15"),
      location: "HQ - Floor 3",
      isBookable: false,
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      name: "ThinkPad X1 Carbon Gen 11",
      assetTag: "AF-1002",
      serialNumber: "SN-THINK-002",
      categoryId: catLaptops.id,
      condition: AssetCondition.GOOD,
      status: AssetStatus.ALLOCATED,
      acquisitionCost: 1899.00,
      acquisitionDate: new Date("2026-02-10"),
      location: "HQ - Floor 5",
      isBookable: false,
    },
  });

  const asset3 = await prisma.asset.create({
    data: {
      name: "iPhone 15 Pro Max 256GB",
      assetTag: "AF-1003",
      serialNumber: "SN-IPH-003",
      categoryId: catMobile.id,
      condition: AssetCondition.EXCELLENT,
      status: AssetStatus.ALLOCATED,
      acquisitionCost: 1199.00,
      acquisitionDate: new Date("2026-03-01"),
      location: "HQ - Floor 3",
      isBookable: false,
    },
  });

  const asset4 = await prisma.asset.create({
    data: {
      name: "iPad Pro 12.9\" M2",
      assetTag: "AF-1004",
      serialNumber: "SN-IPAD-004",
      categoryId: catMobile.id,
      condition: AssetCondition.EXCELLENT,
      status: AssetStatus.AVAILABLE,
      acquisitionCost: 1099.00,
      acquisitionDate: new Date("2026-03-05"),
      location: "HQ - Storage Room A",
      isBookable: true,
    },
  });

  const asset5 = await prisma.asset.create({
    data: {
      name: 'Dell UltraSharp 32" 4K Monitor',
      assetTag: "AF-1005",
      serialNumber: "SN-DELL-005",
      categoryId: catMonitors.id,
      condition: AssetCondition.GOOD,
      status: AssetStatus.AVAILABLE,
      acquisitionCost: 799.00,
      acquisitionDate: new Date("2025-11-20"),
      location: "HQ - Storage Room B",
      isBookable: true,
    },
  });

  const asset6 = await prisma.asset.create({
    data: {
      name: "Herman Miller Aeron Chair",
      assetTag: "AF-1006",
      serialNumber: "SN-AERON-006",
      categoryId: catFurniture.id,
      condition: AssetCondition.EXCELLENT,
      status: AssetStatus.AVAILABLE,
      acquisitionCost: 1499.00,
      acquisitionDate: new Date("2026-01-05"),
      location: "HQ - Floor 2 Executive Office",
      isBookable: false,
    },
  });

  console.log("   ✅ Assets created.");

  // 5. Create Allocations
  console.log("📝 Creating allocations...");
  // Allocation 1: Active allocation to John Doe
  await prisma.allocation.create({
    data: {
      assetId: asset1.id,
      userId: emp1.id,
      createdAt: new Date("2026-01-16"),
      expectedReturnDate: new Date("2026-07-16"),
      status: AllocationStatus.ACTIVE,
    },
  });

  // Allocation 2: Active allocation to Jane Smith (will be used for Transfer Request)
  const alloc2 = await prisma.allocation.create({
    data: {
      assetId: asset2.id,
      userId: emp2.id,
      createdAt: new Date("2026-02-11"),
      expectedReturnDate: new Date("2026-08-11"),
      status: AllocationStatus.ACTIVE,
    },
  });

  // Allocation 3: Allocation requested return state
  const alloc3 = await prisma.allocation.create({
    data: {
      assetId: asset3.id,
      userId: emp1.id,
      createdAt: new Date("2026-03-02"),
      expectedReturnDate: new Date("2026-09-02"),
      status: AllocationStatus.RETURN_REQUESTED,
    },
  });

  // Historical allocation (returned)
  await prisma.allocation.create({
    data: {
      assetId: asset5.id,
      userId: emp2.id,
      createdAt: new Date("2025-11-21"),
      expectedReturnDate: new Date("2026-05-21"),
      returnedAt: new Date("2026-04-15"),
      status: AllocationStatus.RETURNED,
      checkInNotes: "Returned monitor in original condition",
    },
  });

  console.log("   ✅ Allocations created.");

  // 6. Create Transfer Request
  console.log("🔀 Creating transfer requests...");
  await prisma.transferRequest.create({
    data: {
      allocationId: alloc2.id,
      requestedById: emp2.id,
      targetUserId: emp1.id,
      status: TransferStatus.REQUESTED,
    },
  });

  console.log("   ✅ Transfer requests created.");
  console.log("\n🚀 Database Seeding Completed Successfully! You can now log in using:\n");
  console.log("   Admin:    admin@assetflow.io   / password123");
  console.log("   Manager:  manager@assetflow.io / password123");
  console.log("   Employee: john.doe@assetflow.io / password123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
