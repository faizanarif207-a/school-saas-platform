// src/app/school/staff/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Users, Trash2, Power, Mail, CheckCircle2, XCircle, Clock } from "lucide-react";
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
  approvalStatus: string;
  branchId: string | null;
  branch: { name: string } | null;
  createdAt: string;
};

type Branch = { id: string; name: string };

const subRoleLabels: Record<string, string> = {
  OWNER: "Owner", PRINCIPAL: "Principal", ACCOUNTANT: "Accountant", ADMISSION: "Admission Officer", TEACHER: "Teacher",
  PARENT: "Parent", STUDENT: "Student",
};
const subRoleColors: Record<string, string> = {
  OWNER: "bg-primary/10 text-primary border-primary/20",
  PRINCIPAL: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400",
  ACCOUNTANT: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400",
  ADMISSION: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400",
  TEACHER: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400",
  PARENT: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400",
  STUDENT: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", subRole: "PRINCIPAL", branchId: "" });
  const [adding, setAdding] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, bRes] = await Promise.all([fetch("/api/school/staff"), fetch("/api/school/branches")]);
      const sData = await sRes.json();
      const bData = await bRes.json();
      setStaff(sData.staff || []);
      setBranches((bData.branches || []).map((b: Branch) => ({ id: b.id, name: b.name })));
    } catch { toast.error("Failed to load staff"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleInvite() {
    if (!form.name.trim() || !form.email.trim()) { toast.error("Name and email required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/school/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Invitation sent! Staff will receive an email. Approve from the list below.");
      setForm({ name: "", email: "", subRole: "PRINCIPAL", branchId: "" });
      await load();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setAdding(false); }
  }

  async function handleApprove(id: string, name: string) {
    setProcessing(id);
    try {
      const res = await fetch(`/api/school/staff/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${name} approved! Credentials email sent.`);
      await load();
    } catch { toast.error("Failed to approve"); }
    finally { setProcessing(null); }
  }

  async function handleReject(id: string, name: string) {
    if (!confirm(`Reject ${name}? They will receive a rejection email.`)) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/school/staff/${id}/reject`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${name} rejected. Email sent.`);
      await load();
    } catch { toast.error("Failed"); }
    finally { setProcessing(null); }
  }

  async function handleToggle(id: string, currentActive: boolean, name: string) {
    try {
      const res = await fetch(`/api/school/staff/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !currentActive }) });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${name} ${currentActive ? "deactivated" : "activated"}`);
      await load();
    } catch { toast.error("Failed"); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/school/staff/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${name} deleted`);
      await load();
    } catch { toast.error("Failed"); }
  }

  const pendingStaff = staff.filter(s => s.approvalStatus === "pending_approval");
  const approvedStaff = staff.filter(s => s.approvalStatus === "approved");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff & Access Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Invite staff, approve access requests from teachers, parents and students, and manage accounts.</p>
      </div>

      {/* Pending Approvals Banner */}
      {pendingStaff.length > 0 && (
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
          <CardContent className="pt-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <div className="font-semibold text-sm text-amber-800 dark:text-amber-400">
              {pendingStaff.length} access request(s) awaiting your approval
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invite form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />Invite Staff</CardTitle>
            <CardDescription>Send an invitation (requires approval)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2"><Label htmlFor="sn" className="text-xs">Full Name</Label><Input id="sn" placeholder="e.g., Ayesha Khan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" /></div>
            <div className="space-y-2"><Label htmlFor="se" className="text-xs">Email</Label><Input id="se" type="email" placeholder="name@school.edu.pk" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10" /></div>
            <div className="space-y-2"><Label htmlFor="sr" className="text-xs">Role</Label>
              <Select value={form.subRole} onValueChange={(v) => setForm({ ...form, subRole: v })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="PRINCIPAL">Principal</SelectItem><SelectItem value="ACCOUNTANT">Accountant</SelectItem><SelectItem value="ADMISSION">Admission Officer</SelectItem><SelectItem value="TEACHER">Teacher</SelectItem></SelectContent>
              </Select>
            </div>
            {branches.length > 0 && (
              <div className="space-y-2"><Label htmlFor="sb" className="text-xs">Branch</Label>
                <Select value={form.branchId || "none"} onValueChange={(v) => setForm({ ...form, branchId: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">No specific branch</SelectItem>{branches.map((b) => (<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleInvite} disabled={adding} className="w-full">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4 mr-1" />Send Invitation</>}
            </Button>
          </CardContent>
        </Card>

        {/* Staff list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Staff Members</CardTitle>
            <CardDescription>{loading ? "..." : `${staff.length} total · ${pendingStaff.length} pending · ${approvedStaff.length} approved`}</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (<div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>) : staff.length === 0 ? (
              <div className="text-center py-12"><Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" /><div className="text-sm font-medium">No staff invited yet</div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="text-left font-semibold px-6 py-3">Name</th>
                      <th className="text-left font-semibold px-6 py-3">Role</th>
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
                          <td className="px-6 py-3.5"><div className="font-semibold">{s.name}</div><div className="text-xs text-muted-foreground">{s.email}</div></td>
                          <td className="px-6 py-3.5"><Badge variant="outline" className={`text-xs ${color}`}>{label}</Badge></td>
                          <td className="px-6 py-3.5">
                            {s.approvalStatus === "pending_approval" ? (
                              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                            ) : s.approvalStatus === "rejected" ? (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
                            ) : (
                              <Badge variant="outline" className={s.isActive ? "text-xs bg-emerald-50 text-emerald-700 border-emerald-200" : "text-xs bg-zinc-100 text-zinc-500"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-right space-x-1">
                            {s.approvalStatus === "pending_approval" ? (
                              <>
                                <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600 hover:bg-emerald-50 border-emerald-200" disabled={processing === s.id} onClick={() => handleApprove(s.id, s.name || "Staff")}>
                                  {processing === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Approve</>}
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 hover:bg-red-50 border-red-200" disabled={processing === s.id} onClick={() => handleReject(s.id, s.name || "Staff")}>
                                  <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                                </Button>
                              </>
                            ) : s.approvalStatus === "approved" ? (
                              <>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleToggle(s.id, s.isActive, s.name || "Staff")}><Power className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={() => handleDelete(s.id, s.name || "Staff")}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </>
                            ) : null}
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
