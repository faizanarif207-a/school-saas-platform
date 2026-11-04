"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedKpiCard } from "@/components/animated-kpi-card";
import { AnimatedProgressBar } from "@/components/animated-progress-bar";
import { ActivityItem } from "@/components/activity-item";
import { formatPKR } from "@/lib/format";
import {
  Users,
  CalendarCheck,
  Wallet,
  Receipt,
  GraduationCap,
  TrendingUp,
  Plus,
  ArrowRight,
  Bell,
  Settings,
  FileText,
  UserPlus,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

export type OwnerDashboardData = {
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
  classes: {
    id: string;
    name: string;
    sectionCount: number;
    studentCount: number;
  }[];
  monthlyCollection: {
    month: string;
    amount: number;
  }[];
  recentActivity: {
    id: string;
    action: string;
    entity: string;
    createdAt: string;
    userName: string | null;
  }[];
};

export function OwnerDashboard({ data }: { data: OwnerDashboardData }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 lg:p-8 space-y-6"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#0064C8] to-[#0A56A8] text-white">
          {/* Decorative bars */}
          <div className="absolute top-0 right-0 opacity-10 flex flex-col gap-1.5 p-6">
            <div className="w-20 h-3 bg-[#F5A800] rounded-sm" />
            <div className="w-16 h-3 bg-[#0E9E56] rounded-sm" />
            <div className="w-20 h-3 bg-[#0064C8] rounded-sm" />
          </div>
          <CardContent className="pt-6 pb-6 relative">
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                Live Dashboard
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {data.schoolName}
            </h1>
            <p className="mt-1 text-sm opacity-80">{data.city}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30">
                <GraduationCap className="h-3 w-3 mr-1" />
                {data.planName} Plan
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                PKR {data.planPrice.toLocaleString()}/mo
              </Badge>
              {data.isTrial && data.trialDaysLeft !== null && (
                <Badge className="bg-[#F5A800] text-white border-0">
                  <Clock className="h-3 w-3 mr-1" />
                  {data.trialDaysLeft} days trial left
                </Badge>
              )}
              {data.totalBranches > 0 && (
                <Badge className="bg-white/20 text-white border-white/30">
                  <Building2 className="h-3 w-3 mr-1" />
                  {data.totalBranches} Branches
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Action Buttons */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap gap-2"
      >
        <Button asChild size="sm">
          <Link href="/school/students/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Student
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/school/attendance">
            <CalendarCheck className="h-4 w-4 mr-1.5" />
            Mark Attendance
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/school/notices">
            <Bell className="h-4 w-4 mr-1.5" />
            Post Notice
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/school/settings">
            <Settings className="h-4 w-4 mr-1.5" />
            Settings
          </Link>
        </Button>
      </motion.div>

      {/* Animated KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedKpiCard
          label="Total Students"
          value={data.totalStudents}
          sub={`${data.totalClasses} classes · ${data.totalSections} sections`}
          icon={Users}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
          delay={0}
        />
        <AnimatedKpiCard
          label="Present Today"
          value={data.presentToday}
          sub={`${data.totalStudents > 0 ? Math.round((data.presentToday / data.totalStudents) * 100) : 0}% attendance rate`}
          icon={CalendarCheck}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          accentColor="bg-emerald-500"
          delay={0.1}
        />
        <AnimatedKpiCard
          label="Pending Fees"
          value={data.pendingFees}
          format={formatPKR}
          sub={`${data.feePlans} fee plans configured`}
          icon={Receipt}
          iconBg="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
          accentColor="bg-amber-500"
          delay={0.2}
        />
        <AnimatedKpiCard
          label="Collected (Month)"
          value={data.feeCollected}
          format={formatPKR}
          sub={`${data.totalStaff} staff members`}
          icon={Wallet}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          accentColor="bg-emerald-500"
          delay={0.3}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Strength — left 2 cols */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Class Strength
              </CardTitle>
              <CardDescription>Students per class with live bars</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.classes.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground italic">
                  No classes configured.{" "}
                  <Link href="/school/setup" className="text-primary underline">
                    Set up
                  </Link>{" "}
                  your school first.
                </div>
              ) : (
                data.classes.map((cls, i) => {
                  const max = Math.max(...data.classes.map((c) => c.studentCount), 1);
                  const pct = (cls.studentCount / max) * 100;
                  return (
                    <AnimatedProgressBar
                      key={cls.id}
                      label={`${cls.name} (${cls.sectionCount} sections)`}
                      value={pct}
                      valueSuffix={` — ${cls.studentCount}`}
                      delay={i * 0.1}
                      color={cls.studentCount > 0 ? "bg-primary" : "bg-muted-foreground/30"}
                    />
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity — right 1 col */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3">
              {data.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-1">
                  {data.recentActivity.slice(0, 8).map((act, i) => {
                    const iconMap: Record<string, { icon: typeof Users; bg: string }> = {
                      "school.create": { icon: Building2, bg: "bg-blue-50 text-blue-600" },
                      "student.create": { icon: UserPlus, bg: "bg-emerald-50 text-emerald-600" },
                      "student.update": { icon: Users, bg: "bg-amber-50 text-amber-600" },
                      "attendance.marked": { icon: CalendarCheck, bg: "bg-emerald-50 text-emerald-600" },
                      "payment.record": { icon: Wallet, bg: "bg-emerald-50 text-emerald-600" },
                      "notice.create": { icon: Bell, bg: "bg-amber-50 text-amber-600" },
                      "settings.update": { icon: Settings, bg: "bg-blue-50 text-blue-600" },
                      "invoices.generate": { icon: FileText, bg: "bg-amber-50 text-amber-600" },
                      "default": { icon: AlertCircle, bg: "bg-zinc-100 text-zinc-600" },
                    };
                    const config = iconMap[act.action] || iconMap.default;
                    return (
                      <ActivityItem
                        key={act.id}
                        icon={config.icon}
                        iconBg={config.bg}
                        title={act.action.replace(/[._]/g, " ")}
                        subtitle={act.userName || "System"}
                        time={new Date(act.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        index={i}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Collection Chart */}
      {data.monthlyCollection.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Fee Collection
              </CardTitle>
              <CardDescription>Last 6 months trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-3 h-40">
                {data.monthlyCollection.map((m, i) => {
                  const max = Math.max(...data.monthlyCollection.map((x) => x.amount), 1);
                  const heightPct = (m.amount / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs font-mono font-semibold text-muted-foreground">
                        {formatPKR(m.amount)}
                      </div>
                      <motion.div
                        className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/60 relative overflow-hidden"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${heightPct}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.1,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        style={{ minHeight: "4px" }}
                      >
                        {/* Shimmer */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{
                            duration: 2,
                            delay: i * 0.1 + 0.5,
                            repeat: Infinity,
                            repeatDelay: 4,
                            ease: "easeInOut",
                          }}
                        />
                      </motion.div>
                      <div className="text-xs text-muted-foreground">
                        {m.month}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Action Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Settings, title: "School Setup", desc: "Classes, sections, subjects", href: "/school/setup" },
          { icon: Users, title: "Students", desc: "Add, edit, view all students", href: "/school/students" },
          { icon: CalendarCheck, title: "Attendance", desc: "Mark daily attendance", href: "/school/attendance" },
          { icon: Wallet, title: "Fees", desc: "Plans, invoices, payments", href: "/school/fees" },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Link href={action.href} className="block">
                <Card className="hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="pt-5">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-3 rounded-xl bg-primary/10 w-fit mb-3"
                    >
                      <Icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                    <div className="mt-3 flex items-center text-xs text-primary font-semibold">
                      Open
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Plan Usage + Trial Notice */}
      {data.isTrial && data.trialDaysLeft !== null && data.trialDaysLeft <= 10 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-950/10 border-amber-200 dark:border-amber-900">
            <CardContent className="pt-5 flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              </motion.div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-amber-800 dark:text-amber-400">
                  Trial ending in {data.trialDaysLeft} days
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                  Upgrade to {data.planName} plan to keep your school running.
                  PKR {data.planPrice.toLocaleString()}/month.
                </p>
                <Button size="sm" className="mt-3" asChild>
                  <Link href="/school/settings">
                    Upgrade Now
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
