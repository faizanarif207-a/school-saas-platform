// src/app/school/page.tsx — Premium Owner Dashboard (Server Component)
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PremiumOwnerDashboard, OwnerData } from "@/components/premium-owner-dashboard";

export default async function SchoolDashboardPage() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    redirect("/school/login");
  }
  const schoolId = user.schoolId;

  const school = await db.school.findUnique({ where: { id: schoolId }, include: { plan: true } });
  if (!school) redirect("/school/login");

  const academicYear = await db.academicYear.findFirst({
    where: { schoolId, isActive: true },
    orderBy: { startDate: "desc" },
  });

  // ─── COUNTS ───
  let totalStudents = 0, totalClasses = 0, totalSections = 0;
  let presentToday = 0, pendingFees = 0, feeCollected = 0, feePlans = 0, totalStaff = 0;
  let feeStatus = { paid: 0, partial: 0, unpaid: 0 };

  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);

    const [stuCount, clsCount, secCount, attCount, invCount, payAgg, fpCount, staffCount] = await Promise.all([
      db.student.count({ where: { schoolId, status: "active" } }),
      db.class.count({ where: { schoolId } }),
      db.section.count({ where: { class: { schoolId } } }),
      academicYear ? db.attendance.count({ where: { enrollment: { academicYearId: academicYear.id }, date: { gte: today, lt: todayEnd }, status: "present" } }) : Promise.resolve(0),
      db.invoice.count({ where: { student: { schoolId }, status: { in: ["unpaid", "partial", "overdue"] } } }),
      db.payment.aggregate({ where: { invoice: { student: { schoolId } }, paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }, _sum: { amount: true } }),
      db.feePlan.count({ where: { schoolId } }),
      db.user.count({ where: { schoolId, role: { not: "PARENT" } } }),
    ]);

    totalStudents = stuCount; totalClasses = clsCount; totalSections = secCount;
    presentToday = attCount; pendingFees = invCount; feeCollected = payAgg._sum.amount || 0;
    feePlans = fpCount; totalStaff = staffCount;

    // Fee status breakdown
    const [paidCount, partialCount, unpaidCount] = await Promise.all([
      db.invoice.count({ where: { student: { schoolId }, status: "paid" } }),
      db.invoice.count({ where: { student: { schoolId }, status: "partial" } }),
      db.invoice.count({ where: { student: { schoolId }, status: { in: ["unpaid", "overdue"] } } }),
    ]);
    feeStatus = { paid: paidCount, partial: partialCount, unpaid: unpaidCount };
  } catch (err) { console.error("[dashboard stats] error:", err); }

  // ─── ATTENDANCE TREND (last 7 days) ───
  let attendanceTrend: { label: string; value: number }[] = [];
  try {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
      const [present, total] = await Promise.all([
        academicYear ? db.attendance.count({ where: { enrollment: { academicYearId: academicYear.id }, date: { gte: d, lt: dayEnd }, status: "present" } }) : Promise.resolve(0),
        academicYear ? db.attendance.count({ where: { enrollment: { academicYearId: academicYear.id }, date: { gte: d, lt: dayEnd } } }) : Promise.resolve(0),
      ]);
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      attendanceTrend.push({ label: days[d.getDay() === 0 ? 6 : d.getDay() - 1], value: pct });
    }
  } catch (err) { console.error("[attendance trend] error:", err); }

  // ─── COLLECTION TREND (last 6 months) ───
  let collectionTrend: { label: string; value: number }[] = [];
  try {
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const agg = await db.payment.aggregate({ where: { invoice: { student: { schoolId } }, paidAt: { gte: d, lte: monthEnd } }, _sum: { amount: true } });
      collectionTrend.push({ label: d.toLocaleDateString("en-GB", { month: "short" }), value: agg._sum.amount || 0 });
    }
  } catch (err) { console.error("[collection trend] error:", err); }

  // ─── CLASS STRENGTH ───
  let classStrength: { label: string; value: number }[] = [];
  try {
    const clsData = await db.class.findMany({ where: { schoolId }, include: { sections: true }, orderBy: { name: "asc" } });
    const sectionIds = clsData.flatMap((c) => c.sections.map((s) => s.id));
    const enrollmentCounts = await db.enrollment.groupBy({
      by: ["sectionId"],
      where: { sectionId: { in: sectionIds }, ...(academicYear ? { academicYearId: academicYear.id } : {}) },
      _count: { id: true },
    });
    const countMap = new Map(enrollmentCounts.map((e) => [e.sectionId, e._count.id]));
    classStrength = clsData.map((c) => ({
      label: c.name,
      value: c.sections.reduce((sum, s) => sum + (countMap.get(s.id) || 0), 0),
    }));
  } catch (err) { console.error("[class strength] error:", err); }

  // ─── RECENT ACTIVITY ───
  let recentActivity: { id: string; action: string; createdAt: string; userName: string | null }[] = [];
  try {
    const logs = await db.auditLog.findMany({ where: { schoolId }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 6 });
    recentActivity = logs.map((log) => ({ id: log.id, action: log.action, createdAt: log.createdAt.toISOString(), userName: log.user?.name || null }));
  } catch (err) { console.error("[recent activity] error:", err); }

  // ─── TRIAL DAYS ───
  let trialDaysLeft: number | null = null; let isTrial = false;
  if (school.status === "trial") {
    isTrial = true;
    const sub = await db.subscription.findFirst({ where: { schoolId, status: "active" }, orderBy: { createdAt: "desc" } });
    if (sub?.endDate) trialDaysLeft = Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  const branchCount = await db.branch.count({ where: { schoolId } }).catch(() => 0);

  const dashboardData: OwnerData = {
    schoolName: school.name, city: school.city, planName: school.plan.name, planPrice: school.plan.monthlyPrice,
    trialDaysLeft, isTrial, totalStudents, totalClasses, totalSections, presentToday, pendingFees, feeCollected,
    feePlans, totalStaff, totalBranches: branchCount, attendanceTrend, collectionTrend, classStrength, feeStatus, recentActivity,
  };

  return <PremiumOwnerDashboard data={dashboardData} />;
}
