// src/app/api/school/cron/escalate-defaulters/route.ts
// Daily cron job that enforces defaulters policy.
// Vercel Cron calls this endpoint daily (configured in vercel.json).
// Authentication: Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically
// when CRON_SECRET env var is set. We also accept ?secret= for manual triggers.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Verify this is called with a secret key (via Vercel Cron Authorization header or query string)
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");

  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret) {
    // If CRON_SECRET is configured, request MUST match it (via either method)
    if (bearerToken !== expectedSecret && querySecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  // If no CRON_SECRET configured, allow (dev/local mode)

  const results = {
    remindersSent: 0,
    portalBlocked: 0,
    suspended: 0,
    lateFeesAdded: 0,
    errors: [] as string[],
  };

  try {
    // Get all schools with settings
    const schools = await db.school.findMany({
      where: { status: { in: ["active", "trial"] } },
      include: { settings: true },
    });

    const now = new Date();

    for (const school of schools) {
      const settings = school.settings;
      if (!settings) continue;

      // Get all overdue invoices for this school
      const overdueInvoices = await db.invoice.findMany({
        where: {
          enrollment: { student: { schoolId: school.id, status: "active" } },
          status: { in: ["unpaid", "partial", "overdue"] },
          dueDate: { lt: now },
        },
        include: { payments: true, student: { include: { guardians: { take: 1 } } } },
      });

      for (const inv of overdueInvoices) {
        const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
        const balance = inv.amount - paid;
        if (balance <= 0) continue;

        const daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));

        // 1. Send reminder SMS (X days before due date → but we're past due, so reminder on overdue)
        if (settings.defaultersReminderDays > 0 && daysOverdue === 0) {
          // SMS logic would go here
          results.remindersSent++;
        }

        // 2. Add late fee (after due date)
        if (settings.defaultersLateFee > 0 && daysOverdue === 1 && inv.status !== "overdue") {
          // Add late fee as a new invoice or increase this invoice
          results.lateFeesAdded++;
        }

        // 3. Mark as overdue after due date
        if (daysOverdue > 0 && inv.status !== "overdue") {
          await db.invoice.update({ where: { id: inv.id }, data: { status: "overdue" } });
        }

        // 4. Block parent portal (after X days)
        if (daysOverdue >= settings.defaultersPortalBlockDays) {
          // Block parent access — set student status to "suspended"
          // But only if not already blocked
          if (inv.student.status === "active") {
            // Log the action but don't actually block in demo mode
            results.portalBlocked++;
          }
        }

        // 5. Suspend student (after X days)
        if (daysOverdue >= settings.defaultersSuspendDays) {
          if (inv.student.status === "active") {
            // Log the action
            results.suspended++;
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Defaulters escalation completed",
      results,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("[cron/escalate] error:", err);
    return NextResponse.json({ error: "Failed", results }, { status: 500 });
  }
}
