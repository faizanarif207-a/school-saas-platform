// src/app/api/schools/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

// GET /api/schools — list all schools (Super Admin only)
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const schools = await db.school.findMany({
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ schools });
  } catch (err) {
    console.error("[schools/list] error:", err);
    return NextResponse.json({ error: "Failed to load schools" }, { status: 500 });
  }
}

// POST /api/schools — create new school (Super Admin only)
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, city, email, phone, address, planId, status } = body;

    if (!name || !city || !planId) {
      return NextResponse.json(
        { error: "Name, city, and plan are required" },
        { status: 400 }
      );
    }

    // Verify plan exists
    const plan = await db.platformPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const school = await db.school.create({
      data: {
        name,
        city,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        planId,
        status: status || "trial",
        studentCount: 0,
      },
      include: { plan: true },
    });

    // Create initial subscription
    await db.subscription.create({
      data: {
        schoolId: school.id,
        planId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day trial
        status: "active",
        amount: plan.monthlyPrice,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        action: "school.create",
        entity: "school",
        entityId: school.id,
        metadata: JSON.stringify({ name, city, planId, status: school.status }),
      },
    });

    return NextResponse.json({ ok: true, school });
  } catch (err) {
    console.error("[schools/create] error:", err);
    return NextResponse.json({ error: "Failed to create school" }, { status: 500 });
  }
}
