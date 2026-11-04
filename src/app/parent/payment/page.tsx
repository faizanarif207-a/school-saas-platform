// src/app/parent/payment/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatPKR } from "@/lib/format";

export default function ParentPaymentPage() {
  const router = useRouter();
  const params = useSearchParams();
  const invoiceId = params.get("invoiceId");
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState("jazzcash");

  useEffect(() => {
    if (!invoiceId) { router.push("/parent/fees"); return; }
    fetch(`/api/parent/fees?invoiceId=${invoiceId}`)
      .then((r) => r.json())
      .then((data) => { if (data.invoice) setInvoice(data.invoice); else { toast.error("Invoice not found"); router.push("/parent/fees"); } })
      .catch(() => toast.error("Failed"))
      .finally(() => setLoading(false));
  }, [invoiceId, router]);

  async function handlePayment() {
    setPaying(true);
    try {
      const res = await fetch("/api/parent/pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceId, method }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Payment successful! Receipt generated.");
      setTimeout(() => router.push("/parent/fees"), 2000);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Payment failed"); }
    finally { setPaying(false); }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  const balance = invoice ? invoice.amount - (invoice.paid || 0) : 0;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <Toaster richColors position="top-right" />
      <div><h1 className="text-2xl font-bold tracking-tight">Pay Fees Online</h1><p className="text-sm text-muted-foreground mt-1">Secure payment via JazzCash or Easypaisa.</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" />Payment Summary</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Student</span><span className="font-semibold">{invoice?.studentName}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Fee Title</span><span>{invoice?.feeTitle}</span></div>
          <div className="border-t pt-3 flex justify-between"><span className="font-semibold">Balance Due</span><span className="font-bold text-lg text-amber-600 font-mono">{formatPKR(balance)}</span></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5 text-primary" />Select Method</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[{k:"jazzcash",l:"JazzCash",c:"red"},{k:"easypaisa",l:"Easypaisa",c:"green"},{k:"bank",l:"Bank Transfer",c:"blue"}].map(m => (
            <div key={m.k} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${method === m.k ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`} onClick={() => setMethod(m.k)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg bg-${m.c}-500/10 flex items-center justify-center font-bold text-${m.c}-600`}>{m.l.charAt(0)}</div><div><div className="font-semibold">{m.l}</div><div className="text-xs text-muted-foreground">Pay with {m.l}</div></div></div>
                {method === m.k && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Button onClick={handlePayment} disabled={paying || balance <= 0} size="lg" className="w-full h-12 text-base font-semibold">
        {paying ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : `Pay ${formatPKR(balance)}`}
      </Button>
      <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
        <CardContent className="pt-4 flex items-start gap-3"><AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /><div className="text-xs text-amber-700 dark:text-amber-500"><strong>Demo Mode:</strong> Online payment gateway integration will redirect to {method} in production. After successful payment, invoice auto-updates and receipt becomes available.</div></CardContent>
      </Card>
    </div>
  );
}
