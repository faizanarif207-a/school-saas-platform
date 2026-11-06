// src/app/admin/billing/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { formatPKR, formatDate } from "@/lib/format";

export default async function AdminBillingPage() {
  const user = await getSession();
  if (!user || user.role !== "SUPER_ADMIN") redirect("/login");

  const subscriptions = await db.subscription.findMany({
    include: { school: { select: { name: true, city: true } }, plan: { select: { name: true, monthlyPrice: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalMRR = subscriptions.filter(s => s.status === "active").reduce((sum, s) => sum + s.amount, 0);
  const activeCount = subscriptions.filter(s => s.status === "active").length;
  const trialCount = await db.school.count({ where: { status: "trial" } });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Billing & Subscriptions</h1><p className="text-sm text-muted-foreground mt-1">Track platform revenue and subscription status.</p></div>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs uppercase font-bold text-muted-foreground">Monthly Revenue (MRR)</div><div className="text-xl font-bold mt-1 font-mono">{formatPKR(totalMRR)}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs uppercase font-bold text-muted-foreground">Active Subscriptions</div><div className="text-xl font-bold mt-1 text-emerald-600">{activeCount}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><div className="text-xs uppercase font-bold text-muted-foreground">Trial Schools</div><div className="text-xl font-bold mt-1 text-amber-600">{trialCount}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-blue-600" />All Subscriptions</CardTitle><CardDescription>{subscriptions.length} total subscriptions</CardDescription></CardHeader>
        <CardContent className="px-0">
          {subscriptions.length === 0 ? <div className="text-center py-12 text-sm text-muted-foreground">No subscriptions yet.</div> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground"><th className="text-left font-semibold px-6 py-3">School</th><th className="text-left font-semibold px-6 py-3">Plan</th><th className="text-right font-semibold px-6 py-3">Amount</th><th className="text-left font-semibold px-6 py-3">Start Date</th><th className="text-left font-semibold px-6 py-3">End Date</th><th className="text-left font-semibold px-6 py-3">Status</th></tr></thead>
              <tbody>
                {subscriptions.map(sub => (
                  <tr key={sub.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-3.5"><div className="font-semibold">{sub.school.name}</div><div className="text-xs text-muted-foreground">{sub.school.city}</div></td>
                    <td className="px-6 py-3.5">{sub.plan.name}</td>
                    <td className="px-6 py-3.5 text-right font-mono font-bold">{formatPKR(sub.amount)}</td>
                    <td className="px-6 py-3.5 text-xs">{formatDate(sub.startDate)}</td>
                    <td className="px-6 py-3.5 text-xs">{sub.endDate ? formatDate(sub.endDate) : "—"}</td>
                    <td className="px-6 py-3.5"><Badge variant="outline" className={sub.status === "active" ? "text-xs bg-emerald-50 text-emerald-700 border-emerald-200" : sub.status === "expired" ? "text-xs bg-red-50 text-red-700 border-red-200" : "text-xs bg-zinc-100 text-zinc-500"}>{sub.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
