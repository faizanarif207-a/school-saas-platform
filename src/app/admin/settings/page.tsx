// src/app/admin/settings/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminSettingsPage() {
  const user = await getSession();
  if (!user || user.role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1><p className="text-sm text-muted-foreground mt-1">Global platform configuration.</p></div>
      <Card>
        <CardHeader><CardTitle>Platform Information</CardTitle><CardDescription>General platform details</CardDescription></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Platform Name</span><span className="font-semibold">SchoolSaaS by Emerson Technology</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Version</span><span className="font-semibold">1.0.0</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Database</span><span className="font-semibold">Supabase PostgreSQL</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Hosting</span><span className="font-semibold">Vercel</span></div>
          <div className="flex justify-between py-2"><span className="text-muted-foreground">Status</span><span className="font-semibold text-emerald-600">● Operational</span></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Feature Flags</CardTitle><CardDescription>Enable/disable platform features</CardDescription></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Email Notifications</span><span className="font-semibold text-amber-600">● Demo Mode (add RESEND_API_KEY)</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">SMS Notifications</span><span className="font-semibold text-amber-600">● Demo Mode (add TWILIO keys)</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Online Payment</span><span className="font-semibold text-amber-600">● Demo Mode (add gateway keys)</span></div>
          <div className="flex justify-between py-2"><span className="text-muted-foreground">Multi-Branch</span><span className="font-semibold text-emerald-600">● Enabled</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
