// src/app/admin/schools/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Loader2,
  Building2,
  Pause,
  Play,
  AlertCircle,
} from "lucide-react";
import { formatPKR, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type Plan = {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  studentLimit: number;
};

type School = {
  id: string;
  name: string;
  city: string;
  email: string | null;
  phone: string | null;
  status: string;
  studentCount: number;
  createdAt: string;
  plan: Plan;
};

const STATUS_CONFIG = {
  active: {
    label: "Active",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  },
  trial: {
    label: "Trial",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  },
  suspended: {
    label: "Suspended",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
  },
  deleted: {
    label: "Deleted",
    className:
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800",
  },
} as const;

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadSchools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/schools");
      const data = await res.json();
      setSchools(data.schools || []);
    } catch {
      toast.error("Failed to load schools");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  async function handleSuspend(id: string, name: string) {
    if (!confirm(`Suspend "${name}"? They will lose access immediately.`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/schools/${id}/suspend`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${name} has been suspended`);
      await loadSchools();
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleActivate(id: string, name: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/schools/${id}/activate`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${name} has been activated`);
      await loadSchools();
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = schools.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.plan.name.toLowerCase().includes(q)
    );
  });

  const summary = {
    total: schools.length,
    active: schools.filter((s) => s.status === "active").length,
    trial: schools.filter((s) => s.status === "trial").length,
    suspended: schools.filter((s) => s.status === "suspended").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Schools</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage every school on your platform.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/schools/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Add School
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-xs uppercase font-bold text-muted-foreground">
              Total
            </div>
            <div className="text-2xl font-bold mt-1">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-xs uppercase font-bold text-muted-foreground">
              Active
            </div>
            <div className="text-2xl font-bold mt-1 text-emerald-600">
              {summary.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-xs uppercase font-bold text-muted-foreground">
              On Trial
            </div>
            <div className="text-2xl font-bold mt-1 text-blue-600">
              {summary.trial}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-xs uppercase font-bold text-muted-foreground">
              Suspended
            </div>
            <div className="text-2xl font-bold mt-1 text-red-600">
              {summary.suspended}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Schools</CardTitle>
              <CardDescription>{filtered.length} shown</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, city, plan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <div className="text-sm font-medium">No schools found</div>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                {search
                  ? "Try a different search term."
                  : "Add your first school to get started."}
              </p>
              {!search && (
                <Button asChild size="sm">
                  <Link href="/admin/schools/new">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add School
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-semibold px-6 py-3">School</th>
                    <th className="text-left font-semibold px-6 py-3">Plan</th>
                    <th className="text-right font-semibold px-6 py-3">Students</th>
                    <th className="text-left font-semibold px-6 py-3">Joined</th>
                    <th className="text-left font-semibold px-6 py-3">Status</th>
                    <th className="text-right font-semibold px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((school) => {
                    const statusInfo =
                      STATUS_CONFIG[
                        school.status as keyof typeof STATUS_CONFIG
                      ] || STATUS_CONFIG.active;
                    const isSuspended = school.status === "suspended";
                    const isLoadingThis = actionLoading === school.id;
                    return (
                      <tr
                        key={school.id}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <div className="font-semibold">{school.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {school.city}
                            {school.email && ` · ${school.email}`}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-medium">{school.plan.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatPKR(school.plan.monthlyPrice)}/mo
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">
                          {school.studentCount}
                          {school.plan.studentLimit > 0 && (
                            <span className="text-muted-foreground">
                              {" / "}
                              {school.plan.studentLimit}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground">
                          {formatDate(school.createdAt)}
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge
                            variant="outline"
                            className={`text-xs ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          {isLoadingThis ? (
                            <Loader2 className="h-4 w-4 animate-spin inline" />
                          ) : isSuspended ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() =>
                                handleActivate(school.id, school.name)
                              }
                            >
                              <Play className="h-3.5 w-3.5 mr-1" />
                              Activate
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleSuspend(school.id, school.name)
                              }
                            >
                              <Pause className="h-3.5 w-3.5 mr-1" />
                              Suspend
                            </Button>
                          )}
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

      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-400">
          <strong>Note:</strong> Suspended schools immediately lose access. Their
          data is preserved. They can be re-activated anytime.
        </div>
      </div>
    </div>
  );
}
