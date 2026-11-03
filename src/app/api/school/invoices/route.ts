// src/app/api/school/invoices/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { format } from "date-fns";

// GET — list invoices
export async function GET(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const studentId = url.searchParams.get("studentId");

  const invoices = await db.invoice.findMany({
    where: {
      enrollment: { student: { schoolId: user.schoolId } },
      ...(status ? { status } : {}),
      ...(studentId ? { studentId } : {}),
    },
    include: {
      enrollment: { include: { section: { include: { class: true } } } },
      student: { include: { guardians: { take: 1 } } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ invoices });
}

// POST — generate monthly invoices for all students in bulk
export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { month, feePlanId } = body;
    if (!month || !feePlanId) {
      return NextResponse.json(
        { error: "Month and fee plan are required" },
        { status: 400 }
      );
    }

    // Get fee plan
    const feePlan = await db.feePlan.findFirst({
      where: { id: feePlanId, schoolId: user.schoolId },
      include: { class: { include: { sections: true } } },
    });
    if (!feePlan) {
      return NextResponse.json({ error: "Invalid fee plan" }, { status: 400 });
    }

    // Get academic year
    const academicYear = await db.academicYear.findFirst({
      where: { schoolId: user.schoolId, isActive: true },
      orderBy: { startDate: "desc" },
    });
    if (!academicYear) {
      return NextResponse.json(
        { error: "No active academic year" },
        { status: 400 }
      );
    }

    // Parse month (YYYY-MM)
    const [year, mon] = month.split("-").map(Number);
    const invoiceMonth = new Date(year, mon - 1, 1);
    const dueDate = new Date(year, mon - 1, 15);

    // Find all enrollments for the class (if classId) or all students (if no classId)
    const enrollments = await db.enrollment.findMany({
      where: {
        academicYearId: academicYear.id,
        ...(feePlan.classId ? { section: { classId: feePlan.classId } } : {}),
      },
      include: { student: true },
    });

    // Filter out enrollments that already have an invoice for this month+plan
    let created = 0;
    let skipped = 0;

    for (const enr of enrollments) {
      // Skip if student is no longer active
      if (enr.student.status !== "active") {
        skipped++;
        continue;
      }

      const existing = await db.invoice.findFirst({
        where: {
          enrollmentId: enr.id,
          studentId: enr.studentId,
          feePlanId,
          month: invoiceMonth,
        },
      });
      if (existing) {
        skipped++;
        continue;
      }

      await db.invoice.create({
        data: {
          enrollmentId: enr.id,
          studentId: enr.studentId,
          feePlanId,
          month: invoiceMonth,
          amount: feePlan.amount,
          dueDate,
          status: "unpaid",
        },
      });
      created++;
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "invoices.generate",
        entity: "invoice",
        metadata: JSON.stringify({ month, feePlanId, created, skipped }),
      },
    });

    return NextResponse.json({
      ok: true,
      created,
      skipped,
      total: enrollments.length,
    });
  } catch (err) {
    console.error("[invoices/generate] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
