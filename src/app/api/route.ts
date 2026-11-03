import { NextResponse } from "next/server";

// Force dynamic — required for API routes using Prisma
export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}