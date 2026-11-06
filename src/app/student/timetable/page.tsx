// src/app/student/timetable/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

export default async function StudentTimetablePage() {
  const user = await getSession();
  if (!user || user.role !== "STUDENT" || !user.schoolId) redirect("/student/login");

  const student = await db.student.findFirst({
    where: { schoolId: user.schoolId, name: user.name || "", status: "active" },
    include: { enrollments: { where: { academicYear: { isActive: true } }, include: { section: { include: { class: true } } }, take: 1 } },
  });
  if (!student) return <div className="p-6 text-muted-foreground">Student record not found.</div>;
  const enr = student.enrollments[0];

  // Static timetable for now (Phase 7 will add dynamic timetable)
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = [
    { time: "08:00 - 08:45", subject: "Mathematics", teacher: "Ms. Sana", room: "R-12" },
    { time: "08:50 - 09:35", subject: "English", teacher: "Mr. Bilal", room: "R-15" },
    { time: "09:40 - 10:25", subject: "Science", teacher: "Mr. Tariq", room: "Lab-1" },
    { time: "10:30 - 11:15", subject: "Break", teacher: "—", room: "—" },
    { time: "11:20 - 12:05", subject: "Urdu", teacher: "Ms. Hina", room: "R-09" },
    { time: "12:10 - 12:55", subject: "Islamiat", teacher: "Mr. Ali", room: "R-11" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">My Timetable</h1><p className="text-sm text-muted-foreground mt-1">Weekly class schedule{enr ? ` — ${enr.section.class.name}-${enr.section.name}` : ""}.</p></div>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarClock className="h-5 w-5 text-emerald-600" />Weekly Schedule</CardTitle></CardHeader>
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
                      {p.subject === "Break" ? <Badge variant="outline" className="text-xs bg-muted/50">Break</Badge> : (
                        <div><div className="font-semibold text-xs">{p.subject}</div><div className="text-xs text-muted-foreground">{p.teacher}</div><div className="text-xs text-muted-foreground">{p.room}</div></div>
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
