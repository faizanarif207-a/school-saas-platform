// src/app/api/schools/[id]/suspend/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const school = await db.school.update({
      where: { id },
      data: { status: "suspended" },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        action: "school.suspend",
        entity: "school",
        entityId: school.id,
      },
    });

    return NextResponse.json({ ok: true, school });
  } catch (err) {
    console.error("[school/suspend] error:", err);
    return NextResponse.json({ error: "Failed to suspend school" }, { status: 500 });
  }
}
