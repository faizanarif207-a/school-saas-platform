// src/app/api/student/homework/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "STUDENT" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Find student's class via enrollment
  const student = await db.student.findFirst({
    where: { schoolId: user.schoolId, name: user.name || "", status: "active" },
    include: { enrollments: { where: { academicYear: { isActive: true } }, include: { section: true }, take: 1 } },
  });
  if (!student) return NextResponse.json({ homework: [] });
  const enr = student.enrollments[0];
  if (!enr) return NextResponse.json({ homework: [] });
  // Get homework for student's class
  const homework = await db.homework.findMany({
    where: {
      schoolId: user.schoolId,
      classId: enr.section.classId,
      OR: [{ sectionId: null }, { sectionId: enr.sectionId }],
    },
    include: { class: true, subject: true },
    orderBy: { dueDate: "desc" },
    take: 30,
  });
  return NextResponse.json({ homework });
}
