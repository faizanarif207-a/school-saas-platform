// src/app/teacher/timetable/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

export default async function TeacherTimetablePage() {
  const user = await getSession();
  if (!user || user.role !== "TEACHER" || !user.schoolId) redirect("/teacher/login");

  const classes = await db.class.findMany({ where: { schoolId: user.schoolId }, orderBy: { name: "asc" } });
  const subjects = await db.subject.findMany({ where: { schoolId: user.schoolId }, orderBy: { name: "asc" } });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = [
    { time: "08:00 - 08:45", subject: subjects[0]?.name || "Mathematics", class: classes[0]?.name || "Class 5", section: "A", room: "R-12" },
    { time: "08:50 - 09:35", subject: subjects[0]?.name || "Mathematics", class: classes[1]?.name || "Class 6", section: "B", room: "R-15" },
    { time: "09:40 - 10:25", subject: subjects[0]?.name || "Mathematics", class: classes[2]?.name || "Class 7", section: "A", room: "R-09" },
    { time: "10:30 - 11:15", subject: "Break", class: "—", section: "—", room: "—" },
    { time: "11:20 - 12:05", subject: subjects[0]?.name || "Mathematics", class: classes[3]?.name || "Class 8", section: "B", room: "R-18" },
    { time: "12:10 - 12:55", subject: "Free", class: "—", section: "—", room: "—" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">My Timetable</h1><p className="text-sm text-muted-foreground mt-1">Your weekly teaching schedule.</p></div>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarClock className="h-5 w-5 text-cyan-600" />Weekly Schedule</CardTitle></CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left font-semibold px-4 py-3">Day</th>
              {periods.map((p, i) => <th key={i} className="text-left font-semibold px-4 py-3">{p.time}</th>)}
            </tr></thead>
            <tbody>
              {days.map(day => (
                <tr key={day} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold">{day}</td>
                  {periods.map((p, i) => (
                    <td key={i} className="px-4 py-3">
                      {p.subject === "Break" || p.subject === "Free" ? <Badge variant="outline" className="text-xs bg-muted/50">{p.subject}</Badge> : (
                        <div><div className="font-semibold text-xs">{p.subject}</div><div className="text-xs text-muted-foreground">{p.class}-{p.section}</div><div className="text-xs text-muted-foreground">{p.room}</div></div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table></div>
        </CardContent>
      </Card>
    </div>
  );
}
