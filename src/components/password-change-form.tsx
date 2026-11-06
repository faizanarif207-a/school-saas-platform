// src/components/password-change-form.tsx
"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Password changed successfully");
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-semibold text-lg">Password Changed!</h3>
          <p className="text-sm text-muted-foreground mt-1">Your password has been updated successfully.</p>
          <Button variant="outline" className="mt-4" onClick={() => setSuccess(false)}>
            Change Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary" />Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <Input id="current" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New Password <span className="text-xs text-muted-foreground">(min 8 characters)</span></Label>
              <Input id="new" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="h-11" />
            </div>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <Button type="submit" disabled={loading} className="w-full h-11">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</> : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
