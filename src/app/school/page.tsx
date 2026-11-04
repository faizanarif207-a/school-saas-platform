// src/app/school/page.tsx — Owner Dashboard (Server Component)
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { OwnerDashboard, OwnerDashboardData } from "@/components/owner-dashboard";

export default async function SchoolDashboardPage() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    redirect("/school/login");
  }
  const schoolId = user.schoolId;

  // Get school + plan info
  const school = await db.school.findUnique({
    where: { id: schoolId },
    include: { plan: true },
  });
  if (!school) redirect("/school/login");

  // Get academic year
  const academicYear = await db.academicYear.findFirst({
    where: { schoolId, isActive: true },
    orderBy: { startDate: "desc" },
  });

  // Counts
  let totalStudents = 0;
  let totalClasses = 0;
  let totalSections = 0;
  let presentToday = 0;
  let pendingFees = 0;
  let feeCollected = 0;
  let feePlans = 0;
  let totalStaff = 0;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const [
      stuCount,
      clsCount,
      secCount,
      attCount,
      invCount,
      payAgg,
      fpCount,
      staffCount,
    ] = await Promise.all([
      db.student.count({ where: { schoolId, status: "active" } }),
      db.class.count({ where: { schoolId } }),
      db.section.count({ where: { class: { schoolId } } }),
      academicYear
        ? db.attendance.count({
            where: {
              enrollment: { academicYearId: academicYear.id },
              date: { gte: today, lt: todayEnd },
              status: "present",
            },
          })
        : Promise.resolve(0),
      db.invoice.count({
        where: {
          student: { schoolId },
          status: { in: ["unpaid", "partial", "overdue"] },
        },
      }),
      db.payment.aggregate({
        where: {
          invoice: { student: { schoolId } },
          paidAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      db.feePlan.count({ where: { schoolId } }),
      db.user.count({ where: { schoolId, role: { not: "PARENT" } } }),
    ]);

    totalStudents = stuCount;
    totalClasses = clsCount;
    totalSections = secCount;
    presentToday = attCount;
    pendingFees = invCount;
    feeCollected = payAgg._sum.amount || 0;
    feePlans = fpCount;
    totalStaff = staffCount;
  } catch (err) {
    console.error("[school dashboard stats] error:", err);
  }

  // Class strength
  let classes: OwnerDashboardData["classes"] = [];
  try {
    const clsData = await db.class.findMany({
      where: { schoolId },
      include: {
        sections: true,
      },
      orderBy: { name: "asc" },
    });

    // Get enrollment counts per class
    const sectionIds = clsData.flatMap((c) => c.sections.map((s) => s.id));
    const enrollmentCounts = await db.enrollment.groupBy({
      by: ["sectionId"],
      where: {
        sectionId: { in: sectionIds },
        ...(academicYear ? { academicYearId: academicYear.id } : {}),
      },
      _count: { id: true },
    });
    const countMap = new Map(enrollmentCounts.map((e) => [e.sectionId, e._count.id]));

    classes = clsData.map((c) => {
      const sectionCount = c.sections.length;
      const studentCount = c.sections.reduce(
        (sum, s) => sum + (countMap.get(s.id) || 0),
        0
      );
      return {
        id: c.id,
        name: c.name,
        sectionCount,
        studentCount,
      };
    });
  } catch (err) {
    console.error("[class strength] error:", err);
  }

  // Monthly collection (last 6 months)
  let monthlyCollection: OwnerDashboardData["monthlyCollection"] = [];
  try {
    const now = new Date();
    const months: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const agg = await db.payment.aggregate({
        where: {
          invoice: { student: { schoolId } },
          paidAt: { gte: d, lte: monthEnd },
        },
        _sum: { amount: true },
      });
      months.push({
        month: d.toLocaleDateString("en-GB", { month: "short" }),
        amount: agg._sum.amount || 0,
      });
    }
    monthlyCollection = months;
  } catch (err) {
    console.error("[monthly collection] error:", err);
  }

  // Recent activity (audit logs)
  let recentActivity: OwnerDashboardData["recentActivity"] = [];
  try {
    const logs = await db.auditLog.findMany({
      where: { schoolId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    recentActivity = logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      createdAt: log.createdAt.toISOString(),
      userName: log.user?.name || null,
    }));
  } catch (err) {
    console.error("[recent activity] error:", err);
  }

  // Trial days left
  let trialDaysLeft: number | null = null;
  let isTrial = false;
  if (school.status === "trial") {
    isTrial = true;
    const sub = await db.subscription.findFirst({
      where: { schoolId, status: "active" },
      orderBy: { createdAt: "desc" },
    });
    if (sub?.endDate) {
      const diff = Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      trialDaysLeft = Math.max(0, diff);
    }
  }

  const dashboardData: OwnerDashboardData = {
    schoolName: school.name,
    city: school.city,
    planName: school.plan.name,
    planPrice: school.plan.monthlyPrice,
    trialDaysLeft,
    isTrial,
    totalStudents,
    totalClasses,
    totalSections,
    presentToday,
    pendingFees,
    feeCollected,
    feePlans,
    totalStaff,
    totalBranches: 0, // single branch for now
    classes,
    monthlyCollection,
    recentActivity,
  };

  return <OwnerDashboard data={dashboardData} />;
}
