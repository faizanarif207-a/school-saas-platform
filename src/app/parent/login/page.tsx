// src/app/parent/login/page.tsx
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
import { Loader2, ArrowLeft, User, UserPlus } from "lucide-react";

export default function ParentLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // Signup form
  const [signupForm, setSignupForm] = useState({
    admissionId: "",
    studentDob: "",
    parentName: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.role === "PARENT" && data?.user?.schoolId) {
          router.push("/parent");
        }
      })
      .catch(() => {});
  }, [router]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      if (data.user?.role !== "PARENT") {
        setError("This login is for Parents only.");
        await fetch("/api/auth/logout", { method: "POST" });
        setLoading(false);
        return;
      }
      router.push("/parent");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parent/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }
      // Auto-login after signup
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupForm.email, password: signupForm.password }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        router.push("/parent");
        router.refresh();
      } else {
        setError("Account created. Please login.");
        setMode("login");
        setLoginForm({ email: signupForm.email, password: "" });
      }
    } catch {
      setError("Network error");
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
              <ArrowLeft className="h-3 w-3" />
              Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <div className="mb-2 text-xs uppercase tracking-[0.14em] font-bold text-primary flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Parent Portal
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {mode === "login" ? "Sign in" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Access your child's attendance, fees, and results."
                : "Verify your child's details to create an account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    required
                    autoFocus
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                    className="h-11"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Sign In"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setError(null); }}
                    className="text-primary hover:underline font-semibold"
                  >
                    Sign up
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admissionId">Child&apos;s Admission ID</Label>
                  <Input
                    id="admissionId"
                    placeholder="e.g., BEA-LAH-2026-0014"
                    value={signupForm.admissionId}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, admissionId: e.target.value })
                    }
                    required
                    autoFocus
                    className="h-11 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentDob">Child&apos;s Date of Birth</Label>
                  <Input
                    id="studentDob"
                    type="date"
                    value={signupForm.studentDob}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, studentDob: e.target.value })
                    }
                    required
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Your Name</Label>
                    <Input
                      id="parentName"
                      placeholder="Hassan Mahmood"
                      value={signupForm.parentName}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, parentName: e.target.value })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+92 300 1234567"
                      value={signupForm.phone}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, phone: e.target.value })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupForm.email}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, email: e.target.value })
                    }
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="Min 8 characters"
                    value={signupForm.password}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, password: e.target.value })
                    }
                    required
                    minLength={8}
                    className="h-11"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(null); }}
                    className="text-primary hover:underline font-semibold"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {mode === "login" && (
              <div className="mt-6 p-3 rounded-lg bg-accent border border-border text-xs text-accent-foreground">
                <div className="font-semibold mb-1">Demo Parent</div>
                <div className="font-mono">
                  Email: <strong>hassan@example.com</strong>
                  <br />
                  Password: <strong>parent123</strong>
                </div>
                <div className="mt-2 text-muted-foreground">
                  Ali Hassan&apos;s father (Class 5-A, Beaconhouse Lahore)
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border bg-card py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Engineering Digital Excellence</span>
          <span>© 2026 Emerson Technology</span>
        </div>
      </footer>
    </div>
  );
}
