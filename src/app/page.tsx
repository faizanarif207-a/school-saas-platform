// src/app/page.tsx — Premium Marketing Landing Page
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EmersonMark } from "@/components/emerson-logo";
import { SchoolFloatingIcons } from "@/components/floating-school-icons";
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
  Bell,
} from "lucide-react";

export default async function HomePage() {
  const user = await getSession();
  if (user?.role === "SUPER_ADMIN") redirect("/admin");
  if (user?.role === "SCHOOL_ADMIN" && user.schoolId) redirect("/school");
  if (user?.role === "TEACHER" && user.schoolId) redirect("/teacher");
  if (user?.role === "PARENT" && user.schoolId) redirect("/parent");
  if (user?.role === "STUDENT" && user.schoolId) redirect("/student");

  // ─── DATA ───
  const features = [
    { icon: Users, title: "Student Management", desc: "Admit, enroll, track students across classes & sections. Parent portal included.", gradient: "from-blue-500/20 to-blue-600/5", iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400", border: "group-hover:border-blue-400/50" },
    { icon: CalendarCheck, title: "Daily Attendance", desc: "Mark class-wise attendance in seconds. Late/absent reports auto-generated.", gradient: "from-emerald-500/20 to-emerald-600/5", iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", border: "group-hover:border-emerald-400/50" },
    { icon: Wallet, title: "Fees & Invoicing", desc: "Bulk-generate monthly invoices. Accept cash, bank, JazzCash, Easypaisa.", gradient: "from-amber-500/20 to-amber-600/5", iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", border: "group-hover:border-amber-400/50" },
    { icon: Receipt, title: "PDF Receipts", desc: "Branded printable receipts with one click. Schools trust the paper trail.", gradient: "from-purple-500/20 to-purple-600/5", iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400", border: "group-hover:border-purple-400/50" },
    { icon: GraduationCap, title: "Multi-Branch", desc: "One owner, many branches. Per-branch principal & accountant isolation.", gradient: "from-cyan-500/20 to-cyan-600/5", iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", border: "group-hover:border-cyan-400/50" },
    { icon: ShieldCheck, title: "Tenant Isolation", desc: "RLS-enforced at database level. Your school's data is never visible to others.", gradient: "from-rose-500/20 to-rose-600/5", iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400", border: "group-hover:border-rose-400/50" },
  ];

  const pricing = [
    { name: "Starter", price: "5,000", students: "300 students", features: ["Students & attendance", "Fees & receipts", "Basic reports"], featured: false, color: "blue" },
    { name: "Growth", price: "11,000", students: "800 students", features: ["Everything in Starter", "Exams & results", "Parent portal", "SMS alerts"], featured: true, color: "emerald" },
    { name: "Pro", price: "22,000", students: "2,000 students", features: ["Everything in Growth", "Multi-branch", "HR & payroll", "Admission CRM"], featured: false, color: "amber" },
    { name: "Enterprise", price: "Custom", students: "Unlimited", features: ["Everything in Pro", "White-label", "Dedicated support", "Custom dev"], featured: false, color: "purple" },
  ];

  const testimonials = [
    { name: "Ayesha Khan", role: "Principal, Beaconhouse Lahore", quote: "We replaced 3 different tools with SchoolSaaS. Fee collection time cut by 60%.", rating: 5, color: "from-blue-500 to-cyan-500" },
    { name: "Imran Sheikh", role: "Accountant, The City School", quote: "PDF receipts in one click. Parents love the WhatsApp payment confirmations.", rating: 5, color: "from-emerald-500 to-teal-500" },
    { name: "Sana Mir", role: "Parent", quote: "I see my daughter's attendance on my phone every evening. No more surprise PTMs.", rating: 5, color: "from-purple-500 to-pink-500" },
  ];

  const stats = [
    { value: "500+", label: "Schools onboarded", color: "text-primary" },
    { value: "4.9★", label: "Client rating", color: "text-emerald-500" },
    { value: "98%", label: "On-time delivery", color: "text-amber-500" },
    { value: "PKR 4M+", label: "Fees collected/month", color: "text-foreground" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* ═══ HERO SECTION ═══ */}
        <section className="relative overflow-hidden min-h-[600px] flex items-center">
          {/* Animated gradient background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-accent/20" />
            {/* Floating colored blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-pulse" style={{ animationDuration: "4s" }} />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
          </div>

          {/* Floating school icons */}
          <SchoolFloatingIcons />

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 z-10">
            <div className="max-w-4xl">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-6 animate-[fadeIn_0.5s_ease-out]">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>Trusted by 500+ schools across 3 continents</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                School Management,{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    Simplified.
                  </span>
                  {/* Underline animation */}
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-cyan-500 rounded-full" style={{ animation: "scaleIn 0.8s ease-out 0.3s both" }} />
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-8 text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Manage students, fees, attendance, and parents — all in one
                platform. Projects on time, on budget. Built by{" "}
                <span className="font-semibold text-foreground">Emerson Technology</span>.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/pricing" className="group">
                  <Button size="lg" className="text-base font-semibold px-8 h-14 group-hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                    Start 30-day Free Trial
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/features" className="group">
                  <Button size="lg" variant="outline" className="text-base px-8 h-14 group-hover:bg-muted/50 group-hover:border-primary/30 transition-all">
                    See Features
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {["No credit card required", "Setup in 10 minutes", "Cancel anytime"].map((item, i) => (
                  <span key={item} className="flex items-center gap-1.5" style={{ animation: `fadeIn 0.5s ease-out ${0.3 + i * 0.1}s both` }}>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ STATS BAR ═══ */}
        <section className="border-y border-border bg-gradient-to-r from-card via-card to-card relative overflow-hidden">
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center group" style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
                  <div className={`text-4xl lg:text-5xl font-bold ${stat.color} group-hover:scale-110 transition-transform inline-block`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </section>

        {/* ═══ FEATURES SECTION ═══ */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-30 dark:opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(0,100,200,0.05), transparent 50%), radial-gradient(circle at 80% 50%, rgba(14,158,86,0.05), transparent 50%)" }} />
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-primary/5 border-primary/20">
                <Zap className="h-3.5 w-3.5 mr-1.5 text-primary" />
                <span className="font-semibold">Features</span>
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Everything your school needs,{" "}
                <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">in one place</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Stop juggling 5 different tools. SchoolSaaS brings it all together — admissions, attendance, fees, results, parents.
              </p>
            </div>

            {/* Feature cards with gradient + hover effects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="group" style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.08}s both` }}>
                    <Card className={`relative overflow-hidden border transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl ${feature.border} h-full`}>
                      {/* Gradient background on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      <CardContent className="pt-6 relative">
                        {/* Icon with hover bounce */}
                        <div className={`p-3 rounded-xl ${feature.iconBg} w-fit mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Link href="/features" className="group inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                See all features
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ PRICING SECTION ═══ */}
        <section className="py-24 lg:py-32 bg-gradient-to-b from-accent/20 via-background to-background relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-amber-500/5 border-amber-500/20">
                <Wallet className="h-3.5 w-3.5 mr-1.5 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold">Pricing</span>
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Plans that grow with your school
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Start free for 30 days. No setup fee. Cancel anytime.
              </p>
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricing.map((plan, i) => (
                <div key={plan.name} style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
                  <Card className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl h-full ${plan.featured ? "border-primary shadow-lg shadow-primary/10 lg:scale-105" : "hover:border-primary/30"}`}>
                    {/* Featured badge */}
                    {plan.featured && (
                      <div className="absolute -top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-cyan-500" />
                    )}
                    {plan.featured && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-primary to-blue-500 text-white border-0 px-3 py-1 text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    )}
                    <CardContent className="pt-6 pb-6">
                      <div className="font-bold text-lg mb-1">{plan.name}</div>
                      <div className="text-xs text-muted-foreground mb-6">{plan.students}</div>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-4xl font-bold">
                          {plan.price === "Custom" ? "Custom" : `PKR ${plan.price}`}
                        </span>
                        {plan.price !== "Custom" && <span className="text-sm text-muted-foreground">/mo</span>}
                      </div>
                      <ul className="mt-6 space-y-3">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5 text-sm">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/pricing" className="block mt-8">
                        <Button className={`w-full ${plan.featured ? "shadow-md shadow-primary/20" : ""}`} variant={plan.featured ? "default" : "outline"}>
                          Get Started
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-emerald-500/5 border-emerald-500/20">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">How it works</span>
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Get your school online in 3 steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: "1", title: "Sign up", desc: "Pick a plan that fits your school size. Add your school name, city, contact. Get a 30-day free trial.", color: "from-blue-500 to-cyan-500", iconBg: "bg-blue-500" },
                { num: "2", title: "Set up classes", desc: "Add classes, sections, subjects. Import students via Excel or add manually. Set fee plans per class.", color: "from-emerald-500 to-teal-500", iconBg: "bg-emerald-500" },
                { num: "3", title: "Go live", desc: "Mark daily attendance. Generate monthly invoices. Send receipts. Parents get the portal link.", color: "from-amber-500 to-orange-500", iconBg: "bg-amber-500" },
              ].map((step, i) => (
                <div key={step.num} className="group relative" style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.15}s both` }}>
                  {/* Number circle */}
                  <div className={`absolute -top-2 -left-2 w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {step.num}
                  </div>
                  <Card className="pt-16 pl-6 pr-6 pb-6 group-hover:border-primary/30 group-hover:shadow-lg transition-all duration-300 h-full">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section className="py-24 lg:py-32 bg-gradient-to-b from-card via-background to-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-amber-500/5 border-amber-500/20">
                <Star className="h-3.5 w-3.5 mr-1.5 text-amber-500 fill-amber-500" />
                <span className="font-semibold">Testimonials</span>
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Schools love SchoolSaaS</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={t.name} style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
                  <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full relative overflow-hidden">
                    {/* Gradient top strip */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${t.color}`} />
                    <CardContent className="pt-6">
                      <Quote className="h-10 w-10 text-primary/20 mb-3" />
                      <p className="text-foreground leading-relaxed mb-6 text-sm">&ldquo;{t.quote}&rdquo;</p>
                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform" style={{ transitionDelay: `${j * 50}ms` }} />
                        ))}
                      </div>
                      {/* Avatar */}
                      <div className="flex items-center gap-3 pt-3 border-t">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center font-bold text-white group-hover:scale-110 transition-transform`}>
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0064C8] via-[#0A56A8] to-[#1e3a8a] text-white p-12 lg:p-20 shadow-2xl shadow-primary/20">
              {/* Decorative 3-bar logo */}
              <div className="absolute top-8 right-8 opacity-15">
                <EmersonMark size={250} />
              </div>
              {/* Animated blobs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />

              <div className="relative max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-6">
                  <Bell className="h-3.5 w-3.5" />
                  Limited Time Offer
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  Ready to digitize your school?
                </h2>
                <p className="mt-4 text-lg lg:text-xl opacity-90">
                  Join 500+ schools already managing on SchoolSaaS. Start with a
                  30-day free trial — no credit card, no setup fee, cancel anytime.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link href="/pricing" className="group">
                    <Button size="lg" variant="secondary" className="text-base font-semibold px-8 h-14 group-hover:scale-105 transition-transform shadow-lg">
                      Get Started Free
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="text-base px-8 h-14 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50 transition-all">
                      Book a Demo
                    </Button>
                  </Link>
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
