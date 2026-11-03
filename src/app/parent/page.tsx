// src/app/parent/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CalendarCheck,
  Wallet,
  Trophy,
  Bell,
  ArrowRight,
  Users,
} from "lucide-react";
import { formatPKR, formatDate } from "@/lib/format";

export default async function ParentDashboardPage() {
  const user = await getSession();
  if (!user || user.role !== "PARENT" || !user.schoolId) {
    redirect("/parent/login");
  }

  // Get all children linked to this parent
  const links = await db.parentStudent.findMany({
    where: { parentId: user.id },
    include: {
      student: {
        include: {
          enrollments: {
            where: { academicYear: { isActive: true } },
            include: { section: { include: { class: true } }, academicYear: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          attendances: { orderBy: { date: "desc" }, take: 30 },
          invoices: {
            include: { payments: true, feePlan: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          examMarks: { include: { exam: true, subject: true }, take: 10 },
        },
      },
    },
  });

  if (links.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <div className="text-sm font-medium">No children linked</div>
            <p className="text-xs text-muted-foreground mt-1">
              Contact your school admin to link your child&apos;s record.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For simplicity: show first child's data + multi-child selector hint
  const firstChild = links[0].student;
  const firstEnr = firstChild.enrollments[0];

  // Calculate attendance stats for current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthAttendance = firstChild.attendances.filter(
    (a) => new Date(a.date) >= monthStart
  );
  const presentCount = monthAttendance.filter((a) => a.status === "present").length;
  const attendancePct = monthAttendance.length > 0
    ? Math.round((presentCount / monthAttendance.length) * 100)
    : 0;

  // Calculate pending fees
  const pendingInvoices = firstChild.invoices.filter(
    (inv) => inv.status !== "paid"
  );
  const pendingAmount = pendingInvoices.reduce((sum, inv) => {
    const paid = inv.payments.reduce((p, pay) => p + pay.amount, 0);
    return sum + (inv.amount - paid);
  }, 0);

  // Latest result
  const latestMarks = firstChild.examMarks;
  const avgScore = latestMarks.length > 0
    ? Math.round(
        (latestMarks.reduce((sum, m) => sum + (m.marks / m.totalMarks) * 100, 0) /
          latestMarks.length)
      )
    : 0;

  const stats = [
    {
      label: "Children Linked",
      value: links.length.toString(),
      icon: Users,
      sub: "across all enrollments",
    },
    {
      label: "Attendance (Month)",
      value: attendancePct + "%",
      icon: CalendarCheck,
      sub: `${presentCount}/${monthAttendance.length} days present`,
    },
    {
      label: "Pending Fees",
      value: formatPKR(pendingAmount),
      icon: Wallet,
      sub: `${pendingInvoices.length} invoices`,
    },
    {
      label: "Latest Result",
      value: avgScore + "%",
      icon: Trophy,
      sub: `${latestMarks.length} subjects`,
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {user.name}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s your child&apos;s overview at a glance.
        </p>
      </div>

      {/* Multi-child selector hint */}
      {links.length > 1 && (
        <Card className="bg-accent border-accent-foreground/10">
          <CardContent className="pt-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-accent-foreground" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-accent-foreground">
                Multiple children linked ({links.length})
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Showing {firstChild.name}&apos;s data. Multi-child selector coming soon.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                      {stat.label}
                    </div>
                    <div className="text-2xl font-bold mt-1.5 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stat.sub}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg shrink-0 bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Child overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Child Profile — {firstChild.name}
          </CardTitle>
          <CardDescription>
            {firstChild.admissionId && (
              <span className="font-mono">{firstChild.admissionId}</span>
            )}
            {firstEnr && (
              <span className="ml-2">
                {firstEnr.section.class.name}-{firstEnr.section.name} · Roll #{firstEnr.rollNo}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase font-bold text-muted-foreground">Father</div>
              <div className="font-semibold mt-1">{firstChild.fatherName || "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-muted-foreground">Gender</div>
              <div className="font-semibold mt-1 capitalize">{firstChild.gender || "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-muted-foreground">Status</div>
              <div className="font-semibold mt-1 capitalize">
                <Badge
                  variant="outline"
                  className={
                    firstChild.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-zinc-100 text-zinc-600"
                  }
                >
                  {firstChild.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/parent/attendance" className="block">
          <Card className="hover:border-primary/30 hover:shadow-md transition-all h-full">
            <CardContent className="pt-5">
              <CalendarCheck className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Attendance</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Day-by-day calendar view
              </p>
              <div className="mt-3 flex items-center text-xs text-primary font-semibold">
                View <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/parent/fees" className="block">
          <Card className="hover:border-primary/30 hover:shadow-md transition-all h-full">
            <CardContent className="pt-5">
              <Wallet className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Fees &amp; Pay</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {formatPKR(pendingAmount)} pending
              </p>
              <div className="mt-3 flex items-center text-xs text-primary font-semibold">
                Pay Now <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/parent/notices" className="block">
          <Card className="hover:border-primary/30 hover:shadow-md transition-all h-full">
            <CardContent className="pt-5">
              <Bell className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Notices</h3>
              <p className="text-xs text-muted-foreground mt-1">
                School announcements
              </p>
              <div className="mt-3 flex items-center text-xs text-primary font-semibold">
                View <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="opacity-60">
          <CardContent className="pt-5">
            <Trophy className="h-8 w-8 text-muted-foreground mb-3" />
            <h3 className="font-semibold">Results</h3>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {firstChild.attendances.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No attendance records yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-semibold px-6 py-3">Date</th>
                    <th className="text-left font-semibold px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {firstChild.attendances.slice(0, 5).map((a) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="px-6 py-3.5">{formatDate(a.date)}</td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant="outline"
                          className={
                            a.status === "present"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : a.status === "absent"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
