// src/app/api/school/reports/class/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateClassReport, ClassReportData } from "@/lib/pdf-report";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");

  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }

  const school = await db.school.findUnique({
    where: { id: user.schoolId },
    select: { name: true, city: true, email: true, phone: true, address: true },
  });
  if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 });

  const cls = await db.class.findFirst({
    where: { id: classId, schoolId: user.schoolId },
    include: { sections: true },
  });
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  // Pick first section if no specific section
  const section = cls.sections[0];
  if (!section) return NextResponse.json({ error: "No sections in this class" }, { status: 400 });

  const academicYear = await db.academicYear.findFirst({
    where: { schoolId: user.schoolId, isActive: true },
    orderBy: { startDate: "desc" },
  });

  const enrollments = await db.enrollment.findMany({
    where: { sectionId: section.id, ...(academicYear ? { academicYearId: academicYear.id } : {}) },
    include: {
      student: { include: { invoices: { include: { payments: true } } } },
    },
    orderBy: { rollNo: "asc" },
  });

  // Get attendance counts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  let presentToday = 0;
  const students = [];

  for (const enr of enrollments) {
    const attCount = await db.attendance.count({
      where: { enrollmentId: enr.id, status: "present" },
    });
    const totalAtt = await db.attendance.count({
      where: { enrollmentId: enr.id },
    });
    const attPct = totalAtt > 0 ? Math.round((attCount / totalAtt) * 100) : 0;

    // Fee status
    const totalInvoiced = enr.student.invoices.reduce((s, i) => s + i.amount, 0);
    const totalPaid = enr.student.invoices.reduce(
      (s, i) => s + i.payments.reduce((p, pay) => p + pay.amount, 0), 0
    );
    const feeStatus = totalInvoiced === 0 ? "unpaid" : totalPaid >= totalInvoiced ? "paid" : totalPaid > 0 ? "partial" : "overdue";

    if (attPct >= 80) presentToday++; // simplified

    students.push({
      rollNo: enr.rollNo,
      admissionId: enr.student.admissionId,
      name: enr.student.name,
      fatherName: enr.student.fatherName,
      attendancePct: attPct,
      feeStatus,
    });
  }

  const data: ClassReportData = {
    className: cls.name,
    section: section.name,
    totalStudents: enrollments.length,
    presentToday,
    avgAttendancePct: students.length > 0 ? Math.round(students.reduce((s, st) => s + st.attendancePct, 0) / students.length) : 0,
    students,
  };

  const html = generateClassReport(school, data);
  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
