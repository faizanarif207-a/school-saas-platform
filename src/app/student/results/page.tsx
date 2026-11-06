// src/app/student/results/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export default async function StudentResultsPage() {
  const user = await getSession();
  if (!user || user.role !== "STUDENT" || !user.schoolId) redirect("/student/login");

  const student = await db.student.findFirst({
    where: { schoolId: user.schoolId, name: user.name || "", status: "active" },
    include: { examMarks: { include: { exam: true, subject: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!student) return <div className="p-6 text-muted-foreground">Student record not found.</div>;

  const totalMarks = student.examMarks.reduce((s, m) => s + m.totalMarks, 0);
  const obtainedMarks = student.examMarks.reduce((s, m) => s + m.marks, 0);
  const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">My Results</h1><p className="text-sm text-muted-foreground mt-1">Your exam marks and grades.</p></div>
      {student.examMarks.length === 0 ? (
        <Card><CardContent className="pt-12 text-center"><Trophy className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" /><div className="text-sm font-medium">No results published yet</div></CardContent></Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="pt-4 pb-4 text-center"><div className="text-xs uppercase font-bold text-muted-foreground">Total Marks</div><div className="text-xl font-bold mt-1">{obtainedMarks} / {totalMarks}</div></CardContent></Card>
            <Card><CardContent className="pt-4 pb-4 text-center"><div className="text-xs uppercase font-bold text-muted-foreground">Percentage</div><div className="text-xl font-bold mt-1 text-primary">{percentage}%</div></CardContent></Card>
            <Card><CardContent className="pt-4 pb-4 text-center"><div className="text-xs uppercase font-bold text-muted-foreground">Subjects</div><div className="text-xl font-bold mt-1">{student.examMarks.length}</div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" />Subject-Wise Results</CardTitle></CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground"><th className="text-left font-semibold px-6 py-3">Exam</th><th className="text-left font-semibold px-6 py-3">Subject</th><th className="text-right font-semibold px-6 py-3">Marks</th><th className="text-right font-semibold px-6 py-3">Total</th><th className="text-right font-semibold px-6 py-3">%</th><th className="text-left font-semibold px-6 py-3">Grade</th></tr></thead>
                <tbody>
                  {student.examMarks.map(m => {
                    const pct = Math.round((m.marks / m.totalMarks) * 100);
                    return (
                      <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-6 py-3.5">{m.exam.name}</td>
                        <td className="px-6 py-3.5 font-semibold">{m.subject.name}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-bold">{m.marks}</td>
                        <td className="px-6 py-3.5 text-right font-mono text-muted-foreground">{m.totalMarks}</td>
                        <td className="px-6 py-3.5 text-right font-mono">{pct}%</td>
                        <td className="px-6 py-3.5"><Badge variant="outline" className={m.grade === "A+" || m.grade === "A" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : m.grade === "F" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}>{m.grade}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table></div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
