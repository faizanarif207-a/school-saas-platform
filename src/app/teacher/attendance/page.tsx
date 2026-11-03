// src/app/teacher/attendance/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CalendarCheck,
  Save,
  Check,
  X,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { format } from "date-fns";

type ClassType = {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
};

type StudentAtt = {
  enrollmentId: string;
  studentId: string;
  rollNo: number | null;
  name: string;
  fatherName: string | null;
  status: string | null;
};

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [students, setStudents] = useState<StudentAtt[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/school/classes")
      .then((r) => r.json())
      .then((data) => setClasses(data.classes || []))
      .finally(() => setLoading(false));
  }, []);

  const loadStudents = useCallback(async () => {
    if (!sectionId || !date) return;
    setLoadingStudents(true);
    setStudents([]);
    try {
      const res = await fetch(
        `/api/school/attendance?sectionId=${sectionId}&date=${date}`
      );
      const data = await res.json();
      setStudents(data.students || []);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  }, [sectionId, date]);

  useEffect(() => {
    if (sectionId && date) loadStudents();
  }, [sectionId, date, loadStudents]);

  function setStatus(enrollmentId: string, status: string) {
    setStudents((prev) =>
      prev.map((s) =>
        s.enrollmentId === enrollmentId
          ? { ...s, status: s.status === status ? null : status }
          : s
      )
    );
  }

  function markAll(status: string) {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  }

  async function handleSave() {
    if (!sectionId || !date) return;
    setSaving(true);
    try {
      const attendance = students
        .filter((s) => s.status)
        .map((s) => ({ enrollmentId: s.enrollmentId, status: s.status }));

      const res = await fetch("/api/school/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, date, attendance }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Attendance saved: ${data.marked} students marked`);
      await loadStudents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const marked = students.filter((s) => s.status).length;
  const present = students.filter((s) => s.status === "present").length;
  const absent = students.filter((s) => s.status === "absent").length;
  const late = students.filter((s) => s.status === "late").length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mark Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select class section + date, then mark each student.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Select Class &amp; Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={sectionId} onValueChange={setSectionId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={loading ? "Loading..." : "Select section"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) =>
                    c.sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {c.name}-{s.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSave}
                disabled={saving || students.length === 0 || marked === 0}
                className="w-full h-11"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1.5" />
                    Save ({marked}/{students.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="text-xs uppercase font-bold text-muted-foreground">Total</div>
              <div className="text-xl font-bold mt-1">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="text-xs uppercase font-bold text-muted-foreground">Present</div>
              <div className="text-xl font-bold mt-1 text-emerald-600">{present}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="text-xs uppercase font-bold text-muted-foreground">Absent</div>
              <div className="text-xl font-bold mt-1 text-red-600">{absent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="text-xs uppercase font-bold text-muted-foreground">Late</div>
              <div className="text-xl font-bold mt-1 text-amber-600">{late}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick actions */}
      {students.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => markAll("present")} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
            <Check className="h-3.5 w-3.5 mr-1" />
            Mark All Present
          </Button>
          <Button size="sm" variant="outline" onClick={() => markAll("absent")} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <X className="h-3.5 w-3.5 mr-1" />
            Mark All Absent
          </Button>
          <Button size="sm" variant="outline" onClick={() => setStudents((prev) => prev.map((s) => ({ ...s, status: null })))}>
            Clear All
          </Button>
        </div>
      )}

      {/* Students list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Students</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {!sectionId ? (
            <div className="text-center py-16 px-6">
              <CalendarCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <div className="text-sm font-medium">Select a section to begin</div>
              <p className="text-xs text-muted-foreground mt-1">
                Choose class section + date above to load students.
              </p>
            </div>
          ) : loadingStudents ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="text-sm font-medium">No students in this section</div>
              <p className="text-xs text-muted-foreground mt-1">
                This section has no enrolled students for current academic year.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {students.map((s) => (
                <div key={s.enrollmentId} className="flex items-center justify-between p-4 hover:bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-mono text-sm font-bold text-muted-foreground">
                      {s.rollNo || "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{s.name}</div>
                      {s.fatherName && (
                        <div className="text-xs text-muted-foreground">S/O {s.fatherName}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={s.status === "present" ? "default" : "outline"}
                      onClick={() => setStatus(s.enrollmentId, "present")}
                      className={s.status === "present" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-emerald-600 hover:text-emerald-700"}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant={s.status === "absent" ? "default" : "outline"}
                      onClick={() => setStatus(s.enrollmentId, "absent")}
                      className={s.status === "absent" ? "bg-red-600 hover:bg-red-700 text-white" : "text-red-600 hover:text-red-700"}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant={s.status === "late" ? "default" : "outline"}
                      onClick={() => setStatus(s.enrollmentId, "late")}
                      className={s.status === "late" ? "bg-amber-600 hover:bg-amber-700 text-white" : "text-amber-600 hover:text-amber-700"}
                    >
                      <Clock className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
