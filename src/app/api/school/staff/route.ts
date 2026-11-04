// src/app/api/school/staff/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

// GET — list staff (all SCHOOL_ADMIN + TEACHER users of this school)
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const staff = await db.user.findMany({
    where: {
      schoolId: user.schoolId,
      role: { in: ["SCHOOL_ADMIN", "TEACHER"] },
      subRole: { not: "OWNER" }, // exclude owner from "staff" list
    },
    include: { branch: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ staff });
}

// POST — invite staff (create account + temp password)
export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can invite staff
  if (user.subRole !== "OWNER") {
    return NextResponse.json({ error: "Only school owners can invite staff" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, subRole, branchId, isActive } = body;

    if (!name?.trim() || !email?.trim() || !subRole) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 });
    }

    const validSubRoles = ["PRINCIPAL", "ACCOUNTANT", "ADMISSION", "TEACHER"];
    if (!validSubRoles.includes(subRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Verify branch if provided
    if (branchId) {
      const branch = await db.branch.findFirst({
        where: { id: branchId, schoolId: user.schoolId },
      });
      if (!branch) {
        return NextResponse.json({ error: "Invalid branch" }, { status: 400 });
      }
    }

    // Generate temp password (8 chars)
    const tempPassword = randomBytes(4).toString("hex");
    const passwordHash = await hashPassword(tempPassword);

    // Determine role
    const role = subRole === "TEACHER" ? "TEACHER" : "SCHOOL_ADMIN";

    const staffUser = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        passwordHash,
        role,
        subRole: subRole === "TEACHER" ? null : subRole,
        schoolId: user.schoolId,
        branchId: branchId || null,
        isActive: isActive !== false,
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        action: "staff.invite",
        entity: "user",
        entityId: staffUser.id,
        metadata: JSON.stringify({ name, email, subRole, tempPassword }),
      },
    });

    return NextResponse.json({
      ok: true,
      staff: {
        id: staffUser.id,
        name: staffUser.name,
        email: staffUser.email,
        subRole,
        tempPassword, // returned so owner can share with staff
      },
    });
  } catch (err) {
    console.error("[staff/invite] error:", err);
    return NextResponse.json({ error: "Failed to invite staff" }, { status: 500 });
  }
}
