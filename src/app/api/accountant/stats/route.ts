// src/app/api/accountant/stats/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fee stats
  const allInvoices = await db.invoice.findMany({
    where: { enrollment: { student: { schoolId: user.schoolId } } },
    include: { payments: true },
  });

  const totalInvoiced = allInvoices.reduce((s, i) => s + i.amount, 0);
  const totalCollected = allInvoices.reduce((s, i) => s + i.payments.reduce((p, pay) => p + pay.amount, 0), 0);
  const pending = totalInvoiced - totalCollected;
  const defaultersCount = allInvoices.filter(i => i.status !== "paid").length;

  // Status counts
  const paidCount = allInvoices.filter(i => i.status === "paid").length;
  const partialCount = allInvoices.filter(i => i.status === "partial").length;
  const unpaidCount = allInvoices.filter(i => i.status === "unpaid" || i.status === "overdue").length;

  // Collection trend (6 months)
  const collectionTrend: { label: string; value: number }[] = [];
  try {
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const agg = await db.payment.aggregate({
        where: { invoice: { student: { schoolId: user.schoolId } }, paidAt: { gte: d, lte: monthEnd } },
        _sum: { amount: true },
      });
      collectionTrend.push({ label: d.toLocaleDateString("en-GB", { month: "short" }), value: agg._sum.amount || 0 });
    }
  } catch (err) { console.error("[collection trend] error:", err); }

  // Defaulters by class
  const defaultersByClass: { label: string; value: number }[] = [];
  try {
    const defaulters = await db.invoice.findMany({
      where: { enrollment: { student: { schoolId: user.schoolId } }, status: { in: ["unpaid", "partial", "overdue"] } },
      include: { enrollment: { include: { section: { include: { class: true } } } } },
    });
    const classMap = new Map<string, number>();
    for (const inv of defaulters) {
      const className = inv.enrollment.section?.class.name || "Unknown";
      classMap.set(className, (classMap.get(className) || 0) + 1);
    }
    for (const [label, value] of classMap) {
      defaultersByClass.push({ label, value });
    }
  } catch (err) { console.error("[defaulters by class] error:", err); }

  return NextResponse.json({
    stats: { totalInvoiced, totalCollected, pending, defaultersCount, paidCount, partialCount, unpaidCount },
    collectionTrend,
    defaultersByClass,
  });
}
