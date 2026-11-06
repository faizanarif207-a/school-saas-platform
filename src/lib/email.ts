// src/lib/email.ts
// Real email sending via Resend
// Works automatically when RESEND_API_KEY is set in environment

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'SchoolSaaS <noreply@resend.dev>';

export async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.log(`[EMAIL] (no API key — logging only) To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL] Body preview: ${html.substring(0, 100)}...`);
    return { ok: true }; // Don't fail the flow, just log
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[EMAIL] Error:', error);
      return { ok: false, error: error.message };
    }

    console.log(`[EMAIL] Sent to ${to} | ID: ${data?.id}`);
    return { ok: true };
  } catch (err) {
    console.error('[EMAIL] Exception:', err);
    return { ok: false, error: 'Failed to send email' };
  }
}

// ─── Email Templates ───

export function staffInviteEmail(name: string, loginUrl: string, tempPassword: string, role: string, schoolName: string): string {
  return `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
    <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:20px;">
      <div style="width:48px;height:10px;background:#F5A800;border-radius:2px;"></div>
      <div style="width:36px;height:10px;background:#0E9E56;border-radius:2px;"></div>
      <div style="width:48px;height:10px;background:#0064C8;border-radius:2px;"></div>
    </div>
    <h1 style="color:#1C232D;">Welcome to ${schoolName}!</h1>
    <p style="color:#5B6672;font-size:15px;line-height:1.6;">Hello ${name},</p>
    <p style="color:#5B6672;font-size:15px;line-height:1.6;">You have been invited to join <strong>${schoolName}</strong> as <strong>${role}</strong> on the SchoolSaaS platform.</p>
    <div style="background:#FDFDFB;border:1px solid #E6E8E4;border-radius:10px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;color:#5B6672;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Your Login Credentials</p>
      <p style="margin:0 0 4px;font-size:14px;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color:#0064C8;">${loginUrl}</a></p>
      <p style="margin:0 0 4px;font-size:14px;"><strong>Temporary Password:</strong> <code style="background:#F1F5F9;padding:4px 8px;border-radius:4px;font-size:13px;">${tempPassword}</code></p>
    </div>
    <p style="color:#5B6672;font-size:15px;line-height:1.6;">Please login and change your password immediately.</p>
    <p style="color:#94A3B8;font-size:12px;margin-top:30px;padding-top:15px;border-top:1px solid #E6E8E4;">This email was sent by SchoolSaaS — Emerson Technology</p>
  </div>`;
}

export function schoolWelcomeEmail(ownerName: string, schoolName: string, loginUrl: string, tempPassword: string): string {
  return `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
    <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:20px;">
      <div style="width:48px;height:10px;background:#F5A800;border-radius:2px;"></div>
      <div style="width:36px;height:10px;background:#0E9E56;border-radius:2px;"></div>
      <div style="width:48px;height:10px;background:#0064C8;border-radius:2px;"></div>
    </div>
    <h1 style="color:#1C232D;">Welcome to SchoolSaaS!</h1>
    <p style="color:#5B6672;font-size:15px;line-height:1.6;">Hello ${ownerName},</p>
    <p style="color:#5B6672;font-size:15px;line-height:1.6;">Your school <strong>${schoolName}</strong> has been set up successfully on the SchoolSaaS platform by Emerson Technology.</p>
    <div style="background:#FDFDFB;border:1px solid #E6E8E4;border-radius:10px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;color:#5B6672;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Your Login Credentials</p>
      <p style="margin:0 0 4px;font-size:14px;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color:#0064C8;">${loginUrl}</a></p>
      <p style="margin:0 0 4px;font-size:14px;"><strong>Temporary Password:</strong> <code style="background:#F1F5F9;padding:4px 8px;border-radius:4px;font-size:13px;">${tempPassword}</code></p>
    </div>
    <p style="color:#5B6672;font-size:15px;line-height:1.6;">Please login and set up your school — add classes, students, and staff.</p>
    <p style="color:#94A3B8;font-size:12px;margin-top:30px;padding-top:15px;border-top:1px solid #E6E8E4;">This email was sent by SchoolSaaS — Emerson Technology</p>
  </div>`;
}

export function parentWelcomeEmail(parentName: string, studentName: string, loginUrl: string, tempPassword: string): string {
  return `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
    <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:20px;">
      <div style="width:48px;height:10px;background:#F5A800;border-radius:2px;"></div>
      <div style="width:36px;height:10px;background:#0E9E56;border-radius:2px;"></div>
      <div style="width:48px;height:10px;background:#0064C8;border-radius:2px;"></div>
    </div>
    <h1 style="color:#1C232D;">Welcome to the Parent Portal!</h1>
    <p style="color:#5B6672;font-size:15px;line-height:1.6;">Hello ${parentName},</p>
    <p style="color:#5B6672;font-size:15px;line-height:1.6;">Your child <strong>${studentName}</strong> has been enrolled. You can now track their attendance, fees, and results online.</p>
    <div style="background:#FDFDFB;border:1px solid #E6E8E4;border-radius:10px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;color:#5B6672;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Your Login Credentials</p>
      <p style="margin:0 0 4px;font-size:14px;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color:#0064C8;">${loginUrl}</a></p>
      <p style="margin:0 0 4px;font-size:14px;"><strong>Temporary Password:</strong> <code style="background:#F1F5F9;padding:4px 8px;border-radius:4px;font-size:13px;">${tempPassword}</code></p>
    </div>
    <p style="color:#5B6672;font-size:15px;line-height:1.6;">Please login and change your password immediately.</p>
    <p style="color:#94A3B8;font-size:12px;margin-top:30px;padding-top:15px;border-top:1px solid #E6E8E4;">This email was sent by SchoolSaaS — Emerson Technology</p>
  </div>`;
}
