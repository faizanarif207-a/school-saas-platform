// src/lib/pdf-report.ts
// Branded PDF report generator (HTML → browser print → PDF)

export type SchoolInfo = {
  name: string;
  city: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export type ClassReportData = {
  className: string;
  section: string;
  totalStudents: number;
  presentToday: number;
  avgAttendancePct: number;
  students: {
    rollNo: number | null;
    admissionId: string | null;
    name: string;
    fatherName: string | null;
    attendancePct: number;
    feeStatus: string;
  }[];
};

export type MonthlyCollectionData = {
  month: string;
  totalInvoiced: number;
  totalCollected: number;
  pending: number;
  defaultersCount: number;
  invoices: {
    admissionId: string | null;
    studentName: string;
    className: string;
    amount: number;
    paid: number;
    balance: number;
    status: string;
  }[];
};

export type DefaultersReportData = {
  totalOutstanding: number;
  defaultersCount: number;
  defaulters: {
    admissionId: string | null;
    studentName: string;
    fatherName: string | null;
    className: string;
    guardianPhone: string | null;
    amount: number;
    paid: number;
    balance: number;
    daysOverdue: number;
  }[];
};

function header(school: SchoolInfo, reportTitle: string, subtitle: string): string {
  return `
  <div style="display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:20px; border-bottom:2px solid #0064C8;">
    <div>
      <div style="display:flex; flex-direction:column; gap:3px; margin-bottom:8px;">
        <div style="width:48px; height:10px; background:#F5A800; border-radius:2px;"></div>
        <div style="width:36px; height:10px; background:#0E9E56; border-radius:2px;"></div>
        <div style="width:48px; height:10px; background:#0064C8; border-radius:2px;"></div>
      </div>
      <div style="font-size:22px; font-weight:700; color:#1C232D;">${school.name}</div>
      <div style="font-size:12px; color:#5B6672; margin-top:2px;">${school.city} · Powered by Emerson Technology</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:10px; text-transform:uppercase; letter-spacing:0.1em; font-weight:700; color:#5B6672;">Report</div>
      <div style="font-size:18px; font-weight:700; color:#0064C8; margin-top:2px;">${reportTitle}</div>
      <div style="font-size:11px; color:#5B6672; margin-top:2px;">${subtitle}</div>
      <div style="font-size:10px; color:#5B6672; margin-top:2px;">Generated: ${new Date().toLocaleString("en-GB")}</div>
    </div>
  </div>`;
}

function footer(): string {
  return `
  <div style="margin-top:40px; padding-top:15px; border-top:1px dashed #E6E8E4; display:flex; justify-content:space-between; font-size:10px; color:#5B6672;">
    <div>SchoolSaaS by Emerson Technology · Engineering Digital Excellence</div>
    <div>Page 1 · ${new Date().toLocaleDateString("en-GB")}</div>
  </div>`;
}

function commonStyles(): string {
  return `
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Inter, -apple-system, sans-serif; color:#1C232D; background:#fff; padding:40px; max-width:900px; margin:0 auto; }
    .summary { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:20px 0; }
    .summary-card { background:#FDFDFB; border:1px solid #E6E8E4; border-radius:8px; padding:12px; }
    .summary-label { font-size:10px; text-transform:uppercase; letter-spacing:0.06em; font-weight:700; color:#5B6672; }
    .summary-value { font-size:20px; font-weight:700; margin-top:4px; color:#1C232D; }
    table { width:100%; border-collapse:collapse; margin:20px 0; font-size:12px; }
    th { background:#F1F5F9; padding:8px; font-size:10px; color:#5B6672; text-transform:uppercase; letter-spacing:0.05em; font-weight:700; text-align:left; border-bottom:2px solid #0064C8; }
    td { padding:8px; border-bottom:1px solid #E6E8E4; }
    .pill { display:inline-block; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:600; }
    .paid { background:#ECFDF5; color:#047857; border:1px solid #A7F3D0; }
    .unpaid { background:#F1F5F9; color:#475569; border:1px solid #CBD5E1; }
    .partial { background:#FFFBEB; color:#B45309; border:1px solid #FDE68A; }
    .overdue { background:#FEF2F2; color:#B91C1C; border:1px solid #FECACA; }
    @media print { body { padding:20px; } }
  </style>`;
}

export function generateClassReport(school: SchoolInfo, data: ClassReportData): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Class Report</title>${commonStyles()}</head>
  <body>
    ${header(school, "Class Report", `${data.className} - ${data.section}`)}
    <div class="summary">
      <div class="summary-card"><div class="summary-label">Total Students</div><div class="summary-value">${data.totalStudents}</div></div>
      <div class="summary-card"><div class="summary-label">Present Today</div><div class="summary-value">${data.presentToday}</div></div>
      <div class="summary-card"><div class="summary-label">Avg Attendance</div><div class="summary-value">${data.avgAttendancePct}%</div></div>
      <div class="summary-card"><div class="summary-label">Defaulters</div><div class="summary-value">${data.students.filter(s => s.feeStatus !== "paid").length}</div></div>
    </div>
    <table>
      <thead><tr><th>Roll #</th><th>Admission ID</th><th>Name</th><th>Father</th><th>Attendance</th><th>Fee Status</th></tr></thead>
      <tbody>
        ${data.students.map(s => `
          <tr>
            <td>${s.rollNo || "—"}</td>
            <td style="font-family:monospace; color:#0064C8;">${s.admissionId || "—"}</td>
            <td style="font-weight:600;">${s.name}</td>
            <td>${s.fatherName || "—"}</td>
            <td>${s.attendancePct}%</td>
            <td><span class="pill ${s.feeStatus}">${s.feeStatus}</span></td>
          </tr>`).join("")}
      </tbody>
    </table>
    ${footer()}
  </body></html>`;
}

export function generateMonthlyCollectionReport(school: SchoolInfo, data: MonthlyCollectionData): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Monthly Collection</title>${commonStyles()}</head>
  <body>
    ${header(school, "Monthly Collection", data.month)}
    <div class="summary">
      <div class="summary-card"><div class="summary-label">Total Invoiced</div><div class="summary-value">PKR ${data.totalInvoiced.toLocaleString()}</div></div>
      <div class="summary-card"><div class="summary-label">Collected</div><div class="summary-value" style="color:#047857;">PKR ${data.totalCollected.toLocaleString()}</div></div>
      <div class="summary-card"><div class="summary-label">Pending</div><div class="summary-value" style="color:#B45309;">PKR ${data.pending.toLocaleString()}</div></div>
      <div class="summary-card"><div class="summary-label">Defaulters</div><div class="summary-value" style="color:#B91C1C;">${data.defaultersCount}</div></div>
    </div>
    <table>
      <thead><tr><th>Admission ID</th><th>Student</th><th>Class</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
      <tbody>
        ${data.invoices.map(inv => `
          <tr>
            <td style="font-family:monospace; color:#0064C8;">${inv.admissionId || "—"}</td>
            <td style="font-weight:600;">${inv.studentName}</td>
            <td>${inv.className}</td>
            <td style="font-family:monospace;">PKR ${inv.amount.toLocaleString()}</td>
            <td style="font-family:monospace; color:#047857;">PKR ${inv.paid.toLocaleString()}</td>
            <td style="font-family:monospace; color:#B45309;">PKR ${inv.balance.toLocaleString()}</td>
            <td><span class="pill ${inv.status}">${inv.status}</span></td>
          </tr>`).join("")}
      </tbody>
    </table>
    ${footer()}
  </body></html>`;
}

