// src/app/admin/plans/page.tsx
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, TrendingUp, Building2 } from "lucide-react";
import { formatPKR } from "@/lib/format";

export default async function PlansPage() {
  const plans = await db.platformPlan.findMany({
    orderBy: { monthlyPrice: "asc" },
    include: { schools: { select: { id: true, status: true } } },
  });

  const featuredSlug = "growth"; // Most Popular badge

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pricing Plans</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Subscription tiers for schools. Configure limits and features per
          plan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const features: string[] = (() => {
            try {
              const f = JSON.parse(plan.features);
              const modules = (f.modules || []) as string[];
              const labels: Record<string, string> = {
                students: "Student Management",
                attendance: "Attendance Tracking",
                fees: "Fees & Invoicing",
                receipts: "PDF Receipts",
                exams: "Exams & Results",
                results: "Result Cards",
                parent_portal: "Parent Portal",
                sms: "SMS Notifications",
                crm: "Admission CRM",
                payroll: "HR & Payroll",
                multi_campus: "Multi-Campus",
                biometric: "Biometric Attendance",
                library: "Library Management",
                transport: "Transport Tracking",
                canteen_pos: "Canteen POS",
                online_payments: "Online Payments",
                white_label: "White-label Branding",
                dedicated_support: "Dedicated Support",
                all: "All features unlocked",
              };
              return modules.map((m) => labels[m] || m.replace(/_/g, " "));
            } catch {
              return [];
            }
          })();

          const isFeatured = plan.slug === featuredSlug;
          const activeSchools = plan.schools.filter(
            (s) => s.status === "active"
          ).length;
          const totalSchools = plan.schools.length;
          const monthlyRevenue = activeSchools * plan.monthlyPrice;

          return (
            <Card
              key={plan.id}
              className={
                isFeatured
                  ? "relative border-primary shadow-md"
                  : "relative"
              }
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>
                  {plan.slug === "starter" && "Small schools getting started"}
                  {plan.slug === "growth" && "Growing schools with full features"}
                  {plan.slug === "pro" && "Established multi-campus schools"}
                  {plan.slug === "enterprise" && "Custom needs & large networks"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      {formatPKR(plan.monthlyPrice)}
                    </span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {plan.studentLimit > 0
                      ? `Up to ${plan.studentLimit} students`
                      : "Unlimited students"}
                  </div>
                </div>

                {/* Usage */}
                <div className="space-y-1.5 pt-2 border-t">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Schools on this plan
                    </span>
                    <span className="font-semibold font-mono">
                      {totalSchools}
                      {totalSchools > 0 && (
                        <span className="text-emerald-600 ml-1">
                          ({activeSchools} ✓)
                      </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Monthly revenue
                    </span>
                    <span className="font-semibold font-mono">
                      {formatPKR(monthlyRevenue)}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="pt-3 border-t space-y-1.5">
                  {features.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">
                      No features defined.
                    </div>
                  ) : (
                    features.slice(0, 8).map((f) => (
                      <div
                        key={f}
                        className="flex items-start gap-2 text-xs"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </div>
                    ))
                  )}
                  {features.length > 8 && (
                    <div className="text-xs text-muted-foreground pl-5">
                      +{features.length - 8} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-accent border-accent-foreground/10">
        <CardContent className="pt-5">
          <div className="text-sm text-accent-foreground">
            <strong>Tip:</strong> Plan configurations (price, limits, features)
            are stored in the database. Changes here would require an admin
            update form (planned for Phase 2). For now, plans are managed via
            database seed.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
