// src/app/school/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SchoolAdminSidebar } from "@/components/school-admin-sidebar";

export default async function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  // If not logged in or not a school admin, render children directly
  // (login page handles its own full-page layout, no sidebar)
  // Protected pages (dashboard, setup, etc.) will redirect to /school/login themselves
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return <>{children}</>;
  }

  // Get school for sidebar + status check
  const school = await db.school.findUnique({
    where: { id: user.schoolId },
    select: { name: true, status: true },
  });

  if (!school || school.status === "suspended") {
    redirect("/school/login?error=suspended");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SchoolAdminSidebar schoolName={school.name} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
