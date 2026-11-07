// src/lib/storage.ts
// File upload helper — uses Supabase Storage in production,
// falls back to base64 data URL in local dev (no Supabase configured).

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "school-uploads";

export const hasSupabaseStorage = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type UploadResult = {
  url: string;
  path: string;
  bucket: string;
  provider: "supabase" | "data-url";
};

export type UploadOptions = {
  folder?: string; // e.g. "students", "notices"
  maxSizeMB?: number; // default 5MB
  allowedMime?: string[]; // e.g. ["image/jpeg", "image/png"]
};

// ─────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────
const DEFAULT_ALLOWED_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export function validateFile(
  file: File,
  opts: UploadOptions = {}
): { ok: boolean; error?: string } {
  const maxSize = (opts.maxSizeMB ?? 5) * 1024 * 1024;
  const allowed = opts.allowedMime ?? DEFAULT_ALLOWED_MIME;

  if (file.size > maxSize) {
    return {
      ok: false,
      error: `File too large. Max ${opts.maxSizeMB ?? 5}MB allowed (got ${Math.round(file.size / 1024 / 1024)}MB).`,
    };
  }
  if (!allowed.includes(file.type)) {
    return {
      ok: false,
      error: `File type ${file.type} not allowed. Allowed: ${allowed.join(", ")}`,
    };
  }
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────
// Upload via Supabase Storage (server-side)
// ─────────────────────────────────────────────────────────────
async function uploadToSupabase(
  file: File,
  opts: UploadOptions
): Promise<UploadResult> {
  // Lazy import — avoids loading @supabase/supabase-js when not needed
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Ensure bucket exists (best-effort — will no-op if already exists)
  try {
    await supabase.storage.createBucket(SUPABASE_BUCKET, {
      public: true,
      allowedMimeTypes: opts.allowedMime ?? DEFAULT_ALLOWED_MIME,
      fileSizeLimit: (opts.maxSizeMB ?? 5) * 1024 * 1024,
    });
  } catch {
    // Bucket likely already exists — ignore
  }

  const folder = opts.folder ?? "misc";
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filename, arrayBuffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: pub } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filename);

  return {
    url: pub.publicUrl,
    path: data.path,
    bucket: SUPABASE_BUCKET,
    provider: "supabase",
  };
}

// ─────────────────────────────────────────────────────────────
// Fallback — base64 data URL (for local dev without Supabase)
// ─────────────────────────────────────────────────────────────
async function uploadAsDataUrl(
  file: File,
  opts: UploadOptions
): Promise<UploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  return {
    url: dataUrl,
    path: `${opts.folder ?? "misc"}/${file.name}`,
    bucket: "data-url",
    provider: "data-url",
  };
}

// ─────────────────────────────────────────────────────────────
// Main entry — picks provider based on env
// ─────────────────────────────────────────────────────────────
export async function uploadFile(
  file: File,
  opts: UploadOptions = {}
): Promise<UploadResult> {
  const validation = validateFile(file, opts);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  if (hasSupabaseStorage) {
    return uploadToSupabase(file, opts);
  }
  return uploadAsDataUrl(file, opts);
}

// ─────────────────────────────────────────────────────────────
// Delete a file from Supabase (no-op for data URLs)
// ─────────────────────────────────────────────────────────────
export async function deleteFile(path: string): Promise<{ ok: boolean }> {
  if (!hasSupabaseStorage || !path) {
    return { ok: true };
  }
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await supabase.storage.from(SUPABASE_BUCKET).remove([path]);
    return { ok: true };
  } catch (err) {
    console.error("[storage] delete failed:", err);
    return { ok: false };
  }
}
