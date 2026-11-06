// src/app/parent/receipts/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Download } from "lucide-react";
import { formatPKR, formatDateTime } from "@/lib/format";

export default async function ParentReceiptsPage() {
  const user = await getSession();
  if (!user || user.role !== "PARENT" || !user.schoolId) redirect("/parent/login");

  const links = await db.parentStudent.findMany({
    where: { parentId: user.id },
    include: {
      student: {
        include: {
          enrollments: { where: { academicYear: { isActive: true } }, include: { section: { include: { class: true } } }, take: 1 },
          invoices: { include: { payments: true, feePlan: true }, orderBy: { createdAt: "desc" }, take: 20 },
        },
      },
    },
  });
  if (links.length === 0) return <div className="p-6 text-muted-foreground">No children linked.</div>;

  const child = links[0].student;
  const allPayments = child.invoices.flatMap(inv => inv.payments.map(p => ({ ...p, invoice: inv }))).sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Payment Receipts</h1><p className="text-sm text-muted-foreground mt-1">{child.name}'s payment history and downloadable receipts.</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-pink-600" />All Receipts</CardTitle><CardDescription>{allPayments.length} payments</CardDescription></CardHeader>
        <CardContent className="px-0">
          {allPayments.length === 0 ? <div className="text-center py-12"><Receipt className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" /><div className="text-sm font-medium">No receipts yet</div></div> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground"><th className="text-left font-semibold px-6 py-3">Receipt #</th><th className="text-left font-semibold px-6 py-3">Fee Title</th><th className="text-left font-semibold px-6 py-3">Method</th><th className="text-right font-semibold px-6 py-3">Amount</th><th className="text-left font-semibold px-6 py-3">Date</th><th className="text-left font-semibold px-6 py-3">Download</th></tr></thead>
              <tbody>
                {allPayments.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-3.5 font-mono text-xs text-primary">{p.receiptNo || "—"}</td>
                    <td className="px-6 py-3.5 font-semibold">{p.invoice.feePlan?.title || "Fee"}</td>
                    <td className="px-6 py-3.5"><Badge variant="outline" className="text-xs capitalize">{p.method}</Badge></td>
                    <td className="px-6 py-3.5 text-right font-mono font-bold">{formatPKR(p.amount)}</td>
                    <td className="px-6 py-3.5 text-xs text-muted-foreground">{formatDateTime(p.paidAt)}</td>
                    <td className="px-6 py-3.5"><a href={`/api/school/invoices/${p.invoice.id}/receipt?paymentId=${p.id}`} target="_blank" className="text-primary hover:underline text-xs flex items-center gap-1"><Download className="h-3 w-3" />PDF</a></td>
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
