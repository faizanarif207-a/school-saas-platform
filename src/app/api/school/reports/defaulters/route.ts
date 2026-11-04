// src/app/api/school/reports/defaulters/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateDefaultersReport, DefaultersReportData } from "@/lib/pdf-report";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const school = await db.school.findUnique({
    where: { id: user.schoolId },
    select: { name: true, city: true, email: true, phone: true, address: true },
  });
  if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 });

  const invoices = await db.invoice.findMany({
    where: {
      enrollment: { student: { schoolId: user.schoolId } },
      status: { in: ["unpaid", "partial", "overdue"] },
    },
    include: {
      student: { include: { guardians: { take: 1 } } },
      enrollment: { include: { section: { include: { class: true } } } },
      payments: true,
    },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();
  const defaulters = invoices.map(inv => {
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    const balance = inv.amount - paid;
    const daysOverdue = inv.dueDate
      ? Math.max(0, Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
    return {
      admissionId: inv.student.admissionId,
      studentName: inv.student.name,
      fatherName: inv.student.fatherName,
      className: inv.enrollment.section ? `${inv.enrollment.section.class.name}-${inv.enrollment.section.name}` : "",
      guardianPhone: inv.student.guardians[0]?.phone || null,
      amount: inv.amount,
      paid,
      balance,
      daysOverdue,
    };
  }).sort((a, b) => b.balance - a.balance);

  const data: DefaultersReportData = {
    totalOutstanding: defaulters.reduce((s, d) => s + d.balance, 0),
    defaultersCount: defaulters.length,
    defaulters,
  };

  const html = generateDefaultersReport(school, data);
  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
