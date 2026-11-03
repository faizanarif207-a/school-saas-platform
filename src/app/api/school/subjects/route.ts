// src/app/api/school/subjects/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subjects = await db.subject.findMany({
    where: { schoolId: user.schoolId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ subjects });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, code } = body;
    if (!name) return NextResponse.json({ error: "Subject name required" }, { status: 400 });

    const existing = await db.subject.findFirst({
      where: { schoolId: user.schoolId, name: name.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Subject already exists" }, { status: 400 });
    }

    const subject = await db.subject.create({
      data: {
        schoolId: user.schoolId,
        name: name.trim(),
        code: code?.trim() || name.substring(0, 3).toUpperCase(),
      },
    });
    return NextResponse.json({ ok: true, subject });
  } catch (err) {
    console.error("[subjects/create] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
