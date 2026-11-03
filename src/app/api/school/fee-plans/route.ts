// src/app/api/school/fee-plans/route.ts
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
  const feePlans = await db.feePlan.findMany({
    where: { schoolId: user.schoolId },
    include: { class: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ feePlans });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { classId, title, amount, frequency } = body;
    if (!title || !amount || !frequency) {
      return NextResponse.json(
        { error: "Title, amount, and frequency are required" },
        { status: 400 }
      );
    }
    // Verify class if provided
    if (classId) {
      const cls = await db.class.findFirst({
        where: { id: classId, schoolId: user.schoolId },
      });
      if (!cls) {
        return NextResponse.json({ error: "Invalid class" }, { status: 400 });
      }
    }

    const feePlan = await db.feePlan.create({
      data: {
        schoolId: user.schoolId,
        classId: classId || null,
        title: title.trim(),
        amount: parseInt(amount, 10),
        frequency,
      },
    });
    return NextResponse.json({ ok: true, feePlan });
  } catch (err) {
    console.error("[feePlans/create] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
