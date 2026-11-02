// src/app/admin/page.tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  School as SchoolIcon,
  CheckCircle2,
  Clock,
  Ban,
  Wallet,
  Plus,
  ArrowRight,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react";
import { formatPKR } from "@/lib/format";

const STATUS_CONFIG = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  },
  trial: {
    label: "Trial",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  },
  suspended: {
    label: "Suspended",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
  },
  deleted: {
    label: "Deleted",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800",
  },
} as const;

export default async function AdminDashboardPage() {
  // Aggregate stats
  const [
    totalSchools,
    activeSchools,
    trialSchools,
    suspendedSchools,
    totalStudentsAgg,
    schools,
    activeSubs,
    trialSchoolsData,
    plansWithCounts,
  ] = await Promise.all([
    db.school.count(),
    db.school.count({ where: { status: "active" } }),
    db.school.count({ where: { status: "trial" } }),
    db.school.count({ where: { status: "suspended" } }),
    db.school.aggregate({ _sum: { studentCount: true } }),
    db.school.findMany({
      include: { plan: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.subscription.findMany({
      where: { status: "active" },
      include: { plan: true },
    }),
    db.school.findMany({
      where: { status: "trial" },
      include: { plan: true },
    }),
    db.platformPlan.findMany({
      include: { schools: { select: { id: true, status: true } } },
      orderBy: { monthlyPrice: "asc" },
    }),
  ]);

  const mrr = activeSubs.reduce(
    (sum, s) => sum + (s.amount || s.plan.monthlyPrice),
    0
  );
  const trialPotential = trialSchoolsData.reduce(
    (sum, s) => sum + s.plan.monthlyPrice,
    0
  );
  const totalStudents = totalStudentsAgg._sum.studentCount || 0;

  const stats = [
    {
      label: "Total Schools",
      value: totalSchools.toString(),
      icon: SchoolIcon,
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
      sub: `${activeSchools} active · ${trialSchools} trial`,
    },
    {
      label: "Active Schools",
      value: activeSchools.toString(),
      icon: CheckCircle2,
      iconBg:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      sub: `${Math.round((activeSchools / Math.max(totalSchools, 1)) * 100)}% of total`,
    },
    {
      label: "On Trial",
      value: trialSchools.toString(),
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      sub: `≈${formatPKR(trialPotential)} potential MRR`,
    },
    {
      label: "Monthly Revenue (MRR)",
      value: formatPKR(mrr),
      icon: Wallet,
      iconBg:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      sub: "from active subscriptions",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back — here&apos;s your platform at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/schools">All Schools</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/schools/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Add School
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
                  <div
                    className={`p-2 rounded-lg shrink-0 ${stat.iconBg}`}
                  >
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
        {/* Schools table — 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Schools</CardTitle>
              <CardDescription>Latest 10 schools on platform</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/schools">
                View all
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-semibold px-6 py-3">School</th>
                    <th className="text-left font-semibold px-6 py-3">Plan</th>
                    <th className="text-right font-semibold px-6 py-3">Students</th>
                    <th className="text-left font-semibold px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-muted-foreground py-10"
                      >
                        No schools yet. Click &quot;Add School&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    schools.map((school) => {
                      const statusInfo = STATUS_CONFIG[
                        school.status as keyof typeof STATUS_CONFIG
                      ] || STATUS_CONFIG.active;
                      const studentLimit = school.plan.studentLimit;
                      const ratio = studentLimit > 0
                        ? (school.studentCount / studentLimit) * 100
                        : 0;
                      return (
                        <tr
                          key={school.id}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-3.5">
                            <div className="font-semibold">{school.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {school.city}
                              {school.email && ` · ${school.email}`}
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="font-medium">{school.plan.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatPKR(school.plan.monthlyPrice)}/mo
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <div className="font-mono font-medium">
                              {school.studentCount}
                              {studentLimit > 0 && (
                                <span className="text-muted-foreground">
                                  {" / "}
                                  {studentLimit}
                                </span>
                              )}
                            </div>
                            {studentLimit > 0 && (
                              <div className="w-20 ml-auto mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${Math.min(ratio, 100)}%` }}
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            <Badge
                              variant="outline"
                              className={`text-xs ${statusInfo.className}`}
                            >
                              {statusInfo.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Plan distribution — 1 col */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Plan Distribution</CardTitle>
              <CardDescription>Schools per tier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {plansWithCounts.map((plan) => {
                const totalSchoolsOnPlan = plan.schools.length;
                const activeOnPlan = plan.schools.filter(
                  (s) => s.status === "active"
                ).length;
                const max = Math.max(
                  ...plansWithCounts.map((p) => p.schools.length),
                  1
                );
                const widthPct = (totalSchoolsOnPlan / max) * 100;
                return (
                  <div key={plan.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{plan.name}</span>
                      <span className="text-muted-foreground font-mono">
                        {totalSchoolsOnPlan}
                        {totalSchoolsOnPlan > 0 && (
                          <span className="text-emerald-600 ml-1">
                            ({activeOnPlan} ✓)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatPKR(plan.monthlyPrice)}/mo ·{" "}
                      {plan.studentLimit > 0
                        ? `${plan.studentLimit} students`
                        : "Unlimited"}
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t mt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total billed MRR</span>
                  <span className="font-semibold font-mono">
                    {formatPKR(mrr)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trial potential</span>
                  <span className="font-semibold font-mono text-amber-600">
                    +{formatPKR(trialPotential)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insight callout */}
          <Card className="bg-accent border-accent-foreground/10">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
                <div className="text-sm text-accent-foreground">
                  <div className="font-semibold mb-1">Growth opportunity</div>
                  <p className="text-xs leading-relaxed">
                    {trialSchools > 0
                      ? `${trialSchools} schools are on trial. Follow up to convert — that's ${formatPKR(
                          trialPotential
                        )} in additional MRR.`
                      : "No trial schools right now. Add a new school and assign a plan to start."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform health */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Total Students
                </span>
                <span className="font-mono font-semibold">
                  {totalStudents.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Ban className="h-4 w-4 text-muted-foreground" />
                  Suspended
                </span>
                <span className="font-mono font-semibold">{suspendedSchools}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Avg Students/School
                </span>
                <span className="font-mono font-semibold">
                  {totalSchools > 0
                    ? Math.round(totalStudents / totalSchools)
                    : 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
