// src/app/api/contact/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, school, phone, message, planInterest } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Save to Supabase `contact_inquiries` table
    // 2. Send email notification to Emerson team via Resend
    // 3. Send auto-reply to client
    // For now, we just log and return success
    console.log("[contact inquiry]", {
      name,
      email,
      school,
      phone,
      planInterest,
      message: message.substring(0, 100) + "...",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      message: "Thanks for reaching out! We'll get back to you within 24 hours.",
    });
  } catch (err) {
    console.error("[contact] error:", err);
    return NextResponse.json(
      { error: "Failed to submit form. Please try again." },
      { status: 500 }
    );
  }
}
