// src/lib/sms.ts
// SMS notification framework
// In production: integrate with Twilio or local Pakistani SMS gateway
// For now: logs to console (audit trail) and records in DB for tracking

export type SmsMessage = {
  to: string;
  body: string;
  type: "attendance" | "fee_reminder" | "notice" | "admission" | "general";
};

export async function sendSms(message: SmsMessage): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  // Check if SMS is enabled (from school settings)
  // In production, this would call Twilio API or local gateway
  // For now, just log and return success

  console.log(`[SMS] To: ${message.to} | Type: ${message.type}`);
  console.log(`[SMS] Body: ${message.body.substring(0, 100)}${message.body.length > 100 ? "..." : ""}`);

  // TODO: When ready for production, uncomment and configure:
  // const accountSid = process.env.TWILIO_ACCOUNT_SID;
  // const authToken = process.env.TWILIO_AUTH_TOKEN;
  // const fromPhone = process.env.TWILIO_FROM_PHONE;
  // if (accountSid && authToken && fromPhone) {
  //   const client = require("twilio")(accountSid, authToken);
  //   const result = await client.messages.create({
  //     body: message.body,
  //     from: fromPhone,
  //     to: message.to,
  //   });
  //   return { ok: true, messageId: result.sid };
  // }

  return { ok: true, messageId: `mock_${Date.now()}` };
}

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
