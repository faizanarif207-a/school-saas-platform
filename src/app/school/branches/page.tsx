// src/app/school/branches/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Building2, MapPin, Phone, Star } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type Branch = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  isMain: boolean;
  _count: { users: number; classes: number };
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", address: "", city: "", phone: "" });
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/school/branches");
      const data = await res.json();
      setBranches(data.branches || []);
    } catch {
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!form.name.trim()) { toast.error("Branch name is required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/school/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Branch "${form.name}" created`);
      setForm({ name: "", address: "", city: "", phone: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Branches</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your school's campuses and branches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />New Branch</CardTitle>
            <CardDescription>Add a new campus</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2"><Label htmlFor="bn" className="text-xs">Branch Name</Label><Input id="bn" placeholder="e.g., North Campus" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" /></div>
            <div className="space-y-2"><Label htmlFor="ba" className="text-xs">Address</Label><Input id="ba" placeholder="Street, area" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-10" /></div>
            <div className="space-y-2"><Label htmlFor="bc" className="text-xs">City</Label><Input id="bc" placeholder="Lahore" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-10" /></div>
            <div className="space-y-2"><Label htmlFor="bp" className="text-xs">Phone</Label><Input id="bp" placeholder="+92 42 111 222" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-10" /></div>
            <Button onClick={handleAdd} disabled={adding || !form.name.trim()} className="w-full">{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Branch"}</Button>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />All Branches</CardTitle>
            <CardDescription>{loading ? "..." : `${branches.length} branches`}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : branches.length === 0 ? (
              <div className="text-center py-12"><Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" /><div className="text-sm font-medium">No branches yet</div><p className="text-xs text-muted-foreground mt-1">Create your first branch.</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map((b) => (
                  <div key={b.id} className="p-4 rounded-lg border bg-card hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div className="font-semibold">{b.name}</div>
                      </div>
                      {b.isMain && <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200"><Star className="h-3 w-3 mr-1" />Main</Badge>}
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {b.address && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{b.address}{b.city && `, ${b.city}`}</div>}
                      {b.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{b.phone}</div>}
                      <div className="flex gap-3 mt-2">
                        <span>{b._count.classes} classes</span>
                        <span>{b._count.users} staff</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
