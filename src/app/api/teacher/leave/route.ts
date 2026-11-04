// src/app/api/teacher/leave/route.ts
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

  const leaves = await db.leaveRequest.findMany({
    where: { userId: user.id, schoolId: user.schoolId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ leaves });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "TEACHER" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { startDate, endDate, type, reason } = body;

    if (!startDate || !endDate || !reason?.trim()) {
      return NextResponse.json(
        { error: "Start date, end date, and reason are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return NextResponse.json(
        { error: "End date must be on or after start date" },
        { status: 400 }
      );
    }

    const validTypes = ["casual", "sick", "emergency", "maternity"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid leave type" }, { status: 400 });
    }

    const leave = await db.leaveRequest.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        startDate: start,
        endDate: end,
        type,
        reason: reason.trim(),
        status: "pending",
      },
    });

    return NextResponse.json({ ok: true, leave });
  } catch (err) {
    console.error("[teacher/leave] error:", err);
    return NextResponse.json({ error: "Failed to submit leave" }, { status: 500 });
  }
}
