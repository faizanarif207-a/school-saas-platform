// src/app/student/notices/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { formatDateTime } from "@/lib/format";

export default async function StudentNoticesPage() {
  const user = await getSession();
  if (!user || user.role !== "STUDENT" || !user.schoolId) redirect("/student/login");

  const notices = await db.notice.findMany({
    where: { schoolId: user.schoolId, noticeType: "school_wide" },
    include: { poster: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Notices</h1><p className="text-sm text-muted-foreground mt-1">School announcements and updates.</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-emerald-600" />All Notices</CardTitle><CardDescription>{notices.length} notices</CardDescription></CardHeader>
        <CardContent>
          {notices.length === 0 ? <div className="text-center py-12"><Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" /><div className="text-sm font-medium">No notices yet</div></div> : (
            <div className="space-y-3">
              {notices.map(n => (
                <div key={n.id} className="p-4 rounded-lg border bg-card hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-sm">{n.title}</h3><Badge variant="outline" className="text-xs">School-wide</Badge></div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.body}</p>
                  <div className="text-xs text-muted-foreground mt-2">By {n.poster.name || "Admin"} · {formatDateTime(n.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
