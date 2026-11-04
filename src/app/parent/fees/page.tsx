// src/app/parent/fees/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Receipt, Download } from "lucide-react";
import { formatPKR, formatDate } from "@/lib/format";

export default async function ParentFeesPage() {
  const user = await getSession();
  if (!user || user.role !== "PARENT" || !user.schoolId) {
    redirect("/parent/login");
  }

  // Get children (first child for now)
  const links = await db.parentStudent.findMany({
    where: { parentId: user.id },
    include: {
      student: {
        include: {
          enrollments: {
            where: { academicYear: { isActive: true } },
            include: { section: { include: { class: true } } },
            take: 1,
          },
          invoices: {
            include: {
              payments: true,
              feePlan: true,
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      },
    },
  });

  if (links.length === 0) {
    return <div className="p-6">No children linked</div>;
  }

  const child = links[0].student;
  const invoices = child.invoices;

  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.reduce(
    (s, i) => s + i.payments.reduce((p, pay) => p + pay.amount, 0),
    0
  );
  const pending = totalInvoiced - totalPaid;

  const statusConfig = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    unpaid: "bg-zinc-100 text-zinc-700 border-zinc-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    overdue: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fees</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {child.name}&apos;s fee records and payment history.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-xs uppercase font-bold text-muted-foreground">Total Billed</div>
            <div className="text-xl font-bold mt-1 font-mono">{formatPKR(totalInvoiced)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-xs uppercase font-bold text-muted-foreground">Paid</div>
            <div className="text-xl font-bold mt-1 text-emerald-600 font-mono">{formatPKR(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-xs uppercase font-bold text-muted-foreground">Pending</div>
            <div className="text-xl font-bold mt-1 text-amber-600 font-mono">{formatPKR(pending)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Invoice History
          </CardTitle>
          <CardDescription>{invoices.length} invoices</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <div className="text-sm font-medium">No invoices yet</div>
              <p className="text-xs text-muted-foreground mt-1">
                School admin will generate invoices for you.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-semibold px-6 py-3">Fee Title</th>
                    <th className="text-left font-semibold px-6 py-3">Month</th>
                    <th className="text-right font-semibold px-6 py-3">Amount</th>
                    <th className="text-right font-semibold px-6 py-3">Paid</th>
                    <th className="text-right font-semibold px-6 py-3">Balance</th>
                    <th className="text-left font-semibold px-6 py-3">Status</th>
                    <th className="text-left font-semibold px-6 py-3">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
                    const balance = inv.amount - paid;
                    return (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-6 py-3.5">
                          <div className="font-semibold">{inv.feePlan?.title || "Fee"}</div>
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground">
                          {inv.month ? formatDate(inv.month) : "—"}
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">{formatPKR(inv.amount)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-emerald-600">{formatPKR(paid)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-amber-600">{formatPKR(balance)}</td>
                        <td className="px-6 py-3.5">
                          <Badge variant="outline" className={`text-xs ${statusConfig[inv.status as keyof typeof statusConfig] || statusConfig.unpaid}`}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5">
                          {inv.status !== "paid" && (
                            <a
                              href={`/parent/payment?invoiceId=${inv.id}`}
                              className="text-primary hover:underline text-xs font-semibold mr-2"
                            >
                              Pay Online
                            </a>
                          )}
                          {inv.payments.length > 0 ? (
                            <a
                              href={`/api/school/invoices/${inv.id}/receipt?paymentId=${inv.payments[0].id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-xs flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              PDF
                            </a>
                          ) : (
                            inv.status === "paid" && <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Online payment notice */}
      <Card className="bg-accent border-accent-foreground/10">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <Receipt className="h-5 w-5 text-accent-foreground" />
            <div className="text-sm text-accent-foreground">
              <strong>Online Payment:</strong> JazzCash / Easypaisa integration coming in next phase. Currently, please pay at school counter and ask the accountant to record your payment.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
