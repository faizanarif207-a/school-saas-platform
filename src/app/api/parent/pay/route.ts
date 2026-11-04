// src/app/api/parent/pay/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "PARENT" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { invoiceId, method } = body;

    if (!invoiceId || !method) {
      return NextResponse.json({ error: "Invoice ID and payment method required" }, { status: 400 });
    }

    // Verify invoice belongs to parent's children
    const links = await db.parentStudent.findMany({
      where: { parentId: user.id },
      select: { studentId: true },
    });
    const studentIds = links.map((l) => l.studentId);

    const invoice = await db.invoice.findFirst({
      where: { id: invoiceId, studentId: { in: studentIds } },
      include: { payments: true },
    });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const paid = invoice.payments.reduce((s, p) => s + p.amount, 0);
    const balance = invoice.amount - paid;
    if (balance <= 0) return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });

    // In production: redirect to JazzCash/Easypaisa gateway
    // For now: simulate successful payment and create record
    const receiptNo = `R-ONLINE-${Date.now().toString().slice(-6)}`;

    const payment = await db.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: balance,
        method,
        receiptNo,
        notes: `Online payment by ${user.name}`,
      },
    });

    // Update invoice status
    const newPaid = paid + balance;
    await db.invoice.update({
      where: { id: invoice.id },
      data: { status: "paid" },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "payment.online",
        entity: "payment",
        entityId: payment.id,
        metadata: JSON.stringify({ invoiceId, amount: balance, method, receiptNo }),
      },
    });

    return NextResponse.json({
      ok: true,
      payment: { id: payment.id, receiptNo, amount: balance },
      message: "Payment successful",
    });
  } catch (err) {
    console.error("[parent/pay] error:", err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
