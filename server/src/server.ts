import "dotenv/config";
import app from "./app";
import { prisma } from "./config/prisma";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection established successfully via Prisma Client");

    app.listen(PORT, () => {
      console.log(`🚀 AssetFlow backend server listening on port ${PORT}`);
    });
  } catch (error: any) {
    console.error("❌ Failed to start backend server:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
