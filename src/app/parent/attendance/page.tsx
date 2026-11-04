// src/app/parent/attendance/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck } from "lucide-react";
import { formatDate } from "@/lib/format";

export default async function ParentAttendancePage() {
  const user = await getSession();
  if (!user || user.role !== "PARENT" || !user.schoolId) {
    redirect("/parent/login");
  }

  // Get all children
  const links = await db.parentStudent.findMany({
    where: { parentId: user.id },
    include: {
      student: {
        include: {
          enrollments: {
            where: { academicYear: { isActive: true } },
            include: { section: { include: { class: true } } },
            take: 1,
          },
          attendances: { orderBy: { date: "desc" }, take: 60 },
        },
      },
    },
  });

  if (links.length === 0) {
    return <div className="p-6">No children linked</div>;
  }

  const child = links[0].student;
  const attendances = child.attendances;
  const enr = child.enrollments[0];

  // Calculate stats
  const present = attendances.filter((a) => a.status === "present").length;
  const absent = attendances.filter((a) => a.status === "absent").length;
  const late = attendances.filter((a) => a.status === "late").length;
  const total = attendances.length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {child.name}&apos;s attendance record ({enr?.section.class.name}-{enr?.section.name})
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-xs uppercase font-bold text-muted-foreground">Total Days</div>
            <div className="text-xl font-bold mt-1">{total}</div>
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

      {/* Attendance summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Attendance Percentage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{pct}%</div>
            <div className="flex-1">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {pct >= 80 ? "Excellent attendance" : pct >= 60 ? "Attendance needs improvement" : "Low attendance — please contact school"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Day-by-Day History</CardTitle>
          <CardDescription>Last 60 records</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {attendances.length === 0 ? (
            <div className="text-center py-12">
              <CalendarCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <div className="text-sm font-medium">No attendance records yet</div>
              <p className="text-xs text-muted-foreground mt-1">
                Records will appear once teacher starts marking daily attendance.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-semibold px-6 py-3">Date</th>
                    <th className="text-left font-semibold px-6 py-3">Day</th>
                    <th className="text-left font-semibold px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((a) => {
                    const date = new Date(a.date);
                    return (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-6 py-3.5 font-medium">{formatDate(a.date)}</td>
                        <td className="px-6 py-3.5 text-muted-foreground">
                          {date.toLocaleDateString("en-GB", { weekday: "long" })}
                        </td>
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
