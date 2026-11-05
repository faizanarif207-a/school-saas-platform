// src/app/teacher/homework/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, BookOpen, Clock } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatDate } from "@/lib/format";

type Homework = {
  id: string; title: string; description: string; dueDate: string;
  class: { name: string }; section: { name: string } | null; subject: { name: string } | null;
};
type ClassType = { id: string; name: string; sections: { id: string; name: string }[] };
type SubjectType = { id: string; name: string };

export default function TeacherHomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", classId: "", sectionId: "", subjectId: "", dueDate: "" });
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [hwRes, clsRes, subRes] = await Promise.all([
        fetch("/api/teacher/homework"),
        fetch("/api/school/classes"),
        fetch("/api/school/subjects"),
      ]);
      const hwData = await hwRes.json();
      const clsData = await clsRes.json();
      const subData = await subRes.json();
      setHomework(hwData.homework || []);
      setClasses(clsData.classes || []);
      setSubjects(subData.subjects || []);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!form.title.trim() || !form.description.trim() || !form.classId || !form.dueDate) {
      toast.error("Title, description, class, and due date required"); return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/teacher/homework", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Homework assigned");
      setForm({ title: "", description: "", classId: "", sectionId: "", subjectId: "", dueDate: "" });
      await load();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setAdding(false); }
  }

  const availableSections = classes.find(c => c.id === form.classId)?.sections || [];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div><h1 className="text-2xl font-bold tracking-tight">Homework</h1><p className="text-sm text-muted-foreground mt-1">Assign homework to your classes.</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-cyan-600" />Assign Homework</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2"><Label htmlFor="ht" className="text-xs">Title</Label><Input id="ht" placeholder="e.g., Chapter 5 Exercises" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="h-10" /></div>
            <div className="space-y-2"><Label htmlFor="hd" className="text-xs">Description</Label><Textarea id="hd" placeholder="Detailed instructions..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2"><Label htmlFor="hc" className="text-xs">Class</Label>
                <Select value={form.classId} onValueChange={v => setForm({ ...form, classId: v, sectionId: "" })}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="hs" className="text-xs">Section (optional)</Label>
                <Select value={form.sectionId || "all"} onValueChange={v => setForm({ ...form, sectionId: v === "all" ? "" : v })}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="All sections" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Sections</SelectItem>{availableSections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2"><Label htmlFor="hsub" className="text-xs">Subject (optional)</Label>
                <Select value={form.subjectId || "none"} onValueChange={v => setForm({ ...form, subjectId: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">No Subject</SelectItem>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="hdd" className="text-xs">Due Date</Label><Input id="hdd" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="h-10" /></div>
            </div>
            <Button onClick={handleAdd} disabled={adding} className="w-full">{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign Homework"}</Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-cyan-600" />Assigned Homework ({homework.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : homework.length === 0 ? (
              <div className="text-center py-12"><BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" /><div className="text-sm font-medium">No homework assigned yet</div></div>
            ) : (
              <div className="space-y-3">
                {homework.map(hw => (
                  <div key={hw.id} className="p-4 rounded-lg border bg-card hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{hw.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{hw.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{hw.class.name}{hw.section ? `-${hw.section.name}` : " (All)"}</Badge>
                          {hw.subject && <Badge variant="outline" className="text-xs bg-cyan-50 text-cyan-700 border-cyan-200">{hw.subject.name}</Badge>}
                          <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />Due: {formatDate(hw.dueDate)}</Badge>
                        </div>
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
