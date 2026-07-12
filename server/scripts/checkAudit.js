require('dotenv/config');
const { PrismaClient, AuditResult } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set in environment. Please set it and retry.');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    console.log('AuditResult enum from Prisma client (object keys):', Object.keys(AuditResult || {}));

    // Query pg_enum to see actual DB enum labels (Postgres only)
    const enumRows = await prisma.$queryRawUnsafe(
      `SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'auditresult' ORDER BY e.enumsortorder;`
    );
    console.log('Postgres enum values for auditresult:', enumRows.map(r => r.enumlabel));

    const count = await prisma.auditItem.count();
    console.log('AuditItem count:', count);

    const items = await prisma.auditItem.findMany({ take: 20, orderBy: { createdAt: 'desc' } });
    console.log('Sample AuditItem rows:', items);
  } catch (err) {
    console.error('Error while checking audit tables:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
