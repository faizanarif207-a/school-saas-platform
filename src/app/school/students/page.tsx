// src/app/school/students/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Loader2,
  Users,
  Phone,
} from "lucide-react";

type ClassType = { id: string; name: string };
type SectionType = { id: string; name: string; classId: string };
type StudentType = {
  id: string;
  name: string;
  fatherName: string | null;
  gender: string | null;
  contact: string | null;
  status: string;
  enrollments: {
    id: string;
    rollNo: number | null;
    section: { id: string; name: string; class: ClassType };
  }[];
  guardians: { name: string; phone: string | null }[];
};

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentType[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (classFilter !== "all") params.set("classId", classFilter);
      if (sectionFilter !== "all") params.set("sectionId", sectionFilter);

      const [stuRes, clsRes] = await Promise.all([
        fetch(`/api/school/students?${params.toString()}`),
        fetch("/api/school/classes"),
      ]);
      const stuData = await stuRes.json();
      const clsData = await clsRes.json();

      setStudents(stuData.students || []);
      const cls = clsData.classes || [];
      setClasses(cls.map((c: ClassType & { sections: SectionType[] }) => ({
        id: c.id,
        name: c.name,
      })));
      const secs = (clsData.classes || []).flatMap(
        (c: ClassType & { sections: SectionType[] }) =>
          c.sections.map((s) => ({ ...s, classId: c.id, name: s.name }))
      );
      setSections(secs);
    } catch {
      console.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [search, classFilter, sectionFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredSections = sections.filter(
    (s) => classFilter === "all" || s.classId === classFilter
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading..." : `${students.length} students`}
          </p>
        </div>
        <Button asChild>
          <Link href="/school/students/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Student
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <CardTitle className="flex-1">All Students</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative w-56">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or father..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sectionFilter} onValueChange={setSectionFilter}>
                <SelectTrigger className="w-28 h-9">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {filteredSections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <div className="text-sm font-medium">No students found</div>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                {search || classFilter !== "all" || sectionFilter !== "all"
                  ? "Try changing filters."
                  : "Add your first student to get started."}
              </p>
              {!search && classFilter === "all" && sectionFilter === "all" && (
                <Button asChild size="sm">
                  <Link href="/school/students/new">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Student
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-semibold px-6 py-3">Roll #</th>
                    <th className="text-left font-semibold px-6 py-3">Student</th>
                    <th className="text-left font-semibold px-6 py-3">Class</th>
                    <th className="text-left font-semibold px-6 py-3">Guardian</th>
                    <th className="text-left font-semibold px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const enr = s.enrollments[0];
                    const grd = s.guardians[0];
                    return (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">
                          {enr?.rollNo || "—"}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-semibold">{s.name}</div>
                          {s.fatherName && (
                            <div className="text-xs text-muted-foreground">
                              S/O {s.fatherName}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          {enr ? (
                            <span>
                              {enr.section.class.name}-{enr.section.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not enrolled</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          {grd ? (
                            <div>
                              <div className="text-xs font-medium">{grd.name}</div>
                              {grd.phone && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Phone className="h-3 w-3" />
                                  {grd.phone}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge
                            variant="outline"
                            className={
                              s.status === "active"
                                ? "text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                                : "text-xs bg-zinc-100 text-zinc-600 border-zinc-200"
                            }
                          >
                            {s.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
