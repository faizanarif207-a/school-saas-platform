// src/app/api/parent/children/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

// Get all children linked to this parent
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "PARENT" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await db.parentStudent.findMany({
    where: { parentId: user.id },
    include: {
      student: {
        include: {
          enrollments: {
            where: { academicYear: { isActive: true } },
            include: { section: { include: { class: true } }, academicYear: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          attendances: { orderBy: { date: "desc" }, take: 30 },
          invoices: {
            include: { payments: true, feePlan: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          examMarks: { include: { exam: true, subject: true } },
        },
      },
    },
  });

  const children = links.map((link) => {
    const s = link.student;
    const enr = s.enrollments[0];
    return {
      linkId: link.id,
      relation: link.relation,
      id: s.id,
      admissionId: s.admissionId,
      name: s.name,
      fatherName: s.fatherName,
      gender: s.gender,
      class: enr ? `${enr.section.class.name}-${enr.section.name}` : "",
      rollNo: enr?.rollNo || null,
      attendance: s.attendances,
      invoices: s.invoices,
      examMarks: s.examMarks,
    };
  });

  return NextResponse.json({ children });
}
