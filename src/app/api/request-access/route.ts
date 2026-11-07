// src/app/api/request-access/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, schoolCode, admissionId } = body;

    if (!name?.trim() || !email?.trim() || !role || !schoolCode?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Validate role
    const validRoles = ["TEACHER", "PARENT", "STUDENT"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Students MUST provide admissionId
    if (role === "STUDENT" && !admissionId?.trim()) {
      return NextResponse.json({ error: "Admission ID is required for student access requests" }, { status: 400 });
    }

    // Find school by schoolCode (or by name match as fallback)
    const school = await db.school.findFirst({
      where: {
        OR: [
          { schoolCode: schoolCode.trim().toUpperCase() },
          { id: schoolCode.trim() },
          { name: { contains: schoolCode.trim(), mode: "insensitive" } },
        ],
        status: { in: ["active", "trial"] },
      },
      select: { id: true, name: true, city: true },
    });

    if (!school) {
      return NextResponse.json(
        { error: "Invalid school access code. Please contact your school administration." },
        { status: 400 }
      );
    }

    // For Student role — verify the admissionId exists in this school
    let linkedStudent: { id: string; name: string } | null = null;
    if (role === "STUDENT") {
      const student = await db.student.findFirst({
        where: {
          schoolId: school.id,
          admissionId: admissionId.trim().toUpperCase(),
          status: "active",
        },
        select: { id: true, name: true },
      });
      if (!student) {
        return NextResponse.json(
          { error: "No active student found with this Admission ID at this school. Please check and try again." },
          { status: 400 }
        );
      }
      linkedStudent = student;
    }

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      if (existing.approvalStatus === "pending_approval") {
        return NextResponse.json(
          { error: "You already have a pending request. Please wait for approval." },
          { status: 400 }
        );
      }
      if (existing.approvalStatus === "approved") {
        return NextResponse.json(
          { error: "An account with this email already exists. Please login directly." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Determine role + subRole
    const finalRole = role;

    // Create user with pending_approval — NO password
    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        passwordHash: "pending_approval",
        role: finalRole,
        schoolId: school.id,
        approvalStatus: "pending_approval",
        isActive: true,
      },
    });

    // Send confirmation email to requester
    const roleLabel = finalRole.charAt(0) + finalRole.slice(1).toLowerCase();
    const emailHtml = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:20px;">
        <div style="width:48px;height:10px;background:#F5A800;border-radius:2px;"></div>
        <div style="width:36px;height:10px;background:#0E9E56;border-radius:2px;"></div>
        <div style="width:48px;height:10px;background:#0064C8;border-radius:2px;"></div>
      </div>
      <h1 style="color:#1C232D;">Access Request Received</h1>
      <p style="color:#5B6672;font-size:15px;line-height:1.6;">Hello ${name.trim()},</p>
      <p style="color:#5B6672;font-size:15px;line-height:1.6;">Your request to join <strong>${school.name}</strong> as <strong>${roleLabel}</strong> has been submitted successfully.</p>
      ${role === "STUDENT" ? `
      <div style="background:#E7F5EC;border:1px solid #0E9E56;border-radius:10px;padding:20px;margin:20px 0;">
        <p style="margin:0;color:#0E5C2C;font-size:14px;font-weight:600;">✓ Student Record Verified</p>
        <p style="margin:8px 0 0;color:#0E5C2C;font-size:13px;">Your Admission ID <strong>${admissionId.trim().toUpperCase()}</strong> matches a student record at this school.</p>
      </div>
      ` : ""}
      <div style="background:#FEF4DD;border:1px solid #F5A800;border-radius:10px;padding:20px;margin:20px 0;">
        <p style="margin:0;color:#7A5200;font-size:14px;font-weight:600;">⏳ Pending Approval</p>
        <p style="margin:8px 0 0;color:#7A5200;font-size:13px;">The school administration will review your request. Once approved, you will receive a second email containing your login credentials and temporary password.</p>
      </div>
      <p style="color:#5B6672;font-size:15px;line-height:1.6;">This process usually takes 1-2 business days. If you have any questions, please contact your school directly.</p>
      <p style="color:#94A3B8;font-size:12px;margin-top:30px;padding-top:15px;border-top:1px solid #E6E8E4;">This email was sent by SchoolSaaS — Emerson Technology</p>
    </div>`;

    await sendEmail(email.toLowerCase().trim(), `Access Request Received — ${school.name}`, emailHtml);

    // Notify school admins (owners + principals) — find them
    const schoolAdmins = await db.user.findMany({
      where: {
        schoolId: school.id,
        role: "SCHOOL_ADMIN",
        subRole: { in: ["OWNER", "PRINCIPAL"] },
        approvalStatus: "approved",
      },
      select: { email: true, name: true },
    });

    for (const admin of schoolAdmins) {
      const adminEmailHtml = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:20px;">
          <div style="width:48px;height:10px;background:#F5A800;border-radius:2px;"></div>
          <div style="width:36px;height:10px;background:#0E9E56;border-radius:2px;"></div>
          <div style="width:48px;height:10px;background:#0064C8;border-radius:2px;"></div>
        </div>
        <h1 style="color:#1C232D;">New Access Request</h1>
        <p style="color:#5B6672;font-size:15px;line-height:1.6;">Hello ${admin.name || "Admin"},</p>
        <p style="color:#5B6672;font-size:15px;line-height:1.6;">A new access request has been submitted for <strong>${school.name}</strong>.</p>
        <div style="background:#FDFDFB;border:1px solid #E6E8E4;border-radius:10px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 8px;color:#5B6672;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Request Details</p>
          <p style="margin:0 0 4px;font-size:14px;"><strong>Name:</strong> ${name.trim()}</p>
          <p style="margin:0 0 4px;font-size:14px;"><strong>Email:</strong> ${email.toLowerCase().trim()}</p>
          <p style="margin:0 0 4px;font-size:14px;"><strong>Role:</strong> ${roleLabel}</p>
          ${role === "STUDENT" && linkedStudent ? `<p style="margin:0 0 4px;font-size:14px;"><strong>Admission ID:</strong> ${admissionId.trim().toUpperCase()}</p><p style="margin:0 0 4px;font-size:14px;"><strong>Linked Student:</strong> ${linkedStudent.name}</p>` : ""}
        </div>
        <p style="color:#5B6672;font-size:15px;line-height:1.6;">Please login to your dashboard to review and approve this request.</p>
        <p style="color:#94A3B8;font-size:12px;margin-top:30px;padding-top:15px;border-top:1px solid #E6E8E4;">This email was sent by SchoolSaaS — Emerson Technology</p>
      </div>`;

      await sendEmail(admin.email, `New Access Request — ${name.trim()} (${roleLabel})`, adminEmailHtml);
    }

    // Audit log
    await db.auditLog.create({
      data: {
        schoolId: school.id,
        action: "access_request.submit",
        entity: "user",
        entityId: newUser.id,
        metadata: JSON.stringify({
          name,
          email,
          role: finalRole,
          admissionId: role === "STUDENT" ? admissionId : undefined,
          studentId: linkedStudent?.id,
        }),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Request submitted. You will receive an email once approved.",
    });
  } catch (err) {
    console.error("[request-access] error:", err);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
