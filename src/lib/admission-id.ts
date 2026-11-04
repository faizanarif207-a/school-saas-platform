// src/lib/admission-id.ts
// Generate Admission ID in format: SCHOOLCODE-CITY-YEAR-SEQ
// Example: BSS-LHR-2026-0014

import { db } from "./db";

/**
 * Generate a unique Admission ID for a student.
 * Format: [SCHOOL_CODE]-[CITY_3]-[YEAR]-[SEQ_4_DIGITS]
 * Example: BSS-LHR-2026-0014 (14th admission of Beaconhouse Lahore in 2026)
 *
 * School code: derived from school name (first 3-4 letters, uppercase)
 * City code: first 3 letters of city, uppercase
 * Year: current 4-digit year
 * Sequence: 4-digit, zero-padded, increments per school per year
 */
export async function generateAdmissionId(
  schoolId: string,
  schoolName: string,
  city: string
): Promise<string> {
  // Derive school code (first 3 letters, alphanumeric only, uppercase)
  const schoolCode = (schoolName || "SCH")
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  // Derive city code (first 3 letters)
  const cityCode = (city || "ISB")
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  const year = new Date().getFullYear();

  // Count existing admissions for this school this year
  // (admissionId pattern matches SCHOOLCODE-CITY-YEAR-*  OR  any prefix with this year)
  const yearPrefix = `${schoolCode}-${cityCode}-${year}-`;
  const existingCount = await db.student.count({
    where: {
      schoolId,
      admissionId: { startsWith: yearPrefix },
    },
  });

  const seq = (existingCount + 1).toString().padStart(4, "0");
  return `${yearPrefix}${seq}`;
}

/**
 * Search students by multiple identifiers.
 * Returns matches with confidence info.
 */
export async function searchStudentsByAdmission(
  schoolId: string,
  query: string
): Promise<
  Array<{
    id: string;
    admissionId: string | null;
    name: string;
    fatherName: string | null;
    section: string;
    class: string;
    rollNo: number | null;
    guardianPhone: string | null;
  }>
> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Try as Admission ID first (case-insensitive)
  const academicYear = await db.academicYear.findFirst({
    where: { schoolId, isActive: true },
    orderBy: { startDate: "desc" },
  });

  const students = await db.student.findMany({
    where: {
      schoolId,
      OR: [
        { admissionId: { contains: trimmed, mode: "insensitive" } },
        { name: { contains: trimmed, mode: "insensitive" } },
        { fatherName: { contains: trimmed, mode: "insensitive" } },
      ],
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
    take: 20,
    orderBy: { name: "asc" },
  });

  return students.map((s) => {
    const enr = s.enrollments[0];
    const grd = s.guardians[0];
    return {
      id: s.id,
      admissionId: s.admissionId,
      name: s.name,
      fatherName: s.fatherName,
      section: enr?.section.name || "",
      class: enr?.section.class.name || "",
      rollNo: enr?.rollNo || null,
      guardianPhone: grd?.phone || null,
    };
  });
}
