import { prisma } from "../src/config/prisma";
import { AssetCondition, AssetStatus } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding bookable assets...");

  // 1. Ensure the appropriate categories exist (upsert based on unique name)
  const catMeetingRooms = await prisma.assetCategory.upsert({
    where: { name: "Meeting Room Systems" },
    update: {},
    create: { name: "Meeting Room Systems", description: "Meeting Room Systems" },
  });

  const catVehicles = await prisma.assetCategory.upsert({
    where: { name: "Vehicles" },
    update: {},
    create: { name: "Vehicles", description: "Company Fleet" },
  });

  const catLabEquip = await prisma.assetCategory.upsert({
    where: { name: "Lab & Test Equipment" },
    update: {},
    create: { name: "Lab & Test Equipment", description: "Scientific and test hardware" },
  });

  // 2. Define the exact 6 shareable resources
  const assetsToSeed = [
    {
      assetTag: "AF-CONF-001",
      name: "Conference Room — Aurora",
      categoryId: catMeetingRooms.id,
      condition: AssetCondition.EXCELLENT,
      status: AssetStatus.AVAILABLE,
      location: "HQ - Floor 1",
      isBookable: true,
    },
    {
      assetTag: "AF-CONF-002",
      name: "Conference Room — Nebula",
      categoryId: catMeetingRooms.id,
      condition: AssetCondition.EXCELLENT,
      status: AssetStatus.AVAILABLE,
      location: "HQ - Floor 2",
      isBookable: true,
    },
    {
      assetTag: "AF-CONF-003",
      name: "Conference Room — Cosmos",
      categoryId: catMeetingRooms.id,
      condition: AssetCondition.EXCELLENT,
      status: AssetStatus.AVAILABLE,
      location: "HQ - Floor 3",
      isBookable: true,
    },
    {
      assetTag: "AF-RALLY-001",
      name: "Rally Bar — Studio B",
      categoryId: catMeetingRooms.id,
      condition: AssetCondition.GOOD,
      status: AssetStatus.AVAILABLE,
      location: "HQ - Floor 1",
      isBookable: true,
    },
    {
      assetTag: "AF-TESLA-001",
      name: "Tesla Model 3 (Fleet)",
      categoryId: catVehicles.id,
      condition: AssetCondition.EXCELLENT,
      status: AssetStatus.AVAILABLE,
      location: "HQ Parking Lot",
      isBookable: true,
    },
    {
      assetTag: "AF-OSC-001",
      name: "Oscilloscope MDO4",
      categoryId: catLabEquip.id,
      condition: AssetCondition.GOOD,
      status: AssetStatus.AVAILABLE,
      location: "HQ Lab A",
      isBookable: true,
    },
  ];

  for (const assetData of assetsToSeed) {
    const upserted = await prisma.asset.upsert({
      where: { assetTag: assetData.assetTag },
      update: {
        name: assetData.name,
        categoryId: assetData.categoryId,
        condition: assetData.condition,
        status: assetData.status,
        location: assetData.location,
        isBookable: assetData.isBookable,
      },
      create: assetData,
    });
    console.log(`   Upserted asset: ${upserted.name} (${upserted.assetTag})`);
  }

  console.log("✅ Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
