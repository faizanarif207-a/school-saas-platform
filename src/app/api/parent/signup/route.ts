// src/app/api/parent/signup/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { admissionId, studentDob, parentName, email, phone, password } = body;

    // Validate required fields
    if (!admissionId?.trim() || !studentDob || !parentName?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email" },
        { status: 400 }
      );
    }

    // Find student by admissionId + DOB
    const student = await db.student.findFirst({
      where: {
        admissionId: admissionId.trim().toUpperCase(),
        dob: new Date(studentDob),
        status: "active",
      },
      include: {
        guardians: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "No student found with this Admission ID and Date of Birth. Contact your school admin." },
        { status: 404 }
      );
    }

    // Check if email already used
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered. Try logging in instead." },
        { status: 400 }
      );
    }

    // Verify phone matches guardian record (optional strict check)
    const guardian = student.guardians.find((g) => g.phone);
    if (guardian && guardian.phone && !guardian.phone.includes(phone.replace(/\s/g, "").slice(-4))) {
      // Soft check — only last 4 digits need to match
      return NextResponse.json(
        { error: "Phone number does not match school records. Contact your school admin." },
        { status: 400 }
      );
    }

    // Create parent user
    const passwordHash = await hashPassword(password);
    const parentUser = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name: parentName.trim(),
        passwordHash,
        role: "PARENT",
        schoolId: student.schoolId,
        isActive: true,
      },
    });

    // Link parent to student
    await db.parentStudent.create({
      data: {
        parentId: parentUser.id,
        studentId: student.id,
        relation: "guardian",
      },
    });

    // Update guardian record with email if not present
    if (guardian && !guardian.email) {
      await db.guardian.update({
        where: { id: guardian.id },
        data: { email: email.toLowerCase() },
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Account created successfully",
      parent: { id: parentUser.id, email: parentUser.email, name: parentUser.name },
    });
  } catch (err) {
    console.error("[parent/signup] error:", err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
