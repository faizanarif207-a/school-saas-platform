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
  // Both OWNER and PRINCIPAL can approve access requests (Teacher/Parent/Student)
  // Only OWNER can approve SCHOOL_ADMIN staff (Principal, Accountant, Admission)
  if (user.subRole !== "OWNER" && user.subRole !== "PRINCIPAL") {
    return NextResponse.json({ error: "Only owners and principals can approve access requests" }, { status: 403 });
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

    // For STUDENT role — fetch linked student record from audit log metadata
    // so we can sync the user's name to exactly match the student record name.
    // The student dashboard finds the student record by matching user.name + schoolId.
    let updateData: { approvalStatus: string; passwordHash: string; name?: string } = {
      approvalStatus: "approved",
      passwordHash,
    };

    if (staff.role === "STUDENT") {
      // Find the original access_request.submit audit log for this user
      const accessLog = await db.auditLog.findFirst({
        where: {
          entityId: id,
          action: "access_request.submit",
        },
        orderBy: { createdAt: "desc" },
      });

      if (accessLog?.metadata) {
        try {
          const meta = JSON.parse(accessLog.metadata);
          if (meta.studentId) {
            const linkedStudent = await db.student.findFirst({
              where: { id: meta.studentId, schoolId: user.schoolId },
              select: { name: true },
            });
            if (linkedStudent) {
              // Sync user.name with official student record name
              updateData.name = linkedStudent.name;
            }
          }
        } catch {
          // ignore parse errors
        }
      }
    }

    // Update user — approve + set password (and synced name for students)
    await db.user.update({
      where: { id },
      data: updateData,
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
    let loginUrl: string;
    if (staff.role === "TEACHER") {
      loginUrl = `${portalUrl}/teacher/login`;
    } else if (staff.role === "PARENT") {
      loginUrl = `${portalUrl}/parent/login`;
    } else if (staff.role === "STUDENT") {
      loginUrl = `${portalUrl}/student/login`;
    } else {
      loginUrl = `${portalUrl}/school/login`;
    }

    const roleLabel = staff.subRole || staff.role;
    const emailHtml = staffInviteEmail(staff.name || "User", loginUrl, tempPassword, roleLabel, school?.name || "School");
    await sendEmail(staff.email, `Welcome to ${school?.name || "School"} — Your Account is Approved!`, emailHtml);

    return NextResponse.json({
      ok: true,
      message: `${staff.role.toLowerCase().charAt(0).toUpperCase() + staff.role.toLowerCase().slice(1)} approved and credentials email sent`,
      tempPassword,
    });
  } catch (err) {
    console.error("[staff/approve] error:", err);
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
  }
}
