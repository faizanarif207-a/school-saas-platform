// src/app/api/admission/funnel/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stages = ["inquired", "visit", "form", "interview", "admitted", "lost"];
  const counts: Record<string, number> = {};

  for (const stage of stages) {
    const count = await db.inquiry.count({
      where: { schoolId: user.schoolId, stage },
    });
    counts[stage] = count;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // Source breakdown
  const sources = await db.inquiry.groupBy({
    by: ["source"],
    where: { schoolId: user.schoolId },
    _count: { id: true },
  });

  return NextResponse.json({
    funnel: {
      stages,
      counts,
      total,
    },
    sources: sources.map((s) => ({ source: s.source, count: s._count.id })),
  });
}
