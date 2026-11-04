// src/app/school/accountant/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, Receipt, AlertCircle, TrendingUp, Download } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatPKR, formatDate } from "@/lib/format";

type Invoice = {
  id: string;
  amount: number;
  month: string | null;
  status: string;
  dueDate: string;
  student: { name: string; admissionId: string | null; fatherName: string | null };
  enrollment: { section: { class: { name: string }; name: string } };
  feePlan: { title: string } | null;
  payments: { amount: number; receiptNo: string | null; method: string }[];
};

export default function AccountantPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/school/invoices");
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Calculate stats
  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.payments.reduce((p, pay) => p + pay.amount, 0), 0);
  const pending = totalInvoiced - totalPaid;
  const defaulters = invoices.filter((i) => i.status !== "paid").length;

  const statusConfig: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    unpaid: "bg-zinc-100 text-zinc-700 border-zinc-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    overdue: "bg-red-50 text-red-700 border-red-200",
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Accountant Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Track fees, invoices, payments, and defaulters.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs uppercase font-bold text-muted-foreground">Total Invoiced</div><div className="text-xl font-bold mt-1 font-mono">{formatPKR(totalInvoiced)}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs uppercase font-bold text-muted-foreground">Collected</div><div className="text-xl font-bold mt-1 text-emerald-600 font-mono">{formatPKR(totalPaid)}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs uppercase font-bold text-muted-foreground">Pending</div><div className="text-xl font-bold mt-1 text-amber-600 font-mono">{formatPKR(pending)}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs uppercase font-bold text-muted-foreground">Defaulters</div><div className="text-xl font-bold mt-1 text-red-600">{defaulters}</div></CardContent></Card>
      </div>

      {/* Quick export */}
      <div className="flex gap-2 flex-wrap">
        <a href="/api/school/exports/fees" download><button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border bg-background hover:bg-muted/50"><Download className="h-4 w-4" />Export Fees (Excel)</button></a>
        <a href="/api/school/exports/defaulters" download><button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border bg-background hover:bg-muted/50"><Download className="h-4 w-4" />Export Defaulters (Excel)</button></a>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" />Recent Invoices</CardTitle>
          <CardDescription>{invoices.length} invoices</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {invoices.length === 0 ? (
            <div className="text-center py-12"><Receipt className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" /><div className="text-sm font-medium">No invoices yet</div></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-semibold px-6 py-3">Admission ID</th>
                    <th className="text-left font-semibold px-6 py-3">Student</th>
                    <th className="text-left font-semibold px-6 py-3">Class</th>
                    <th className="text-right font-semibold px-6 py-3">Amount</th>
                    <th className="text-right font-semibold px-6 py-3">Paid</th>
                    <th className="text-right font-semibold px-6 py-3">Balance</th>
                    <th className="text-left font-semibold px-6 py-3">Status</th>
                    <th className="text-left font-semibold px-6 py-3">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 15).map((inv) => {
                    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
                    return (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-6 py-3.5 font-mono text-xs text-primary">{inv.student.admissionId || "—"}</td>
                        <td className="px-6 py-3.5"><div className="font-semibold">{inv.student.name}</div>{inv.student.fatherName && <div className="text-xs text-muted-foreground">S/O {inv.student.fatherName}</div>}</td>
                        <td className="px-6 py-3.5 text-xs">{inv.enrollment.section.class.name}-{inv.enrollment.section.name}</td>
                        <td className="px-6 py-3.5 text-right font-mono">{formatPKR(inv.amount)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-emerald-600">{formatPKR(paid)}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-amber-600">{formatPKR(inv.amount - paid)}</td>
                        <td className="px-6 py-3.5"><Badge variant="outline" className={`text-xs ${statusConfig[inv.status] || ""}`}>{inv.status}</Badge></td>
                        <td className="px-6 py-3.5">{inv.payments.length > 0 ? <a href={`/api/school/invoices/${inv.id}/receipt?paymentId=${inv.payments[0].id}`} target="_blank" className="text-primary text-xs hover:underline">PDF</a> : <span className="text-muted-foreground text-xs">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
