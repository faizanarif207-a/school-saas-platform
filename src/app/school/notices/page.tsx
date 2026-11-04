// src/app/school/notices/page.tsx — Notice Board
"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Bell, Trash2, Send, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatDate } from "@/lib/format";

type ClassType = { id: string; name: string };
type Notice = { id: string; title: string; body: string; noticeType: string; classId: string | null; sendSms: boolean; createdAt: string; poster: { name: string | null }; };

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", body: "", noticeType: "school_wide", classId: "", sendSms: false });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nRes, cRes] = await Promise.all([fetch("/api/school/notices"), fetch("/api/school/classes")]);
      const nData = await nRes.json();
      const cData = await cRes.json();
      setNotices(nData.notices || []);
      setClasses((cData.classes || []).map((c: ClassType & { sections: unknown[] }) => ({ id: c.id, name: c.name })));
    } catch { toast.error("Failed to load notices"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!form.title.trim() || !form.body.trim()) { toast.error("Title and body are required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/school/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Notice posted successfully");
      setForm({ title: "", body: "", noticeType: "school_wide", classId: "", sendSms: false });
      await load();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this notice?")) return;
    try {
      const res = await fetch(`/api/school/notices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Notice deleted");
      await load();
    } catch { toast.error("Failed to delete"); }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div><h1 className="text-2xl font-bold tracking-tight">Notice Board</h1><p className="text-sm text-muted-foreground mt-1">Post school-wide or class-specific notices.</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />New Notice</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="t" className="text-xs">Title</Label><Input id="t" placeholder="e.g., PTM on Saturday" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="b" className="text-xs">Body</Label><Textarea id="b" placeholder="Notice details..." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={5} /></div>
            <div className="space-y-2"><Label htmlFor="nt" className="text-xs">Type</Label>
              <Select value={form.noticeType} onValueChange={(v) => setForm({ ...form, noticeType: v, classId: "" })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="school_wide">School-wide</SelectItem><SelectItem value="class_specific">Class-specific</SelectItem></SelectContent>
              </Select>
            </div>
            {form.noticeType === "class_specific" && (
              <div className="space-y-2"><Label htmlFor="c" className="text-xs">Class</Label>
                <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleCreate} disabled={saving || !form.title.trim() || !form.body.trim()} className="w-full">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1" />Post Notice</>}</Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5 text-primary" />Posted Notices</CardTitle><CardDescription>{loading ? "..." : `${notices.length} notices`}</CardDescription></CardHeader>
          <CardContent>
            {loading ? (<div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>) : notices.length === 0 ? (
              <div className="text-center py-12"><Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" /><div className="text-sm font-medium">No notices yet</div></div>
            ) : (
              <div className="space-y-3">
                {notices.map((n) => (
                  <div key={n.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-sm">{n.title}</h3><Badge variant="outline" className="text-xs">{n.noticeType === "school_wide" ? "School-wide" : "Class-specific"}</Badge>{n.sendSms && <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">SMS</Badge>}</div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.body}</p>
                        <div className="text-xs text-muted-foreground mt-2">By {n.poster.name || "Admin"} · {formatDate(n.createdAt)}</div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(n.id)} className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
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
