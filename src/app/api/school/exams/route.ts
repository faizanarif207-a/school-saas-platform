// src/app/api/school/exams/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const exams = await db.exam.findMany({
    where: { schoolId: user.schoolId },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json({ exams });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, term, startDate, endDate } = body;
    if (!name?.trim() || !term || !startDate || !endDate) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    const academicYear = await db.academicYear.findFirst({
      where: { schoolId: user.schoolId, isActive: true },
      orderBy: { startDate: "desc" },
    });
    if (!academicYear) {
      return NextResponse.json({ error: "No active academic year" }, { status: 400 });
    }
    const exam = await db.exam.create({
      data: {
        schoolId: user.schoolId,
        academicYearId: academicYear.id,
        name: name.trim(),
        term,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      },
    });
    return NextResponse.json({ ok: true, exam });
  } catch (err) {
    console.error("[exam/create] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
