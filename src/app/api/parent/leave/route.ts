// src/app/api/parent/leave/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "PARENT" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Get leaves for parent's children
  const links = await db.parentStudent.findMany({ where: { parentId: user.id }, select: { studentId: true } });
  const studentIds = links.map(l => l.studentId);
  // We need a way to track student leaves — for now, we'll use the parent's leave requests
  // In the LeaveRequest model, we can use userId as the parent's ID and store studentId in metadata
  const leaves = await db.leaveRequest.findMany({
    where: { userId: user.id, schoolId: user.schoolId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ leaves });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "PARENT" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { studentId, startDate, endDate, reason } = body;
    if (!studentId || !startDate || !endDate || !reason?.trim()) {
      return NextResponse.json({ error: "Student, dates, and reason required" }, { status: 400 });
    }
    // Verify student belongs to parent
    const link = await db.parentStudent.findFirst({ where: { parentId: user.id, studentId } });
    if (!link) return NextResponse.json({ error: "Student not linked to your account" }, { status: 403 });

    const leave = await db.leaveRequest.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type: "general",
        reason: `Leave for child: ${reason.trim()}`,
        status: "pending",
      },
    });
    return NextResponse.json({ ok: true, leave });
  } catch (err) {
    console.error("[parent/leave] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
