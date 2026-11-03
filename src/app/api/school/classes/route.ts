// src/app/api/school/classes/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classes = await db.class.findMany({
    where: { schoolId: user.schoolId },
    include: {
      sections: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Add count per section (manual query, no relation in schema)
  const sectionCounts = await db.enrollment.groupBy({
    by: ["sectionId"],
    where: { sectionId: { in: classes.flatMap((c) => c.sections.map((s) => s.id)) } },
    _count: { id: true },
  });
  const countMap = new Map(sectionCounts.map((sc) => [sc.sectionId, sc._count.id]));

  const classesWithCount = classes.map((c) => ({
    ...c,
    sections: c.sections.map((s) => ({
      ...s,
      _count: { enrollments: countMap.get(s.id) || 0 },
    })),
  }));

  return NextResponse.json({ classes: classesWithCount });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json({ error: "Class name is required" }, { status: 400 });
    }

    // Check for duplicate class name
    const existing = await db.class.findFirst({
      where: { schoolId: user.schoolId, name: name.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Class with this name already exists" }, { status: 400 });
    }

    const cls = await db.class.create({
      data: { schoolId: user.schoolId, name: name.trim() },
    });
    return NextResponse.json({ ok: true, class: cls });
  } catch (err) {
    console.error("[classes/create] error:", err);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
