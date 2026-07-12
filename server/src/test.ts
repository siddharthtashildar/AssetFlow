import { prisma } from "./config/prisma";

async function main() {
  await prisma.$connect();
  console.log("✅ Connected to Neon PostgreSQL");

  await prisma.$disconnect();
}

main().catch(console.error);