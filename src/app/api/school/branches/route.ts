// src/app/api/school/branches/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET — list branches
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const branches = await db.branch.findMany({
    where: { schoolId: user.schoolId },
    include: {
      _count: { select: { users: true, classes: true } },
    },
    orderBy: { isMain: "desc" },
  });
  return NextResponse.json({ branches });
}

// POST — create branch
export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can create branches
  if (user.subRole !== "OWNER") {
    return NextResponse.json({ error: "Only school owners can create branches" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, address, city, phone } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: "Branch name is required" }, { status: 400 });
    }

    // Check plan limit (Starter = 1 branch, Growth = 2, Pro/Enterprise = unlimited)
    const school = await db.school.findUnique({
      where: { id: user.schoolId },
      include: { plan: true },
    });
    if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const branchCount = await db.branch.count({ where: { schoolId: user.schoolId } });
    const planSlug = school.plan.slug;
    const limits: Record<string, number> = { starter: 1, growth: 3, pro: 50, enterprise: 9999 };
    const limit = limits[planSlug] || 1;
    if (branchCount >= limit) {
      return NextResponse.json(
        { error: `Plan limit: ${planSlug} allows ${limit} branch(es). Upgrade to add more.` },
        { status: 403 }
      );
    }

    const branch = await db.branch.create({
      data: {
        schoolId: user.schoolId,
        name: name.trim(),
        address: address?.trim() || null,
        city: city?.trim() || school.city,
        phone: phone?.trim() || null,
        isMain: branchCount === 0, // first branch is main
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "branch.create",
        entity: "branch",
        entityId: branch.id,
      },
    });

    return NextResponse.json({ ok: true, branch });
  } catch (err) {
    console.error("[branches/create] error:", err);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}
