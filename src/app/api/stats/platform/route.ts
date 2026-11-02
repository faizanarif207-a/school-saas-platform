// src/app/api/stats/platform/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [schools, activeSchools, trialSchools, suspendedSchools] = await Promise.all([
      db.school.count(),
      db.school.count({ where: { status: "active" } }),
      db.school.count({ where: { status: "trial" } }),
      db.school.count({ where: { status: "suspended" } }),
    ]);

    // Active subscriptions with plan info for MRR calculation
    const activeSubs = await db.subscription.findMany({
      where: { status: "active" },
      include: { plan: true },
    });
    const mrr = activeSubs.reduce((sum, s) => sum + (s.amount || s.plan.monthlyPrice), 0);

    // Plan distribution (count by plan)
    const plansWithCounts = await db.platformPlan.findMany({
      include: {
        schools: { select: { id: true } },
      },
    });
    const planDistribution = plansWithCounts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      monthlyPrice: p.monthlyPrice,
      studentLimit: p.studentLimit,
      schoolCount: p.schools.length,
    }));

    // Trial potential MRR (if trial schools convert to their plan's price)
    const trialSchoolsData = await db.school.findMany({
      where: { status: "trial" },
      include: { plan: true },
    });
    const trialPotential = trialSchoolsData.reduce(
      (sum, s) => sum + s.plan.monthlyPrice,
      0
    );

    return NextResponse.json({
      stats: {
        totalSchools: schools,
        active: activeSchools,
        trial: trialSchools,
        suspended: suspendedSchools,
        mrr,
        trialPotential,
        // Total students across all schools (for platform metric)
        totalStudents: await db.school.aggregate({
          _sum: { studentCount: true },
        }).then((r) => r._sum.studentCount || 0),
      },
      planDistribution,
    });
  } catch (err) {
    console.error("[stats/platform] error:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
