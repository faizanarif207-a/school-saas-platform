// src/app/api/principal/stats/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const academicYear = await db.academicYear.findFirst({
    where: { schoolId: user.schoolId, isActive: true },
    orderBy: { startDate: "desc" },
  });

  // Stats
  let totalStudents = 0, presentToday = 0, avgAttendance = 0;
  try {
    totalStudents = await db.student.count({ where: { schoolId: user.schoolId, status: "active" } });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);
    presentToday = academicYear ? await db.attendance.count({ where: { enrollment: { academicYearId: academicYear.id }, date: { gte: today, lt: todayEnd }, status: "present" } }) : 0;

    // Avg attendance (last 30 days)
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [present30, total30] = await Promise.all([
      academicYear ? db.attendance.count({ where: { enrollment: { academicYearId: academicYear.id }, date: { gte: thirtyDaysAgo }, status: "present" } }) : Promise.resolve(0),
      academicYear ? db.attendance.count({ where: { enrollment: { academicYearId: academicYear.id }, date: { gte: thirtyDaysAgo } } }) : Promise.resolve(0),
    ]);
    avgAttendance = total30 > 0 ? Math.round((present30 / total30) * 100) : 0;
  } catch (err) { console.error("[principal stats] error:", err); }

  // Pending approvals
  const pendingApprovals = await db.leaveRequest.count({
    where: { schoolId: user.schoolId, status: "pending" },
  });

  // Attendance trend (last 7 days)
  const attendanceTrend: { label: string; value: number }[] = [];
  try {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
      const [present, total] = await Promise.all([
        academicYear ? db.attendance.count({ where: { enrollment: { academicYearId: academicYear.id }, date: { gte: d, lt: dayEnd }, status: "present" } }) : Promise.resolve(0),
        academicYear ? db.attendance.count({ where: { enrollment: { academicYearId: academicYear.id }, date: { gte: d, lt: dayEnd } } }) : Promise.resolve(0),
      ]);
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      attendanceTrend.push({ label: days[d.getDay() === 0 ? 6 : d.getDay() - 1], value: pct });
    }
  } catch (err) { console.error("[att trend] error:", err); }

  // Teacher performance data (for bar chart)
  let teacherPerf: { label: string; value: number }[] = [];
  try {
    const teachers = await db.user.findMany({
      where: { schoolId: user.schoolId, role: "TEACHER" },
      select: { id: true, name: true },
    });
    for (const t of teachers) {
      const attCount = await db.attendance.count({ where: { markedBy: t.id } });
      teacherPerf.push({ label: t.name?.split(" ")[0] || "Teacher", value: attCount });
    }
  } catch (err) { console.error("[teacher perf] error:", err); }

  return NextResponse.json({
    stats: { totalStudents, presentToday, avgAttendance, pendingApprovals },
    attendanceTrend,
    teacherPerf,
  });
}
