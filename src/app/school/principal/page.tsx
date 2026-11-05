// src/app/school/principal/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { TrendIndicator } from "@/components/trend-indicator";
import { AnimatedCounter } from "@/components/animated-counter";
import { Loader2, CheckCircle2, XCircle, Clock, Users, CalendarCheck, PenSquare, ShieldCheck, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatDate } from "@/lib/format";

type Approval = { id: string; startDate: string; endDate: string; type: string; reason: string; status: string; user: { name: string | null; email: string } };
type Teacher = { id: string; name: string | null; email: string; isActive: boolean; attendanceMarked: number; marksEntered: number; leavesTaken: number };

export default function PrincipalPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, avgAttendance: 0, pendingApprovals: 0 });
  const [attendanceTrend, setAttendanceTrend] = useState<{ label: string; value: number }[]>([]);
  const [teacherPerf, setTeacherPerf] = useState<{ label: string; value: number }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, tRes, sRes] = await Promise.all([
        fetch("/api/principal/approvals"),
        fetch("/api/principal/teachers"),
        fetch("/api/principal/stats"),
      ]);
      const aData = await aRes.json();
      const tData = await tRes.json();
      const sData = await sRes.json();
      setApprovals(aData.approvals || []);
      setTeachers(tData.teachers || []);
      setStats(sData.stats || { totalStudents: 0, presentToday: 0, avgAttendance: 0, pendingApprovals: 0 });
      setAttendanceTrend(sData.attendanceTrend || []);
      setTeacherPerf(sData.teacherPerf || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleApproval(id: string, action: "approve" | "reject") {
    setProcessing(id);
    try {
      const res = await fetch(`/api/principal/approvals/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, comment: "" }) });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Leave ${action === "approve" ? "approved" : "rejected"}`);
      await load();
    } catch { toast.error("Failed"); }
    finally { setProcessing(null); }
  }

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />

      {/* ═══ HERO ═══ */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300/10 rounded-full blur-3xl" />
          <CardContent className="pt-6 pb-6 relative">
            <div className="flex items-center gap-2 mb-2">
              <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Principal Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Academic Overview</h1>
            <p className="mt-1 text-sm opacity-80">Approve leaves, monitor teacher performance, and track attendance trends.</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ KPIs ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: stats.totalStudents, sub: "across all classes", icon: Users, iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400", trend: 8, delay: 0 },
          { label: "Present Today", value: stats.presentToday, sub: `${stats.avgAttendance}% attendance rate`, icon: CalendarCheck, iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", trend: 5, delay: 0.1 },
          { label: "Pending Approvals", value: stats.pendingApprovals, sub: "leave requests", icon: Clock, iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", trend: 0, delay: 0.2 },
          { label: "Active Teachers", value: teachers.length, sub: `${teachers.filter(t => t.isActive).length} currently active`, icon: GraduationCap, iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400", trend: 3, delay: 0.3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, delay: stat.delay }} whileHover={{ y: -4 }}>
              <Card className="relative overflow-hidden group cursor-default">
                <motion.div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: stat.delay + 0.2 }} style={{ transformOrigin: "left" }} />
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">{stat.label}</div>
                      <div className="text-2xl font-bold mt-1.5 tracking-tight"><AnimatedCounter value={stat.value} /></div>
                      <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
                      {stat.trend !== 0 && <div className="mt-2"><TrendIndicator value={stat.trend} /></div>}
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

      {/* ═══ CHARTS ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />Attendance Trend (7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-purple-600 dark:text-purple-400">
                <LineChart data={attendanceTrend} height={220} color="#7C3AED" gradientId="principal-att-grad" formatValue={(n) => `${n}%`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Teacher Performance */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PenSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />Teacher Performance</CardTitle>
              <CardDescription>Attendance marking + marks entry counts</CardDescription>
            </CardHeader>
            <CardContent>
              {teacherPerf.length > 0 ? (
                <div className="h-[220px]">
                  <BarChart data={teacherPerf} height={220} formatValue={(n) => n.toString()} />
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">No teacher data available yet.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══ PENDING APPROVALS ═══ */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div className="w-2 h-2 rounded-full bg-amber-500" animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              Pending Leave Approvals ({approvals.length})
            </CardTitle>
            <CardDescription>Teacher leave requests awaiting your decision</CardDescription>
          </CardHeader>
          <CardContent>
            {approvals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-10 w-10 text-emerald-500/40 mx-auto mb-3" />
                <div className="text-sm font-medium">No pending approvals</div>
                <p className="text-xs text-muted-foreground mt-1">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvals.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="p-4 rounded-lg border bg-card hover:border-purple-500/30 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{a.user.name}</span>
                          <Badge variant="outline" className="text-xs capitalize bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900">{a.type}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">{formatDate(a.startDate)} → {formatDate(a.endDate)}</div>
                        <p className="text-sm text-foreground">{a.reason}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" className="text-emerald-600 hover:bg-emerald-50 border-emerald-200" disabled={processing === a.id} onClick={() => handleApproval(a.id, "approve")}>
                          {processing === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Approve</>}
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200" disabled={processing === a.id} onClick={() => handleApproval(a.id, "reject")}>
                          <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ TEACHER TABLE ═══ */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />Teacher Performance Detail</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {teachers.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">No teachers assigned yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="text-left font-semibold px-6 py-3">Teacher</th>
                      <th className="text-right font-semibold px-6 py-3">Attendance Marked</th>
                      <th className="text-right font-semibold px-6 py-3">Marks Entered</th>
                      <th className="text-right font-semibold px-6 py-3">Leaves Taken</th>
                      <th className="text-left font-semibold px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t, i) => (
                      <motion.tr key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-6 py-3.5"><div className="font-semibold">{t.name}</div><div className="text-xs text-muted-foreground">{t.email}</div></td>
                        <td className="px-6 py-3.5 text-right font-mono"><span className="inline-flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5 text-emerald-500" />{t.attendanceMarked}</span></td>
                        <td className="px-6 py-3.5 text-right font-mono"><span className="inline-flex items-center gap-1"><PenSquare className="h-3.5 w-3.5 text-blue-500" />{t.marksEntered}</span></td>
                        <td className="px-6 py-3.5 text-right font-mono">{t.leavesTaken}</td>
                        <td className="px-6 py-3.5"><Badge variant="outline" className={t.isActive ? "text-xs bg-emerald-50 text-emerald-700 border-emerald-200" : "text-xs bg-zinc-100 text-zinc-500"}>{t.isActive ? "Active" : "Inactive"}</Badge></td>
                      </motion.tr>
                    ))}
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
