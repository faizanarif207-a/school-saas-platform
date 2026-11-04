// src/app/api/principal/teachers/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get teachers with their attendance marking discipline + exam marks entered
  const teachers = await db.user.findMany({
    where: {
      schoolId: user.schoolId,
      role: "TEACHER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      _count: {
        select: {
          leaveRequests: { where: { status: "approved" } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Get attendance marking count per teacher
  const teacherIds = teachers.map((t) => t.id);
  const attendanceCounts = await db.attendance.groupBy({
    by: ["markedBy"],
    where: { markedBy: { in: teacherIds } },
    _count: { id: true },
  });
  const attMap = new Map(attendanceCounts.map((a) => [a.markedBy, a._count.id]));

  // Get marks entered per teacher
  const marksCounts = await db.examMark.groupBy({
    by: ["enteredBy"],
    where: { enteredBy: { in: teacherIds } },
    _count: { id: true },
  });
  const marksMap = new Map(marksCounts.map((m) => [m.enteredBy, m._count.id]));

  const result = teachers.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    isActive: t.isActive,
    attendanceMarked: attMap.get(t.id) || 0,
    marksEntered: marksMap.get(t.id) || 0,
    leavesTaken: t._count.leaveRequests,
  }));

  return NextResponse.json({ teachers: result });
}
