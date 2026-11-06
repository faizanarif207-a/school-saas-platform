// src/app/admin/audit/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";
import { formatDateTime } from "@/lib/format";

export default async function AdminAuditPage() {
  const user = await getSession();
  if (!user || user.role !== "SUPER_ADMIN") redirect("/login");

  const logs = await db.auditLog.findMany({
    include: { school: { select: { name: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const actionColors: Record<string, string> = {
    "school.create": "bg-blue-50 text-blue-700 border-blue-200",
    "school.suspend": "bg-red-50 text-red-700 border-red-200",
    "school.activate": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "student.create": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "staff.invite": "bg-purple-50 text-purple-700 border-purple-200",
    "payment.record": "bg-amber-50 text-amber-700 border-amber-200",
    "branch.create": "bg-cyan-50 text-cyan-700 border-cyan-200",
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1><p className="text-sm text-muted-foreground mt-1">Platform-wide activity log — who did what, when.</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5 text-blue-600" />All Activity ({logs.length})</CardTitle><CardDescription>Latest 100 actions across all schools</CardDescription></CardHeader>
        <CardContent className="px-0">
          {logs.length === 0 ? <div className="text-center py-12 text-sm text-muted-foreground">No activity logged yet.</div> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground"><th className="text-left font-semibold px-6 py-3">Action</th><th className="text-left font-semibold px-6 py-3">User</th><th className="text-left font-semibold px-6 py-3">School</th><th className="text-left font-semibold px-6 py-3">Time</th></tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-3.5"><Badge variant="outline" className={`text-xs capitalize ${actionColors[log.action] || "bg-zinc-50 text-zinc-700 border-zinc-200"}`}>{log.action.replace(/[._]/g, " ")}</Badge></td>
                    <td className="px-6 py-3.5"><div className="font-semibold">{log.user?.name || "System"}</div><div className="text-xs text-muted-foreground">{log.user?.email || ""}</div></td>
                    <td className="px-6 py-3.5 text-muted-foreground">{log.school?.name || "Platform"}</td>
                    <td className="px-6 py-3.5 text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</td>
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
