// src/app/parent/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ParentSidebar } from "@/components/parent-sidebar";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user || user.role !== "PARENT" || !user.schoolId) {
    return <>{children}</>;
  }

  // Check school is not suspended
  const school = await db.school.findUnique({
    where: { id: user.schoolId },
    select: { name: true, status: true },
  });

  if (!school || school.status === "suspended") {
    redirect("/parent/login?error=suspended");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ParentSidebar parentName={user.name || "Parent"} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
