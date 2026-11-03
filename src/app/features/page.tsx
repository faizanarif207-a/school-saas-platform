// src/app/features/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Users, CalendarCheck, Wallet, Receipt, GraduationCap, ShieldCheck, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

const features = [
  { icon: Users, title: "Student Management", items: ["Online admission form", "Father/guardian record", "Enrollment per academic year", "Roll number auto-assignment", "Excel bulk import", "Search by name or Admission ID", "Status tracking: active, graduated, left"] },
  { icon: CalendarCheck, title: "Attendance", items: ["Daily class-wise marking", "Present/Absent/Late buttons", "One-click Mark All Present", "Monthly summary per student", "Auto SMS to parents on absence", "24-hour edit window", "Audit log: who marked, when"] },
  { icon: Wallet, title: "Fees & Invoicing", items: ["Fee plans per class", "Bulk-generate monthly invoices", "Cash/Bank/JazzCash/Easypaisa", "Partial payments supported", "Auto receipt number", "Status filters", "Defaulters report by class"] },
  { icon: Receipt, title: "PDF Receipts", items: ["Branded Emerson receipts", "Print-ready HTML", "Student name, class, fee, method", "Receipt number tracking", "One-click download", "Duplicate protection (audit log)"] },
  { icon: GraduationCap, title: "Multi-Branch", items: ["One owner, many branches", "Per-branch principal", "School-level aggregated reports", "school_id + branch_id isolation", "Owner switches branches", "Per-branch fee plans"] },
  { icon: ShieldCheck, title: "Tenant Isolation", items: ["RLS at database level", "school_id on every row", "JWT session auth (7-day)", "Server-side role check on API", "Audit log for all actions", "Suspended schools lose access", "Daily encrypted backups"] },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-accent/30 to-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-4"><Sparkles className="h-3 w-3 mr-1" />Features</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
              Built for <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Pakistani schools</span>, by Emerson Technology
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">Every feature your school needs to digitize operations.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild><Link href="/pricing">Start Free Trial<ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/contact">Book a Demo</Link></Button>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <Card className="lg:col-span-1"><CardContent className="pt-6"><div className="p-3 rounded-xl bg-primary/10 w-fit mb-4"><Icon className="h-8 w-8 text-primary" /></div><h2 className="text-2xl font-bold tracking-tight">{f.title}</h2><p className="mt-2 text-sm text-muted-foreground">{f.items.length} capabilities</p></CardContent></Card>
                  <div className="lg:col-span-2 space-y-3">
                    {f.items.map((item, i) => (<div key={i} className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:border-primary/30 transition-colors"><CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span className="text-sm text-foreground">{item}</span></div>))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
