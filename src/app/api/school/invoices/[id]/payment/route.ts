// src/app/api/school/invoices/[id]/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { amount, method, notes } = body;

    if (!amount || !method) {
      return NextResponse.json(
        { error: "Amount and method required" },
        { status: 400 }
      );
    }

    // Verify invoice belongs to school
    const invoice = await db.invoice.findFirst({
      where: {
        id,
        enrollment: { student: { schoolId: user.schoolId } },
      },
      include: { payments: true },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const paid = invoice.payments.reduce((s, p) => s + p.amount, 0);
    const remaining = invoice.amount - paid;
    if (amount > remaining) {
      return NextResponse.json(
        { error: `Amount exceeds remaining (PKR ${remaining})` },
        { status: 400 }
      );
    }

    // Generate receipt number
    const receiptNo = `R-${Date.now().toString().slice(-6)}`;

    const payment = await db.payment.create({
      data: {
        invoiceId: id,
        amount: parseInt(amount, 10),
        method,
        receiptNo,
        notes: notes || null,
      },
    });

    // Update invoice status
    const newPaid = paid + parseInt(amount, 10);
    let newStatus = "unpaid";
    if (newPaid >= invoice.amount) newStatus = "paid";
    else if (newPaid > 0) newStatus = "partial";

    await db.invoice.update({
      where: { id },
      data: { status: newStatus },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "payment.record",
        entity: "payment",
        entityId: payment.id,
        metadata: JSON.stringify({ invoiceId: id, amount, method, receiptNo }),
      },
    });

    return NextResponse.json({ ok: true, payment, invoiceStatus: newStatus });
  } catch (err) {
    console.error("[payment/create] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
