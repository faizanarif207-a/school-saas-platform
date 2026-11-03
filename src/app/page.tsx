// src/app/page.tsx — Marketing home page (public)
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EmersonMark } from "@/components/emerson-logo";
import { getSession } from "@/lib/auth";
import {
  Users,
  CalendarCheck,
  Wallet,
  Receipt,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Star,
  Quote,
  Zap,
} from "lucide-react";

export default async function HomePage() {
  // If user is logged in, redirect to their dashboard
  const user = await getSession();
  if (user?.role === "SUPER_ADMIN") redirect("/admin");
  if (user?.role === "SCHOOL_ADMIN" && user.schoolId) redirect("/school");
  if (user?.role === "TEACHER" && user.schoolId) redirect("/teacher");
  if (user?.role === "PARENT" && user.schoolId) redirect("/parent");
  if (user?.role === "STUDENT" && user.schoolId) redirect("/student");

  const features = [
    {
      icon: Users,
      title: "Student Management",
      desc: "Admit, enroll, track students across classes & sections. Parent portal included.",
    },
    {
      icon: CalendarCheck,
      title: "Daily Attendance",
      desc: "Mark class-wise attendance in seconds. Late/absent reports auto-generated.",
    },
    {
      icon: Wallet,
      title: "Fees & Invoicing",
      desc: "Bulk-generate monthly invoices. Accept cash, bank, JazzCash, Easypaisa.",
    },
    {
      icon: Receipt,
      title: "PDF Receipts",
      desc: "Branded printable receipts with one click. Schools trust the paper trail.",
    },
    {
      icon: GraduationCap,
      title: "Multi-Branch",
      desc: "One owner, many branches. Per-branch principal & accountant isolation.",
    },
    {
      icon: ShieldCheck,
      title: "Tenant Isolation",
      desc: "RLS-enforced at database level. Your school's data is never visible to others.",
    },
  ];

  const pricing = [
    {
      name: "Starter",
      price: "5,000",
      students: "300 students",
      features: ["Students & attendance", "Fees & receipts", "Basic reports"],
      featured: false,
    },
    {
      name: "Growth",
      price: "11,000",
      students: "800 students",
      features: ["Everything in Starter", "Exams & results", "Parent portal", "SMS alerts"],
      featured: true,
    },
    {
      name: "Pro",
      price: "22,000",
      students: "2,000 students",
      features: ["Everything in Growth", "Multi-branch", "HR & payroll", "Admission CRM"],
      featured: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      students: "Unlimited",
      features: ["Everything in Pro", "White-label", "Dedicated support", "Custom dev"],
      featured: false,
    },
  ];

  const testimonials = [
    {
      name: "Ayesha Khan",
      role: "Principal, Beaconhouse Lahore",
      quote: "We replaced 3 different tools with SchoolSaaS. Fee collection time cut by 60%.",
      rating: 5,
    },
    {
      name: "Imran Sheikh",
      role: "Accountant, The City School",
      quote: "PDF receipts in one click. Parents love the WhatsApp payment confirmations.",
      rating: 5,
    },
    {
      name: "Sana Mir",
      role: "Parent",
      quote: "I see my daughter's attendance on my phone every evening. No more surprise PTMs.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-accent-foreground/10 text-xs font-semibold text-accent-foreground mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Trusted by 500+ schools across 3 continents</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
                School Management,{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Simplified.
                </span>
              </h1>

              <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Manage students, fees, attendance, and parents — all in one
                platform. Projects on time, on budget. Built for Pakistani
                schools by Emerson Technology.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <Link href="/pricing">
                    Start 30-day Free Trial
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/features">See Features</Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Setup in 10 minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground mt-1">Schools onboarded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-emerald-600">4.9★</div>
                <div className="text-sm text-muted-foreground mt-1">Client rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-amber-600">98%</div>
                <div className="text-sm text-muted-foreground mt-1">On-time delivery</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-foreground">PKR 4M+</div>
                <div className="text-sm text-muted-foreground mt-1">Fees collected/month</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-3">
                <Zap className="h-3 w-3 mr-1" /> Features
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Everything your school needs,{" "}
                <span className="text-primary">in one place</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Stop juggling 5 different tools. SchoolSaaS brings it all together.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="hover:border-primary/30 hover:shadow-md transition-all">
                    <CardContent className="pt-6">
                      <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing preview */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-accent/30 to-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-3">
                <Wallet className="h-3 w-3 mr-1" /> Pricing
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Plans that grow with your school
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Start free for 30 days. No setup fee. Cancel anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricing.map((plan) => (
                <Card key={plan.name} className={plan.featured ? "relative border-primary shadow-md" : "relative"}>
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground gap-1">
                        <Sparkles className="h-3 w-3" /> Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <div className="font-semibold text-lg mb-1">{plan.name}</div>
                    <div className="text-xs text-muted-foreground mb-4">{plan.students}</div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-bold">
                        {plan.price === "Custom" ? "Custom" : `PKR ${plan.price}`}
                      </span>
                      {plan.price !== "Custom" && <span className="text-xs text-muted-foreground">/mo</span>}
                    </div>
                    <ul className="mt-5 space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-6" variant={plan.featured ? "default" : "outline"} asChild>
                      <Link href="/pricing">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 lg:py-28 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-3">
                <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" /> Testimonials
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Schools love SchoolSaaS</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <Card key={t.name}>
                  <CardContent className="pt-6">
                    <Quote className="h-8 w-8 text-primary/20 mb-3" />
                    <p className="text-foreground leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-10 lg:p-16">
              <div className="absolute top-0 right-0 opacity-10">
                <EmersonMark size={300} />
              </div>
              <div className="relative max-w-2xl">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Ready to digitize your school?</h2>
                <p className="mt-4 text-lg opacity-90">
                  Join 500+ schools already managing on SchoolSaaS. 30-day free trial — no credit card.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/pricing">
                      Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild
                    className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <Link href="/contact">Book a Demo</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
