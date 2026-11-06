// src/app/unified-login/page.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmersonLogo } from "@/components/emerson-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          redirectBasedOnRole(data.user.role, data.user.subRole, router);
        }
      })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      redirectBasedOnRole(data.user.role, data.user.subRole, router);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <EmersonLogo size={26} variant="light" />
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />

        <Card className="w-full max-w-md shadow-2xl relative z-10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Sign in to your account</CardTitle>
            <CardDescription>Enter your credentials — we'll take you to the right dashboard automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
              </div>
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold">
                {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</>) : (<>Sign In<ArrowRight className="h-4 w-4 ml-2" /></>)}
              </Button>
            </form>

            <div className="mt-6 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Demo Accounts (Click to fill)</div>
              {[
                { label: "👑 Super Admin", email: "admin@schoolsaas.pk", password: "admin123" },
                { label: "🏫 School Owner", email: "admin@beaconhouse.edu.pk", password: "school123" },
                { label: "🎓 Principal", email: "principal@beaconhouse.edu.pk", password: "principal123" },
                { label: "💰 Accountant", email: "accountant@beaconhouse.edu.pk", password: "accountant123" },
                { label: "📋 Admission", email: "admission@beaconhouse.edu.pk", password: "admission123" },
                { label: "👩‍🏫 Teacher", email: "sana@beaconhouse.edu.pk", password: "teacher123" },
                { label: "👨‍👩‍👧 Parent", email: "hassan@example.com", password: "parent123" },
                { label: "🧑‍🎓 Student", email: "ali@beaconhouse.edu.pk", password: "student123" },
              ].map((acc) => (
                <button key={acc.email} onClick={() => { setEmail(acc.email); setPassword(acc.password); }} className="w-full text-left p-2 rounded-lg border bg-card hover:border-primary/30 hover:bg-muted/30 transition-all text-xs flex items-center justify-between group">
                  <span className="font-medium">{acc.label}</span>
                  <span className="text-muted-foreground font-mono group-hover:text-primary transition-colors">{acc.email}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border bg-card py-4 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Engineering Digital Excellence</span>
          <span>© 2026 Emerson Technology</span>
        </div>
      </footer>
    </div>
  );
}

function redirectBasedOnRole(role: string, subRole: string | null, router: ReturnType<typeof useRouter>) {
  switch (role) {
    case "SUPER_ADMIN": router.push("/admin"); break;
    case "SCHOOL_ADMIN":
      if (subRole === "PRINCIPAL") router.push("/school/principal");
      else if (subRole === "ACCOUNTANT") router.push("/school/accountant");
      else if (subRole === "ADMISSION") router.push("/school/admission");
      else router.push("/school");
      break;
    case "TEACHER": router.push("/teacher"); break;
    case "PARENT": router.push("/parent"); break;
    case "STUDENT": router.push("/student"); break;
    default: router.push("/");
  }
  router.refresh();
}
