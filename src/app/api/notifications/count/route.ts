// src/app/api/notifications/count/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || !user.schoolId) {
    return NextResponse.json({ count: 0 });
  }

  // Count notices from the last 7 days (treat as "unread" for simplicity)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const count = await db.notice.count({
    where: {
      schoolId: user.schoolId,
      createdAt: { gte: sevenDaysAgo },
      noticeType: "school_wide",
    },
  });

  return NextResponse.json({ count });
}
