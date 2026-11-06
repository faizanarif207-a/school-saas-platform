// src/app/teacher/students/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { formatDate } from "@/lib/format";

export default async function TeacherStudentsPage() {
  const user = await getSession();
  if (!user || user.role !== "TEACHER" || !user.schoolId) redirect("/teacher/login");

  const academicYear = await db.academicYear.findFirst({ where: { schoolId: user.schoolId, isActive: true }, orderBy: { startDate: "desc" } });
  const classes = await db.class.findMany({
    where: { schoolId: user.schoolId },
    include: { sections: { include: { enrollments: { where: academicYear ? { academicYearId: academicYear.id } : {}, include: { student: true } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">My Students</h1><p className="text-sm text-muted-foreground mt-1">Students across all your classes.</p></div>
      {classes.map(cls => (
        <Card key={cls.id}>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-5 w-5 text-cyan-600" />{cls.name}</CardTitle><CardDescription>{cls.sections.length} sections</CardDescription></CardHeader>
          <CardContent className="px-0">
            {cls.sections.map(sec => {
              const students = sec.enrollments.map(e => ({ ...e.student, rollNo: e.rollNo }));
              return (
                <div key={sec.id} className="mb-4">
                  <div className="px-6 py-2 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{sec.name} ({students.length} students)</div>
                  {students.length === 0 ? <div className="px-6 py-3 text-sm text-muted-foreground">No students enrolled.</div> : (
                    <div className="overflow-x-auto"><table className="w-full text-sm">
                      <thead><tr className="border-b text-xs uppercase tracking-wider text-muted-foreground"><th className="text-left font-semibold px-6 py-2">Roll #</th><th className="text-left font-semibold px-6 py-2">Name</th><th className="text-left font-semibold px-6 py-2">Father</th><th className="text-left font-semibold px-6 py-2">Admission ID</th><th className="text-left font-semibold px-6 py-2">Status</th></tr></thead>
                      <tbody>
                        {students.map(s => (
                          <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="px-6 py-2.5 font-mono text-xs">{s.rollNo || "—"}</td>
                            <td className="px-6 py-2.5 font-semibold">{s.name}</td>
                            <td className="px-6 py-2.5 text-muted-foreground">{s.fatherName || "—"}</td>
                            <td className="px-6 py-2.5 font-mono text-xs text-primary">{s.admissionId || "—"}</td>
                            <td className="px-6 py-2.5"><Badge variant="outline" className={s.status === "active" ? "text-xs bg-emerald-50 text-emerald-700 border-emerald-200" : "text-xs bg-zinc-100 text-zinc-500"}>{s.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table></div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
