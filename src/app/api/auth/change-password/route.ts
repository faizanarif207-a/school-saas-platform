// src/app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new passwords required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }

    // Get user from DB
    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Verify current password
    const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Update password
    const newHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "password.change",
        entity: "user",
        entityId: user.id,
      },
    });

    return NextResponse.json({ ok: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("[change-password] error:", err);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
