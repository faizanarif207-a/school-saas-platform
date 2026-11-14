// src/app/api/upload/route.ts
// Generic file upload endpoint — accepts multipart/form-data
// Saves to Supabase Storage (production) or returns base64 data URL (dev).

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadFile, hasSupabaseStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Auth — any logged-in user can upload
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "misc";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Restrict folder to a whitelist (prevent arbitrary paths)
    const allowedFolders = [
      "students",
      "notices",
      "staff",
      "parents",
      "homework",
      "avatars",
      "documents",
      "misc",
    ];
    if (!allowedFolders.includes(folder)) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    const result = await uploadFile(file, { folder });

    return NextResponse.json({
      ok: true,
      url: result.url,
      path: result.path,
      bucket: result.bucket,
      provider: result.provider,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    console.error("[upload] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Health check — returns current storage provider info
export async function GET() {
  return NextResponse.json({
    provider: hasSupabaseStorage ? "supabase" : "data-url",
    bucket: process.env.SUPABASE_BUCKET || "school-uploads",
    configured: hasSupabaseStorage,
  });
}
