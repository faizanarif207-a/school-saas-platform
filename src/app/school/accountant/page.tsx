// src/app/school/accountant/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart } from "@/components/charts/line-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { TrendIndicator } from "@/components/trend-indicator";
import { AnimatedCounter } from "@/components/animated-counter";
import { Loader2, Wallet, Receipt, AlertCircle, TrendingUp, Download, Coins, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatPKR, formatDate } from "@/lib/format";

type Invoice = {
  id: string; amount: number; month: string | null; status: string; dueDate: string;
  student: { name: string; admissionId: string | null; fatherName: string | null };
  enrollment: { section: { class: { name: string }; name: string } };
  feePlan: { title: string } | null;
  payments: { amount: number; receiptNo: string | null; method: string }[];
};

type Stats = {
  totalInvoiced: number; totalCollected: number; pending: number;
  defaultersCount: number; paidCount: number; partialCount: number; unpaidCount: number;
};
type CollectionTrend = { label: string; value: number }[];

export default function AccountantPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats>({ totalInvoiced: 0, totalCollected: 0, pending: 0, defaultersCount: 0, paidCount: 0, partialCount: 0, unpaidCount: 0 });
  const [collectionTrend, setCollectionTrend] = useState<CollectionTrend>([]);
  const [defaultersByClass, setDefaultersByClass] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, statsRes] = await Promise.all([
        fetch("/api/school/invoices"),
        fetch("/api/accountant/stats"),
      ]);
      const invData = await invRes.json();
      const statsData = await statsRes.json();
      setInvoices(invData.invoices || []);
      setStats(statsData.stats || { totalInvoiced: 0, totalCollected: 0, pending: 0, defaultersCount: 0, paidCount: 0, partialCount: 0, unpaidCount: 0 });
      setCollectionTrend(statsData.collectionTrend || []);
      setDefaultersByClass(statsData.defaultersByClass || []);
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

  const statusConfig: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    unpaid: "bg-zinc-100 text-zinc-700 border-zinc-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    overdue: "bg-red-50 text-red-700 border-red-200",
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const totalInvoices = stats.paidCount + stats.partialCount + stats.unpaidCount;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />

      {/* ═══ HERO ═══ */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#D97706] to-[#B45309] text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-300/10 rounded-full blur-3xl" />
          <CardContent className="pt-6 pb-6 relative">
            <div className="flex items-center gap-2 mb-2">
              <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Accountant Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
            <p className="mt-1 text-sm opacity-80">Track fees, invoices, payments, and defaulters in real time.</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ KPIs ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Invoiced", value: stats.totalInvoiced, format: formatPKR, sub: "all invoices", icon: Receipt, iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400", trend: 10, delay: 0 },
          { label: "Collected", value: stats.totalCollected, format: formatPKR, sub: "payments received", icon: Coins, iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", trend: 14, delay: 0.1 },
          { label: "Pending", value: stats.pending, format: formatPKR, sub: "outstanding amount", icon: Wallet, iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", trend: -3, delay: 0.2 },
          { label: "Defaulters", value: stats.defaultersCount, sub: "students with unpaid fees", icon: FileWarning, iconBg: "bg-red-500/10 text-red-600 dark:text-red-400", trend: -5, delay: 0.3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, delay: stat.delay }} whileHover={{ y: -4 }}>
              <Card className="relative overflow-hidden group cursor-default">
                <motion.div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: stat.delay + 0.2 }} style={{ transformOrigin: "left" }} />
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">{stat.label}</div>
                      <div className="text-2xl font-bold mt-1.5 tracking-tight"><AnimatedCounter value={stat.value} format={stat.format || ((n) => Math.round(n).toString())} /></div>
                      <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
                      {stat.trend !== 0 && <div className="mt-2"><TrendIndicator value={stat.trend} invertColor={stat.label === "Defaulters" || stat.label === "Pending"} /></div>}
                    </div>
                    <motion.div className={`p-2 rounded-lg shrink-0 ${stat.iconBg}`} whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Icon className="h-5 w-5" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ═══ EXPORTS ═══ */}
      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        <a href="/api/school/exports/fees" download>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border bg-background hover:bg-muted/50 hover:border-amber-500/30 transition-all hover:-translate-y-0.5">
            <Download className="h-4 w-4 text-amber-600" />Export Fees (Excel)
          </button>
        </a>
        <a href="/api/school/exports/defaulters" download>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border bg-background hover:bg-muted/50 hover:border-red-500/30 transition-all hover:-translate-y-0.5">
            <Download className="h-4 w-4 text-red-600" />Export Defaulters (Excel)
          </button>
        </a>
        <a href="/api/school/reports/collection" target="_blank">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border bg-background hover:bg-muted/50 hover:border-blue-500/30 transition-all hover:-translate-y-0.5">
            <FileWarning className="h-4 w-4 text-blue-600" />Monthly Collection (PDF)
          </button>
        </a>
        <a href="/api/school/reports/defaulters" target="_blank">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border bg-background hover:bg-muted/50 hover:border-red-500/30 transition-all hover:-translate-y-0.5">
            <FileWarning className="h-4 w-4 text-red-600" />Defaulters Report (PDF)
          </button>
        </a>
      </motion.div>

      {/* ═══ CHARTS ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Trend Line */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />Collection Trend (6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-amber-600 dark:text-amber-400">
                <LineChart data={collectionTrend} height={220} color="#D97706" gradientId="acc-collection-grad" formatValue={(n) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString()} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Invoice Status Donut */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Invoice Status</CardTitle><CardDescription>Distribution breakdown</CardDescription></CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <DonutChart
                data={[
                  { label: "Paid", value: stats.paidCount, color: "#10B981" },
                  { label: "Partial", value: stats.partialCount, color: "#F59E0B" },
                  { label: "Unpaid", value: stats.unpaidCount, color: "#EF4444" },
                ]}
                size={160}
                centerValue={totalInvoices > 0 ? Math.round((stats.paidCount / totalInvoices) * 100) + "%" : "0%"}
                centerLabel="Paid"
              />
              <div className="mt-4 space-y-2 w-full">
                {[{ label: "Paid", value: stats.paidCount, color: "bg-emerald-500" }, { label: "Partial", value: stats.partialCount, color: "bg-amber-500" }, { label: "Unpaid", value: stats.unpaidCount, color: "bg-red-500" }].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${s.color}`} /><span className="text-muted-foreground">{s.label}</span></div>
                    <span className="font-mono font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══ DEFAULTERS BY CLASS ═══ */}
      {defaultersByClass.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />Defaulters by Class</CardTitle>
              <CardDescription>Where to focus collection efforts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <BarChart data={defaultersByClass} height={200} formatValue={(n) => n.toString()} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ═══ RECENT INVOICES ═══ */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />Recent Invoices</CardTitle>
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
                    {invoices.slice(0, 15).map((inv, i) => {
                      const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
                      return (
                        <motion.tr key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.03 }} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-6 py-3.5 font-mono text-xs text-primary">{inv.student.admissionId || "—"}</td>
                          <td className="px-6 py-3.5"><div className="font-semibold">{inv.student.name}</div>{inv.student.fatherName && <div className="text-xs text-muted-foreground">S/O {inv.student.fatherName}</div>}</td>
                          <td className="px-6 py-3.5 text-xs">{inv.enrollment.section.class.name}-{inv.enrollment.section.name}</td>
                          <td className="px-6 py-3.5 text-right font-mono">{formatPKR(inv.amount)}</td>
                          <td className="px-6 py-3.5 text-right font-mono text-emerald-600">{formatPKR(paid)}</td>
                          <td className="px-6 py-3.5 text-right font-mono text-amber-600">{formatPKR(inv.amount - paid)}</td>
                          <td className="px-6 py-3.5"><Badge variant="outline" className={`text-xs ${statusConfig[inv.status] || ""}`}>{inv.status}</Badge></td>
                          <td className="px-6 py-3.5">{inv.payments.length > 0 ? <a href={`/api/school/invoices/${inv.id}/receipt?paymentId=${inv.payments[0].id}`} target="_blank" className="text-primary text-xs hover:underline">PDF</a> : <span className="text-muted-foreground text-xs">—</span>}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
