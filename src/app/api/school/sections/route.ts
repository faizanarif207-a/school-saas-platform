// src/app/api/school/sections/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { classId, name, capacity } = body;
    if (!classId || !name) {
      return NextResponse.json({ error: "Class and section name are required" }, { status: 400 });
    }

    // Verify class belongs to school
    const cls = await db.class.findFirst({
      where: { id: classId, schoolId: user.schoolId },
    });
    if (!cls) {
      return NextResponse.json({ error: "Invalid class" }, { status: 400 });
    }

    // Check for duplicate
    const existing = await db.section.findFirst({
      where: { classId, name: name.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Section with this name already exists" }, { status: 400 });
    }

    const section = await db.section.create({
      data: { classId, name: name.trim(), capacity: capacity || 40 },
    });
    return NextResponse.json({ ok: true, section });
  } catch (err) {
    console.error("[sections/create] error:", err);
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