export function generateDefaultersReport(school: SchoolInfo, data: DefaultersReportData): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Defaulters Report</title>${commonStyles()}</head>
  <body>
    ${header(school, "Defaulters Report", "Unpaid fee summary")}
    <div class="summary">
      <div class="summary-card"><div class="summary-label">Total Defaulters</div><div class="summary-value" style="color:#B91C1C;">${data.defaultersCount}</div></div>
      <div class="summary-card"><div class="summary-label">Total Outstanding</div><div class="summary-value" style="color:#B91C1C;">PKR ${data.totalOutstanding.toLocaleString()}</div></div>
      <div class="summary-card" style="grid-column:span 2;"><div class="summary-label">Note</div><div style="font-size:12px; margin-top:4px; color:#5B6672;">Contact parents to collect pending dues. SMS reminders can be sent from the dashboard.</div></div>
    </div>
    <table>
      <thead><tr><th>Admission ID</th><th>Student</th><th>Father</th><th>Phone</th><th>Class</th><th>Balance</th><th>Days Overdue</th></tr></thead>
      <tbody>
        ${data.defaulters.map(d => `
          <tr>
            <td style="font-family:monospace; color:#0064C8;">${d.admissionId || "—"}</td>
            <td style="font-weight:600;">${d.studentName}</td>
            <td>${d.fatherName || "—"}</td>
            <td>${d.guardianPhone || "—"}</td>
            <td>${d.className}</td>
            <td style="font-family:monospace; color:#B91C1C; font-weight:700;">PKR ${d.balance.toLocaleString()}</td>
            <td>${d.daysOverdue} days</td>
          </tr>`).join("")}
      </tbody>
    </table>
    ${footer()}
  </body></html>`;
}
