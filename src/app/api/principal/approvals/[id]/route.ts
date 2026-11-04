// src/app/api/principal/approvals/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, comment } = body; // action: "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const leave = await db.leaveRequest.findFirst({
      where: { id, schoolId: user.schoolId, status: "pending" },
    });
    if (!leave) {
      return NextResponse.json({ error: "Leave not found or already processed" }, { status: 404 });
    }

    await db.leaveRequest.update({
      where: { id },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        approvedBy: user.id,
        approverComment: comment || null,
        approvedAt: new Date(),
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: `leave.${action}`,
        entity: "leave",
        entityId: id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[approval] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
