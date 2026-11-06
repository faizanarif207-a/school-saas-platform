// src/app/api/school/students/[id]/result-card/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || (user.role !== "SCHOOL_ADMIN" && user.role !== "PARENT" && user.role !== "STUDENT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const url = new URL(req.url);
  const examId = url.searchParams.get("examId");

  // Verify access
  if (user.role === "SCHOOL_ADMIN") {
    const student = await db.student.findFirst({ where: { id, schoolId: user.schoolId } });
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
  } else if (user.role === "PARENT") {
    const link = await db.parentStudent.findFirst({ where: { parentId: user.id, studentId: id } });
    if (!link) return NextResponse.json({ error: "Not linked" }, { status: 403 });
  }

  const school = await db.school.findUnique({
    where: { id: user.schoolId || "" },
    select: { name: true, city: true },
  });

  const student = await db.student.findUnique({
    where: { id },
    include: {
      enrollments: {
        where: { academicYear: { isActive: true } },
        include: { section: { include: { class: true } }, academicYear: true },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
      examMarks: {
        where: examId ? { examId } : {},
        include: { exam: true, subject: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const enr = student.enrollments[0];
  const examName = student.examMarks[0]?.exam.name || "Latest Exam";
  const totalMarks = student.examMarks.reduce((s, m) => s + m.totalMarks, 0);
  const obtainedMarks = student.examMarks.reduce((s, m) => s + m.marks, 0);
  const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : percentage >= 50 ? "D" : "F";

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Result Card - ${student.name}</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Inter, sans-serif; color:#1C232D; background:#fff; padding:40px; max-width:800px; margin:0 auto; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:20px; border-bottom:3px solid #0064C8; }
  .logo-bars { display:flex; flex-direction:column; gap:4px; }
  .logo-bars div { border-radius:2px; }
  .logo-bars .b1 { width:48px; height:10px; background:#F5A800; }
  .logo-bars .b2 { width:36px; height:10px; background:#0E9E56; }
  .logo-bars .b3 { width:48px; height:10px; background:#0064C8; }
  .school-name { font-size:22px; font-weight:700; }
  .school-city { font-size:12px; color:#5B6672; margin-top:2px; }
  .title { text-align:center; font-size:22px; font-weight:700; margin:24px 0; color:#0064C8; }
  .info-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-bottom:24px; }
  .info-card { background:#FDFDFB; border:1px solid #E6E8E4; border-radius:8px; padding:12px; }
  .info-label { font-size:10px; text-transform:uppercase; letter-spacing:0.06em; font-weight:700; color:#5B6672; }
  .info-value { font-size:14px; font-weight:600; margin-top:4px; }
  table { width:100%; border-collapse:collapse; margin:20px 0; }
  th { background:#F1F5F9; padding:10px; font-size:10px; color:#5B6672; text-transform:uppercase; font-weight:700; text-align:left; border-bottom:2px solid #0064C8; }
  td { padding:10px; border-bottom:1px solid #E6E8E4; font-size:13px; }
  .summary { background:#FEF4DD; border-top:2px solid #F5A800; padding:16px; border-radius:8px; margin-top:20px; }
  .summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; text-align:center; }
  .summary-label { font-size:10px; text-transform:uppercase; font-weight:700; color:#7A5200; }
  .summary-value { font-size:22px; font-weight:700; margin-top:4px; color:#1C232D; }
  .footer { margin-top:40px; padding-top:15px; border-top:1px dashed #E6E8E4; display:flex; justify-content:space-between; font-size:10px; color:#5B6672; }
  .sign { text-align:center; margin-top:60px; }
  .sign-line { width:200px; margin:0 auto 4px; border-top:1px solid #1C232D; }
  .sign-text { font-size:11px; color:#5B6672; }
  @media print { body { padding:20px; } }
</style>
</head><body>
  <div class="header">
    <div>
      <div class="logo-bars"><div class="b1"></div><div class="b2"></div><div class="b3"></div></div>
      <div class="school-name" style="margin-top:8px;">${school?.name || "School"}</div>
      <div class="school-city">${school?.city || ""} · Powered by Emerson Technology</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:10px; text-transform:uppercase; font-weight:700; color:#5B6672;">Result Card</div>
      <div style="font-size:16px; font-weight:700; color:#0064C8; margin-top:2px;">${examName}</div>
      <div style="font-size:11px; color:#5B6672; margin-top:2px;">Generated: ${new Date().toLocaleDateString("en-GB")}</div>
    </div>
  </div>

  <div class="title">Student Result Card</div>

  <div class="info-grid">
    <div class="info-card"><div class="info-label">Student Name</div><div class="info-value">${student.name}</div></div>
    <div class="info-card"><div class="info-label">Admission ID</div><div class="info-value" style="font-family:monospace; color:#0064C8;">${student.admissionId || "—"}</div></div>
    <div class="info-card"><div class="info-label">Class</div><div class="info-value">${enr ? `${enr.section.class.name}-${enr.section.name}` : "—"}</div></div>
    <div class="info-card"><div class="info-label">Roll Number</div><div class="info-value">${enr?.rollNo || "—"}</div></div>
  </div>

  <table>
    <thead><tr><th>Subject</th><th>Total Marks</th><th>Obtained</th><th>Grade</th><th>Remarks</th></tr></thead>
    <tbody>
      ${student.examMarks.map(m => `<tr><td style="font-weight:600;">${m.subject.name}</td><td>${m.totalMarks}</td><td style="font-weight:700;">${m.marks}</td><td><span style="padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; background:${m.grade === "A+" || m.grade === "A" ? "#ECFDF5" : m.grade === "F" ? "#FEF2F2" : "#FFFBEB"}; color:${m.grade === "A+" || m.grade === "A" ? "#047857" : m.grade === "F" ? "#B91C1C" : "#B45309"};">${m.grade}</span></td><td>${m.remarks || "—"}</td></tr>`).join("")}
      ${student.examMarks.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:#5B6672;">No marks entered yet for this exam.</td></tr>' : ""}
    </tbody>
  </table>

  ${student.examMarks.length > 0 ? `
  <div class="summary">
    <div class="summary-grid">
      <div><div class="summary-label">Total Marks</div><div class="summary-value">${obtainedMarks} / ${totalMarks}</div></div>
      <div><div class="summary-label">Percentage</div><div class="summary-value">${percentage}%</div></div>
      <div><div class="summary-label">Grade</div><div class="summary-value">${grade}</div></div>
      <div><div class="summary-label">Subjects</div><div class="summary-value">${student.examMarks.length}</div></div>
    </div>
  </div>` : ""}

  <div class="footer">
    <div>Generated by SchoolSaaS · Emerson Technology</div>
    <div>${new Date().toLocaleDateString("en-GB")}</div>
  </div>

  <div class="sign">
    <div class="sign-line"></div>
    <div class="sign-text">Principal's Signature</div>
  </div>
</body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
