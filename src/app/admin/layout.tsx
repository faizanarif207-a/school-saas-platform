// src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SuperAdminSidebar } from "@/components/super-admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SuperAdminSidebar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
