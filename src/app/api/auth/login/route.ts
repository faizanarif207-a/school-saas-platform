// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyDbUser, setSessionCookie } from "@/lib/auth";

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

    await setSessionCookie(user);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("[login] error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
