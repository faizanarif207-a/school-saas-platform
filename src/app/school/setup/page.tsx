// src/app/school/setup/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, GraduationCap, Book } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type ClassType = {
  id: string;
  name: string;
  sections: {
    id: string;
    name: string;
    capacity: number;
    _count: { enrollments: number };
  }[];
};

type SubjectType = {
  id: string;
  name: string;
  code: string | null;
};

export default function SetupPage() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClass, setNewClass] = useState("");
  const [newSection, setNewSection] = useState<{ [classId: string]: string }>({});
  const [newSubject, setNewSubject] = useState({ name: "", code: "" });
  const [addingClass, setAddingClass] = useState(false);
  const [addingSection, setAddingSection] = useState<string | null>(null);
  const [addingSubject, setAddingSubject] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [clsRes, subRes] = await Promise.all([
        fetch("/api/school/classes"),
        fetch("/api/school/subjects"),
      ]);
      const clsData = await clsRes.json();
      const subData = await subRes.json();
      setClasses(clsData.classes || []);
      setSubjects(subData.subjects || []);
    } catch {
      toast.error("Failed to load setup data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddClass() {
    if (!newClass.trim()) return;
    setAddingClass(true);
    try {
      const res = await fetch("/api/school/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Class "${newClass}" created`);
      setNewClass("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAddingClass(false);
    }
  }

  async function handleAddSection(classId: string) {
    const name = newSection[classId];
    if (!name?.trim()) return;
    setAddingSection(classId);
    try {
      const res = await fetch("/api/school/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Section "${name}" added`);
      setNewSection({ ...newSection, [classId]: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAddingSection(null);
    }
  }

  async function handleAddSubject() {
    if (!newSubject.name.trim()) return;
    setAddingSubject(true);
    try {
      const res = await fetch("/api/school/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubject),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Subject "${newSubject.name}" added`);
      setNewSubject({ name: "", code: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAddingSubject(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">School Setup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure classes, sections, and subjects for your school.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes + Sections */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Classes &amp; Sections
            </CardTitle>
            <CardDescription>
              Each class can have multiple sections (A, B, C, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new class */}
            <div className="flex gap-2 pb-4 border-b">
              <Input
                placeholder="New class name (e.g., Class 6)"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
                className="flex-1"
              />
              <Button onClick={handleAddClass} disabled={addingClass || !newClass.trim()}>
                {addingClass ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Class
                  </>
                )}
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No classes yet. Add your first class above.
              </div>
            ) : (
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-3 rounded-lg border bg-card hover:border-primary/30"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-sm">{cls.name}</div>
                      <Badge variant="outline" className="text-xs">
                        {cls.sections.length} sections
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cls.sections.map((sec) => (
                        <Badge
                          key={sec.id}
                          variant="outline"
                          className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900"
                        >
                          {sec.name} ({sec._count.enrollments})
                        </Badge>
                      ))}
                      {cls.sections.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">
                          No sections yet
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add section (e.g., A)"
                        value={newSection[cls.id] || ""}
                        onChange={(e) =>
                          setNewSection({ ...newSection, [cls.id]: e.target.value })
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddSection(cls.id)
                        }
                        className="h-8 text-xs flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddSection(cls.id)}
                        disabled={
                          addingSection === cls.id || !newSection[cls.id]?.trim()
                        }
                        className="h-8"
                      >
                        {addingSection === cls.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              Subjects
            </CardTitle>
            <CardDescription>Subjects taught in your school</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 pb-4 border-b">
              <div>
                <Label htmlFor="subj-name" className="text-xs">
                  Subject Name
                </Label>
                <Input
                  id="subj-name"
                  placeholder="e.g., Mathematics"
                  value={newSubject.name}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, name: e.target.value })
                  }
                  className="h-9 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="subj-code" className="text-xs">
                  Code (optional)
                </Label>
                <Input
                  id="subj-code"
                  placeholder="MAT"
                  value={newSubject.code}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, code: e.target.value })
                  }
                  className="h-9 mt-1"
                />
              </div>
              <Button
                onClick={handleAddSubject}
                disabled={addingSubject || !newSubject.name.trim()}
                className="w-full"
                size="sm"
              >
                {addingSubject ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Subject
                  </>
                )}
              </Button>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground">
                No subjects yet.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <Badge
                    key={s.id}
                    variant="outline"
                    className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                  >
                    {s.name}
                    {s.code && (
                      <span className="ml-1 text-muted-foreground font-mono">
                        {s.code}
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
