// src/app/student/homework/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatDate } from "@/lib/format";

type Homework = {
  id: string; title: string; description: string; dueDate: string;
  class: { name: string }; subject: { name: string } | null;
};

export default function StudentHomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/homework");
      const data = await res.json();
      setHomework(data.homework || []);
    } catch { toast.error("Failed to load homework"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const pending = homework.filter(h => new Date(h.dueDate) >= now);
  const overdue = homework.filter(h => new Date(h.dueDate) < now);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div><h1 className="text-2xl font-bold tracking-tight">My Homework</h1><p className="text-sm text-muted-foreground mt-1">Assignments and their due dates.</p></div>
      <div className="grid grid-cols-2 gap-3">
        <Card><CardContent className="pt-4 pb-4 text-center"><div className="text-xs uppercase font-bold text-muted-foreground">Pending</div><div className="text-xl font-bold mt-1 text-amber-600">{pending.length}</div></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 text-center"><div className="text-xs uppercase font-bold text-muted-foreground">Overdue</div><div className="text-xl font-bold mt-1 text-red-600">{overdue.length}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-emerald-600" />All Assignments</CardTitle><CardDescription>{homework.length} total</CardDescription></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : homework.length === 0 ? (
            <div className="text-center py-12"><CheckCircle2 className="h-10 w-10 text-emerald-500/40 mx-auto mb-3" /><div className="text-sm font-medium">No homework assigned</div><p className="text-xs text-muted-foreground mt-1">Enjoy your free time!</p></div>
          ) : (
            <div className="space-y-3">
              {homework.map(hw => {
                const isOverdue = new Date(hw.dueDate) < now;
                return (
                  <div key={hw.id} className={`p-4 rounded-lg border ${isOverdue ? "border-red-200 bg-red-50/30" : "border-border bg-card"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{hw.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{hw.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{hw.class.name}</Badge>
                          {hw.subject && <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">{hw.subject.name}</Badge>}
                          <Badge variant="outline" className={`text-xs ${isOverdue ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                            <Clock className="h-3 w-3 mr-1" />{isOverdue ? "Overdue: " : "Due: "}{formatDate(hw.dueDate)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
