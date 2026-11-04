// src/app/api/school/exports/students/route.ts
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateExcelBuffer, excelResponse } from "@/lib/excel-export";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const academicYear = await db.academicYear.findFirst({
    where: { schoolId: user.schoolId, isActive: true },
    orderBy: { startDate: "desc" },
  });

  const students = await db.student.findMany({
    where: { schoolId: user.schoolId },
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

  const headers = [
    "Admission ID",
    "Name",
    "Father Name",
    "Class",
    "Section",
    "Roll #",
    "Gender",
    "DOB",
    "Contact",
    "Guardian Name",
    "Guardian Phone",
    "Status",
    "Admitted On",
  ];

  const rows = students.map((s) => {
    const enr = s.enrollments[0];
    const grd = s.guardians[0];
    return [
      s.admissionId || "",
      s.name,
      s.fatherName || "",
      enr?.section.class.name || "",
      enr?.section.name || "",
      enr?.rollNo || "",
      s.gender || "",
      s.dob ? new Date(s.dob).toLocaleDateString("en-GB") : "",
      s.contact || "",
      grd?.name || "",
      grd?.phone || "",
      s.status,
      new Date(s.createdAt).toLocaleDateString("en-GB"),
    ];
  });

  const buffer = generateExcelBuffer({
    filename: "students.xlsx",
    sheetName: "Students",
    headers,
    rows,
  });

  return excelResponse(buffer, "students.xlsx");
}
