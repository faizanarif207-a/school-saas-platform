// src/app/about/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EmersonMark } from "@/components/emerson-logo";
import { Sparkles, Heart, CheckCircle2, Target, ArrowRight, Building2 } from "lucide-react";

const values = [
  { icon: Heart, title: "Client-Centric", desc: "We do not sell software — we partner with institutions. Every feature we ship starts from a real institution's need." },
  { icon: Sparkles, title: "Innovation", desc: "Mobile apps, biometric integration, and AI-driven insights — we keep pushing what is possible for educational institutions." },
  { icon: CheckCircle2, title: "Transparency", desc: "Clear pricing, no lock-in, open data export. The same dashboard the team sees, the client sees." },
  { icon: Target, title: "On Time, On Budget", desc: "98% on-time delivery rate across 500+ projects. We deliver what we promise, when we promise." },
];

const services = [
  "UI/UX Design — Research, wireframes, design systems",
  "Web Applications — SaaS platforms, dashboards, portals",
  "Mobile Apps — Native and cross-platform",
  "Digital Marketing — Full-funnel campaigns",
  "SEO — Technical and content optimization",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/15" />
            <div className="absolute top-0 right-0 opacity-10"><EmersonMark size={300} /></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
          </div>
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-primary/5 border-primary/20">About Us</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Engineering Digital Excellence
              </h1>
              <p className="mt-6 text-lg lg:text-xl text-muted-foreground leading-relaxed">
                Emerson Technology is a digital products company built to move businesses forward. We create mobile apps, web applications, and digital marketing solutions — from design to growth, all under one roof.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="group">
                  <Button size="lg" className="text-base font-semibold px-8 h-14 group-hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                    Get in Touch
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="lg" variant="outline" className="text-base px-8 h-14 hover:bg-muted/50 hover:border-primary/30 transition-all">
                    See Our Product
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <Badge variant="outline" className="mb-3 px-4 py-1.5 bg-emerald-500/5 border-emerald-500/20">Our Story</Badge>
            <h2 className="text-3xl font-bold tracking-tight mb-6">Why we started</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-base">
              <p>
                Emerson Technology's mission goes beyond building software — we partner with institutions to support their growth from launch to scale. We noticed that many educational institutions were stuck with paper registers and disconnected spreadsheets, while existing management solutions were either too expensive or did not understand the needs of modern schools and colleges.
              </p>
              <p>
                So we built SchoolSaaS — a complete management platform designed for educational institutions of all sizes. The Emerson brand promise is simple: <strong className="text-foreground">Projects on time, on budget.</strong> This is not just a tagline; it is how we work.
              </p>
              <p>
                We have delivered 500+ projects across 3 continents, maintaining a 4.9-star rating with 78+ partners. We are growth-focused — the work does not end at launch. Through SEO and digital marketing, we ensure our clients reach their goals.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-y border-border bg-gradient-to-r from-card via-background to-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: "500+", label: "Projects delivered", color: "text-primary" },
                { value: "4.9★", label: "Client rating", color: "text-emerald-500" },
                { value: "7+", label: "Years of expertise", color: "text-amber-500" },
                { value: "98%", label: "On-time delivery", color: "text-foreground" },
              ].map((stat, i) => (
                <div key={i} className="text-center group" style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both` }}>
                  <div className={`text-4xl font-bold ${stat.color} group-hover:scale-110 transition-transform inline-block`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="outline" className="mb-3 px-4 py-1.5 bg-purple-500/5 border-purple-500/20">
                <Heart className="h-3.5 w-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold">Our Values</span>
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">How we work</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.08}s both` }}>
                    <Card className="group hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 h-full">
                      <CardContent className="pt-6">
                        <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{v.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 bg-gradient-to-b from-card via-background to-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-3 px-4 py-1.5 bg-cyan-500/5 border-cyan-500/20">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-cyan-600 dark:text-cyan-400" />
                  <span className="font-semibold">Our Services</span>
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Five crafts, one journey</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  From UI/UX design to SEO — the same team stays with your institution from start to scale. No separate vendors, no hand-offs.
                </p>
                <ul className="space-y-3">
                  {services.map((service) => (
                    <li key={service} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Tagline", text: "We Build Digital Products That Move Business Forward." },
                  { title: "Positioning", text: "Engineering Digital Excellence." },
                  { title: "Promise", text: "Projects on time, on budget — every time." },
                ].map((item, i) => (
                  <Card key={item.title} className="hover:shadow-lg hover:border-primary/30 transition-all duration-300" style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.08}s both` }}>
                    <CardContent className="pt-5 pb-5">
                      <div className="font-semibold mb-1">{item.title}</div>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-700 text-white p-10 lg:p-16 text-center shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 opacity-10"><EmersonMark size={300} /></div>
              <div className="relative">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Let us work with your institution</h2>
                <p className="mt-4 text-lg opacity-90 max-w-xl mx-auto">Book a free strategy call — no commitments, just clarity.</p>
                <Link href="/contact" className="group inline-block mt-8">
                  <Button size="lg" variant="secondary" className="text-base font-semibold px-8 h-14 group-hover:scale-105 transition-transform shadow-lg">
                    Contact Us
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
