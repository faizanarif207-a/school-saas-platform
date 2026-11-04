// src/app/api/school/exports/defaulters/route.ts
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateExcelBuffer, excelResponse } from "@/lib/excel-export";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get all invoices with unpaid/partial/overdue status
  const invoices = await db.invoice.findMany({
    where: {
      enrollment: { student: { schoolId: user.schoolId } },
      status: { in: ["unpaid", "partial", "overdue"] },
    },
    include: {
      student: { include: { guardians: { take: 1 } } },
      enrollment: { include: { section: { include: { class: true } } } },
      feePlan: true,
      payments: true,
    },
    orderBy: { dueDate: "asc" },
  });

  const headers = [
    "Admission ID",
    "Student Name",
    "Class-Section",
    "Father Name",
    "Guardian Phone",
    "Fee Title",
    "Month",
    "Amount Due",
    "Amount Paid",
    "Balance",
    "Due Date",
    "Days Overdue",
    "Status",
  ];

  const now = new Date();
  const rows = invoices
    .map((inv) => {
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
      const balance = inv.amount - paid;
      const daysOverdue = inv.dueDate
        ? Math.max(0, Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      return {
        row: [
          inv.student.admissionId || "",
          inv.student.name,
          inv.enrollment.section
            ? `${inv.enrollment.section.class.name}-${inv.enrollment.section.name}`
            : "",
          inv.student.fatherName || "",
          inv.student.guardians[0]?.phone || "",
          inv.feePlan?.title || "",
          inv.month ? new Date(inv.month).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "",
          inv.amount,
          paid,
          balance,
          inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-GB") : "",
          daysOverdue,
          inv.status,
        ],
        balance,
      };
    })
    .sort((a, b) => b.balance - a.balance)
    .map((item) => item.row);

  const buffer = generateExcelBuffer({
    filename: "defaulters.xlsx",
    sheetName: "Defaulters",
    headers,
    rows,
  });

  return excelResponse(buffer, "defaulters.xlsx");
}
