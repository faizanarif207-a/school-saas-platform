// src/app/school/fees/invoices/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt, Sparkles, Download } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatPKR, formatDate } from "@/lib/format";

type FeePlan = {
  id: string;
  title: string;
  amount: number;
  class: { id: string; name: string } | null;
};

type Invoice = {
  id: string;
  amount: number;
  month: string | null;
  dueDate: string;
  status: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    fatherName: string | null;
  };
  enrollment: {
    section: { name: string; class: { name: string } };
  };
  feePlan: { title: string } | null;
  payments: { id: string; amount: number; receiptNo: string; method: string; paidAt: string }[];
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [genForm, setGenForm] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    feePlanId: "",
  });
  const [generating, setGenerating] = useState(false);
  const [payForm, setPayForm] = useState<{ invoice: Invoice | null; amount: string; method: string; notes: string }>({
    invoice: null,
    amount: "",
    method: "cash",
    notes: "",
  });
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const [invRes, fpRes] = await Promise.all([
        fetch(`/api/school/invoices?${params.toString()}`),
        fetch("/api/school/fee-plans"),
      ]);
      const invData = await invRes.json();
      const fpData = await fpRes.json();
      setInvoices(invData.invoices || []);
      setFeePlans(fpData.feePlans || []);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGenerate() {
    if (!genForm.month || !genForm.feePlanId) {
      toast.error("Month and fee plan are required");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/school/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(genForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Generated ${data.created} invoices (${data.skipped} already existed)`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setGenerating(false);
    }
  }

  async function openPayment(inv: Invoice) {
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    const remaining = inv.amount - paid;
    setPayForm({ invoice: inv, amount: remaining.toString(), method: "cash", notes: "" });
  }

  async function handlePayment() {
    if (!payForm.invoice || !payForm.amount) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/school/invoices/${payForm.invoice.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseInt(payForm.amount, 10),
          method: payForm.method,
          notes: payForm.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Payment recorded · Receipt ${data.payment.receiptNo}`);
      setPayForm({ invoice: null, amount: "", method: "cash", notes: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setPaying(false);
    }
  }

  function openReceipt(inv: Invoice, paymentId: string) {
    window.open(`/api/school/invoices/${inv.id}/receipt?paymentId=${paymentId}`, "_blank");
  }

  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.reduce(
    (s, i) => s + i.payments.reduce((sp, p) => sp + p.amount, 0),
    0
  );
  const pending = totalAmount - totalPaid;

  const statusConfig = {
    paid: { label: "Paid", class: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900" },
    unpaid: { label: "Unpaid", class: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700" },
    partial: { label: "Partial", class: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900" },
    overdue: { label: "Overdue", class: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900" },
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate monthly invoices and record payments.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-xs uppercase font-bold text-muted-foreground">Total Invoiced</div>
            <div className="text-xl font-bold mt-1 font-mono">{formatPKR(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-xs uppercase font-bold text-muted-foreground">Collected</div>
            <div className="text-xl font-bold mt-1 text-emerald-600 font-mono">{formatPKR(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-xs uppercase font-bold text-muted-foreground">Pending</div>
            <div className="text-xl font-bold mt-1 text-amber-600 font-mono">{formatPKR(pending)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Generate invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Monthly Invoices
          </CardTitle>
          <CardDescription>
            Bulk-create invoices for all students of a fee plan&apos;s class.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="month" className="text-xs">Month</Label>
              <Input
                id="month"
                type="month"
                value={genForm.month}
                onChange={(e) => setGenForm({ ...genForm, month: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feePlan" className="text-xs">Fee Plan</Label>
              <Select
                value={genForm.feePlanId}
                onValueChange={(v) => setGenForm({ ...genForm, feePlanId: v })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {feePlans.map((fp) => (
                    <SelectItem key={fp.id} value={fp.id}>
                      {fp.title} ({fp.class?.name || "All"}) — {formatPKR(fp.amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating || !genForm.feePlanId}
              className="h-10"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-1.5" />Generate</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoices {loading ? "" : `(${invoices.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Receipt className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <div className="text-sm font-medium">No invoices found</div>
              <p className="text-xs text-muted-foreground mt-1">
                Generate invoices using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-semibold px-6 py-3">Student</th>
                    <th className="text-left font-semibold px-6 py-3">Class</th>
                    <th className="text-right font-semibold px-6 py-3">Amount</th>
                    <th className="text-right font-semibold px-6 py-3">Paid</th>
                    <th className="text-left font-semibold px-6 py-3">Due</th>
                    <th className="text-left font-semibold px-6 py-3">Status</th>
                    <th className="text-right font-semibold px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
                    const sc = statusConfig[inv.status as keyof typeof statusConfig] || statusConfig.unpaid;
                    return (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-6 py-3.5">
                          <div className="font-semibold">{inv.student.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {inv.feePlan?.title || "Fee"} · {inv.month && formatDate(inv.month)}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-xs">
                          {inv.enrollment.section.class.name}-{inv.enrollment.section.name}
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono">
                          {formatPKR(inv.amount)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono text-emerald-600">
                          {formatPKR(paid)}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-muted-foreground">
                          {formatDate(inv.dueDate)}
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge variant="outline" className={`text-xs ${sc.class}`}>
                            {sc.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-right space-x-2">
                          {inv.status !== "paid" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openPayment(inv)}
                              className="h-7 text-xs"
                            >
                              Pay
                            </Button>
                          )}
                          {inv.payments.length > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openReceipt(inv, inv.payments[0].id)}
                              className="h-7 text-xs text-primary"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Receipt
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

      {/* Payment dialog */}
      <Dialog
        open={!!payForm.invoice}
        onOpenChange={(open) => !open && setPayForm({ invoice: null, amount: "", method: "cash", notes: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {payForm.invoice && (
                <>
                  {payForm.invoice.student.name} · {payForm.invoice.feePlan?.title} · {payForm.invoice.month && formatDate(payForm.invoice.month)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {payForm.invoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/30">
                <div>
                  <div className="text-xs text-muted-foreground">Invoice</div>
                  <div className="font-mono font-semibold">{formatPKR(payForm.invoice.amount)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Already Paid</div>
                  <div className="font-mono font-semibold text-emerald-600">
                    {formatPKR(payForm.invoice.payments.reduce((s, p) => s + p.amount, 0))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                  <div className="font-mono font-semibold text-amber-600">
                    {formatPKR(payForm.invoice.amount - payForm.invoice.payments.reduce((s, p) => s + p.amount, 0))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="payAmount" className="text-xs">Amount (PKR)</Label>
                  <Input
                    id="payAmount"
                    type="number"
                    value={payForm.amount}
                    onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payMethod" className="text-xs">Method</Label>
                  <Select
                    value={payForm.method}
                    onValueChange={(v) => setPayForm({ ...payForm, method: v })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="jazzcash">JazzCash</SelectItem>
                      <SelectItem value="easypaisa">Easypaisa</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payNotes" className="text-xs">Notes (optional)</Label>
                <Input
                  id="payNotes"
                  placeholder="Reference / cheque no."
                  value={payForm.notes}
                  onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayForm({ invoice: null, amount: "", method: "cash", notes: "" })}
            >
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={paying || !payForm.amount}>
              {paying ? (
                <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Recording...</>
              ) : (
                "Record & Generate Receipt"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
