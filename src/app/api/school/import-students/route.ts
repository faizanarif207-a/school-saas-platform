// src/app/api/school/import-students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateAdmissionId } from "@/lib/admission-id";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const sectionId = formData.get("sectionId") as string;

    if (!file || !sectionId) {
      return NextResponse.json({ error: "File and section are required" }, { status: 400 });
    }

    // Verify section
    const section = await db.section.findFirst({
      where: { id: sectionId, class: { schoolId: user.schoolId } },
      include: { class: true },
    });
    if (!section) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

    // Get academic year
    const academicYear = await db.academicYear.findFirst({
      where: { schoolId: user.schoolId, isActive: true },
      orderBy: { startDate: "desc" },
    });
    if (!academicYear) return NextResponse.json({ error: "No active academic year" }, { status: 400 });

    // Get school info
    const school = await db.school.findUnique({
      where: { id: user.schoolId },
      select: { name: true, city: true },
    });

    // Parse Excel
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = String(row["Name"] || row["name"] || "").trim();
      const fatherName = String(row["Father Name"] || row["fatherName"] || "").trim() || null;
      const gender = String(row["Gender"] || row["gender"] || "").trim().toLowerCase() || null;
      const phone = String(row["Phone"] || row["phone"] || "").trim() || null;

      if (!name) {
        skipped++;
        errors.push(`Row ${i + 2}: Missing name`);
        continue;
      }

      try {
        // Generate admission ID
        const admissionId = await generateAdmissionId(user.schoolId, school?.name || "", school?.city || "");

        // Create student
        const student = await db.student.create({
          data: {
            schoolId: user.schoolId,
            admissionId,
            name,
            fatherName,
            gender: gender === "male" || gender === "female" ? gender : null,
            contact: phone,
            status: "active",
          },
        });

        // Create enrollment
        const lastRoll = await db.enrollment.findFirst({
          where: { sectionId, academicYearId: academicYear.id },
          orderBy: { rollNo: "desc" },
        });
        const rollNo = lastRoll ? (lastRoll.rollNo || 0) + 1 : 1;

        await db.enrollment.create({
          data: {
            studentId: student.id,
            academicYearId: academicYear.id,
            sectionId,
            rollNo,
          },
        });

        // Create guardian if phone provided
        if (phone && fatherName) {
          await db.guardian.create({
            data: {
              studentId: student.id,
              name: fatherName,
              phone,
              relation: "father",
            },
          });
        }

        created++;
      } catch (err) {
        skipped++;
        errors.push(`Row ${i + 2}: Failed to create student`);
      }
    }

    // Update school student count
    await db.school.update({
      where: { id: user.schoolId },
      data: { studentCount: { increment: created } },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "students.bulk_import",
        entity: "student",
        metadata: JSON.stringify({ created, skipped, total: rows.length }),
      },
    });

    return NextResponse.json({
      ok: true,
      created,
      skipped,
      total: rows.length,
      errors: errors.slice(0, 10),
    });
  } catch (err) {
    console.error("[import/students] error:", err);
    return NextResponse.json({ error: "Failed to import students" }, { status: 500 });
  }
}
