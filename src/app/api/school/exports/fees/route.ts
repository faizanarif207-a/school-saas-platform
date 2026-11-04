// src/app/api/school/exports/fees/route.ts
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateExcelBuffer, excelResponse } from "@/lib/excel-export";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const invoices = await db.invoice.findMany({
    where: { enrollment: { student: { schoolId: user.schoolId } } },
    include: {
      student: true,
      enrollment: { include: { section: { include: { class: true } } } },
      feePlan: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const headers = [
    "Invoice ID",
    "Admission ID",
    "Student Name",
    "Class-Section",
    "Fee Title",
    "Month",
    "Amount",
    "Paid",
    "Balance",
    "Status",
    "Due Date",
    "Created At",
  ];

  const rows = invoices.map((inv) => {
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    return [
      inv.id.slice(-8).toUpperCase(),
      inv.student.admissionId || "",
      inv.student.name,
      inv.enrollment.section
        ? `${inv.enrollment.section.class.name}-${inv.enrollment.section.name}`
        : "",
      inv.feePlan?.title || "",
      inv.month ? new Date(inv.month).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "",
      inv.amount,
      paid,
      inv.amount - paid,
      inv.status,
      inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-GB") : "",
      new Date(inv.createdAt).toLocaleDateString("en-GB"),
    ];
  });

  const buffer = generateExcelBuffer({
    filename: "fees.xlsx",
    sheetName: "Fees",
    headers,
    rows,
  });

  return excelResponse(buffer, "fees.xlsx");
}
