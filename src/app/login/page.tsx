// src/app/login/page.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { EmersonLogo, EmersonMark } from "@/components/emerson-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@schoolsaas.pk");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to admin
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.role === "SUPER_ADMIN") router.push("/admin");
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
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <EmersonLogo size={26} variant="light" />
          <ThemeToggle />
        </div>
      </header>

      {/* Body — split layout */}
      <main className="flex-1 grid lg:grid-cols-2">
        {/* Left — Brand panel */}
        <section className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0064C8] to-[#0A56A8] text-white relative overflow-hidden">
          {/* Decorative bars */}
          <div className="absolute top-12 right-12 opacity-20">
            <EmersonMark size={140} />
          </div>
          <div className="absolute bottom-0 left-0 w-2 h-1/3 bg-[#F5A800]" />
          <div className="absolute bottom-0 left-2 w-1.5 h-1/4 bg-[#0E9E56]" />

          <div className="relative z-10">
            <div className="text-xs uppercase tracking-[0.14em] font-bold opacity-80 mb-3">
              Emerson Technology
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-[-0.02em] max-w-md">
              We Build Digital Products That Move Business Forward
            </h1>
            <p className="mt-5 text-base opacity-90 max-w-md leading-relaxed">
              Multi-tenant school management platform. Manage schools, students,
              fees, attendance, and parents — all from one place.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3 text-sm opacity-90">
              <ShieldCheck className="h-4 w-4 text-[#F5A800]" />
              <span>Secure multi-tenant isolation (RLS enforced)</span>
            </div>
            <div className="flex items-center gap-3 text-sm opacity-90">
              <Sparkles className="h-4 w-4 text-[#F5A800]" />
              <span>Projects on time, on budget</span>
            </div>
          </div>
        </section>

        {/* Right — Login form */}
        <section className="flex items-center justify-center p-6 sm:p-12 bg-background">
          <Card className="w-full max-w-md shadow-xl border-border">
            <CardHeader className="space-y-1">
              <div className="lg:hidden mb-4">
                <EmersonLogo size={28} variant="light" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Super Admin Login
              </CardTitle>
              <CardDescription>
                Sign in to manage your schools and platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@schoolsaas.pk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-11"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 p-3 rounded-lg bg-accent border border-border text-xs text-accent-foreground">
                <div className="font-semibold mb-1">Demo Credentials</div>
                <div className="font-mono">
                  Email: <strong>admin@schoolsaas.pk</strong>
                  <br />
                  Password: <strong>admin123</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Engineering Digital Excellence</span>
          <span>© 2026 Emerson Technology</span>
        </div>
      </footer>
    </div>
  );
}
