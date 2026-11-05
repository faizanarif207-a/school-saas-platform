// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyDbUser, setSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await verifyDbUser(email.trim().toLowerCase(), password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials or inactive account" },
        { status: 401 }
      );
    }

    // Check if school is suspended (for school-level users)
    if (user.schoolId && user.role !== "SUPER_ADMIN") {
      const school = await db.school.findUnique({
        where: { id: user.schoolId },
        select: { status: true, name: true },
      });
      if (school?.status === "suspended") {
        return NextResponse.json(
          { error: `${school.name} has been suspended. Please contact platform support.` },
          { status: 403 }
        );
      }
    }

    await setSessionCookie(user);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subRole: user.subRole || null,
        branchId: user.branchId || null,
      },
    });
  } catch (err) {
    console.error("[login] error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
