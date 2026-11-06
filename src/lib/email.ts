// src/lib/email.ts
// Real email sending via Gmail SMTP (using App Password)
// Works automatically when GMAIL_EMAIL + GMAIL_APP_PASSWORD are set

import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  const email = process.env.GMAIL_EMAIL;
  const password = process.env.GMAIL_APP_PASSWORD;
  if (email && password) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: password,
      },
    });
  }
  return transporter;
}

const FROM_EMAIL = process.env.GMAIL_EMAIL || "noreply@schoolsaas.app";

export async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const transport = getTransporter();
  
  if (!transport) {
    console.log(`[EMAIL] (no Gmail credentials — logging only) To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL] Body preview: ${html.substring(0, 100)}...`);
    return { ok: true };
  }

  try {
    const info = await transport.sendMail({
      from: `SchoolSaaS <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Sent to ${to} | Message ID: ${info.messageId}`);
    return { ok: true };
  } catch (err: any) {
    console.error("[EMAIL] Error:", err.message);
    return { ok: false, error: err.message };
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
