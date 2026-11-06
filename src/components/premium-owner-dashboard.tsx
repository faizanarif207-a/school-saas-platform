"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart } from "@/components/charts/line-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { TrendIndicator } from "@/components/trend-indicator";
import { AnimatedCounter } from "@/components/animated-counter";
import { formatPKR } from "@/lib/format";
import {
  Users, CalendarCheck, Wallet, Receipt, GraduationCap,
  TrendingUp, Plus, ArrowRight, Bell, Settings,
  Building2, UserPlus, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";

export type OwnerData = {
  schoolName: string;
  city: string;
  planName: string;
  planPrice: number;
  trialDaysLeft: number | null;
  isTrial: boolean;
  totalStudents: number;
  totalClasses: number;
  totalSections: number;
  presentToday: number;
  pendingFees: number;
  feeCollected: number;
  feePlans: number;
  totalStaff: number;
  totalBranches: number;
  attendanceTrend: { label: string; value: number }[];
  collectionTrend: { label: string; value: number }[];
  classStrength: { label: string; value: number }[];
  feeStatus: { paid: number; partial: number; unpaid: number };
  recentActivity: { id: string; action: string; createdAt: string; userName: string | null }[];
};

export function PremiumOwnerDashboard({ data }: { data: OwnerData }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  };

  const totalInvoices = data.feeStatus.paid + data.feeStatus.partial + data.feeStatus.unpaid;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 lg:p-8 space-y-6">
      {/* ═══ HERO ═══ */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#0064C8] to-[#0A56A8] text-white shadow-xl">
          <div className="absolute top-0 right-0 opacity-10 flex flex-col gap-1.5 p-6">
            <div className="w-20 h-3 bg-[#F5A800] rounded-sm" />
            <div className="w-16 h-3 bg-[#0E9E56] rounded-sm" />
            <div className="w-20 h-3 bg-[#0064C8] rounded-sm" />
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />
          <CardContent className="pt-6 pb-6 relative">
            <div className="flex items-center gap-2 mb-3">
              <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Live Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{data.schoolName}</h1>
            <p className="mt-1 text-sm opacity-80">{data.city}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30"><GraduationCap className="h-3 w-3 mr-1" />{data.planName} Plan</Badge>
              <Badge className="bg-white/20 text-white border-white/30">PKR {data.planPrice.toLocaleString()}/mo</Badge>
              {data.isTrial && data.trialDaysLeft !== null && (
                <Badge className="bg-[#F5A800] text-white border-0"><Clock className="h-3 w-3 mr-1" />{data.trialDaysLeft} days trial left</Badge>
              )}
              {data.totalBranches > 0 && (
                <Badge className="bg-white/20 text-white border-white/30"><Building2 className="h-3 w-3 mr-1" />{data.totalBranches} Branches</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: data.totalStudents, sub: `${data.totalClasses} classes · ${data.totalSections} sections`, icon: Users, iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400", trend: 12, delay: 0 },
          { label: "Present Today", value: data.presentToday, sub: `${data.totalStudents > 0 ? Math.round((data.presentToday / data.totalStudents) * 100) : 0}% attendance rate`, icon: CalendarCheck, iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", trend: 5, delay: 0.1 },
          { label: "Pending Fees", value: data.pendingFees, format: formatPKR, sub: `${data.feePlans} fee plans configured`, icon: Receipt, iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", trend: -3, delay: 0.2 },
          { label: "Collected (Month)", value: data.feeCollected, format: formatPKR, sub: `${data.totalStaff} staff members`, icon: Wallet, iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", trend: 14, delay: 0.3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, delay: stat.delay }} whileHover={{ y: -4 }}>
              <Card className="relative overflow-hidden group cursor-default">
                <motion.div className="absolute top-0 left-0 right-0 h-1 bg-primary" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: stat.delay + 0.2 }} style={{ transformOrigin: "left" }} />
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">{stat.label}</div>
                      <div className="text-2xl font-bold mt-1.5 tracking-tight">
                        <AnimatedCounter value={stat.value} format={stat.format || ((n) => Math.round(n).toString())} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
                      <div className="mt-2"><TrendIndicator value={stat.trend} /></div>
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

      {/* ═══ CHARTS ROW 1: Attendance Trend + Fee Status Donut ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Line Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Attendance Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-primary">
                <LineChart data={data.attendanceTrend} height={220} color="#0064C8" gradientId="att-grad" formatValue={(n) => `${n}%`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fee Status Donut */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Fee Status</CardTitle>
              <CardDescription>Invoice distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <DonutChart
                data={[
                  { label: "Paid", value: data.feeStatus.paid, color: "#10B981" },
                  { label: "Partial", value: data.feeStatus.partial, color: "#F59E0B" },
                  { label: "Unpaid", value: data.feeStatus.unpaid, color: "#EF4444" },
                ]}
                size={160}
                centerValue={totalInvoices > 0 ? Math.round((data.feeStatus.paid / totalInvoices) * 100) + "%" : "0%"}
                centerLabel="Paid"
              />
              <div className="mt-4 space-y-2 w-full">
                {[
                  { label: "Paid", value: data.feeStatus.paid, color: "bg-emerald-500" },
                  { label: "Partial", value: data.feeStatus.partial, color: "bg-amber-500" },
                  { label: "Unpaid", value: data.feeStatus.unpaid, color: "bg-red-500" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${s.color}`} />
                      <span className="text-muted-foreground">{s.label}</span>
                    </div>
                    <span className="font-mono font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══ CHARTS ROW 2: Collection Trend + Class Strength ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Bar Chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Monthly Fee Collection
              </CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <BarChart data={data.collectionTrend} height={220} formatValue={(n) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString()} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Class Strength */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Class Strength
              </CardTitle>
              <CardDescription>Students per class</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.classStrength.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground italic">No classes configured.</div>
              ) : (
                data.classStrength.map((cls, i) => {
                  const max = Math.max(...data.classStrength.map((c) => c.value), 1);
                  const pct = (cls.value / max) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{cls.label}</span>
                        <span className="text-muted-foreground font-mono">{cls.value} students</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══ RECENT ACTIVITY + QUICK ACTIONS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3">
              {data.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">No recent activity</div>
              ) : (
                <div className="space-y-1">
                  {data.recentActivity.slice(0, 6).map((act, i) => {
                    const icons: Record<string, { icon: typeof Users; bg: string }> = {
                      "school.create": { icon: Building2, bg: "bg-blue-500/10 text-blue-600" },
                      "student.create": { icon: UserPlus, bg: "bg-emerald-500/10 text-emerald-600" },
                      "attendance.marked": { icon: CalendarCheck, bg: "bg-emerald-500/10 text-emerald-600" },
                      "payment.record": { icon: Wallet, bg: "bg-emerald-500/10 text-emerald-600" },
                      "notice.create": { icon: Bell, bg: "bg-amber-500/10 text-amber-600" },
                      "settings.update": { icon: Settings, bg: "bg-blue-500/10 text-blue-600" },
                      "branch.create": { icon: Building2, bg: "bg-cyan-500/10 text-cyan-600" },
                      "staff.invite": { icon: UserPlus, bg: "bg-purple-500/10 text-purple-600" },
                    };
                    const config = icons[act.action] || { icon: AlertCircle, bg: "bg-zinc-500/10 text-zinc-600" };
                    const Icon = config.icon;
                    return (
                      <motion.div key={act.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }} whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/40">
                        <div className={`p-2 rounded-lg shrink-0 ${config.bg}`}><Icon className="h-4 w-4" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium capitalize truncate">{act.action.replace(/[._]/g, " ")}</div>
                          <div className="text-xs text-muted-foreground truncate">{act.userName || "System"}</div>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0 font-mono">{new Date(act.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: UserPlus, title: "Add Student", desc: "Admit a new student", href: "/school/students/new" },
                { icon: CalendarCheck, title: "Mark Attendance", desc: "Today's attendance", href: "/school/attendance" },
                { icon: Bell, title: "Post Notice", desc: "School announcement", href: "/school/notices" },
                { icon: Building2, title: "Add Branch", desc: "New campus", href: "/school/branches" },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.div key={action.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.08 }} whileHover={{ y: -3 }}>
                    <Link href={action.href} className="block">
                      <div className="p-3 rounded-lg border bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer flex items-center gap-3">
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{action.title}</div>
                          <div className="text-xs text-muted-foreground">{action.desc}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══ TRIAL WARNING ═══ */}
      {data.isTrial && data.trialDaysLeft !== null && data.trialDaysLeft <= 10 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-950/10 border-amber-200 dark:border-amber-900">
            <CardContent className="pt-5 flex items-start gap-3">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              </motion.div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-amber-800 dark:text-amber-400">Trial ending in {data.trialDaysLeft} days</div>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">Upgrade to {data.planName} plan to keep your institution running. PKR {data.planPrice.toLocaleString()}/month.</p>
                <Button size="sm" className="mt-3" asChild><Link href="/school/settings">Upgrade Now <ArrowRight className="h-3 w-3 ml-1" /></Link></Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
