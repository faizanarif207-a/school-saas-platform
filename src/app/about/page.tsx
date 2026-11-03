// src/app/about/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EmersonMark } from "@/components/emerson-logo";
import { Sparkles, Heart, CheckCircle2, Target, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20">
          <div className="absolute top-0 right-0 opacity-10"><EmersonMark size={300} /></div>
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-4">About Us</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Engineering Digital Excellence</h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">Emerson Technology ek digital products company hai jo business ko aage le jaane ke liye banti hai. Hum mobile apps, web apps, aur digital marketing ke saath end-to-end solutions dete hain.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild><Link href="/contact">Get in Touch<ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
                <Button size="lg" variant="outline" asChild><Link href="/">See Our Product</Link></Button>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <Badge variant="outline" className="mb-3">Our Story</Badge>
            <h2 className="text-3xl font-bold tracking-tight mb-6">Hum kyun bane</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Emerson Technology ka kaam sirf software banana nahi — banane ke baad growth tak saath dena hai. Hum ne dekha ke Pakistani schools paper registers aur Excel sheets mein phanse hue hain, aur international school management software ya to bohat mehenge hain ya Urdu/parents ke context ko nahi samajhte.</p>
              <p>Hum ne SchoolSaaS banaya — Pakistani schools ke liye, Pakistani schools ke saath. Emerson brand ka vaada hai: <strong className="text-foreground">&ldquo;Projects on time, on budget.&rdquo;</strong> Yeh sirf ek line nahi, hamara kaam karne ka tareeqa hai.</p>
              <p>Hum ne 500+ projects deliver kiye hain 3 continents mein, 78+ partners ke saath 4.9★ rating maintain ki hai. Hum growth-focused hain — launch par kaam khatam nahi hota, SEO aur marketing se results tak jaate hain.</p>
            </div>
          </div>
        </section>
        <section className="py-12 border-y border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center"><div className="text-4xl font-bold text-primary">500+</div><div className="text-sm text-muted-foreground mt-1">Projects delivered</div></div>
              <div className="text-center"><div className="text-4xl font-bold text-emerald-600">4.9★</div><div className="text-sm text-muted-foreground mt-1">Client rating</div></div>
              <div className="text-center"><div className="text-4xl font-bold text-amber-600">7+</div><div className="text-sm text-muted-foreground mt-1">Saal ka craft</div></div>
              <div className="text-center"><div className="text-4xl font-bold text-foreground">98%</div><div className="text-sm text-muted-foreground mt-1">On-time delivery</div></div>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12"><Badge variant="outline" className="mb-3"><Heart className="h-3 w-3 mr-1" />Our Values</Badge><h2 className="text-3xl font-bold tracking-tight">Hum kis tarah kaam karte hain</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Heart, title: "Client-Centric", desc: "We don't sell software — we partner with schools." },
                { icon: Sparkles, title: "Innovation", desc: "Mobile apps, biometric, AI-driven insights." },
                { icon: CheckCircle2, title: "Transparency", desc: "Clear pricing, no lock-in, open data export." },
                { icon: Target, title: "On Time, On Budget", desc: "98% on-time delivery rate across 500+ projects." },
              ].map((v) => {
                const Icon = v.icon;
                return (<Card key={v.title}><CardContent className="pt-6"><div className="p-3 rounded-xl bg-primary/10 w-fit mb-4"><Icon className="h-6 w-6 text-primary" /></div><h3 className="font-semibold mb-2">{v.title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p></CardContent></Card>);
              })}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
