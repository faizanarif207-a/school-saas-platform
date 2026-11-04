// src/app/features/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Users, CalendarCheck, Wallet, Receipt, Building2, ShieldCheck,
  Bell, FileText, Sparkles, CheckCircle2, ArrowRight, ChevronDown,
  TrendingUp, GraduationCap, MessageSquare, BarChart3,
} from "lucide-react";

const featureCategories = [
  {
    title: "Student Management",
    icon: Users,
    color: "blue",
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    accent: "blue",
    summary: "Complete student lifecycle — from admission to graduation.",
    features: [
      { title: "Online Admission Form", desc: "Streamlined digital admission with photo upload and document management." },
      { title: "Guardian Records", desc: "Track parent and guardian contact information with relationship types." },
      { title: "Annual Enrollment", desc: "Enroll students per academic year with automatic class promotion." },
      { title: "Auto Roll Numbers", desc: "System assigns roll numbers automatically per section." },
      { title: "Bulk Excel Import", desc: "Import hundreds of students via Excel in one click." },
      { title: "Advanced Search", desc: "Find students by name, Admission ID, or parent phone number." },
      { title: "Status Tracking", desc: "Track active, graduated, transferred, and inactive students." },
    ],
  },
  {
    title: "Attendance System",
    icon: CalendarCheck,
    color: "emerald",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    accent: "emerald",
    summary: "Fast, accurate daily attendance with real-time parent notifications.",
    features: [
      { title: "Class-Wise Marking", desc: "Mark Present, Absent, or Late for each student in seconds." },
      { title: "One-Tap All Present", desc: "Quickly mark the entire class present with a single tap." },
      { title: "Attendance History", desc: "Per-student day-by-day attendance history with status colors." },
      { title: "Monthly Summaries", desc: "Automatic monthly attendance percentage per student." },
      { title: "Below-Threshold Alerts", desc: "Automatic alerts for students below 80% attendance." },
      { title: "Teacher Dashboard", desc: "Teachers see their daily timetable and pending tasks." },
      { title: "Audit Trail", desc: "Every attendance mark is logged with teacher and timestamp." },
    ],
  },
  {
    title: "Fees & Invoicing",
    icon: Wallet,
    color: "amber",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    accent: "amber",
    summary: "Comprehensive fee management with flexible payment options.",
    features: [
      { title: "Flexible Fee Plans", desc: "Create monthly, quarterly, annual, or one-time fee plans per class." },
      { title: "Bulk Invoice Generation", desc: "Generate invoices for an entire class in one click." },
      { title: "Multiple Payment Methods", desc: "Accept cash, bank transfer, JazzCash, Easypaisa, and cheques." },
      { title: "Partial Payments", desc: "Record partial payments with automatic status updates." },
      { title: "Auto Receipt Numbers", desc: "System generates unique receipt numbers per branch." },
      { title: "Status Filters", desc: "Filter invoices by unpaid, partial, paid, or overdue status." },
      { title: "Defaulters Report", desc: "Identify and follow up with fee defaulters by class." },
      { title: "Monthly Collection Trends", desc: "Track fee collection performance over time." },
    ],
  },
  {
    title: "Branded Receipts",
    icon: Receipt,
    color: "purple",
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    accent: "purple",
    summary: "Professional, printable receipts that build trust with parents.",
    features: [
      { title: "Institution Branding", desc: "Receipts display your institution name and logo with Emerson branding." },
      { title: "Print-Ready Format", desc: "Open in any browser and print or save as PDF instantly." },
      { title: "Complete Details", desc: "Student name, class, fee title, month, payment method, and amounts." },
      { title: "Unique Receipt Number", desc: "Every receipt has a trackable, unique reference number." },
      { title: "One-Click Download", desc: "Download receipt immediately after recording payment." },
      { title: "Duplicate Prevention", desc: "Audit logs ensure no duplicate receipts are generated." },
    ],
  },
  {
    title: "Multi-Branch Management",
    icon: Building2,
    color: "cyan",
    gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    accent: "cyan",
    summary: "Manage multiple campuses from a single dashboard.",
    features: [
      { title: "Unlimited Branches", desc: "Create as many campuses as your institution needs (plan-based)." },
      { title: "Per-Branch Isolation", desc: "Each branch has its own principal, staff, and student data." },
      { title: "Owner Dashboard", desc: "Institution owners see aggregated data across all branches." },
      { title: "Database-Level Security", desc: "Branch data isolation enforced at the database layer." },
      { title: "Quick Branch Switching", desc: "Switch between branch views with a single click." },
      { title: "Per-Branch Fee Plans", desc: "Set different fee structures for each campus." },
    ],
  },
  {
    title: "Security & Data Protection",
    icon: ShieldCheck,
    color: "rose",
    gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    accent: "rose",
    summary: "Enterprise-grade security with full audit trails.",
    features: [
      { title: "Row-Level Security", desc: "Database-level tenant isolation prevents cross-institution data access." },
      { title: "JWT Authentication", desc: "Secure, token-based sessions with 7-day expiry." },
      { title: "Role-Based Access", desc: "Every API call checks user role and permissions server-side." },
      { title: "Complete Audit Log", desc: "Every action is recorded — who did what, when." },
      { title: "Account Suspension", desc: "Suspended institutions immediately lose all access." },
      { title: "Daily Encrypted Backups", desc: "Automated daily backups with encryption." },
    ],
  },
  {
    title: "Communication & Notifications",
    icon: Bell,
    color: "amber",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    accent: "amber",
    summary: "Keep parents and staff informed with automated notifications.",
    features: [
      { title: "Notice Board", desc: "Post school-wide or class-specific announcements visible to parents." },
      { title: "SMS Notifications", desc: "Automatic SMS for absences, fee reminders, and announcements." },
      { title: "WhatsApp Integration", desc: "Send notices and reminders via WhatsApp Business API." },
      { title: "Email Invitations", desc: "Staff and parents receive branded invitation emails." },
      { title: "Automated Reminders", desc: "Configurable reminder schedule for fee due dates." },
    ],
  },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    color: "blue",
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    accent: "blue",
    summary: "Data-driven insights for better decision-making.",
    features: [
      { title: "Excel Exports", desc: "Export students, attendance, fees, and defaulters to Excel." },
      { title: "PDF Reports", desc: "Branded PDF reports for class summaries and monthly collections." },
      { title: "Class-Wise Analytics", desc: "Attendance rates, fee collection, and performance per class." },
      { title: "Teacher Performance", desc: "Track attendance marking discipline and marks entry rates." },
      { title: "Admission Funnel", desc: "Track conversion from inquiry to enrolled student." },
      { title: "Platform-Level Stats", desc: "Institution owners see MRR, churn, and growth metrics." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden py-20 lg:py-28">
          {/* Gradient background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/15" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
          </div>
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-primary/5 border-primary/20">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span className="font-semibold">Features</span>
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
              Everything your institution needs,{" "}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                in one platform
              </span>
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              From admission to graduation, manage every aspect of your institution — students, fees, attendance, exams, parents, and staff.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing" className="group">
                <Button size="lg" className="text-base font-semibold px-8 h-14 group-hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-base px-8 h-14 hover:bg-muted/50 hover:border-primary/30 transition-all">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ FEATURE SECTIONS ═══ */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-20">
            {featureCategories.map((category, idx) => {
              const Icon = category.icon;
              const isReversed = idx % 2 === 1;
              return (
                <div key={category.title} id={category.title.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-20">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`p-4 rounded-2xl ${category.iconBg} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">{category.title}</h2>
                      <p className="text-muted-foreground mt-1">{category.summary}</p>
                    </div>
                  </div>

                  {/* Feature Cards Grid */}
                  <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isReversed ? "lg:flex-row-reverse" : ""}`}>
                    {/* Summary Card — spans 1 col */}
                    <div className="lg:col-span-1">
                      <Card className={`relative overflow-hidden h-full border-2 border-${category.accent}-500/20 hover:border-${category.accent}-500/50 transition-all duration-300 hover:shadow-xl`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-50`} />
                        <CardContent className="pt-6 relative">
                          <div className={`p-4 rounded-2xl ${category.iconBg} w-fit mb-4`}>
                            <Icon className="h-10 w-10" />
                          </div>
                          <h3 className="font-bold text-xl mb-2">{category.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{category.summary}</p>
                          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <span>{category.features.length} capabilities</span>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Feature Items — spans 2 cols */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {category.features.map((feature, i) => (
                        <div
                          key={feature.title}
                          className="group p-5 rounded-xl border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                          style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.05}s both` }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${category.iconBg} shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                {feature.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {feature.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ PARENT PORTAL HIGHLIGHT ═══ */}
        <section className="py-20 bg-gradient-to-b from-accent/20 via-background to-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-pink-500/5 border-pink-500/20">
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-pink-600 dark:text-pink-400" />
                  <span className="font-semibold">Parent Portal</span>
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  Keep parents in the loop
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  Parents get their own portal with real-time access to their child's attendance, fees, results, and school notices.
                </p>
                <ul className="space-y-3">
                  {[
                    "Multi-child support for parents with multiple children",
                    "Online fee payment with JazzCash, Easypaisa, or bank transfer",
                    "Downloadable PDF receipts for every payment",
                    "Day-by-day attendance calendar with color-coded status",
                    "School-wide and class-specific notice board",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Visual representation */}
              <div className="relative">
                <Card className="relative overflow-hidden border-2 border-pink-500/20 hover:border-pink-500/40 transition-all hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10" />
                  <CardContent className="pt-6 relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-pink-500/10">
                        <GraduationCap className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <div className="font-bold">Parent Dashboard</div>
                        <div className="text-xs text-muted-foreground">Multi-child · Real-time · Secure</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Attendance", value: "94%", color: "text-emerald-500" },
                        { label: "Pending Fees", value: "PKR 4.5K", color: "text-amber-500" },
                        { label: "Latest Result", value: "82%", color: "text-primary" },
                      ].map((stat) => (
                        <div key={stat.label} className="p-3 rounded-lg bg-muted/50 text-center">
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                          <div className={`text-lg font-bold mt-1 ${stat.color}`}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      {["Attendance Calendar", "Fee Payment + Receipts", "Notices & Announcements"].map((item) => (
                        <div key={item} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Try every feature free for 30 days
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              No credit card required. Setup in 10 minutes. Cancel anytime.
            </p>
            <Link href="/pricing" className="group inline-block mt-8">
              <Button size="lg" className="text-base font-semibold px-8 h-14 group-hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                Get Started
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
