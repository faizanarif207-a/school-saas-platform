// src/app/api/teacher/marks/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

// Save marks (teacher)
export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "TEACHER" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { examId, classId, sectionId, subjectId, totalMarks, marks } = body;

    if (!examId || !classId || !sectionId || !subjectId || !totalMarks) {
      return NextResponse.json(
        { error: "All fields required: exam, class, section, subject, totalMarks" },
        { status: 400 }
      );
    }

    if (!Array.isArray(marks) || marks.length === 0) {
      return NextResponse.json(
        { error: "Marks array required" },
        { status: 400 }
      );
    }

    // Validate exam + class + section + subject belong to this school
    const exam = await db.exam.findFirst({
      where: { id: examId, schoolId: user.schoolId },
    });
    if (!exam) return NextResponse.json({ error: "Invalid exam" }, { status: 400 });

    const cls = await db.class.findFirst({
      where: { id: classId, schoolId: user.schoolId },
    });
    if (!cls) return NextResponse.json({ error: "Invalid class" }, { status: 400 });

    const section = await db.section.findFirst({
      where: { id: sectionId, classId },
    });
    if (!section) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

    const subject = await db.subject.findFirst({
      where: { id: subjectId, schoolId: user.schoolId },
    });
    if (!subject) return NextResponse.json({ error: "Invalid subject" }, { status: 400 });

    // Upsert marks for each student
    let saved = 0;
    for (const m of marks) {
      const { studentId, marks: obtainedMarks } = m;
      if (obtainedMarks === undefined || obtainedMarks === null) continue;

      // Verify student belongs to school
      const student = await db.student.findFirst({
        where: { id: studentId, schoolId: user.schoolId },
      });
      if (!student) continue;

      // Calculate grade
      const pct = (obtainedMarks / totalMarks) * 100;
      const grade =
        pct >= 90 ? "A+" :
        pct >= 80 ? "A" :
        pct >= 70 ? "B" :
        pct >= 60 ? "C" :
        pct >= 50 ? "D" : "F";

      await db.examMark.upsert({
        where: {
          examId_studentId_subjectId: { examId, studentId, subjectId },
        },
        update: {
          marks: obtainedMarks,
          totalMarks,
          grade,
          classId,
          sectionId,
          enteredBy: user.id,
          status: "submitted",
        },
        create: {
          examId,
          studentId,
          subjectId,
          classId,
          sectionId,
          marks: obtainedMarks,
          totalMarks,
          grade,
          enteredBy: user.id,
          status: "submitted",
        },
      });
      saved++;
    }

    return NextResponse.json({ ok: true, saved });
  } catch (err) {
    console.error("[teacher/marks] error:", err);
    return NextResponse.json({ error: "Failed to save marks" }, { status: 500 });
  }
}
