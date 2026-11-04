// src/app/contact/page.tsx
"use client";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Loader2, Send, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@emersontechnology.com", sub: "We reply within 24 hours" },
  { icon: Phone, label: "Phone", value: "+92 300 1234567", sub: "Mon-Fri, 9am - 6pm PKT" },
  { icon: MapPin, label: "Office", value: "Lahore, Pakistan", sub: "Remote-first, serve globally" },
];

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", school: "", phone: "", planInterest: "growth", message: "" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Message sent! We'll be in touch within 24 hours.");
      setSubmitted(true);
      setForm({ name: "", email: "", school: "", phone: "", planInterest: "growth", message: "" });
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to send message"); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster richColors position="top-right" />
      <SiteHeader />
      <main className="flex-1">
        <section className="py-16 lg:py-20 bg-gradient-to-b from-accent/30 to-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-3"><MessageSquare className="h-3 w-3 mr-1" />Contact</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Let&apos;s talk</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">Book a free strategy call, demo request, ya koi bhi sawal — hum aap ke saath 24 hours mein zaroor raabt karenge.</p>
          </div>
        </section>
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {contactInfo.map((info) => {
                  const Icon = info.icon;
                  return (<Card key={info.label}><CardContent className="pt-5 pb-5"><div className="flex items-start gap-4"><div className="p-3 rounded-xl bg-primary/10 shrink-0"><Icon className="h-5 w-5 text-primary" /></div><div><div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{info.label}</div><div className="font-semibold">{info.value}</div><div className="text-xs text-muted-foreground mt-1">{info.sub}</div></div></div></CardContent></Card>);
                })}
              </div>
              <Card className="lg:col-span-3">
                <CardHeader><CardTitle>Send us a message</CardTitle><CardDescription>Fill the form, hum aap ko email/phone pe reply karenge.</CardDescription></CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="h-8 w-8 text-emerald-600" /></div>
                      <h3 className="font-semibold text-lg mb-2">Message sent!</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">Thanks for reaching out. Hamari team 24 hours mein aap se raabt karegi.</p>
                      <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>Send another message</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="name">Your Name <span className="text-red-500">*</span></Label><Input id="name" placeholder="Ayesha Khan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="h-11" /></div>
                        <div className="space-y-2"><Label htmlFor="email">Email <span className="text-red-500">*</span></Label><Input id="email" type="email" placeholder="you@school.edu.pk" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="h-11" /></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="school">School Name</Label><Input id="school" placeholder="Beaconhouse School System" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} className="h-11" /></div>
                        <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" placeholder="+92 300 1234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11" /></div>
                      </div>
                      <div className="space-y-2"><Label htmlFor="plan">Plan interested in</Label>
                        <Select value={form.planInterest} onValueChange={(v) => setForm({ ...form, planInterest: v })}>
                          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="starter">Starter (PKR 5K/mo · 300 students)</SelectItem><SelectItem value="growth">Growth (PKR 11K/mo · 800 students)</SelectItem><SelectItem value="pro">Pro (PKR 22K/mo · 2,000 students)</SelectItem><SelectItem value="enterprise">Enterprise (Custom)</SelectItem><SelectItem value="not_sure">Not sure yet</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label htmlFor="message">Message <span className="text-red-500">*</span></Label><Textarea id="message" placeholder="Tell us about your school..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} /></div>
                      <Button type="submit" disabled={submitting} className="w-full h-11 text-base font-semibold">{submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : <><Send className="h-4 w-4 mr-2" />Send Message</>}</Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
