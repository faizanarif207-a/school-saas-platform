// src/app/api/school/students/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET — student detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const student = await db.student.findFirst({
    where: { id, schoolId: user.schoolId },
    include: {
      enrollments: {
        include: { section: { include: { class: true } }, academicYear: true },
        orderBy: { createdAt: "desc" },
      },
      guardians: true,
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ student });
}

// PATCH — update student
export async function PATCH(
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
    const {
      name,
      fatherName,
      dob,
      gender,
      contact,
      address,
      status,
      sectionId,
      rollNo,
      guardianName,
      guardianPhone,
      guardianRelation,
    } = body;

    // Verify student belongs to school
    const existing = await db.student.findFirst({
      where: { id, schoolId: user.schoolId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // If section is changing, verify it belongs to school + handle enrollment
    if (sectionId && sectionId !== existing.id) {
      const section = await db.section.findFirst({
        where: { id: sectionId, class: { schoolId: user.schoolId } },
      });
      if (!section) {
        return NextResponse.json({ error: "Invalid section" }, { status: 400 });
      }

      const academicYear = await db.academicYear.findFirst({
        where: { schoolId: user.schoolId, isActive: true },
        orderBy: { startDate: "desc" },
      });
      if (academicYear) {
        // Find existing enrollment for this year
        const existingEnr = await db.enrollment.findFirst({
          where: { studentId: id, academicYearId: academicYear.id },
        });
        if (existingEnr) {
          // Update section + rollNo
          await db.enrollment.update({
            where: { id: existingEnr.id },
            data: { sectionId, rollNo: rollNo ? parseInt(rollNo, 10) : existingEnr.rollNo },
          });
        } else {
          // Create new enrollment
          await db.enrollment.create({
            data: {
              studentId: id,
              academicYearId: academicYear.id,
              sectionId,
              rollNo: rollNo ? parseInt(rollNo, 10) : 1,
            },
          });
        }
      }
    }

    // Update student record
    const updated = await db.student.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(fatherName !== undefined && { fatherName: fatherName?.trim() || null }),
        ...(dob !== undefined && { dob: dob ? new Date(dob) : null }),
        ...(gender !== undefined && { gender }),
        ...(contact !== undefined && { contact: contact?.trim() || null }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(status && { status }),
      },
    });

    // Update guardian if provided
    if (guardianName !== undefined) {
      const existingGuardian = await db.guardian.findFirst({
        where: { studentId: id },
      });
      if (existingGuardian) {
        await db.guardian.update({
          where: { id: existingGuardian.id },
          data: {
            name: guardianName?.trim() || existingGuardian.name,
            phone: guardianPhone?.trim() || null,
            relation: guardianRelation || existingGuardian.relation,
          },
        });
      } else if (guardianName) {
        await db.guardian.create({
          data: {
            studentId: id,
            name: guardianName.trim(),
            phone: guardianPhone?.trim() || null,
            relation: guardianRelation || "father",
          },
        });
      }
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "student.update",
        entity: "student",
        entityId: id,
        metadata: JSON.stringify({ updatedFields: Object.keys(body) }),
      },
    });

    return NextResponse.json({ ok: true, student: updated });
  } catch (err) {
    console.error("[students/update] error:", err);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

// DELETE — soft delete student (status = "left")
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await db.student.findFirst({
      where: { id, schoolId: user.schoolId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Soft delete — set status to "left" (data preserved for history)
    await db.student.update({
      where: { id },
      data: { status: "left" },
    });

    // Decrement school studentCount
    await db.school.update({
      where: { id: user.schoolId },
      data: { studentCount: { decrement: 1 } },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "student.delete",
        entity: "student",
        entityId: id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[students/delete] error:", err);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
