// src/app/api/school/staff/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

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
    return NextResponse.json({ error: "Only owners can reject staff" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const staff = await db.user.findFirst({
      where: { id, schoolId: user.schoolId, approvalStatus: "pending_approval" },
    });
    if (!staff) {
      return NextResponse.json({ error: "Staff not found or already processed" }, { status: 404 });
    }

    // Update user — reject
    await db.user.update({
      where: { id },
      data: { approvalStatus: "rejected", isActive: false },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "staff.reject",
        entity: "user",
        entityId: id,
      },
    });

    // Send rejection email
    const school = await db.school.findUnique({ where: { id: user.schoolId }, select: { name: true } });
    const emailHtml = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:20px;">
        <div style="width:48px;height:10px;background:#F5A800;border-radius:2px;"></div>
        <div style="width:36px;height:10px;background:#0E9E56;border-radius:2px;"></div>
        <div style="width:48px;height:10px;background:#0064C8;border-radius:2px;"></div>
      </div>
      <h1 style="color:#1C232D;">Update on Your Application</h1>
      <p style="color:#5B6672;font-size:15px;line-height:1.6;">Hello ${staff.name || "User"},</p>
      <p style="color:#5B6672;font-size:15px;line-height:1.6;">We appreciate your interest in joining <strong>${school?.name || "School"}</strong>. Unfortunately, your account request has not been approved at this time.</p>
      <p style="color:#5B6672;font-size:15px;line-height:1.6;">If you believe this is an error, please contact the school administration directly.</p>
      <p style="color:#94A3B8;font-size:12px;margin-top:30px;padding-top:15px;border-top:1px solid #E6E8E4;">This email was sent by SchoolSaaS — Emerson Technology</p>
    </div>`;

    await sendEmail(staff.email, `Update on Your Application — ${school?.name || "School"}`, emailHtml);

    return NextResponse.json({ ok: true, message: "Staff rejected and email sent" });
  } catch (err) {
    console.error("[staff/reject] error:", err);
    return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
  }
}
