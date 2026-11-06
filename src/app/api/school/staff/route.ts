// src/app/api/school/staff/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

// GET — list staff
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const staff = await db.user.findMany({
    where: {
      schoolId: user.schoolId,
      role: { in: ["SCHOOL_ADMIN", "TEACHER"] },
      subRole: { not: "OWNER" },
    },
    include: { branch: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ staff });
}

// POST — invite staff (creates pending_approval account)
export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.subRole !== "OWNER") {
    return NextResponse.json({ error: "Only school owners can invite staff" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, subRole, branchId } = body;

    if (!name?.trim() || !email?.trim() || !subRole) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 });
    }

    const validSubRoles = ["PRINCIPAL", "ACCOUNTANT", "ADMISSION", "TEACHER"];
    if (!validSubRoles.includes(subRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    if (branchId) {
      const branch = await db.branch.findFirst({ where: { id: branchId, schoolId: user.schoolId } });
      if (!branch) return NextResponse.json({ error: "Invalid branch" }, { status: 400 });
    }

    const role = subRole === "TEACHER" ? "TEACHER" : "SCHOOL_ADMIN";

    // Create user with pending_approval status — NO password yet
    const staffUser = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        passwordHash: "pending_approval",
        role,
        subRole: subRole === "TEACHER" ? null : subRole,
        schoolId: user.schoolId,
        branchId: branchId || null,
        isActive: true,
        approvalStatus: "pending_approval",
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "staff.invite",
        entity: "user",
        entityId: staffUser.id,
        metadata: JSON.stringify({ name, email, subRole }),
      },
    });

    // Send "invitation received" email — NO credentials yet
    const school = await db.school.findUnique({ where: { id: user.schoolId }, select: { name: true } });
    const portalUrl = process.env.AUTH_URL || "https://school-saas-platform-indol.vercel.app";
    const loginUrl = role === "TEACHER" ? `${portalUrl}/teacher/login` : `${portalUrl}/school/login`;

    const emailHtml = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:20px;">
        <div style="width:48px;height:10px;background:#F5A800;border-radius:2px;"></div>
        <div style="width:36px;height:10px;background:#0E9E56;border-radius:2px;"></div>
        <div style="width:48px;height:10px;background:#0064C8;border-radius:2px;"></div>
      </div>
      <h1 style="color:#1C232D;">Invitation Received from ${school?.name || "School"}!</h1>
      <p style="color:#5B6672;font-size:15px;line-height:1.6;">Hello ${name.trim()},</p>
      <p style="color:#5B6672;font-size:15px;line-height:1.6;">You have been invited to join <strong>${school?.name || "School"}</strong> as <strong>${subRole}</strong> on the SchoolSaaS platform.</p>
      <div style="background:#FEF4DD;border:1px solid #F5A800;border-radius:10px;padding:20px;margin:20px 0;">
        <p style="margin:0;color:#7A5200;font-size:14px;font-weight:600;">⏳ Pending Approval</p>
        <p style="margin:8px 0 0;color:#7A5200;font-size:13px;">Your account is awaiting approval from the school administration. Once approved, you will receive a second email with your login credentials and temporary password.</p>
      </div>
      <p style="color:#94A3B8;font-size:12px;margin-top:30px;padding-top:15px;border-top:1px solid #E6E8E4;">This email was sent by SchoolSaaS — Emerson Technology</p>
    </div>`;

    await sendEmail(email.toLowerCase().trim(), `Invitation from ${school?.name || "School"} — Pending Approval`, emailHtml);

    return NextResponse.json({
      ok: true,
      staff: {
        id: staffUser.id,
        name: staffUser.name,
        email: staffUser.email,
        subRole,
        approvalStatus: "pending_approval",
      },
    });
  } catch (err) {
    console.error("[staff/invite] error:", err);
    return NextResponse.json({ error: "Failed to invite staff" }, { status: 500 });
  }
}
