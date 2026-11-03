// src/app/school/fees/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Wallet, Receipt, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatPKR } from "@/lib/format";

type ClassType = { id: string; name: string };
type FeePlan = {
  id: string;
  title: string;
  amount: number;
  frequency: string;
  class: ClassType | null;
};

export default function FeePlansPage() {
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    classId: "",
    title: "",
    amount: "",
    frequency: "monthly",
  });
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fpRes, clsRes] = await Promise.all([
        fetch("/api/school/fee-plans"),
        fetch("/api/school/classes"),
      ]);
      const fpData = await fpRes.json();
      const clsData = await clsRes.json();
      setFeePlans(fpData.feePlans || []);
      const cls = clsData.classes || [];
      setClasses(cls.map((c: ClassType & { sections: unknown[] }) => ({ id: c.id, name: c.name })));
    } catch {
      toast.error("Failed to load fee plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    if (!form.title.trim() || !form.amount || !form.frequency) {
      toast.error("Title, amount, and frequency are required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/school/fee-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Fee plan created");
      setForm({ classId: "", title: "", amount: "", frequency: "monthly" });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fee Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure fee structures per class.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/school/fees/invoices">
            <Receipt className="h-4 w-4 mr-1.5" />
            Invoices
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add fee plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              New Fee Plan
            </CardTitle>
            <CardDescription>Create a fee structure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Monthly Tuition"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs">Amount (PKR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="4500"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classId" className="text-xs">Class (optional)</Label>
              <Select
                value={form.classId || "all"}
                onValueChange={(v) => setForm({ ...form, classId: v === "all" ? "" : v })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-xs">Frequency</Label>
              <Select
                value={form.frequency}
                onValueChange={(v) => setForm({ ...form, frequency: v })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one_time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} disabled={adding} className="w-full">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Plan"}
            </Button>
          </CardContent>
        </Card>

        {/* Existing fee plans */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Existing Plans
            </CardTitle>
            <CardDescription>{loading ? "..." : `${feePlans.length} plans`}</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : feePlans.length === 0 ? (
              <div className="text-center py-12 px-6 text-sm text-muted-foreground">
                No fee plans yet. Create one using the form on the left.
              </div>
            ) : (
              <div className="divide-y">
                {feePlans.map((fp) => (
                  <div key={fp.id} className="p-4 hover:bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{fp.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {fp.class ? fp.class.name : "All classes"} · {fp.frequency}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-lg">
                          {formatPKR(fp.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per {fp.frequency === "one_time" ? "one-time" : fp.frequency.replace("ly", "")}
                        </div>
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
