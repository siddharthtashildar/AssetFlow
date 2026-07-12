import 'dotenv/config';
import { prisma } from '../src/config/prisma';
import { AuditService } from '../src/services/auditService';

async function run() {
  try {
    const auditor = await prisma.user.findUnique({ where: { email: 'john.doe@assetflow.io' } });
    if (!auditor) {
      console.error('Auditor user not found');
      return;
    }

    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);
    const endDate = new Date(today.getTime() + 1000 * 60 * 60 * 24).toISOString().slice(0, 10);

    const cycle = await AuditService.createAuditCycle({
      title: 'Automated Test Cycle',
      startDate: startDate,
      endDate: endDate,
      auditorId: auditor.id,
    });

    console.log('Created cycle:', cycle?.id);

    const items = await prisma.auditItem.findMany({ where: { auditCycleId: cycle?.id } });
    console.log('Audit items created:', items.length);
  } catch (err) {
    console.error('Error creating test audit cycle:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
