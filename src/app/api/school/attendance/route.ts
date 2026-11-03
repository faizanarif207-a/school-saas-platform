// src/app/api/school/attendance/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET — list attendance for a section on a date
export async function GET(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const sectionId = url.searchParams.get("sectionId");
  const dateParam = url.searchParams.get("date");

  if (!sectionId) {
    return NextResponse.json({ error: "Section required" }, { status: 400 });
  }

  // Verify section belongs to this school
  const section = await db.section.findFirst({
    where: { id: sectionId, class: { schoolId: user.schoolId } },
  });
  if (!section) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  const academicYear = await db.academicYear.findFirst({
    where: { schoolId: user.schoolId, isActive: true },
    orderBy: { startDate: "desc" },
  });
  if (!academicYear) {
    return NextResponse.json({ students: [], attendance: [] });
  }

  // Parse date (or use today)
  let date: Date;
  if (dateParam) {
    date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);
  } else {
    date = new Date();
    date.setHours(0, 0, 0, 0);
  }

  // Get all enrollments for this section + academic year, with student info
  const enrollments = await db.enrollment.findMany({
    where: { sectionId, academicYearId: academicYear.id },
    include: { student: true },
    orderBy: { rollNo: "asc" },
  });

  // Get today's attendance for these enrollments
  const attendance = await db.attendance.findMany({
    where: {
      date,
      enrollmentId: { in: enrollments.map((e) => e.id) },
    },
  });

  // Build response
  const studentsWithAttendance = enrollments.map((enr) => {
    const att = attendance.find((a) => a.enrollmentId === enr.id);
    return {
      enrollmentId: enr.id,
      studentId: enr.studentId,
      rollNo: enr.rollNo,
      name: enr.student.name,
      fatherName: enr.student.fatherName,
      status: att?.status || null, // null = not marked
    };
  });

  return NextResponse.json({
    students: studentsWithAttendance,
    date: date.toISOString(),
    sectionName: section.name,
  });
}

// POST — save bulk attendance for a section + date
export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { sectionId, date, attendance } = body;
    // attendance: array of { enrollmentId, status }

    if (!sectionId || !date || !Array.isArray(attendance)) {
      return NextResponse.json(
        { error: "sectionId, date, and attendance array are required" },
        { status: 400 }
      );
    }

    // Verify section
    const section = await db.section.findFirst({
      where: { id: sectionId, class: { schoolId: user.schoolId } },
    });
    if (!section) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    const attDate = new Date(date);
    attDate.setHours(0, 0, 0, 0);

    // Delete existing attendance for this section + date (idempotent update)
    const existingEnrIds = await db.enrollment.findMany({
      where: { sectionId },
      select: { id: true },
    });
    await db.attendance.deleteMany({
      where: { date: attDate, enrollmentId: { in: existingEnrIds.map((e) => e.id) } },
    });

    // Insert new attendance records
    const records = attendance
      .filter((a: { status: string }) => a.status) // skip unmarked
      .map((a: { enrollmentId: string; status: string }) => ({
        enrollmentId: a.enrollmentId,
        studentId: "", // will set below
        date: attDate,
        status: a.status,
        markedBy: user.id,
      }));

    // Get student IDs from enrollments
    const enrIds = records.map((r: { enrollmentId: string }) => r.enrollmentId);
    const enrRecords = await db.enrollment.findMany({
      where: { id: { in: enrIds } },
      select: { id: true, studentId: true },
    });
    const enrMap = new Map(enrRecords.map((e) => [e.id, e.studentId]));

    for (const r of records) {
      r.studentId = enrMap.get(r.enrollmentId) || "";
    }

    if (records.length > 0) {
      await db.attendance.createMany({
        data: records.filter((r: { studentId: string }) => r.studentId),
      });
    }

    return NextResponse.json({
      ok: true,
      marked: records.length,
      date: attDate.toISOString(),
    });
  } catch (err) {
    console.error("[attendance/save] error:", err);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
