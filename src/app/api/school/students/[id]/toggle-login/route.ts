// src/app/api/school/students/[id]/toggle-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
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

  try {
    const { id } = await params;
    const body = await req.json();
    const { enable } = body;

    // Find student
    const student = await db.student.findFirst({
      where: { id, schoolId: user.schoolId },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (enable) {
      // Check if student user already exists
      const existing = await db.user.findFirst({
        where: { name: student.name, schoolId: user.schoolId, role: "STUDENT" },
      });
      if (existing) {
        // Reactivate
        await db.user.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
        return NextResponse.json({ ok: true, message: "Student login re-activated" });
      }

      // Create student user account
      const tempPassword = randomBytes(4).toString("hex");
      const passwordHash = await hashPassword(tempPassword);
      const studentEmail = `${student.admissionId?.toLowerCase() || student.name.toLowerCase().replace(/\s+/g, ".")}@student.school`;

      const studentUser = await db.user.create({
        data: {
          email: studentEmail,
          name: student.name,
          passwordHash,
          role: "STUDENT",
          schoolId: user.schoolId,
          isActive: true,
        },
      });

      return NextResponse.json({
        ok: true,
        message: "Student login enabled",
        credentials: { email: studentEmail, tempPassword },
      });
    } else {
      // Disable student login
      const existing = await db.user.findFirst({
        where: { name: student.name, schoolId: user.schoolId, role: "STUDENT" },
      });
      if (existing) {
        await db.user.update({
          where: { id: existing.id },
          data: { isActive: false },
        });
      }
      return NextResponse.json({ ok: true, message: "Student login disabled" });
    }
  } catch (err) {
    console.error("[toggle-login] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
