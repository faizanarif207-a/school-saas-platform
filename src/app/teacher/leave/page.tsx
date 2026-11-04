// src/app/teacher/leave/page.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CalendarClock, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatDate } from "@/lib/format";

type LeaveRequest = {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: string;
  approverComment: string | null;
  createdAt: string;
};

export default function TeacherLeavePage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    type: "casual",
    reason: "",
  });

  async function loadLeaves() {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/leave");
      const data = await res.json();
      setLeaves(data.leaves || []);
    } catch {
      toast.error("Failed to load leaves");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setError("All fields are required");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date must be on or after start date");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Leave request submitted to Principal");
      setForm({ startDate: "", endDate: "", type: "casual", reason: "" });
      await loadLeaves();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  const statusConfig = {
    pending: { label: "Pending", icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-200" },
    approved: { label: "Approved", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rejected: { label: "Rejected", icon: XCircle, color: "bg-red-50 text-red-700 border-red-200" },
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Apply Leave</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Submit leave requests to your Principal for approval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Apply form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              New Leave Request
            </CardTitle>
            <CardDescription>Submit a leave application</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Leave Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="maternity">Maternity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Brief reason for leave..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={submitting} className="w-full h-11">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Past leaves */}
        <Card>
          <CardHeader>
            <CardTitle>My Leave History</CardTitle>
            <CardDescription>{loading ? "Loading..." : `${leaves.length} requests`}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : leaves.length === 0 ? (
              <div className="text-center py-12">
                <CalendarClock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <div className="text-sm font-medium">No leave requests yet</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Submit your first request using the form on the left.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaves.map((l) => {
                  const sc = statusConfig[l.status as keyof typeof statusConfig] || statusConfig.pending;
                  const Icon = sc.icon;
                  return (
                    <div key={l.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-sm capitalize">{l.type} leave</div>
                        <Badge variant="outline" className={`text-xs ${sc.color}`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {sc.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {formatDate(l.startDate)} → {formatDate(l.endDate)}
                      </div>
                      <p className="text-sm text-foreground mb-1">{l.reason}</p>
                      {l.approverComment && (
                        <div className="text-xs text-muted-foreground italic mt-2 pt-2 border-t">
                          Principal: &ldquo;{l.approverComment}&rdquo;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
