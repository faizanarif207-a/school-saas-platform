// src/app/school/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CalendarCheck,
  Wallet,
  Receipt,
  Plus,
  TrendingUp,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { formatPKR } from "@/lib/format";

export default async function SchoolDashboardPage() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    redirect("/school/login");
  }
  const schoolId = user.schoolId;

  // Get current academic year
  const academicYear = await db.academicYear.findFirst({
    where: { schoolId, isActive: true },
    orderBy: { startDate: "desc" },
  });

  // Counts — wrapped in try/catch so one failure doesn't break whole page
  let totalStudents = 0;
  let totalClasses = 0;
  let totalSections = 0;
  let todayAttendance = 0;
  let pendingFees = 0;
  let feeCollected = 0;
  let feePlans = 0;

  try {
    const [
      stuCount,
      clsCount,
      secCount,
      attCount,
      invCount,
      payAgg,
      fpCount,
    ] = await Promise.all([
      db.student.count({ where: { schoolId, status: "active" } }),
      db.class.count({ where: { schoolId } }),
      db.section.count({ where: { class: { schoolId } } }),
      academicYear
        ? db.attendance.count({
            where: {
              enrollment: { academicYearId: academicYear.id },
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
              status: "present",
            },
          })
        : Promise.resolve(0),
      db.invoice.count({
        where: {
          student: { schoolId },
          status: { in: ["unpaid", "partial", "overdue"] },
        },
      }),
      db.payment.aggregate({
        where: {
          invoice: { student: { schoolId } },
          paidAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      db.feePlan.count({ where: { schoolId } }),
    ]);

    totalStudents = stuCount;
    totalClasses = clsCount;
    totalSections = secCount;
    todayAttendance = attCount;
    pendingFees = invCount;
    feeCollected = payAgg._sum.amount || 0;
    feePlans = fpCount;
  } catch (err) {
    console.error("[school dashboard stats] error:", err);
  }

  const stats = [
    {
      label: "Total Students",
      value: totalStudents.toString(),
      icon: Users,
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
      sub: `${totalClasses} classes · ${totalSections} sections`,
    },
    {
      label: "Present Today",
      value: todayAttendance.toString(),
      icon: CalendarCheck,
      iconBg:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      sub: academicYear ? `AY ${academicYear.year}` : "No active year",
    },
    {
      label: "Pending Fees",
      value: pendingFees.toString(),
      icon: Receipt,
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      sub: "invoices awaiting payment",
    },
    {
      label: "Collected This Month",
      value: formatPKR(feeCollected),
      icon: Wallet,
      iconBg:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      sub: `${feePlans} fee plans configured`,
    },
  ];

  // Recent students
  const recentStudents = await db.student.findMany({
    where: { schoolId },
    include: {
      enrollments: {
        include: { section: { include: { class: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      guardians: { take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Class strength overview
  const classes = await db.class.findMany({
    where: { schoolId },
    include: {
      sections: {
        include: {
          enrollments: {
            where: academicYear ? { academicYearId: academicYear.id } : {},
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">School Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back — here&apos;s your school at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/school/attendance">Mark Attendance</Link>
          </Button>
          <Button asChild>
            <Link href="/school/students/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Student
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
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
                  <div className={`p-2 rounded-lg shrink-0 ${stat.iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent students */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Students</CardTitle>
              <CardDescription>Latest admissions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/school/students">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            {recentStudents.length === 0 ? (
              <div className="text-center py-10 px-6">
                <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <div className="text-sm font-medium">No students yet</div>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Add your first student to get started.
                </p>
                <Button asChild size="sm">
                  <Link href="/school/students/new">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Student
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="text-left font-semibold px-6 py-3">Student</th>
                      <th className="text-left font-semibold px-6 py-3">Class</th>
                      <th className="text-left font-semibold px-6 py-3">Guardian</th>
                      <th className="text-left font-semibold px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStudents.map((s) => {
                      const enr = s.enrollments[0];
                      const grd = s.guardians[0];
                      return (
                        <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-6 py-3.5">
                            <div className="font-semibold">{s.name}</div>
                            {s.fatherName && (
                              <div className="text-xs text-muted-foreground">
                                S/O {s.fatherName}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            {enr ? (
                              <span>
                                {enr.section.class.name}-{enr.section.name}
                                <span className="text-xs text-muted-foreground ml-1">
                                  #{enr.rollNo}
                                </span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">Not enrolled</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            {grd ? (
                              <div>
                                <div className="text-xs">{grd.name}</div>
                                <div className="text-xs text-muted-foreground">{grd.phone}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            <Badge
                              variant="outline"
                              className={
                                s.status === "active"
                                  ? "text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                                  : "text-xs bg-zinc-100 text-zinc-600 border-zinc-200"
                              }
                            >
                              {s.status}
                            </Badge>
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

        {/* Class strength */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Class Strength</CardTitle>
            <CardDescription>Students per class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {classes.length === 0 ? (
              <div className="text-xs text-muted-foreground italic py-4 text-center">
                No classes configured. <Link href="/school/setup" className="text-primary underline">Set up</Link> your school first.
              </div>
            ) : (
              classes.map((cls) => {
                const total = cls.sections.reduce(
                  (sum, sec) => sum + sec.enrollments.length,
                  0
                );
                const max = Math.max(
                  ...classes.map((c) =>
                    c.sections.reduce((s, sec) => s + sec.enrollments.length, 0)
                  ),
                  1
                );
                const widthPct = (total / max) * 100;
                return (
                  <div key={cls.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{cls.name}</span>
                      <span className="text-muted-foreground font-mono">
                        {total} ({cls.sections.length} sections)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/school/setup" className="block">
              <div className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-sm transition-all">
                <GraduationCap className="h-5 w-5 text-primary mb-2" />
                <div className="font-semibold text-sm">School Setup</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Classes, sections, subjects, academic year
                </div>
              </div>
            </Link>
            <Link href="/school/students" className="block">
              <div className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-sm transition-all">
                <Users className="h-5 w-5 text-primary mb-2" />
                <div className="font-semibold text-sm">Students</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Add, edit, view all students
                </div>
              </div>
            </Link>
            <Link href="/school/attendance" className="block">
              <div className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-sm transition-all">
                <CalendarCheck className="h-5 w-5 text-primary mb-2" />
                <div className="font-semibold text-sm">Attendance</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Mark daily class-wise attendance
                </div>
              </div>
            </Link>
            <Link href="/school/fees" className="block">
              <div className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-sm transition-all">
                <Wallet className="h-5 w-5 text-primary mb-2" />
                <div className="font-semibold text-sm">Fees</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Fee plans, invoices, payments
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
