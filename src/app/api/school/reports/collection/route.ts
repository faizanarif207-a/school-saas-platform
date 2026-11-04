// src/app/api/school/reports/collection/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateMonthlyCollectionReport, MonthlyCollectionData } from "@/lib/pdf-report";

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

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const invoices = await db.invoice.findMany({
    where: {
      enrollment: { student: { schoolId: user.schoolId } },
      createdAt: { gte: monthStart, lte: monthEnd },
    },
    include: {
      student: true,
      enrollment: { include: { section: { include: { class: true } } } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.payments.reduce((p, pay) => p + pay.amount, 0), 0);
  const pending = totalInvoiced - totalCollected;
  const defaultersCount = invoices.filter(i => i.status !== "paid").length;

  const data: MonthlyCollectionData = {
    month: now.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    totalInvoiced,
    totalCollected,
    pending,
    defaultersCount,
    invoices: invoices.map(inv => ({
      admissionId: inv.student.admissionId,
      studentName: inv.student.name,
      className: inv.enrollment.section ? `${inv.enrollment.section.class.name}-${inv.enrollment.section.name}` : "",
      amount: inv.amount,
      paid: inv.payments.reduce((s, p) => s + p.amount, 0),
      balance: inv.amount - inv.payments.reduce((s, p) => s + p.amount, 0),
      status: inv.status,
    })),
  };

  const html = generateMonthlyCollectionReport(school, data);
  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
