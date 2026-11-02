// src/app/api/plans/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const plans = await db.platformPlan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: "asc" },
    });
    return NextResponse.json({ plans });
  } catch (err) {
    console.error("[plans/list] error:", err);
    return NextResponse.json({ error: "Failed to load plans" }, { status: 500 });
  }
}
