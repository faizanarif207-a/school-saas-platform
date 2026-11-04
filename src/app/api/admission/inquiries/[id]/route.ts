// src/app/api/admission/inquiries/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
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
    const { stage, notes, followUpDate, followUpAction } = body;

    const inquiry = await db.inquiry.findFirst({
      where: { id, schoolId: user.schoolId },
    });
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    await db.inquiry.update({
      where: { id },
      data: {
        ...(stage && { stage }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(followUpDate !== undefined && { followUpDate: followUpDate ? new Date(followUpDate) : null }),
        ...(followUpAction !== undefined && { followUpAction: followUpAction?.trim() || null }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[inquiry/update] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
