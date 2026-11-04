// src/app/api/school/settings/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET school settings (create with defaults if not exists)
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let settings = await db.schoolSettings.findUnique({
    where: { schoolId: user.schoolId },
  });

  if (!settings) {
    settings = await db.schoolSettings.create({
      data: { schoolId: user.schoolId },
    });
  }

  return NextResponse.json({ settings });
}

// PATCH — update school settings
export async function PATCH(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const allowedFields = [
      "defaultersReminderDays",
      "defaultersLateFee",
      "defaultersPortalBlockDays",
      "defaultersSuspendDays",
      "smsEnabled",
      "whatsappEnabled",
      "studentLoginMinClass",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    // Upsert (in case settings row doesn't exist yet)
    const settings = await db.schoolSettings.upsert({
      where: { schoolId: user.schoolId },
      update: updateData,
      create: { schoolId: user.schoolId, ...updateData },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "settings.update",
        entity: "school_settings",
        entityId: settings.schoolId,
        metadata: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    console.error("[settings/update] error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
