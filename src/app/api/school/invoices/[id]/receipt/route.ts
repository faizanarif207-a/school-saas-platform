// src/app/api/school/invoices/[id]/receipt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { format } from "date-fns";

// GET — return receipt HTML for printing/PDF
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const paymentId = new URL(req.url).searchParams.get("paymentId");

  const invoice = await db.invoice.findFirst({
    where: {
      id,
      enrollment: { student: { schoolId: user.schoolId } },
    },
    include: {
      student: { include: { guardians: { take: 1 } } },
      enrollment: { include: { section: { include: { class: true } } } },
      payments: paymentId ? { where: { id: paymentId } } : { orderBy: { paidAt: "desc" }, take: 1 },
      feePlan: true,
    },
  });

  if (!invoice || invoice.payments.length === 0) {
    return NextResponse.json(
      { error: "No payment found for this invoice" },
      { status: 404 }
    );
  }

  const payment = invoice.payments[0];
  const school = await db.school.findUnique({
    where: { id: user.schoolId },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Receipt ${payment.receiptNo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: #1C232D;
    background: #fff;
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 24px;
    border-bottom: 2px solid #0064C8;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo-mark {
    display: inline-flex;
    flex-direction: column;
    gap: 4px;
  }
  .logo-mark div {
    width: 36px;
    height: 6px;
    border-radius: 2px;
  }
  .logo-mark .b1 { background: #F5A800; width: 36px; }
  .logo-mark .b2 { background: #0E9E56; width: 28px; }
  .logo-mark .b3 { background: #0064C8; width: 36px; }
  .school-name {
    font-size: 20px;
    font-weight: 700;
    color: #1C232D;
  }
  .school-city {
    font-size: 12px;
    color: #5B6672;
    margin-top: 2px;
  }
  .receipt-info {
    text-align: right;
  }
  .receipt-label {
    font-size: 10px;
    color: #5B6672;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
  }
  .receipt-no {
    font-size: 18px;
    font-weight: 700;
    color: #0064C8;
    margin-top: 4px;
    font-family: monospace;
  }
  .receipt-date {
    font-size: 12px;
    color: #5B6672;
    margin-top: 2px;
  }
  .title {
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    margin: 32px 0 24px 0;
    color: #1C232D;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }
  .info-block {
    padding: 12px 16px;
    background: #FDFDFB;
    border: 1px solid #E6E8E4;
    border-radius: 8px;
  }
  .info-label {
    font-size: 10px;
    color: #5B6672;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .info-value {
    font-size: 14px;
    font-weight: 600;
    color: #1C232D;
  }
  .info-sub {
    font-size: 12px;
    color: #5B6672;
    margin-top: 2px;
  }
  .table {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
  }
  .table th {
    background: #F1F5F9;
    padding: 10px 12px;
    font-size: 11px;
    color: #5B6672;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
    text-align: left;
    border-bottom: 2px solid #0064C8;
  }
  .table td {
    padding: 12px;
    font-size: 14px;
    border-bottom: 1px solid #E6E8E4;
  }
  .total-row {
    background: #FEF4DD;
    border-top: 2px solid #F5A800;
  }
  .total-row td {
    font-weight: 700;
    font-size: 16px;
  }
  .method-tag {
    display: inline-block;
    padding: 4px 10px;
    background: #ECFDF5;
    color: #047857;
    border: 1px solid #A7F3D0;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
  }
  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px dashed #E6E8E4;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #5B6672;
  }
  .sign {
    text-align: center;
    margin-top: 60px;
  }
  .sign-line {
    width: 200px;
    margin: 0 auto 4px;
    border-top: 1px solid #1C232D;
  }
  .sign-text {
    font-size: 11px;
    color: #5B6672;
  }
  @media print {
    body { padding: 20px; }
    .no-print { display: none; }
  }
  .print-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #0064C8;
    color: white;
    border: 0;
    padding: 10px 18px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
  }
  .print-btn:hover { background: #0A56A8; }
</style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Print / Save PDF</button>

  <div class="header">
    <div class="logo">
      <div class="logo-mark">
        <div class="b1"></div>
        <div class="b2"></div>
        <div class="b3"></div>
      </div>
      <div>
        <div class="school-name">${school?.name || 'School'}</div>
        <div class="school-city">${school?.city || ''} · Powered by Emerson Technology</div>
      </div>
    </div>
    <div class="receipt-info">
      <div class="receipt-label">Receipt No</div>
      <div class="receipt-no">${payment.receiptNo}</div>
      <div class="receipt-date">${format(new Date(payment.paidAt), "dd MMM yyyy, HH:mm")}</div>
    </div>
  </div>

  <h1 class="title">Fee Payment Receipt</h1>

  <div class="grid">
    <div class="info-block">
      <div class="info-label">Student Name</div>
      <div class="info-value">${invoice.student.name}</div>
      ${invoice.student.fatherName ? `<div class="info-sub">S/O ${invoice.student.fatherName}</div>` : ''}
    </div>
    <div class="info-block">
      <div class="info-label">Class</div>
      <div class="info-value">
        ${invoice.enrollment.section.class.name}-${invoice.enrollment.section.name}
        <span style="font-weight:400;color:#5B6672;font-size:12px;"> · Roll #${invoice.enrollment.rollNo}</span>
      </div>
      ${invoice.student.guardians[0] ? `<div class="info-sub">Guardian: ${invoice.student.guardians[0].name}</div>` : ''}
    </div>
    <div class="info-block">
      <div class="info-label">Fee Title</div>
      <div class="info-value">${invoice.feePlan?.title || 'Tuition Fee'}</div>
      ${invoice.month ? `<div class="info-sub">For: ${format(new Date(invoice.month), "MMMM yyyy")}</div>` : ''}
    </div>
    <div class="info-block">
      <div class="info-label">Payment Method</div>
      <div class="info-value"><span class="method-tag">${payment.method.toUpperCase()}</span></div>
      ${payment.notes ? `<div class="info-sub">Notes: ${payment.notes}</div>` : ''}
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:right;">Invoice Amount</th>
        <th style="text-align:right;">Paid</th>
        <th style="text-align:right;">Balance</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${invoice.feePlan?.title || 'Tuition Fee'}${invoice.month ? ` — ${format(new Date(invoice.month), "MMM yyyy")}` : ''}</td>
        <td style="text-align:right;font-family:monospace;">PKR ${invoice.amount.toLocaleString()}</td>
        <td style="text-align:right;font-family:monospace;color:#047857;">PKR ${payment.amount.toLocaleString()}</td>
        <td style="text-align:right;font-family:monospace;">PKR ${(invoice.amount - payment.amount).toLocaleString()}</td>
      </tr>
      <tr class="total-row">
        <td>Total Received</td>
        <td colspan="2" style="text-align:right;">PKR</td>
        <td style="text-align:right;font-family:monospace;">${payment.amount.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>This is a computer-generated receipt from SchoolSaaS by Emerson Technology.</div>
    <div>Receipt ID: ${payment.id}</div>
  </div>

  <div class="sign">
    <div class="sign-line"></div>
    <div class="sign-text">Authorized Signature</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
