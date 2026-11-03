// src/app/admin/schools/new/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Save, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatPKR } from "@/lib/format";

type Plan = {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  studentLimit: number;
  features: string;
};

export default function AddSchoolPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    city: "",
    email: "",
    phone: "",
    address: "",
    planId: "",
    status: "trial",
  });

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        setPlans(data.plans || []);
        if (data.plans?.length > 0 && !form.planId) {
          setForm((f) => ({ ...f, planId: data.plans[1]?.id || data.plans[0].id }));
        }
      })
      .finally(() => setLoadingPlans(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.city.trim() || !form.planId) {
      setError("Name, city, and plan are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(`School "${form.name}" created successfully`);
      router.push("/admin/schools");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create school");
      setSubmitting(false);
    }
  }

  const selectedPlan = plans.find((p) => p.id === form.planId);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Toaster richColors position="top-right" />
      {/* Back link */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/admin/schools">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to schools
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add New School</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new tenant on your platform. They&apos;ll start with a 30-day
          trial by default.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              School Details
            </CardTitle>
            <CardDescription>
              This information is used for billing and contact.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  School Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Beaconhouse School System"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="e.g., Lahore"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@school.edu.pk"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+92 42 111 222 333"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (optional)</Label>
              <Input
                id="address"
                placeholder="Street, area, postal code"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan">
                  Plan <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.planId}
                  onValueChange={(v) => setForm({ ...form, planId: v })}
                  required
                >
                  <SelectTrigger className="h-11">
                    <SelectValue
                      placeholder={
                        loadingPlans ? "Loading plans..." : "Select a plan"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} — {formatPKR(plan.monthlyPrice)}/mo ·{" "}
                        {plan.studentLimit > 0
                          ? `${plan.studentLimit} students`
                          : "Unlimited"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial (30 days)</SelectItem>
                    <SelectItem value="active">Active immediately</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedPlan && (
              <div className="p-4 rounded-lg bg-accent border border-accent-foreground/10">
                <div className="font-semibold text-sm text-accent-foreground mb-2">
                  Plan Summary — {selectedPlan.name}
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Monthly Price</div>
                    <div className="font-semibold font-mono">
                      {formatPKR(selectedPlan.monthlyPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Student Limit</div>
                    <div className="font-semibold font-mono">
                      {selectedPlan.studentLimit > 0
                        ? selectedPlan.studentLimit.toLocaleString()
                        : "Unlimited"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Trial End</div>
                    <div className="font-semibold font-mono">
                      {form.status === "trial"
                        ? new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/schools">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1.5" />
                    Create School
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
