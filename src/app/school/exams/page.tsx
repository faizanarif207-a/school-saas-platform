// src/app/school/exams/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatDate } from "@/lib/format";

type Exam = { id: string; name: string; term: string; startDate: string; endDate: string; isActive: boolean };

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", term: "mid_term", startDate: "", endDate: "" });
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/school/exams");
      const data = await res.json();
      setExams(data.exams || []);
    } catch { toast.error("Failed to load exams"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!form.name.trim() || !form.startDate || !form.endDate) { toast.error("All fields required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/school/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Exam "${form.name}" created`);
      setForm({ name: "", term: "mid_term", startDate: "", endDate: "" });
      await load();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setAdding(false); }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exam Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Create and manage exams for the current academic year.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />New Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2"><Label htmlFor="en" className="text-xs">Exam Name</Label><Input id="en" placeholder="e.g., Mid-Term 2026" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" /></div>
            <div className="space-y-2"><Label htmlFor="et" className="text-xs">Term</Label>
              <Select value={form.term} onValueChange={(v) => setForm({ ...form, term: v })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="mid_term">Mid-Term</SelectItem><SelectItem value="final">Final</SelectItem><SelectItem value="monthly">Monthly Test</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2"><Label htmlFor="sd" className="text-xs">Start Date</Label><Input id="sd" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="h-10" /></div>
              <div className="space-y-2"><Label htmlFor="ed" className="text-xs">End Date</Label><Input id="ed" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="h-10" /></div>
            </div>
            <Button onClick={handleAdd} disabled={adding} className="w-full">{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Exam"}</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />All Exams</CardTitle>
            <CardDescription>{loading ? "..." : `${exams.length} exams`}</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (<div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>) : exams.length === 0 ? (
              <div className="text-center py-12"><FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" /><div className="text-sm font-medium">No exams created yet</div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-semibold px-6 py-3">Name</th><th className="text-left font-semibold px-6 py-3">Term</th><th className="text-left font-semibold px-6 py-3">Start</th><th className="text-left font-semibold px-6 py-3">End</th><th className="text-left font-semibold px-6 py-3">Status</th>
                  </tr></thead>
                  <tbody>
                    {exams.map((e, i) => (
                      <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-6 py-3.5 font-semibold">{e.name}</td>
                        <td className="px-6 py-3.5"><Badge variant="outline" className="text-xs capitalize">{e.term.replace("_", " ")}</Badge></td>
                        <td className="px-6 py-3.5 text-xs"><Calendar className="h-3 w-3 inline mr-1" />{formatDate(e.startDate)}</td>
                        <td className="px-6 py-3.5 text-xs">{formatDate(e.endDate)}</td>
                        <td className="px-6 py-3.5"><Badge variant="outline" className={e.isActive ? "text-xs bg-emerald-50 text-emerald-700 border-emerald-200" : "text-xs bg-zinc-100 text-zinc-500"}>{e.isActive ? "Active" : "Inactive"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
