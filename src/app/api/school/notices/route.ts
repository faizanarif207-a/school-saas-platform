// src/app/api/school/notices/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET — list notices (school-wide + class-specific if class filter applied)
export async function GET(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");

  const notices = await db.notice.findMany({
    where: {
      schoolId: user.schoolId,
      ...(classId
        ? { OR: [{ noticeType: "school_wide" }, { classId }] }
        : { noticeType: "school_wide" }),
    },
    include: { poster: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ notices });
}

// POST — create notice
export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, body: noticeBody, noticeType, classId, sendSms } = body;

    if (!title?.trim() || !noticeBody?.trim()) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    // Validate classId if class-specific notice
    if (noticeType === "class_specific" && classId) {
      const cls = await db.class.findFirst({
        where: { id: classId, schoolId: user.schoolId },
      });
      if (!cls) {
        return NextResponse.json({ error: "Invalid class" }, { status: 400 });
      }
    }

    const notice = await db.notice.create({
      data: {
        schoolId: user.schoolId,
        postedBy: user.id,
        title: title.trim(),
        body: noticeBody.trim(),
        noticeType: noticeType || "school_wide",
        classId: noticeType === "class_specific" ? classId : null,
        sendSms: sendSms || false,
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "notice.create",
        entity: "notice",
        entityId: notice.id,
      },
    });

    return NextResponse.json({ ok: true, notice });
  } catch (err) {
    console.error("[notices/create] error:", err);
    return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
  }
}
