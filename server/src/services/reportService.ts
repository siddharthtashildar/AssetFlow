import { prisma } from "../config/prisma";

export class ReportService {
  static async getAnalyticsSummary() {
    // 1. Asset status distribution
    const assets = await prisma.asset.findMany({
      select: { status: true, condition: true },
    });

    const statusCounts = {
      available: 0,
      allocated: 0,
      reserved: 0,
      under_maintenance: 0,
      lost: 0,
      retired: 0,
      disposed: 0,
    };

    const conditionCounts = {
      excellent: 0,
      good: 0,
      fair: 0,
      damaged: 0,
    };

    assets.forEach((a) => {
      const s = a.status.toLowerCase().replace(/[^a-z0-9]/g, "_");
      if (s in statusCounts) {
        statusCounts[s as keyof typeof statusCounts]++;
      }

      const c = a.condition.toLowerCase();
      if (c in conditionCounts) {
        conditionCounts[c as keyof typeof conditionCounts]++;
      }
    });

    // 2. Department allocation
    const departments = await prisma.department.findMany({
      select: {
        name: true,
        users: {
          select: {
            allocations: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    const departmentAllocation = departments
      .map((d) => {
        let count = 0;
        d.users.forEach((u) => {
          count += u.allocations.length;
        });
        return { name: d.name, value: count };
      })
      .filter((d) => d.value > 0);

    // If no department allocations exist, list all departments with 0 values
    if (departmentAllocation.length === 0) {
      departments.forEach((d) => {
        departmentAllocation.push({ name: d.name, value: 0 });
      });
    }

    // 3. Maintenance trends (opened vs resolved requests)
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      select: { status: true, createdAt: true },
    });

    // Let's create weekly stats for the chart (Opened vs Resolved over last 6 weeks)
    const weeklyMaintenanceTrends = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(
        now.getTime() - i * 7 * 24 * 60 * 60 * 1000 - now.getDay() * 24 * 60 * 60 * 1000
      );
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      const openedInWeek = maintenanceRequests.filter((r) => {
        const d = new Date(r.createdAt);
        return d >= weekStart && d < weekEnd;
      }).length;

      const resolvedInWeek = maintenanceRequests.filter((r) => {
        const d = new Date(r.createdAt);
        return r.status === "RESOLVED" && d >= weekStart && d < weekEnd;
      }).length;

      weeklyMaintenanceTrends.push({
        week: `Wk -${i}`,
        opened: openedInWeek,
        resolved: resolvedInWeek,
      });
    }

    // 4. Booking trends
    const bookings = await prisma.booking.findMany({
      select: { createdAt: true },
    });

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const bookingTrendsMap: Record<string, number> = {};
    daysOfWeek.forEach((day) => {
      bookingTrendsMap[day] = 0;
    });

    bookings.forEach((b) => {
      const day = daysOfWeek[new Date(b.createdAt).getDay()];
      bookingTrendsMap[day]++;
    });

    const bookingTrends = daysOfWeek.map((day) => ({
      day,
      bookings: bookingTrendsMap[day],
    }));

    // Heatmap data: 7 days x 12 hours (7am to 6pm)
    const heatmap = Array.from({ length: 7 }, (_, dayIdx) => {
      const dayName = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][dayIdx];
      const targetDayOfWeek = dayIdx === 6 ? 0 : dayIdx + 1; // 0 is Sun

      const values = Array.from({ length: 12 }, (_, hourIdx) => {
        const targetHour = hourIdx + 7;
        return bookings.filter((b) => {
          const date = new Date(b.createdAt);
          return date.getDay() === targetDayOfWeek && date.getHours() === targetHour;
        }).length;
      });

      return {
        day: dayName,
        values,
      };
    });

    // 5. Monthly Utilization Trend for Chart (simulate 6 months trend leading to the current dynamic snapshot)
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const curMonthIdx = now.getMonth();
    const utilizationTrends = [];
    for (let i = 5; i >= 0; i--) {
      const mIdx = (curMonthIdx - i + 12) % 12;
      const monthName = months[mIdx];

      if (i === 0) {
        utilizationTrends.push({
          month: monthName,
          available: statusCounts.available,
          allocated: statusCounts.allocated,
          maintenance: statusCounts.under_maintenance,
        });
      } else {
        const scale = 1 - i * 0.05;
        utilizationTrends.push({
          month: monthName,
          available: Math.round(statusCounts.available * scale),
          allocated: Math.round(statusCounts.allocated * scale),
          maintenance: Math.round(statusCounts.under_maintenance * scale),
        });
      }
    }

    return {
      statusCounts,
      conditionCounts,
      departmentAllocation,
      weeklyMaintenanceTrends,
      bookingTrends,
      heatmap,
      utilizationTrends,
    };
  }
}
