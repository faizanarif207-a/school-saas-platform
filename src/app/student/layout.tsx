// src/app/student/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudentSidebar } from "@/components/student-sidebar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user || user.role !== "STUDENT" || !user.schoolId) {
    return <>{children}</>;
  }

  const school = await db.school.findUnique({
    where: { id: user.schoolId },
    select: { name: true, status: true },
  });

  if (!school || school.status === "suspended") {
    redirect("/student/login?error=suspended");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar studentName={user.name || "Student"} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
