// src/app/pricing/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPKR } from "@/lib/format";
import { Check, X, Sparkles, Wallet, ArrowRight, HelpCircle } from "lucide-react";

const tiers = [
  { name: "Starter", price: 5000, students: "300 students", setupFee: "PKR 15,000", features: [{ label: "Students & Attendance", included: true }, { label: "Fees & Receipts", included: true }, { label: "Up to 5 staff logins", included: true }, { label: "Excel exports", included: true }, { label: "Exams & Results", included: false }, { label: "Parent Portal", included: false }, { label: "SMS Notifications", included: false }, { label: "Multi-Branch", included: false }], featured: false },
  { name: "Growth", price: 11000, students: "800 students", setupFee: "PKR 20,000", features: [{ label: "Students & Attendance", included: true }, { label: "Fees & Receipts", included: true }, { label: "Up to 20 staff logins", included: true }, { label: "Excel exports", included: true }, { label: "Exams & Results", included: true }, { label: "Parent Portal", included: true }, { label: "SMS Notifications", included: true }, { label: "Multi-Branch", included: false }], featured: true },
  { name: "Pro", price: 22000, students: "2,000 students", setupFee: "PKR 25,000", features: [{ label: "Students & Attendance", included: true }, { label: "Fees & Receipts", included: true }, { label: "Unlimited staff logins", included: true }, { label: "Excel exports", included: true }, { label: "Exams & Results", included: true }, { label: "Parent Portal", included: true }, { label: "SMS Notifications", included: true }, { label: "Multi-Branch", included: true }], featured: false },
  { name: "Enterprise", price: null, students: "Unlimited", setupFee: "Custom", features: [{ label: "Students & Attendance", included: true }, { label: "Fees & Receipts", included: true }, { label: "Unlimited staff logins", included: true }, { label: "Excel exports", included: true }, { label: "Exams & Results", included: true }, { label: "Parent Portal", included: true }, { label: "SMS Notifications", included: true }, { label: "Multi-Branch", included: true }], featured: false },
];

const faqs = [
  { q: "Kya 30-day free trial mein credit card chahiye?", a: "Nahi, bilkul nahi. Trial bina credit card ke shuru hoti hai." },
  { q: "Agar students ki tadad plan limit se zyada ho jaye?", a: "Auto-billing ho jayegi — har extra student par PKR 15-25/month." },
  { q: "Kya main kabhi bhi plan change kar sakta hoon?", a: "Haan, kabhi bhi. Upgrade instant, downgrade next cycle mein." },
  { q: "Founder's price kya hai?", a: "Pehle 10-20 schools ke liye lifetime price lock diya jayega." },
  { q: "Referral reward kya hai?", a: "Agar aap koi school refer karte hain aur woh sign up karta hai, to 1 month free." },
  { q: "Data privacy kaisa ensure hota hai?", a: "RLS database level pe enforce hota hai. Cross-school data impossible." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-accent/30 to-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-4"><Wallet className="h-3 w-3 mr-1" />Pricing</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Transparent pricing, <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">no surprises</span></h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">Pick the plan that fits your school size. Cancel anytime.</p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold"><Check className="h-4 w-4" />30-day free trial · No credit card · Cancel anytime</div>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((tier) => (
                <Card key={tier.name} className={tier.featured ? "relative border-primary shadow-md lg:scale-105" : "relative"}>
                  {tier.featured && (<div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-primary text-primary-foreground gap-1"><Sparkles className="h-3 w-3" />Most Popular</Badge></div>)}
                  <CardContent className="pt-6">
                    <div className="font-bold text-lg mb-1">{tier.name}</div>
                    <div className="text-xs text-muted-foreground mb-5">{tier.students}</div>
                    <div className="flex items-baseline gap-1 mb-1">{tier.price !== null ? (<><span className="text-3xl font-bold">{formatPKR(tier.price)}</span><span className="text-xs text-muted-foreground">/mo</span></>) : (<span className="text-3xl font-bold">Custom</span>)}</div>
                    <div className="text-xs text-muted-foreground mb-5">Setup: {tier.setupFee}</div>
                    <Button className="w-full mb-6" variant={tier.featured ? "default" : "outline"} asChild><Link href="/contact">Get Started</Link></Button>
                    <ul className="space-y-2 text-sm">{tier.features.map((f) => (<li key={f.label} className="flex items-start gap-2">{f.included ? <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> : <X className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />}<span className={f.included ? "" : "text-muted-foreground/70"}>{f.label}</span></li>))}</ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10"><Badge variant="outline" className="mb-3"><HelpCircle className="h-3 w-3 mr-1" />FAQ</Badge><h2 className="text-3xl font-bold tracking-tight">Aap ke sawal, hamare jawab</h2></div>
            <div className="space-y-3">{faqs.map((faq) => (<Card key={faq.q}><CardContent className="pt-5 pb-5"><h3 className="font-semibold mb-2">{faq.q}</h3><p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p></CardContent></Card>))}</div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
