// src/app/api/parent/fees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "PARENT" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const invoiceId = url.searchParams.get("invoiceId");

  if (invoiceId) {
    // Get specific invoice
    const links = await db.parentStudent.findMany({
      where: { parentId: user.id },
      select: { studentId: true },
    });
    const studentIds = links.map((l) => l.studentId);

    const invoice = await db.invoice.findFirst({
      where: { id: invoiceId, studentId: { in: studentIds } },
      include: { student: true, feePlan: true, payments: true },
    });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const paid = invoice.payments.reduce((s, p) => s + p.amount, 0);
    return NextResponse.json({
      invoice: {
        id: invoice.id,
        studentName: invoice.student.name,
        feeTitle: invoice.feePlan?.title || "Fee",
        month: invoice.month ? new Date(invoice.month).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—",
        amount: invoice.amount,
        paid,
        balance: invoice.amount - paid,
        status: invoice.status,
      },
    });
  }

  return NextResponse.json({ error: "invoiceId required" }, { status: 400 });
}
