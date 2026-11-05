// src/lib/sms.ts
// Real SMS sending via Twilio
// Works automatically when TWILIO_* env vars are set

import { Twilio } from 'twilio';

let twilioClient: Twilio | null = null;

function getTwilioClient(): Twilio | null {
  if (twilioClient) return twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (sid && token) {
    twilioClient = new Twilio(sid, token);
  }
  return twilioClient;
}

export type SmsMessage = {
  to: string;
  body: string;
  type: "attendance" | "fee_reminder" | "notice" | "admission" | "general";
};

export async function sendSms(message: SmsMessage): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const client = getTwilioClient();
  const fromPhone = process.env.TWILIO_FROM_PHONE;

  if (!client || !fromPhone) {
    console.log(`[SMS] (no Twilio — logging only) To: ${message.to} | Type: ${message.type}`);
    console.log(`[SMS] Body: ${message.body.substring(0, 100)}${message.body.length > 100 ? "..." : ""}`);
    return { ok: true }; // Don't fail the flow
  }

  try {
    // Format phone number (ensure + prefix)
    let toPhone = message.to.replace(/\s/g, '').replace(/-/g, '');
    if (!toPhone.startsWith('+')) {
      toPhone = '+' + toPhone;
    }

    const result = await client.messages.create({
      body: message.body,
      from: fromPhone,
      to: toPhone,
    });

    console.log(`[SMS] Sent to ${toPhone} | ID: ${result.sid}`);
    return { ok: true, messageId: result.sid };
  } catch (err: any) {
    console.error('[SMS] Error:', err.message);
    return { ok: false, error: err.message };
  }
}

// ─── SMS Templates ───

export function formatAttendanceSms(studentName: string, date: string, status: string, schoolName: string): string {
  return `Dear Parent, your child ${studentName} was ${status} on ${date} at ${schoolName}. - SchoolSaaS`;
}

export function formatFeeReminderSms(studentName: string, amount: number, dueDate: string, schoolName: string): string {
  return `Reminder: ${studentName}'s fee of PKR ${amount.toLocaleString()} is due on ${dueDate}. Please pay to avoid late fee. - ${schoolName}`;
}

export function formatNoticeSms(title: string, schoolName: string): string {
  const truncated = title.length > 80 ? title.substring(0, 80) + "..." : title;
  return `Notice from ${schoolName}: ${truncated}. Check parent portal for details. - SchoolSaaS`;
}

export function formatAdmissionSms(studentName: string, admissionId: string, schoolName: string, loginUrl: string, tempPassword: string): string {
  return `Welcome to ${schoolName}! Your child ${studentName} (ID: ${admissionId}) admitted. Login: ${loginUrl} Password: ${tempPassword} - SchoolSaaS`;
}
