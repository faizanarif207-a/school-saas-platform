// src/app/school/principal/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock, Users, CalendarCheck, PenSquare } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatDate } from "@/lib/format";

type Approval = {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: string;
  user: { name: string | null; email: string };
};

type Teacher = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  attendanceMarked: number;
  marksEntered: number;
  leavesTaken: number;
};

export default function PrincipalPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, tRes] = await Promise.all([
        fetch("/api/principal/approvals"),
        fetch("/api/principal/teachers"),
      ]);
      const aData = await aRes.json();
      const tData = await tRes.json();
      setApprovals(aData.approvals || []);
      setTeachers(tData.teachers || []);
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
      const res = await fetch(`/api/principal/approvals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment: "" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Leave ${action === "approve" ? "approved" : "rejected"}`);
      await load();
    } catch {
      toast.error("Failed");
    } finally {
      setProcessing(null);
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Principal Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Approve leaves, monitor teacher performance, and review academic progress.</p>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Pending Approvals ({approvals.length})
          </CardTitle>
          <CardDescription>Teacher leave requests awaiting your decision</CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-8"><CheckCircle2 className="h-10 w-10 text-emerald-500/40 mx-auto mb-3" /><div className="text-sm font-medium">No pending approvals</div></div>
          ) : (
            <div className="space-y-3">
              {approvals.map((a) => (
                <div key={a.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{a.user.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">{a.type}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">{formatDate(a.startDate)} → {formatDate(a.endDate)}</div>
                      <p className="text-sm text-foreground">{a.reason}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="text-emerald-600 hover:bg-emerald-50" disabled={processing === a.id} onClick={() => handleApproval(a.id, "approve")}>
                        {processing === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" disabled={processing === a.id} onClick={() => handleApproval(a.id, "reject")}>
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teacher Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Teacher Performance</CardTitle>
          <CardDescription>Attendance marking + marks entry discipline</CardDescription>
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
                  {teachers.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-6 py-3.5"><div className="font-semibold">{t.name}</div><div className="text-xs text-muted-foreground">{t.email}</div></td>
                      <td className="px-6 py-3.5 text-right font-mono"><span className="inline-flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5 text-emerald-500" />{t.attendanceMarked}</span></td>
                      <td className="px-6 py-3.5 text-right font-mono"><span className="inline-flex items-center gap-1"><PenSquare className="h-3.5 w-3.5 text-blue-500" />{t.marksEntered}</span></td>
                      <td className="px-6 py-3.5 text-right font-mono">{t.leavesTaken}</td>
                      <td className="px-6 py-3.5"><Badge variant="outline" className={t.isActive ? "text-xs bg-emerald-50 text-emerald-700 border-emerald-200" : "text-xs bg-zinc-100 text-zinc-500"}>{t.isActive ? "Active" : "Inactive"}</Badge></td>
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
