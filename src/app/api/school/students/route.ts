// src/app/api/school/students/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const classId = url.searchParams.get("classId") || "";
  const sectionId = url.searchParams.get("sectionId") || "";

  const academicYear = await db.academicYear.findFirst({
    where: { schoolId: user.schoolId, isActive: true },
    orderBy: { startDate: "desc" },
  });

  const students = await db.student.findMany({
    where: {
      schoolId: user.schoolId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { fatherName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      enrollments: {
        some: {
          ...(academicYear ? { academicYearId: academicYear.id } : {}),
          ...(sectionId ? { sectionId } : {}),
          ...(classId ? { section: { classId } } : {}),
        },
      },
    },
    include: {
      enrollments: {
        where: academicYear ? { academicYearId: academicYear.id } : {},
        include: { section: { include: { class: true } } },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
      guardians: { take: 1 },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ students, total: students.length });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      fatherName,
      dob,
      gender,
      contact,
      address,
      sectionId,
      rollNo,
      guardianName,
      guardianPhone,
      guardianRelation,
    } = body;

    if (!name || !sectionId) {
      return NextResponse.json(
        { error: "Student name and section are required" },
        { status: 400 }
      );
    }

    // Verify section belongs to school
    const section = await db.section.findFirst({
      where: { id: sectionId, class: { schoolId: user.schoolId } },
    });
    if (!section) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    // Get active academic year
    const academicYear = await db.academicYear.findFirst({
      where: { schoolId: user.schoolId, isActive: true },
      orderBy: { startDate: "desc" },
    });
    if (!academicYear) {
      return NextResponse.json(
        { error: "No active academic year. Set up academic year first." },
        { status: 400 }
      );
    }

    // Auto-assign roll number if not provided
    let finalRollNo = rollNo;
    if (!finalRollNo) {
      const lastRoll = await db.enrollment.findFirst({
        where: { sectionId, academicYearId: academicYear.id },
        orderBy: { rollNo: "desc" },
      });
      finalRollNo = lastRoll ? lastRoll.rollNo + 1 : 1;
    }

    // Create student
    const student = await db.student.create({
      data: {
        schoolId: user.schoolId,
        name: name.trim(),
        fatherName: fatherName?.trim() || null,
        dob: dob ? new Date(dob) : null,
        gender: gender || null,
        contact: contact?.trim() || null,
        address: address?.trim() || null,
        status: "active",
      },
    });

    // Create enrollment
    await db.enrollment.create({
      data: {
        studentId: student.id,
        academicYearId: academicYear.id,
        sectionId,
        rollNo: parseInt(finalRollNo, 10),
      },
    });

    // Create guardian if provided
    if (guardianName) {
      await db.guardian.create({
        data: {
          studentId: student.id,
          name: guardianName.trim(),
          phone: guardianPhone?.trim() || null,
          relation: guardianRelation || "father",
        },
      });
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "student.create",
        entity: "student",
        entityId: student.id,
        metadata: JSON.stringify({ name, sectionId, rollNo: finalRollNo }),
      },
    });

    return NextResponse.json({ ok: true, student });
  } catch (err) {
    console.error("[students/create] error:", err);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
