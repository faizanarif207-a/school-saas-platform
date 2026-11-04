// src/app/parent/notices/page.tsx
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";

export default async function ParentNoticesPage() {
  const user = await getSession();
  if (!user || user.role !== "PARENT" || !user.schoolId) {
    redirect("/parent/login");
  }

  // Get all notices for this school (school-wide + class-specific)
  // For now, get school-wide + class-specific for child's class
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
        },
      },
    },
  });

  const child = links[0]?.student;
  const classId = child?.enrollments[0]?.section.class.id;

  const notices = await db.notice.findMany({
    where: {
      schoolId: user.schoolId,
      OR: [
        { noticeType: "school_wide" },
        ...(classId ? [{ noticeType: "class_specific", classId }] : []),
      ],
    },
    include: { poster: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          School announcements and class-specific notices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            All Notices
          </CardTitle>
          <CardDescription>{notices.length} notices</CardDescription>
        </CardHeader>
        <CardContent>
          {notices.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <div className="text-sm font-medium">No notices yet</div>
              <p className="text-xs text-muted-foreground mt-1">
                School admin posts notices for parents here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-lg border bg-card hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{n.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {n.noticeType === "school_wide" ? "School-wide" : "Class-specific"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {n.body}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <span>By {n.poster.name || "Admin"}</span>
                        <span>·</span>
                        <span>{formatDateTime(n.createdAt)}</span>
                      </div>
                    </div>
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
