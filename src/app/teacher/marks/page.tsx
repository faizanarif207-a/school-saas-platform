// src/app/teacher/marks/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, PenSquare, Save } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type ClassType = {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
};

type SubjectType = { id: string; name: string; code: string | null };
type ExamType = { id: string; name: string; term: string };
type StudentType = {
  id: string;
  admissionId: string | null;
  name: string;
  enrollmentId: string;
  rollNo: number | null;
};

export default function TeacherMarksPage() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [exams, setExams] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);

  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [students, setStudents] = useState<StudentType[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({}); // studentId -> marks
  const [totalMarks, setTotalMarks] = useState("100");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/school/classes").then((r) => r.json()),
      fetch("/api/school/subjects").then((r) => r.json()),
      fetch("/api/teacher/exams").then((r) => r.json()),
    ])
      .then(([cls, sub, exm]) => {
        setClasses(cls.classes || []);
        setSubjects(sub.subjects || []);
        setExams(exm.exams || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter sections by class
  const availableSections =
    classes.find((c) => c.id === classId)?.sections || [];

  // Load students when section selected
  async function loadStudents() {
    if (!sectionId) return;
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/school/students?sectionId=${sectionId}`);
      const data = await res.json();
      const stu = (data.students || []).map((s: { id: string; admissionId: string | null; name: string; enrollments: { id: string; rollNo: number | null }[] }) => ({
        id: s.id,
        admissionId: s.admissionId,
        name: s.name,
        enrollmentId: s.enrollments[0]?.id || "",
        rollNo: s.enrollments[0]?.rollNo || null,
      }));
      setStudents(stu);
      // Initialize marks as empty strings
      const initMarks: Record<string, string> = {};
      stu.forEach((s: StudentType) => {
        initMarks[s.id] = "";
      });
      setMarks(initMarks);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  }

  useEffect(() => {
    if (sectionId) loadStudents();
  }, [sectionId]);

  async function handleSave() {
    if (!examId || !classId || !sectionId || !subjectId || !totalMarks) {
      toast.error("Select all fields first");
      return;
    }
    setSaving(true);
    try {
      const marksToSave = students
        .filter((s) => marks[s.id] !== "")
        .map((s) => ({
          studentId: s.id,
          marks: parseInt(marks[s.id], 10),
          totalMarks: parseInt(totalMarks, 10),
        }));

      if (marksToSave.length === 0) {
        toast.error("Enter at least one mark");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/teacher/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          classId,
          sectionId,
          subjectId,
          totalMarks: parseInt(totalMarks, 10),
          marks: marksToSave,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Marks saved: ${data.saved} students`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enter Marks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Submit marks for current exam. Principal will approve before publishing to parents.
        </p>
      </div>

      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenSquare className="h-5 w-5 text-primary" />
            Select Exam, Class &amp; Subject
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam">Exam</Label>
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} ({e.term})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={classId} onValueChange={(v) => { setClassId(v); setSectionId(""); }}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select
                value={sectionId}
                onValueChange={setSectionId}
                disabled={!classId}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {availableSections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students grid */}
      {sectionId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Students ({students.length})
              </CardTitle>
              <Button onClick={handleSave} disabled={saving || !examId || !subjectId}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save Marks
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {loadingStudents ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No students in this section.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="text-left font-semibold px-6 py-3">Roll #</th>
                      <th className="text-left font-semibold px-6 py-3">Student</th>
                      <th className="text-left font-semibold px-6 py-3" style={{ width: "150px" }}>
                        Marks (/{totalMarks})
                      </th>
                      <th className="text-left font-semibold px-6 py-3" style={{ width: "100px" }}>
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => {
                      const mark = marks[s.id];
                      const markNum = parseInt(mark, 10);
                      const total = parseInt(totalMarks, 10);
                      const pct = total > 0 && markNum >= 0 ? (markNum / total) * 100 : 0;
                      const grade =
                        pct >= 90 ? "A+" :
                        pct >= 80 ? "A" :
                        pct >= 70 ? "B" :
                        pct >= 60 ? "C" :
                        pct >= 50 ? "D" :
                        pct > 0 ? "F" : "";
                      return (
                        <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-6 py-3 font-mono text-xs">{s.rollNo || "—"}</td>
                          <td className="px-6 py-3">
                            <div className="font-semibold">{s.name}</div>
                            {s.admissionId && (
                              <div className="text-xs text-muted-foreground font-mono">{s.admissionId}</div>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <Input
                              type="number"
                              min={0}
                              max={total}
                              placeholder="0"
                              value={mark}
                              onChange={(e) =>
                                setMarks({ ...marks, [s.id]: e.target.value })
                              }
                              className="h-9 w-24"
                            />
                          </td>
                          <td className="px-6 py-3 font-semibold">{grade}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
