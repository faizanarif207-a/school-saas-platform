// src/app/api/school/notices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// DELETE — notice
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const notice = await db.notice.findFirst({
      where: { id, schoolId: user.schoolId },
    });
    if (!notice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    await db.notice.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "notice.delete",
        entity: "notice",
        entityId: id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notices/delete] error:", err);
    return NextResponse.json({ error: "Failed to delete notice" }, { status: 500 });
  }
}
