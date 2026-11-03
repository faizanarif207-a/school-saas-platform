// src/app/teacher/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { TeacherSidebar } from "@/components/teacher-sidebar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user || user.role !== "TEACHER" || !user.schoolId) {
    return <>{children}</>;
  }

  // Check school is not suspended
  const school = await db.school.findUnique({
    where: { id: user.schoolId },
    select: { name: true, status: true },
  });

  if (!school || school.status === "suspended") {
    redirect("/teacher/login?error=suspended");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar teacherName={user.name || "Teacher"} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
