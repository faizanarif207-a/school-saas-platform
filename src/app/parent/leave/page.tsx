// src/app/parent/leave/page.tsx
"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarClock, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatDate } from "@/lib/format";

type Leave = { id: string; startDate: string; endDate: string; reason: string; status: string; approverComment: string | null; createdAt: string };

export default function ParentLeavePage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ studentId: "", startDate: "", endDate: "", reason: "" });
  const [children, setChildren] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, cRes] = await Promise.all([fetch("/api/parent/leave"), fetch("/api/parent/children")]);
      const lData = await lRes.json();
      const cData = await cRes.json();
      setLeaves(lData.leaves || []);
      const kids = (cData.children || []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }));
      setChildren(kids);
      if (kids.length > 0 && !form.studentId) setForm(f => ({ ...f, studentId: kids[0].id }));
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.studentId || !form.startDate || !form.endDate || !form.reason.trim()) {
      toast.error("All fields required"); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/parent/leave", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Leave request submitted");
      setForm({ studentId: form.studentId, startDate: "", endDate: "", reason: "" });
      await load();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setSubmitting(false); }
  }

  const statusConfig = {
    pending: { label: "Pending", icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-200" },
    approved: { label: "Approved", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rejected: { label: "Rejected", icon: XCircle, color: "bg-red-50 text-red-700 border-red-200" },
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div><h1 className="text-2xl font-bold tracking-tight">Apply Leave</h1><p className="text-sm text-muted-foreground mt-1">Submit leave requests for your child.</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-pink-600" />New Leave Request</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="child">Select Child</Label>
                <select id="child" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm">
                  {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="sd">Start Date</Label><Input id="sd" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required className="h-11" /></div>
                <div className="space-y-2"><Label htmlFor="ed">End Date</Label><Input id="ed" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required className="h-11" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="reason">Reason</Label><Textarea id="reason" placeholder="Why does your child need leave?" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required rows={4} /></div>
              <Button type="submit" disabled={submitting} className="w-full h-11">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><Send className="h-4 w-4 mr-2" />Submit Request</>}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>My Leave History</CardTitle><CardDescription>{loading ? "..." : `${leaves.length} requests`}</CardDescription></CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : leaves.length === 0 ? (
              <div className="text-center py-12"><CalendarClock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" /><div className="text-sm font-medium">No leave requests yet</div></div>
            ) : (
              <div className="space-y-3">
                {leaves.map(l => {
                  const sc = statusConfig[l.status as keyof typeof statusConfig] || statusConfig.pending;
                  const Icon = sc.icon;
                  return (
                    <div key={l.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-muted-foreground">{formatDate(l.startDate)} → {formatDate(l.endDate)}</div>
                        <Badge variant="outline" className={`text-xs ${sc.color}`}><Icon className="h-3 w-3 mr-1" />{sc.label}</Badge>
                      </div>
                      <p className="text-sm">{l.reason}</p>
                      {l.approverComment && <div className="text-xs text-muted-foreground italic mt-2 pt-2 border-t">School: "{l.approverComment}"</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
