// src/app/teacher/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  PenSquare,
  Users,
  CalendarClock,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default async function TeacherDashboardPage() {
  const user = await getSession();
  if (!user || user.role !== "TEACHER" || !user.schoolId) {
    redirect("/teacher/login");
  }

  // Get classes assigned to this teacher (simple: all classes for now)
  const academicYear = await db.academicYear.findFirst({
    where: { schoolId: user.schoolId, isActive: true },
    orderBy: { startDate: "desc" },
  });

  const classes = await db.class.findMany({
    where: { schoolId: user.schoolId },
    include: {
      sections: {
        include: {
          enrollments: academicYear
            ? { where: { academicYearId: academicYear.id } }
            : {},
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Today's attendance count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const todayAttendanceCount = await db.attendance.count({
    where: {
      markedBy: user.id,
      date: { gte: today, lt: todayEnd },
    },
  });

  // Total students across all classes (for stats)
  const totalStudents = classes.reduce(
    (sum, c) =>
      sum + c.sections.reduce((s, sec) => s + sec.enrollments.length, 0),
    0
  );

  const stats = [
    {
      label: "Total Classes",
      value: classes.length.toString(),
      icon: Users,
      sub: `${classes.reduce((s, c) => s + c.sections.length, 0)} sections`,
    },
    {
      label: "Total Students",
      value: totalStudents.toString(),
      icon: Users,
      sub: "across all classes",
    },
    {
      label: "Marked Today",
      value: todayAttendanceCount.toString(),
      icon: CalendarCheck,
      sub: "attendance records",
    },
    {
      label: "Pending Marks",
      value: "—",
      icon: PenSquare,
      sub: "active exams",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {user.name}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s your teaching dashboard at a glance.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <div className="text-2xl font-bold mt-1.5 tracking-tight">
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

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:border-primary/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Mark Attendance
            </CardTitle>
            <CardDescription>
              Mark daily attendance for your classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/teacher/attendance">Go to Attendance</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenSquare className="h-5 w-5 text-primary" />
              Enter Marks
            </CardTitle>
            <CardDescription>
              Submit marks for current exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/teacher/marks">Go to Marks Entry</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's classes (simulated) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Your Classes
          </CardTitle>
          <CardDescription>Classes and sections you teach</CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <div className="text-sm font-medium">No classes assigned yet</div>
              <p className="text-xs text-muted-foreground mt-1">
                Contact your school admin to assign you classes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-3 rounded-lg border bg-card hover:border-primary/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{cls.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {cls.sections.length} sections
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cls.sections.map((sec) => (
                      <Badge
                        key={sec.id}
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900"
                      >
                        {sec.name} ({sec.enrollments.length})
                      </Badge>
                    ))}
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
