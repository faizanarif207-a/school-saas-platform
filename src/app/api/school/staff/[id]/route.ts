// src/app/api/school/staff/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH — toggle active/deactivate staff
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.subRole !== "OWNER") {
    return NextResponse.json({ error: "Only owners can manage staff" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    const staff = await db.user.findFirst({
      where: { id, schoolId: user.schoolId, subRole: { not: "OWNER" } },
    });
    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    await db.user.update({
      where: { id },
      data: { isActive: isActive !== false ? true : false },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: isActive ? "staff.activate" : "staff.deactivate",
        entity: "user",
        entityId: id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[staff/update] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// DELETE — permanently remove staff
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.subRole !== "OWNER") {
    return NextResponse.json({ error: "Only owners can delete staff" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const staff = await db.user.findFirst({
      where: { id, schoolId: user.schoolId, subRole: { not: "OWNER" } },
    });
    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    await db.user.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "staff.delete",
        entity: "user",
        entityId: id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[staff/delete] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
