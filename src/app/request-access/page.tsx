// src/app/request-access/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmersonLogo } from "@/components/emerson-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2, ArrowLeft, UserPlus, CheckCircle2, ShieldCheck } from "lucide-react";

export default function RequestAccessPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", role: "TEACHER", schoolCode: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim() || !form.schoolCode.trim()) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <EmersonLogo size={26} variant="light" />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md shadow-2xl text-center">
            <CardContent className="pt-8 pb-8">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Request Submitted!</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Your access request has been sent to the school administration.
                Once approved, you will receive an email with your login credentials.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Please check your email inbox for updates.
              </p>
              <Button variant="outline" className="mt-6" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
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

        <Card className="w-full max-w-md shadow-2xl relative z-10">
          <CardHeader className="space-y-1">
            <div className="mb-2 text-xs uppercase tracking-[0.14em] font-bold text-primary flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Request Access
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Request Portal Access</CardTitle>
            <CardDescription>
              Submit your details — the school administration will review and approve your request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sana Mir"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Your Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Credentials will be sent to this email once approved.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Your Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="PARENT">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolCode">School Access Code</Label>
                <Input
                  id="schoolCode"
                  placeholder="Enter the code provided by your school"
                  value={form.schoolCode}
                  onChange={(e) => setForm({ ...form, schoolCode: e.target.value })}
                  required
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  This code is given by your school administration. Without this code, no one can request access.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Submit Access Request
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-3 rounded-lg bg-accent border border-border text-xs text-accent-foreground">
              <div className="font-semibold mb-1 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                How This Works
              </div>
              <ol className="space-y-1 pl-4 list-decimal">
                <li>Enter your name, email, and school access code</li>
                <li>School administration receives your request</li>
                <li>They review and approve (or reject) your request</li>
                <li>If approved, you receive an email with login credentials</li>
                <li>Use those credentials to access your portal</li>
              </ol>
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
