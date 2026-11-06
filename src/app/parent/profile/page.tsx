// src/app/parent/profile/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PasswordChangeForm } from "@/components/password-change-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ParentProfilePage() {
  const user = await getSession();
  if (!user || user.role !== "PARENT" || !user.schoolId) redirect("/parent/login");
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">My Profile</h1><p className="text-sm text-muted-foreground mt-1">View your account and change password.</p></div>
      <Card>
        <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Name</span><span className="font-semibold">{user.name || "—"}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Email</span><span className="font-semibold">{user.email}</span></div>
          <div className="flex justify-between py-2"><span className="text-muted-foreground">Role</span><span className="font-semibold">Parent</span></div>
        </CardContent>
      </Card>
      <PasswordChangeForm />
    </div>
  );
}
