// src/app/student/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Trophy,
  CalendarClock,
  Bell,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/format";

export default async function StudentDashboardPage() {
  const user = await getSession();
  if (!user || user.role !== "STUDENT" || !user.schoolId) {
    redirect("/student/login");
  }

  // Find student record linked to this user (by email)
  // Since students are created by linking user.email to student record
  // We need to find the student whose admission matches the user's name + school
  // For simplicity, find by email pattern or by user.name in school
  const student = await db.student.findFirst({
    where: {
      schoolId: user.schoolId,
      name: user.name || "",
      status: "active",
    },
    include: {
      enrollments: {
        where: { academicYear: { isActive: true } },
        include: { section: { include: { class: true } }, academicYear: true },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
      attendances: { orderBy: { date: "desc" }, take: 30 },
      examMarks: { include: { exam: true, subject: true }, take: 10 },
    },
  });

  if (!student) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <div className="text-sm font-medium">Student record not found</div>
            <p className="text-xs text-muted-foreground mt-1">
              Please contact your school admin to link your student record.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enr = student.enrollments[0];

  // Calculate stats
  const presentCount = student.attendances.filter((a) => a.status === "present").length;
  const totalCount = student.attendances.length;
  const attendancePct = totalCount > 0
    ? Math.round((presentCount / totalCount) * 100)
    : 0;

  const avgScore = student.examMarks.length > 0
    ? Math.round(
        (student.examMarks.reduce((sum, m) => sum + (m.marks / m.totalMarks) * 100, 0) /
          student.examMarks.length)
      )
    : 0;

  const stats = [
    {
      label: "Attendance",
      value: attendancePct + "%",
      icon: CalendarCheck,
      sub: `${presentCount}/${totalCount} days`,
    },
    {
      label: "Latest Result",
      value: avgScore + "%",
      icon: Trophy,
      sub: `${student.examMarks.length} subjects`,
    },
    {
      label: "Class",
      value: enr ? `${enr.section.class.name}-${enr.section.name}` : "—",
      icon: Users,
      sub: `Roll #${enr?.rollNo || "—"}`,
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hi, {user.name}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s your academic overview.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                      {stat.label}
                    </div>
                    <div className="text-xl font-bold mt-1.5 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stat.sub}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg shrink-0 bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase font-bold text-muted-foreground">Admission ID</div>
              <div className="font-mono font-semibold mt-1 text-primary">{student.admissionId || "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-muted-foreground">Name</div>
              <div className="font-semibold mt-1">{student.name}</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-muted-foreground">Father</div>
              <div className="font-semibold mt-1">{student.fatherName || "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-muted-foreground">Status</div>
              <div className="mt-1">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {student.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Recent Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {student.attendances.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No attendance records yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-semibold px-6 py-3">Date</th>
                    <th className="text-left font-semibold px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {student.attendances.slice(0, 5).map((a) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="px-6 py-3.5">{formatDate(a.date)}</td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant="outline"
                          className={
                            a.status === "present"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : a.status === "absent"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent results */}
      {student.examMarks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-semibold px-6 py-3">Exam</th>
                    <th className="text-left font-semibold px-6 py-3">Subject</th>
                    <th className="text-right font-semibold px-6 py-3">Marks</th>
                    <th className="text-right font-semibold px-6 py-3">Total</th>
                    <th className="text-left font-semibold px-6 py-3">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {student.examMarks.slice(0, 5).map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="px-6 py-3.5">{m.exam.name}</td>
                      <td className="px-6 py-3.5">{m.subject.name}</td>
                      <td className="px-6 py-3.5 text-right font-mono font-semibold">{m.marks}</td>
                      <td className="px-6 py-3.5 text-right font-mono text-muted-foreground">{m.totalMarks}</td>
                      <td className="px-6 py-3.5">
                        <Badge variant="outline" className={
                          m.grade === "A+" || m.grade === "A"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : m.grade === "F"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }>
                          {m.grade}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
