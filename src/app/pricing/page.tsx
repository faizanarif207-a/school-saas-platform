// src/app/pricing/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPKR } from "@/lib/format";
import { Check, X, Sparkles, Wallet, ArrowRight, HelpCircle, Calendar, Users, Building2 } from "lucide-react";

const tiers = [
  { name: "Starter", price: 5000, students: "300 students", setupFee: "PKR 15,000", features: [
    { label: "Student Management", included: true },
    { label: "Daily Attendance", included: true },
    { label: "Fees & Invoicing", included: true },
    { label: "PDF Receipts", included: true },
    { label: "Up to 5 staff logins", included: true },
    { label: "Excel Exports", included: true },
    { label: "Exams & Results", included: false },
    { label: "Parent Portal", included: false },
    { label: "SMS Notifications", included: false },
    { label: "Multi-Branch", included: false },
    { label: "Admission CRM", included: false },
    { label: "HR & Payroll", included: false },
  ], featured: false, color: "blue" },
  { name: "Growth", price: 11000, students: "800 students", setupFee: "PKR 20,000", features: [
    { label: "Student Management", included: true },
    { label: "Daily Attendance", included: true },
    { label: "Fees & Invoicing", included: true },
    { label: "PDF Receipts", included: true },
    { label: "Up to 20 staff logins", included: true },
    { label: "Excel Exports", included: true },
    { label: "Exams & Results", included: true },
    { label: "Parent Portal", included: true },
    { label: "SMS Notifications", included: true },
    { label: "Multi-Branch", included: false },
    { label: "Admission CRM", included: false },
    { label: "HR & Payroll", included: false },
  ], featured: true, color: "emerald" },
  { name: "Pro", price: 22000, students: "2,000 students", setupFee: "PKR 25,000", features: [
    { label: "Student Management", included: true },
    { label: "Daily Attendance", included: true },
    { label: "Fees & Invoicing", included: true },
    { label: "PDF Receipts", included: true },
    { label: "Unlimited staff logins", included: true },
    { label: "Excel Exports", included: true },
    { label: "Exams & Results", included: true },
    { label: "Parent Portal", included: true },
    { label: "SMS Notifications", included: true },
    { label: "Multi-Branch", included: true },
    { label: "Admission CRM", included: true },
    { label: "HR & Payroll", included: true },
  ], featured: false, color: "amber" },
  { name: "Enterprise", price: null, students: "Unlimited", setupFee: "Custom", features: [
    { label: "Student Management", included: true },
    { label: "Daily Attendance", included: true },
    { label: "Fees & Invoicing", included: true },
    { label: "PDF Receipts", included: true },
    { label: "Unlimited staff logins", included: true },
    { label: "Excel Exports", included: true },
    { label: "Exams & Results", included: true },
    { label: "Parent Portal", included: true },
    { label: "SMS Notifications", included: true },
    { label: "Multi-Branch", included: true },
    { label: "Admission CRM", included: true },
    { label: "HR & Payroll", included: true },
  ], featured: false, color: "purple" },
];

const extras = [
  { name: "Setup Fee", desc: "One-time, covers data migration, training, and initial configuration.", icon: Calendar },
  { name: "Extra Students", desc: "PKR 15-25 per extra student per month beyond plan limit. Auto-billed.", icon: Users },
  { name: "Extra Branch", desc: "PKR 3,000-6,000 per additional branch per month (Pro plan onwards).", icon: Building2 },
  { name: "SMS / WhatsApp", desc: "Pass-through rate + 10-15% margin. Charged per message bundle, not per student.", icon: Wallet },
];

