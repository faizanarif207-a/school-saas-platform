// src/app/school/staff/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Users, Trash2, Power, Mail } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatDate } from "@/lib/format";

type StaffMember = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  subRole: string | null;
  isActive: boolean;
  branchId: string | null;
  branch: { name: string } | null;
  createdAt: string;
};

type Branch = { id: string; name: string };

const subRoleLabels: Record<string, string> = {
  OWNER: "Owner",
  PRINCIPAL: "Principal",
  ACCOUNTANT: "Accountant",
  ADMISSION: "Admission Officer",
  TEACHER: "Teacher",
};

const subRoleColors: Record<string, string> = {
  OWNER: "bg-primary/10 text-primary border-primary/20",
  PRINCIPAL: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400",
  ACCOUNTANT: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400",
  ADMISSION: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400",
  TEACHER: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", subRole: "PRINCIPAL", branchId: "" });
  const [adding, setAdding] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, bRes] = await Promise.all([
        fetch("/api/school/staff"),
        fetch("/api/school/branches"),
      ]);
      const sData = await sRes.json();
      const bData = await bRes.json();
      setStaff(sData.staff || []);
      setBranches((bData.branches || []).map((b: Branch) => ({ id: b.id, name: b.name })));
    } catch {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleInvite() {
    if (!form.name.trim() || !form.email.trim()) { toast.error("Name and email are required"); return; }
    setAdding(true);
    setTempPassword(null);
    try {
      const res = await fetch("/api/school/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTempPassword(data.staff.tempPassword);
      setTempName(data.staff.name);
      toast.success(`${data.staff.name} invited successfully`);
      setForm({ name: "", email: "", subRole: "PRINCIPAL", branchId: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id: string, currentActive: boolean, name: string) {
    try {
      const res = await fetch(`/api/school/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${name} ${currentActive ? "deactivated" : "activated"}`);
      await load();
    } catch {
      toast.error("Failed");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/school/staff/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${name} deleted`);
      await load();
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Invite and manage your school staff — principals, accountants, teachers.</p>
      </div>

      {/* Temp password notification */}
      {tempPassword && tempName && (
        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900">
          <CardContent className="pt-5 flex items-start gap-3">
            <Mail className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-emerald-800 dark:text-emerald-400">
                {tempName} has been invited!
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-1">
                Share these credentials with {tempName}:
              </p>
              <div className="mt-2 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900 font-mono text-xs">
                Login: <strong>/school/login</strong> (or <strong>/teacher/login</strong> if teacher)
                <br />
                Email: <strong>{form.email || "(see above)"}</strong>
                <br />
                Temp Password: <strong>{tempPassword}</strong>
              </div>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => { setTempPassword(null); setTempName(null); }}>
                Got it
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invite form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />Invite Staff</CardTitle>
            <CardDescription>Send an invitation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2"><Label htmlFor="sn" className="text-xs">Full Name</Label><Input id="sn" placeholder="e.g., Ayesha Khan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" /></div>
            <div className="space-y-2"><Label htmlFor="se" className="text-xs">Email</Label><Input id="se" type="email" placeholder="name@school.edu.pk" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10" /></div>
            <div className="space-y-2"><Label htmlFor="sr" className="text-xs">Role</Label>
              <Select value={form.subRole} onValueChange={(v) => setForm({ ...form, subRole: v })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRINCIPAL">Principal</SelectItem>
                  <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                  <SelectItem value="ADMISSION">Admission Officer</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {branches.length > 0 && (
              <div className="space-y-2"><Label htmlFor="sb" className="text-xs">Branch</Label>
                <Select value={form.branchId || "none"} onValueChange={(v) => setForm({ ...form, branchId: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific branch</SelectItem>
                    {branches.map((b) => (<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleInvite} disabled={adding || !form.name.trim() || !form.email.trim()} className="w-full">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4 mr-1" />Send Invite</>}
            </Button>
          </CardContent>
        </Card>

        {/* Staff list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Staff Members</CardTitle>
            <CardDescription>{loading ? "..." : `${staff.length} staff members`}</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : staff.length === 0 ? (
              <div className="text-center py-12"><Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" /><div className="text-sm font-medium">No staff invited yet</div><p className="text-xs text-muted-foreground mt-1">Invite your first staff member using the form.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="text-left font-semibold px-6 py-3">Name</th>
                      <th className="text-left font-semibold px-6 py-3">Role</th>
                      <th className="text-left font-semibold px-6 py-3">Branch</th>
                      <th className="text-left font-semibold px-6 py-3">Status</th>
                      <th className="text-right font-semibold px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => {
                      const role = s.subRole || s.role;
                      const label = subRoleLabels[role] || role;
                      const color = subRoleColors[role] || subRoleColors.TEACHER;
                      return (
                        <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-6 py-3.5">
                            <div className="font-semibold">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.email}</div>
                          </td>
                          <td className="px-6 py-3.5"><Badge variant="outline" className={`text-xs ${color}`}>{label}</Badge></td>
                          <td className="px-6 py-3.5 text-xs text-muted-foreground">{s.branch?.name || "—"}</td>
                          <td className="px-6 py-3.5">
                            <Badge variant="outline" className={s.isActive ? "text-xs bg-emerald-50 text-emerald-700 border-emerald-200" : "text-xs bg-zinc-100 text-zinc-500"}>
                              {s.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-6 py-3.5 text-right space-x-1">
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleToggle(s.id, s.isActive, s.name || "Staff")}>
                              <Power className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={() => handleDelete(s.id, s.name || "Staff")}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
