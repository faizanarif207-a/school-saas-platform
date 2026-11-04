// src/app/school/admission/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, TrendingUp, Phone, ArrowRight, Filter } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatDate } from "@/lib/format";

type Inquiry = {
  id: string;
  parentName: string;
  parentPhone: string;
  studentName: string | null;
  desiredClass: string | null;
  source: string;
  stage: string;
  notes: string | null;
  followUpDate: string | null;
  followUpAction: string | null;
  branch: { name: string } | null;
};

type FunnelData = {
  funnel: { stages: string[]; counts: Record<string, number>; total: number };
  sources: { source: string; count: number }[];
};

const stageColors: Record<string, string> = {
  inquired: "bg-blue-50 text-blue-700 border-blue-200",
  visit: "bg-cyan-50 text-cyan-700 border-cyan-200",
  form: "bg-amber-50 text-amber-700 border-amber-200",
  interview: "bg-purple-50 text-purple-700 border-purple-200",
  admitted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost: "bg-red-50 text-red-700 border-red-200",
};

const stageOrder = ["inquired", "visit", "form", "interview", "admitted"];

export default function AdmissionPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ parentName: "", parentPhone: "", studentName: "", desiredClass: "", source: "walk_in", notes: "" });
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes, fRes] = await Promise.all([
        fetch("/api/admission/inquiries"),
        fetch("/api/admission/funnel"),
      ]);
      const iData = await iRes.json();
      const fData = await fRes.json();
      setInquiries(iData.inquiries || []);
      setFunnel(fData);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!form.parentName.trim() || !form.parentPhone.trim()) { toast.error("Parent name and phone required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/admission/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Inquiry logged");
      setForm({ parentName: "", parentPhone: "", studentName: "", desiredClass: "", source: "walk_in", notes: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAdding(false);
    }
  }

  async function handleStageChange(id: string, newStage: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admission/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Stage updated to ${newStage}`);
      await load();
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdating(null);
    }
  }

  const filtered = filter === "all" ? inquiries : inquiries.filter((i) => i.stage === filter);
  const todayFollowups = inquiries.filter((i) => {
    if (!i.followUpDate) return false;
    const d = new Date(i.followUpDate);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admission CRM</h1>
        <p className="text-sm text-muted-foreground mt-1">Track inquiries from first contact to admission.</p>
      </div>

      {/* Funnel KPIs */}
      {funnel && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {funnel.funnel.stages.map((stage) => (
            <Card key={stage}><CardContent className="pt-3 pb-3 text-center">
              <div className="text-xs uppercase font-bold text-muted-foreground capitalize">{stage}</div>
              <div className="text-xl font-bold mt-1">{funnel.funnel.counts[stage] || 0}</div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {/* Funnel visualization */}
      {funnel && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Conversion Funnel</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stageOrder.map((stage, i) => {
              const count = funnel.funnel.counts[stage] || 0;
              const max = funnel.funnel.counts["inquired"] || 1;
              const pct = (count / max) * 100;
              return (
                <div key={stage}>
                  <div className="flex justify-between text-sm mb-1"><span className="capitalize font-medium">{stage}</span><span className="text-muted-foreground">{count} ({Math.round(pct)}%)</span></div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Today's follow-ups */}
      {todayFollowups > 0 && (
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
          <CardContent className="pt-4 flex items-center gap-3">
            <Phone className="h-5 w-5 text-amber-600" />
            <div className="font-semibold text-sm text-amber-800 dark:text-amber-400">{todayFollowups} follow-up(s) due today</div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New inquiry form */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />New Inquiry</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2"><Label htmlFor="pn" className="text-xs">Parent Name</Label><Input id="pn" placeholder="e.g., Asad Mahmood" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} className="h-10" /></div>
            <div className="space-y-2"><Label htmlFor="pp" className="text-xs">Parent Phone</Label><Input id="pp" placeholder="+92 301 1234567" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} className="h-10" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2"><Label htmlFor="sn" className="text-xs">Student Name</Label><Input id="sn" placeholder="Optional" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} className="h-10" /></div>
              <div className="space-y-2"><Label htmlFor="dc" className="text-xs">Class</Label><Input id="dc" placeholder="Class 5" value={form.desiredClass} onChange={(e) => setForm({ ...form, desiredClass: e.target.value })} className="h-10" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="src" className="text-xs">Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="walk_in">Walk-in</SelectItem><SelectItem value="facebook">Facebook</SelectItem><SelectItem value="referral">Referral</SelectItem><SelectItem value="website">Website</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label htmlFor="nt" className="text-xs">Notes</Label><Textarea id="nt" placeholder="Any notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <Button onClick={handleAdd} disabled={adding} className="w-full">{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log Inquiry"}</Button>
          </CardContent>
        </Card>

        {/* Inquiries list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle>Inquiries</CardTitle><CardDescription>{filtered.length} shown</CardDescription></div>
              <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="inquired">Inquired</SelectItem><SelectItem value="visit">Visit</SelectItem><SelectItem value="form">Form</SelectItem><SelectItem value="interview">Interview</SelectItem><SelectItem value="admitted">Admitted</SelectItem><SelectItem value="lost">Lost</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">No inquiries found.</div>
            ) : (
              <div className="divide-y">
                {filtered.map((inq) => (
                  <div key={inq.id} className="p-4 hover:bg-muted/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1"><span className="font-semibold">{inq.parentName}</span><Badge variant="outline" className={`text-xs ${stageColors[inq.stage] || ""}`}>{inq.stage}</Badge></div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2"><Phone className="h-3 w-3" />{inq.parentPhone}{inq.studentName && <span>· {inq.studentName}</span>}{inq.desiredClass && <span>· {inq.desiredClass}</span>}</div>
                        {inq.notes && <div className="text-xs text-muted-foreground mt-1 italic">{inq.notes}</div>}
                        {inq.followUpAction && inq.followUpDate && <div className="text-xs text-amber-600 mt-1 font-medium">Next: {inq.followUpAction} ({formatDate(inq.followUpDate)})</div>}
                      </div>
                      <div className="shrink-0">
                        <Select value={inq.stage} onValueChange={(v) => handleStageChange(inq.id, v)} disabled={updating === inq.id}>
                          <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inquired">Inquired</SelectItem><SelectItem value="visit">Visit</SelectItem><SelectItem value="form">Form</SelectItem><SelectItem value="interview">Interview</SelectItem><SelectItem value="admitted">Admitted</SelectItem><SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
