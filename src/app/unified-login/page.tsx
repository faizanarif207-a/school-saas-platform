// src/app/unified-login/page.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Crown,
  Building2,
  GraduationCap,
  Calculator,
  ClipboardList,
  BookOpen,
  Users,
  School,
  Check,
  Sparkles,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Role catalog — used both for picker cards and redirect logic
// ─────────────────────────────────────────────────────────────
type RoleKey =
  | "SUPER_ADMIN"
  | "SCHOOL_OWNER"
  | "PRINCIPAL"
  | "ACCOUNTANT"
  | "ADMISSION"
  | "TEACHER"
  | "PARENT"
  | "STUDENT";

const ROLES: Array<{
  key: RoleKey;
  label: string;
  desc: string;
  icon: typeof Crown;
  gradient: string;
  emoji: string;
  demoEmail: string;
  demoPassword: string;
  redirectPath: string;
}> = [
  {
    key: "SUPER_ADMIN",
    label: "Super Admin",
    desc: "Platform owner — manages all schools, plans, billing.",
    icon: Crown,
    gradient: "from-amber-500 to-orange-600",
    emoji: "👑",
    demoEmail: "admin@schoolsaas.pk",
    demoPassword: "admin123",
    redirectPath: "/admin",
  },
  {
    key: "SCHOOL_OWNER",
    label: "School Owner",
    desc: "Multi-branch owner — invites staff, approves requests.",
    icon: Building2,
    gradient: "from-blue-600 to-indigo-700",
    emoji: "🏫",
    demoEmail: "admin@beaconhouse.edu.pk",
    demoPassword: "school123",
    redirectPath: "/school",
  },
  {
    key: "PRINCIPAL",
    label: "Principal",
    desc: "Branch head — leaves, attendance, teacher performance.",
    icon: School,
    gradient: "from-purple-600 to-fuchsia-700",
    emoji: "🎓",
    demoEmail: "principal@beaconhouse.edu.pk",
    demoPassword: "principal123",
    redirectPath: "/school/principal",
  },
  {
    key: "ACCOUNTANT",
    label: "Accountant",
    desc: "Fees, invoices, receipts, defaulter reports.",
    icon: Calculator,
    gradient: "from-amber-600 to-yellow-700",
    emoji: "💰",
    demoEmail: "accountant@beaconhouse.edu.pk",
    demoPassword: "accountant123",
    redirectPath: "/school/accountant",
  },
  {
    key: "ADMISSION",
    label: "Admission Officer",
    desc: "New inquiries, follow-ups, admission funnel.",
    icon: ClipboardList,
    gradient: "from-sky-600 to-blue-700",
    emoji: "📋",
    demoEmail: "admission@beaconhouse.edu.pk",
    demoPassword: "admission123",
    redirectPath: "/school/admission",
  },
  {
    key: "TEACHER",
    label: "Teacher",
    desc: "Attendance, marks, homework, leave requests.",
    icon: BookOpen,
    gradient: "from-cyan-600 to-teal-700",
    emoji: "👩‍🏫",
    demoEmail: "sana@beaconhouse.edu.pk",
    demoPassword: "teacher123",
    redirectPath: "/teacher",
  },
  {
    key: "PARENT",
    label: "Parent",
    desc: "Child's attendance, results, fees, leave requests.",
    icon: Users,
    gradient: "from-emerald-600 to-green-700",
    emoji: "👨‍👩‍👧",
    demoEmail: "hassan@example.com",
    demoPassword: "parent123",
    redirectPath: "/parent",
  },
  {
    key: "STUDENT",
    label: "Student",
    desc: "Class 6+ — own attendance, results, homework.",
    icon: GraduationCap,
    gradient: "from-rose-600 to-pink-700",
    emoji: "🧑‍🎓",
    demoEmail: "ali@beaconhouse.edu.pk",
    demoPassword: "student123",
    redirectPath: "/student",
  },
];

// ─────────────────────────────────────────────────────────────
// Animation variants — tuned for smooth, clear transitions
// ─────────────────────────────────────────────────────────────
const stepVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 40 : -40,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -40 : 40,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] as const },
  }),
};

const cardContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0); // 0 = role picker, 1 = login form
  const [direction, setDirection] = useState(1);
  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if already logged in
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

  function selectRole(role: RoleKey) {
    const roleData = ROLES.find((r) => r.key === role)!;
    setSelectedRole(role);
    setEmail(roleData.demoEmail);
    setPassword(roleData.demoPassword);
    setError(null);
    setDirection(1);
    setStep(1);
  }

  function goBackToRoles() {
    setDirection(-1);
    setStep(0);
    setError(null);
  }

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

  const selectedRoleData = ROLES.find((r) => r.key === selectedRole);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── HEADER ─── */}
      <header className="border-b border-border bg-card relative z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <EmersonLogo size={26} variant="light" />
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Ambient gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/20" />
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        />

        <div className="w-full max-w-2xl relative z-10">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ─────────────────────────────────────────────── */}
            {/* STEP 0 — ROLE PICKER                          */}
            {/* ─────────────────────────────────────────────── */}
            {step === 0 && (
              <motion.div
                key="step-0"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <Card className="shadow-2xl overflow-hidden">
                  <CardHeader className="text-center pb-4">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mx-auto mb-3"
                    >
                      <Sparkles className="h-3 w-3" /> Choose Your Role
                    </motion.div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                      Who are you signing in as?
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base mt-2">
                      Pick your role below — we'll take you to the right dashboard.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2 pb-6">
                    <motion.div
                      variants={cardContainer}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                    >
                      {ROLES.map((role) => {
                        const Icon = role.icon;
                        return (
                          <motion.button
                            key={role.key}
                            variants={cardItem}
                            onClick={() => selectRole(role.key)}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative text-left rounded-xl border border-border bg-card hover:border-transparent hover:shadow-lg transition-shadow p-4 focus:outline-none focus:ring-2 focus:ring-primary/40"
                          >
                            {/* Gradient header strip */}
                            <div
                              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${role.gradient} rounded-t-xl opacity-70 group-hover:opacity-100 transition-opacity`}
                            />
                            <div
                              className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${role.gradient} text-white shadow-sm`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="text-sm font-semibold text-foreground">
                              {role.label}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                              {role.desc}
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>

                    <div className="mt-6 pt-4 border-t border-border text-center">
                      <p className="text-xs text-muted-foreground">
                        Don't have an account?{" "}
                        <Link
                          href="/request-access"
                          className="text-primary font-semibold hover:underline"
                        >
                          Request access →
                        </Link>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ─────────────────────────────────────────────── */}
            {/* STEP 1 — LOGIN FORM                           */}
            {/* ─────────────────────────────────────────────── */}
            {step === 1 && selectedRoleData && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <Card className="w-full max-w-md mx-auto shadow-2xl">
                  {/* Gradient role banner */}
                  <div
                    className={`relative h-2 bg-gradient-to-r ${selectedRoleData.gradient} rounded-t-xl`}
                  />
                  <CardHeader className="space-y-3">
                    <button
                      onClick={goBackToRoles}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-3 w-3" /> Change role
                    </button>
                    <div className="flex items-center gap-3">
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${selectedRoleData.gradient} text-white shadow-md`}
                      >
                        <selectedRoleData.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold tracking-tight">
                          {selectedRoleData.label} Sign In
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {selectedRoleData.desc}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
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
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In as {selectedRoleData.label}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Demo credentials hint — pre-filled */}
                    <div className="mt-5 p-3 rounded-lg bg-muted/40 border border-border">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <div className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            Demo credentials pre-filled.
                          </span>{" "}
                          Just click <span className="font-semibold">Sign In</span>{" "}
                          to enter the {selectedRoleData.label} dashboard.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border bg-card py-4 relative z-20">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Engineering Digital Excellence</span>
          <span>© 2026 Emerson Technology</span>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Redirect helper — matches role + subRole to the right dashboard
// ─────────────────────────────────────────────────────────────
function redirectBasedOnRole(
  role: string,
  subRole: string | null,
  router: ReturnType<typeof useRouter>
) {
  switch (role) {
    case "SUPER_ADMIN":
      router.push("/admin");
      break;
    case "SCHOOL_ADMIN":
      if (subRole === "PRINCIPAL") router.push("/school/principal");
      else if (subRole === "ACCOUNTANT") router.push("/school/accountant");
      else if (subRole === "ADMISSION") router.push("/school/admission");
      else router.push("/school");
      break;
    case "TEACHER":
      router.push("/teacher");
      break;
    case "PARENT":
      router.push("/parent");
      break;
    case "STUDENT":
      router.push("/student");
      break;
    default:
      router.push("/");
  }
  router.refresh();
}
