// src/app/api/school/exports/attendance/route.ts
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateExcelBuffer, excelResponse } from "@/lib/excel-export";

export async function GET(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const sectionId = url.searchParams.get("sectionId");
  const monthParam = url.searchParams.get("month"); // YYYY-MM

  // Determine date range
  let startDate: Date;
  let endDate: Date;
  if (monthParam) {
    const [year, mon] = monthParam.split("-").map(Number);
    startDate = new Date(year, mon - 1, 1);
    endDate = new Date(year, mon, 0, 23, 59, 59);
  } else {
    // Default: current month
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  const academicYear = await db.academicYear.findFirst({
    where: { schoolId: user.schoolId, isActive: true },
    orderBy: { startDate: "desc" },
  });

  const enrollments = await db.enrollment.findMany({
    where: {
      ...(academicYear ? { academicYearId: academicYear.id } : {}),
      ...(sectionId ? { sectionId } : {}),
    },
    include: {
      student: true,
      section: { include: { class: true } },
    },
    orderBy: { rollNo: "asc" },
  });

  // Generate list of dates in month
  const dates: Date[] = [];
  const d = new Date(startDate);
  while (d <= endDate) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  // Get all attendance for these enrollments in the date range
  const enrIds = enrollments.map((e) => e.id);
  const attendance = await db.attendance.findMany({
    where: {
      enrollmentId: { in: enrIds },
      date: { gte: startDate, lte: endDate },
    },
  });

  // Build attendance map: enrId_date => status
  const attMap = new Map<string, string>();
  for (const a of attendance) {
    const key = `${a.enrollmentId}_${new Date(a.date).toISOString().slice(0, 10)}`;
    attMap.set(key, a.status);
  }

  // Build headers
  const headers = [
    "Roll #",
    "Admission ID",
    "Name",
    "Class-Section",
    ...dates.map((d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })),
    "Present",
    "Absent",
    "Late",
    "Total",
    "% Present",
  ];

  const rows = enrollments.map((enr) => {
    let present = 0,
      absent = 0,
      late = 0;
    const dayStatuses: string[] = [];

    for (const date of dates) {
      const key = `${enr.id}_${date.toISOString().slice(0, 10)}`;
      const status = attMap.get(key) || "";
      dayStatuses.push(status === "present" ? "P" : status === "absent" ? "A" : status === "late" ? "L" : "");
      if (status === "present") present++;
      else if (status === "absent") absent++;
      else if (status === "late") late++;
    }

    const total = present + absent + late;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;

    return [
      enr.rollNo || "",
      enr.student.admissionId || "",
      enr.student.name,
      `${enr.section.class.name}-${enr.section.name}`,
      ...dayStatuses,
      present,
      absent,
      late,
      total,
      pct + "%",
    ];
  });

  const buffer = generateExcelBuffer({
    filename: "attendance.xlsx",
    sheetName: "Attendance",
    headers,
    rows,
  });

  return excelResponse(buffer, "attendance.xlsx");
}
