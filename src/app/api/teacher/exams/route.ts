// src/app/api/teacher/exams/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "TEACHER" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const exams = await db.exam.findMany({
    where: { schoolId: user.schoolId, isActive: true },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json({ exams });
}
