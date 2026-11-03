// src/app/school/students/new/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Save, User } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type ClassType = {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
};

export default function AddStudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    dob: "",
    gender: "male",
    contact: "",
    address: "",
    sectionId: "",
    rollNo: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelation: "father",
  });

  useEffect(() => {
    fetch("/api/school/classes")
      .then((r) => r.json())
      .then((data) => {
        setClasses(data.classes || []);
      })
      .finally(() => setLoadingClasses(false));
  }, []);

  const availableSections =
    classes.find((c) =>
      c.sections.some((s) => s.id === form.sectionId)
    )?.sections || [];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Student name is required");
      return;
    }
    if (!form.sectionId) {
      setError("Section is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/school/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Student "${form.name}" admitted successfully`);
      router.push("/school/students");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add student");
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Toaster richColors position="top-right" />
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/school/students">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to students
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add New Student</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Admit a new student. Roll number will auto-assign if left blank.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Student Details
            </CardTitle>
            <CardDescription>Personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Student Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Ali Hassan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father&apos;s Name</Label>
                <Input
                  id="fatherName"
                  placeholder="e.g., Hassan Mahmood"
                  value={form.fatherName}
                  onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact (optional)</Label>
                <Input
                  id="contact"
                  placeholder="+92 300 1234567"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (optional)</Label>
              <Input
                id="address"
                placeholder="House #, Street, Area"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="h-11"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Enrollment
            </CardTitle>
            <CardDescription>
              Class section for current academic year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sectionId">
                  Section <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.sectionId}
                  onValueChange={(v) => setForm({ ...form, sectionId: v })}
                  required
                >
                  <SelectTrigger className="h-11">
                    <SelectValue
                      placeholder={
                        loadingClasses
                          ? "Loading..."
                          : availableSections.length > 0
                          ? "Select section"
                          : "Setup classes first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) =>
                      c.sections.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {c.name}-{s.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNo">Roll No (optional)</Label>
                <Input
                  id="rollNo"
                  type="number"
                  placeholder="Auto-assign"
                  value={form.rollNo}
                  onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Guardian / Parent
            </CardTitle>
            <CardDescription>
              Primary contact for messages &amp; notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guardianName">Guardian Name</Label>
                <Input
                  id="guardianName"
                  placeholder="Father / Mother name"
                  value={form.guardianName}
                  onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianPhone">Phone</Label>
                <Input
                  id="guardianPhone"
                  placeholder="+92 300 1234567"
                  value={form.guardianPhone}
                  onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianRelation">Relation</Label>
                <Select
                  value={form.guardianRelation}
                  onValueChange={(v) => setForm({ ...form, guardianRelation: v })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="guardian">Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/school/students">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Admitting...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                Admit Student
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
