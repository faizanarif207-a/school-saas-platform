// src/app/api/admission/inquiries/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const stage = url.searchParams.get("stage");
  const today = url.searchParams.get("today");

  let where: Record<string, unknown> = { schoolId: user.schoolId };
  if (stage) where.stage = stage;
  if (today === "true") {
    where.followUpDate = {
      gte: new Date(new Date().setHours(0, 0, 0, 0)),
      lte: new Date(new Date().setHours(23, 59, 59, 999)),
    };
  }

  const inquiries = await db.inquiry.findMany({
    where,
    include: { branch: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ inquiries });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { parentName, parentPhone, studentName, desiredClass, source, notes, branchId, followUpDate, followUpAction } = body;

    if (!parentName?.trim() || !parentPhone?.trim()) {
      return NextResponse.json({ error: "Parent name and phone are required" }, { status: 400 });
    }

    const inquiry = await db.inquiry.create({
      data: {
        schoolId: user.schoolId,
        branchId: branchId || null,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        studentName: studentName?.trim() || null,
        desiredClass: desiredClass || null,
        source: source || "walk_in",
        stage: "inquired",
        notes: notes?.trim() || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        followUpAction: followUpAction?.trim() || null,
        assignedTo: user.id,
      },
    });

    return NextResponse.json({ ok: true, inquiry });
  } catch (err) {
    console.error("[inquiry/create] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
