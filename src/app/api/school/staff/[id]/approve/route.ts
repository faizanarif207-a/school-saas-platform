// src/app/api/school/staff/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { sendEmail, staffInviteEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.subRole !== "OWNER") {
    return NextResponse.json({ error: "Only owners can approve staff" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const staff = await db.user.findFirst({
      where: { id, schoolId: user.schoolId, approvalStatus: "pending_approval" },
    });
    if (!staff) {
      return NextResponse.json({ error: "Staff not found or already processed" }, { status: 404 });
    }

    // Generate temp password
    const tempPassword = randomBytes(4).toString("hex");
    const passwordHash = await hashPassword(tempPassword);

    // Update user — approve + set password
    await db.user.update({
      where: { id },
      data: {
        approvalStatus: "approved",
        passwordHash,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "staff.approve",
        entity: "user",
        entityId: id,
      },
    });

    // Send credentials email
    const school = await db.school.findUnique({ where: { id: user.schoolId }, select: { name: true } });
    const portalUrl = process.env.AUTH_URL || "https://school-saas-platform-indol.vercel.app";
    const loginUrl = staff.role === "TEACHER"
      ? `${portalUrl}/teacher/login`
      : `${portalUrl}/school/login`;

    const roleLabel = staff.subRole || staff.role;
    const emailHtml = staffInviteEmail(staff.name || "Staff", loginUrl, tempPassword, roleLabel, school?.name || "School");
    await sendEmail(staff.email, `Welcome to ${school?.name || "School"} — Your Account is Approved!`, emailHtml);

    return NextResponse.json({
      ok: true,
      message: "Staff approved and credentials email sent",
      tempPassword,
    });
  } catch (err) {
    console.error("[staff/approve] error:", err);
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
  }
}