const faqs = [
  { q: "Is a credit card required for the 30-day free trial?", a: "No. The trial starts without any credit card. At the end of the trial, you choose a plan or your account goes into read-only mode — no charges." },
  { q: "What happens if we exceed the student limit on our plan?", a: "Auto-billing kicks in at PKR 15-25 per extra student per month. You never need to manually upgrade. This applies to Growth and Pro plans." },
  { q: "Can we change plans at any time?", a: "Yes. Upgrading takes effect immediately. Downgrading takes effect at the next billing cycle. Your data is always preserved." },
  { q: "What is the Founder's Price?", a: "The first 10-20 institutions get a lifetime price lock. Your monthly rate is locked forever — even if we increase prices in the future." },
  { q: "Is there a referral program?", a: "Yes. If you refer another institution that signs up, you get 1 month of free subscription — no questions asked." },
  { q: "How is data privacy ensured?", a: "Row-Level Security (RLS) is enforced at the database level. Your institution's data is never visible to any other institution — this is guaranteed at the database query level, not just the UI." },
  { q: "What happens if we cancel?", a: "Go to Settings and cancel. Your account stays in read-only mode for 30 days for data export, then is permanently deleted. No hidden charges." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 lg:py-24">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/15" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
          </div>
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-amber-500/5 border-amber-500/20">
              <Wallet className="h-3.5 w-3.5 mr-1.5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold">Pricing</span>
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Transparent pricing,{" "}
              <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">no surprises</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your institution today. Upgrade or downgrade anytime — no lock-in, no hidden fees.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-sm font-semibold">
              <Check className="h-4 w-4" />
              30-day free trial · No credit card · Cancel anytime
            </div>
          </div>
        </section>

        {/* Tiers */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((tier, i) => (
                <div key={tier.name} style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
                  <Card className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl h-full ${tier.featured ? "border-primary shadow-lg shadow-primary/10 lg:scale-105" : "hover:border-primary/30"}`}>
                    {tier.featured && (
                      <>
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-cyan-500" />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-primary to-blue-500 text-white border-0 px-3 py-1 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      </>
                    )}
                    <CardContent className="pt-6">
                      <div className="font-bold text-lg mb-1">{tier.name}</div>
                      <div className="text-xs text-muted-foreground mb-5">{tier.students}</div>
                      <div className="flex items-baseline gap-1 mb-1">
                        {tier.price !== null ? (
                          <>
                            <span className="text-4xl font-bold">{formatPKR(tier.price)}</span>
                            <span className="text-xs text-muted-foreground">/mo</span>
                          </>
                        ) : (
                          <span className="text-4xl font-bold">Custom</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-5">Setup: {tier.setupFee}</div>
                      <Link href="/contact" className="block mb-6">
                        <Button className={`w-full ${tier.featured ? "shadow-md shadow-primary/20" : ""}`} variant={tier.featured ? "default" : "outline"}>
                          Get Started
                        </Button>
                      </Link>
                      <ul className="space-y-2.5 text-sm">
                        {tier.features.map((f) => (
                          <li key={f.label} className="flex items-start gap-2.5">
                            {f.included ? (
                              <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/30 shrink-0 mt-0.5" />
                            )}
                            <span className={f.included ? "text-foreground" : "text-muted-foreground/60"}>{f.label}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Extra charges */}
        <section className="py-16 bg-gradient-to-b from-card via-background to-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-center mb-3">Additional charges (transparent)</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">These are pass-through or per-usage costs — no hidden margins.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {extras.map((extra, i) => {
                const Icon = extra.icon;
                return (
                  <div key={extra.name} style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.08}s both` }}>
                    <Card className="hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 h-full">
                      <CardContent className="pt-5">
                        <div className="p-3 rounded-xl bg-primary/10 w-fit mb-3">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-1">{extra.name}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{extra.desc}</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 px-4 py-1.5 bg-primary/5 border-primary/20">
                <HelpCircle className="h-3.5 w-3.5 mr-1.5 text-primary" />
                <span className="font-semibold">FAQ</span>
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={faq.q} style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.05}s both` }}>
                  <Card className="hover:border-primary/30 hover:shadow-md transition-all duration-300">
                    <CardContent className="pt-5 pb-5">
                      <h3 className="font-semibold mb-2 flex items-start gap-2">
                        <span className="text-primary font-mono text-xs mt-1">Q</span>
                        {faq.q}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                        <span className="text-emerald-500 font-mono text-xs mt-1">A</span>
                        {faq.a}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Still deciding? Book a free demo</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Our team will walk you through SchoolSaaS in 30 minutes — no commitment required.</p>
            <Link href="/contact" className="group inline-block mt-8">
              <Button size="lg" className="text-base font-semibold px-8 h-14 group-hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                Book a Free Demo
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
