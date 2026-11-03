// src/app/school/settings/page.tsx — School Settings (Defaulters Policy)
"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, AlertCircle, Bell, Shield } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type Settings = { defaultersReminderDays: number; defaultersLateFee: number; defaultersPortalBlockDays: number; defaultersSuspendDays: number; smsEnabled: boolean; whatsappEnabled: boolean; studentLoginMinClass: string; };

const defaultSettings: Settings = { defaultersReminderDays: 5, defaultersLateFee: 0, defaultersPortalBlockDays: 30, defaultersSuspendDays: 60, smsEnabled: false, whatsappEnabled: false, studentLoginMinClass: "Class 6" };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/school/settings");
      const data = await res.json();
      if (data.settings) setSettings({ ...defaultSettings, ...data.settings });
    } catch { toast.error("Failed to load settings"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/school/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Settings saved successfully");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  }

  if (loading) return (<div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">School Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure policies for your school.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-amber-600" />Fee Defaulters Policy</CardTitle>
          <CardDescription>Auto-escalation rules for unpaid fees.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="rd">Reminder SMS days before due</Label><Input id="rd" type="number" min={0} max={30} value={settings.defaultersReminderDays} onChange={(e) => setSettings({ ...settings, defaultersReminderDays: parseInt(e.target.value) || 0 })} className="h-11" /></div>
            <div className="space-y-2"><Label htmlFor="lf">Late fee amount (PKR)</Label><Input id="lf" type="number" min={0} value={settings.defaultersLateFee} onChange={(e) => setSettings({ ...settings, defaultersLateFee: parseInt(e.target.value) || 0 })} className="h-11" /></div>
            <div className="space-y-2"><Label htmlFor="pb">Portal block (days after due)</Label><Input id="pb" type="number" min={0} max={365} value={settings.defaultersPortalBlockDays} onChange={(e) => setSettings({ ...settings, defaultersPortalBlockDays: parseInt(e.target.value) || 0 })} className="h-11" /></div>
            <div className="space-y-2"><Label htmlFor="sd">Account suspend (days after due)</Label><Input id="sd" type="number" min={0} max={365} value={settings.defaultersSuspendDays} onChange={(e) => setSettings({ ...settings, defaultersSuspendDays: parseInt(e.target.value) || 0 })} className="h-11" /></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div><Label className="font-semibold">SMS Notifications</Label><p className="text-xs text-muted-foreground mt-1">Send attendance + fee reminders via SMS</p></div>
            <Switch checked={settings.smsEnabled} onCheckedChange={(v) => setSettings({ ...settings, smsEnabled: v })} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div><Label className="font-semibold">WhatsApp Notifications</Label><p className="text-xs text-muted-foreground mt-1">Send notices via WhatsApp</p></div>
            <Switch checked={settings.whatsappEnabled} onCheckedChange={(v) => setSettings({ ...settings, whatsappEnabled: v })} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Student Login Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2"><Label htmlFor="mc">Minimum class for student login</Label>
            <Select value={settings.studentLoginMinClass} onValueChange={(v) => setSettings({ ...settings, studentLoginMinClass: v })}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Class 4">Class 4</SelectItem><SelectItem value="Class 5">Class 5</SelectItem><SelectItem value="Class 6">Class 6 (recommended)</SelectItem><SelectItem value="Class 7">Class 7</SelectItem><SelectItem value="Class 8">Class 8</SelectItem><SelectItem value="Class 9">Class 9</SelectItem><SelectItem value="Class 10">Class 10 only</SelectItem></SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg">{saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Settings</>}</Button></div>
    </div>
  );
}
