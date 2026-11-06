// src/app/api/teacher/homework/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "TEACHER" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const homework = await db.homework.findMany({
    where: { schoolId: user.schoolId, assignedBy: user.id },
    include: { class: true, section: true, subject: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ homework });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "TEACHER" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { title, description, classId, sectionId, subjectId, dueDate } = body;
    if (!title?.trim() || !description?.trim() || !classId || !dueDate) {
      return NextResponse.json({ error: "Title, description, class, and due date required" }, { status: 400 });
    }
    const cls = await db.class.findFirst({ where: { id: classId, schoolId: user.schoolId } });
    if (!cls) return NextResponse.json({ error: "Invalid class" }, { status: 400 });
    const hw = await db.homework.create({
      data: {
        schoolId: user.schoolId,
        classId,
        sectionId: sectionId || null,
        subjectId: subjectId || null,
        assignedBy: user.id,
        title: title.trim(),
        description: description.trim(),
        dueDate: new Date(dueDate),
      },
    });
    return NextResponse.json({ ok: true, homework: hw });
  } catch (err) {
    console.error("[homework/create] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
