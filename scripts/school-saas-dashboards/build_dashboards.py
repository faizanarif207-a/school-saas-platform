"""Generate and render all 7 role dashboard wireframes."""
import os
import re
from playwright.sync_api import sync_playwright

DASH_DIR = "/home/z/my-project/scripts/school-saas-dashboards"
OUT_DIR = "/home/z/my-project/download/school-saas-dashboards"
os.makedirs(OUT_DIR, exist_ok=True)

with open(os.path.join(DASH_DIR, "shared.css"), "r", encoding="utf-8") as f:
    SHARED_CSS = f.read()


def page_html(title, subtitle, url, accent, sidebar_bg, sidebar_items, topbar_btn_label,
              kpis_html, main_content_html, annotations):
    """Build a full HTML page for one role dashboard.

    sidebar_items: list of dicts: {label: str, items: list of {name, badge?, count?}}
    annotations: list of (num, label, desc)
    """
    sidebar_html = []
    for sec in sidebar_items:
        sidebar_html.append(f'<div class="nav-section"><div class="nav-label">{sec["label"]}</div>')
        for it in sec["items"]:
            badge = ""
            if it.get("badge"):
                badge = f'<span class="nav-badge">{it["badge"]}</span>'
            elif it.get("count"):
                badge = f'<span class="nav-count">{it["count"]}</span>'
            active = " active" if it.get("active") else ""
            sidebar_html.append(
                f'<div class="nav-item{active}"><span class="nav-icon">{it["icon"]}</span>'
                f'<span>{it["name"]}</span>{badge}</div>'
            )
        sidebar_html.append('</div>')

    annot_html = []
    for num, label, desc in annotations:
        annot_html.append(
            f'<div class="annot-item"><span class="annot-num">{num}</span>'
            f'<span class="annot-label">{label}</span>'
            f'<div class="annot-desc">{desc}</div></div>'
        )

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>{title}</title>
<style>{SHARED_CSS}
.canvas {{ width: 1500px; }}
.browser-body {{ min-height: 660px; }}
</style>
</head><body style="--accent: {accent}; --sidebar: {sidebar_bg};">
<div class="canvas">
  <div class="header">
    <h1>{title}</h1>
    <p>{subtitle}</p>
  </div>
  <div class="layout">
    <div class="browser-wrap">
      <div class="browser">
        <div class="browser-bar">
          <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
          <div class="url-bar">{url}</div>
        </div>
        <div class="browser-body">
          <div class="sidebar">
            <div class="logo">
              <div class="logo-text">SchoolSaaS</div>
              <div class="logo-sub">{subtitle.split("—")[0].strip() if "—" in subtitle else "Portal"}</div>
            </div>
            {''.join(sidebar_html)}
          </div>
          <div class="main">
            <div class="topbar">
              <div class="page-title">
                <h2>{title.split("—")[1].strip() if "—" in title else title}</h2>
                <div class="breadcrumb">Home &rsaquo; Dashboard</div>
              </div>
              <div class="topbar-actions">
                <button class="btn">Export</button>
                <button class="btn btn-primary">{topbar_btn_label}</button>
                <div class="avatar">{''.join([c for c in subtitle if c.isalpha()][:2]).upper() or "U"}</div>
              </div>
            </div>
            {kpis_html}
            {main_content_html}
          </div>
        </div>
      </div>
    </div>
    <div class="annot-panel">
      <div class="annot-title">Wireframe Guide</div>
      {''.join(annot_html)}
    </div>
  </div>
</div>
</body></html>"""


# ─── 1. School Admin ───
school_admin = page_html(
    title="School Admin Dashboard — School SaaS",
    subtitle="School Admin — runs one school's day-to-day setup",
    url="https://platform.yourschoolsaas.pk/school/admin/dashboard",
    accent="#0F766E",
    sidebar_bg="#0F172A",
    sidebar_items=[
        {"label": "School", "items": [
            {"name": "Dashboard", "icon": "▣", "active": True},
            {"name": "Students", "icon": "🎓", "count": "542"},
            {"name": "Staff", "icon": "👥", "count": "28"},
            {"name": "Classes", "icon": "🏛"},
            {"name": "Subjects", "icon": "📚"},
        ]},
        {"label": "Billing", "items": [
            {"name": "Fee Plans", "icon": "₹"},
            {"name": "Invoices", "icon": "🧾"},
            {"name": "Reports", "icon": "📊"},
        ]},
        {"label": "Settings", "items": [
            {"name": "School Profile", "icon": "⚙"},
            {"name": "Academic Year", "icon": "📅"},
            {"name": "Invite Users", "icon": "✉"},
        ]},
    ],
    topbar_btn_label="+ Add Student",
    kpis_html="""<div class="stats">
        <div class="stat-card"><div class="stat-label">Total Students</div><div class="stat-value">542</div><div class="stat-delta up">+12 this week</div></div>
        <div class="stat-card"><div class="stat-label">Total Staff</div><div class="stat-value">28</div><div class="stat-delta">22 teachers · 6 admin</div></div>
        <div class="stat-card"><div class="stat-label">Classes</div><div class="stat-value">10</div><div class="stat-delta">24 sections</div></div>
        <div class="stat-card"><div class="stat-label">Fee Collected (Month)</div><div class="stat-value">PKR 480K</div><div class="stat-delta up">87% of target</div></div>
    </div>""",
    main_content_html="""<div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Class Strength (2024-25)</div><a class="panel-link">View all →</a></div>
        <table><thead><tr><th>Class</th><th>Sections</th><th>Students</th><th>Avg Attendance</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Class 1</td><td>A, B</td><td>52</td><td>92%</td><td><span class="status-pill pill-active">Healthy</span></td></tr>
          <tr><td>Class 5</td><td>A, B, C</td><td>78</td><td>89%</td><td><span class="status-pill pill-active">Healthy</span></td></tr>
          <tr><td>Class 8</td><td>A, B</td><td>64</td><td>81%</td><td><span class="status-pill pill-pending">Watch</span></td></tr>
          <tr><td>Class 10</td><td>A</td><td>34</td><td>76%</td><td><span class="status-pill pill-suspended">Low</span></td></tr>
        </tbody></table>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Recent Admissions</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>This week</span><span>12 new</span></div><div class="bar-track"><div class="bar-fill" style="width:60%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>This month</span><span>38 new</span></div><div class="bar-track"><div class="bar-fill" style="width:78%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Pending approval</span><span>3</span></div><div class="bar-track"><div class="bar-fill" style="width:15%;background:#B45309;"></div></div></div>
          <div style="margin-top:14px;padding-top:10px;border-top:1px dashed #E2E8F0;font-size:10.5px;color:#64748B;line-height:1.5;">
            Top source: <strong style="color:#1E293B;">Walk-ins (47%)</strong><br>
            Second: <strong style="color:#1E293B;">Referral (28%)</strong>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-card">
      <div class="panel-header"><div class="panel-title">Staff Overview</div><a class="panel-link">Manage →</a></div>
      <table><thead><tr><th>Name</th><th>Role</th><th>Subject</th><th>Classes</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Ayesha Khan</td><td>Principal</td><td>—</td><td>All</td><td><span class="status-pill pill-active">Active</span></td></tr>
        <tr><td>Imran Sheikh</td><td>Accountant</td><td>—</td><td>—</td><td><span class="status-pill pill-active">Active</span></td></tr>
        <tr><td>Sana Mir</td><td>Teacher</td><td>Mathematics</td><td>5, 6</td><td><span class="status-pill pill-active">Active</span></td></tr>
        <tr><td>Bilal Ahmed</td><td>Teacher</td><td>English</td><td>7, 8</td><td><span class="status-pill pill-pending">On leave</span></td></tr>
      </tbody></table>
    </div>""",
    annotations=[
        (1, "Sidebar", "School-scoped navigation. Admin sees setup + billing. Cannot see platform-level controls."),
        (2, "Topbar", "Quick '+ Add Student' opens admission form. Export downloads CSV/Excel."),
        (3, "KPI cards", "School health at a glance: students, staff, classes, this month's fee collection vs target."),
        (4, "Class strength", "Per-class roll with attendance %. Color pill flags classes that need attention."),
        (5, "Recent admissions", "Trend bars show weekly/monthly intake. Helps admin plan staffing & marketing."),
        (6, "Staff table", "All users of this school with their role + current status. Admin can edit / deactivate."),
    ],
)

# ─── 2. Principal ───
principal = page_html(
    title="Principal Dashboard — School SaaS",
    subtitle="Principal — academic head, monitors results & approvals",
    url="https://platform.yourschoolsaas.pk/school/principal/dashboard",
    accent="#7C3AED",
    sidebar_bg="#0F172A",
    sidebar_items=[
        {"label": "Academics", "items": [
            {"name": "Dashboard", "icon": "▣", "active": True},
            {"name": "Attendance", "icon": "✓"},
            {"name": "Exams", "icon": "📝"},
            {"name": "Results", "icon": "🏆", "badge": "4"},
            {"name": "Teachers", "icon": "👩‍🏫"},
        ]},
        {"label": "Approvals", "items": [
            {"name": "Pending Approvals", "icon": "◷", "badge": "4"},
            {"name": "Result Cards", "icon": "📄"},
            {"name": "Timetable", "icon": "📅"},
        ]},
        {"label": "Reports", "items": [
            {"name": "Class Reports", "icon": "📊"},
            {"name": "Teacher Performance", "icon": "📈"},
            {"name": "Audit Log", "icon": "🛡"},
        ]},
    ],
    topbar_btn_label="Approve Pending",
    kpis_html="""<div class="stats">
        <div class="stat-card"><div class="stat-label">Total Students</div><div class="stat-value">542</div><div class="stat-delta">across 10 classes</div></div>
        <div class="stat-card"><div class="stat-label">Attendance Today</div><div class="stat-value">88%</div><div class="stat-delta up">+2% vs avg</div></div>
        <div class="stat-card"><div class="stat-label">Avg Result (Mid-Term)</div><div class="stat-value">73%</div><div class="stat-delta warn">-3% vs last term</div></div>
        <div class="stat-card"><div class="stat-label">Pending Approvals</div><div class="stat-value">4</div><div class="stat-delta down">2 results · 2 leaves</div></div>
    </div>""",
    main_content_html="""<div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Pending Approvals</div><a class="panel-link">View all →</a></div>
        <table><thead><tr><th>Type</th><th>Submitted by</th><th>Detail</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>Result Card</td><td>Ms. Sana (Class 5)</td><td>Mid-Term · 52 students</td><td><span style="color:#7C3AED;font-weight:600;">Review</span></td></tr>
          <tr><td>Result Card</td><td>Mr. Bilal (Class 8)</td><td>Mid-Term · 64 students</td><td><span style="color:#7C3AED;font-weight:600;">Review</span></td></tr>
          <tr><td>Leave Request</td><td>Ms. Hina (Urdu)</td><td>2 days · Medical</td><td><span style="color:#7C3AED;font-weight:600;">Approve</span></td></tr>
          <tr><td>Leave Request</td><td>Mr. Tariq (Sci)</td><td>1 day · Personal</td><td><span style="color:#7C3AED;font-weight:600;">Approve</span></td></tr>
        </tbody></table>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Today's Attendance by Class</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>Class 1</span><span>94%</span></div><div class="bar-track"><div class="bar-fill" style="width:94%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Class 5</span><span>89%</span></div><div class="bar-track"><div class="bar-fill" style="width:89%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Class 8</span><span>81%</span></div><div class="bar-track"><div class="bar-fill" style="width:81%;background:#B45309;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Class 10</span><span>76%</span></div><div class="bar-track"><div class="bar-fill" style="width:76%;background:#DC2626;"></div></div></div>
          <div style="margin-top:14px;padding:8px 10px;background:#FEF3C7;border-radius:5px;font-size:10.5px;color:#92400E;line-height:1.4;">
            <strong>Action needed:</strong> Class 10 attendance below 80% threshold for 3rd consecutive day.
          </div>
        </div>
      </div>
    </div>
    <div class="panel-card">
      <div class="panel-header"><div class="panel-title">Teacher Performance — Mid-Term</div><a class="panel-link">Detailed report →</a></div>
      <table><thead><tr><th>Teacher</th><th>Subject</th><th>Classes</th><th>Avg Result</th><th>Attendance Marked</th><th>Flag</th></tr></thead>
      <tbody>
        <tr><td>Sana Mir</td><td>Mathematics</td><td>5, 6</td><td>78%</td><td>100%</td><td><span class="status-pill pill-active">On track</span></td></tr>
        <tr><td>Imran S.</td><td>Physics</td><td>9, 10</td><td>71%</td><td>96%</td><td><span class="status-pill pill-active">On track</span></td></tr>
        <tr><td>Hina Q.</td><td>Urdu</td><td>3, 4</td><td>62%</td><td>88%</td><td><span class="status-pill pill-pending">Review</span></td></tr>
        <tr><td>Tariq M.</td><td>Science</td><td>7, 8</td><td>54%</td><td>72%</td><td><span class="status-pill pill-suspended">Concern</span></td></tr>
      </tbody></table>
    </div>""",
    annotations=[
        (1, "Sidebar", "Academics-focused menu. Sees exams, results, teachers. Cannot edit fee plans or payroll."),
        (2, "KPI cards", "Academic health metrics: attendance, avg result, pending approvals queue."),
        (3, "Approvals queue", "Result cards submitted by teachers need principal sign-off before going to parents."),
        (4, "Class attendance", "Today's attendance per class. Auto-flags classes below 80% for 3+ days."),
        (5, "Teacher performance", "Cross-tab of result % + attendance-marking discipline. Identifies who needs coaching."),
    ],
)

# ─── 3. Admission Officer ───
admission = page_html(
    title="Admission Officer Dashboard — School SaaS",
    subtitle="Admission Officer — manages inquiries → enrollment funnel",
    url="https://platform.yourschoolsaas.pk/school/admission/dashboard",
    accent="#2563EB",
    sidebar_bg="#0F172A",
    sidebar_items=[
        {"label": "Admissions", "items": [
            {"name": "Dashboard", "icon": "▣", "active": True},
            {"name": "Inquiries", "icon": "📞", "count": "47"},
            {"name": "Follow-ups", "icon": "🔄", "badge": "8"},
            {"name": "Applications", "icon": "📋"},
            {"name": "Admitted", "icon": "✅"},
        ]},
        {"label": "Marketing", "items": [
            {"name": "Sources", "icon": "📍"},
            {"name": "Campaigns", "icon": "📣"},
            {"name": "Offers", "icon": "🎁"},
        ]},
        {"label": "Reports", "items": [
            {"name": "Conversion Funnel", "icon": "🔻"},
            {"name": "Monthly Stats", "icon": "📊"},
        ]},
    ],
    topbar_btn_label="+ New Inquiry",
    kpis_html="""<div class="stats">
        <div class="stat-card"><div class="stat-label">New Inquiries (Month)</div><div class="stat-value">47</div><div class="stat-delta up">+18% vs last month</div></div>
        <div class="stat-card"><div class="stat-label">Follow-ups Due Today</div><div class="stat-value">8</div><div class="stat-delta down">3 overdue</div></div>
        <div class="stat-card"><div class="stat-label">Converted (Month)</div><div class="stat-value">12</div><div class="stat-delta up">26% conversion</div></div>
        <div class="stat-card"><div class="stat-label">Pending Decisions</div><div class="stat-value">23</div><div class="stat-delta warn">need nurturing</div></div>
    </div>""",
    main_content_html="""<div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Admission Funnel (This Month)</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>1. Inquired</span><span>47</span></div><div class="bar-track"><div class="bar-fill" style="width:100%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>2. Campus Visit</span><span>32</span></div><div class="bar-track"><div class="bar-fill" style="width:68%;background:#3B82F6;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>3. Form Submitted</span><span>21</span></div><div class="bar-track"><div class="bar-fill" style="width:45%;background:#1D4ED8;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>4. Interview/Assessment</span><span>16</span></div><div class="bar-track"><div class="bar-fill" style="width:34%;background:#1E40AF;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>5. Admitted</span><span>12</span></div><div class="bar-track"><div class="bar-fill" style="width:26%;background:#0F766E;"></div></div></div>
          <div style="margin-top:14px;padding-top:10px;border-top:1px dashed #E2E8F0;font-size:10.5px;color:#475569;line-height:1.5;">
            <strong style="color:#1E293B;">Biggest drop:</strong> Visit → Form (34% drop). Parents visit but don't submit.
          </div>
        </div>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Inquiries by Source</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>Walk-in</span><span>22 (47%)</span></div><div class="bar-track"><div class="bar-fill" style="width:47%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Facebook Ads</span><span>13 (28%)</span></div><div class="bar-track"><div class="bar-fill" style="width:28%;background:#3B82F6;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Referral</span><span>8 (17%)</span></div><div class="bar-track"><div class="bar-fill" style="width:17%;background:#0F766E;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Website</span><span>4 (8%)</span></div><div class="bar-track"><div class="bar-fill" style="width:8%;background:#B45309;"></div></div></div>
        </div>
      </div>
    </div>
    <div class="panel-card">
      <div class="panel-header"><div class="panel-title">Today's Follow-ups</div><a class="panel-link">All follow-ups →</a></div>
      <table><thead><tr><th>Parent</th><th>Phone</th><th>Stage</th><th>Last Contact</th><th>Next Action</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Asad Mahmood</td><td>0301-2233445</td><td>Visit done</td><td>2 days ago</td><td>Send fee structure</td><td><span class="status-pill pill-pending">Due today</span></td></tr>
        <tr><td>Fariha Noor</td><td>0302-5567890</td><td>Form submitted</td><td>5 days ago</td><td>Schedule assessment</td><td><span class="status-pill pill-suspended">Overdue</span></td></tr>
        <tr><td>Kamran Ali</td><td>0312-9988776</td><td>Inquired</td><td>Yesterday</td><td>Invite for campus visit</td><td><span class="status-pill pill-active">Today</span></td></tr>
        <tr><td>Rabia Shah</td><td>0333-1122334</td><td>Visit done</td><td>3 days ago</td><td>Discount approval call</td><td><span class="status-pill pill-pending">Due today</span></td></tr>
      </tbody></table>
    </div>""",
    annotations=[
        (1, "Sidebar", "CRM-only navigation. Sees inquiries, follow-ups, sources. Cannot access fees or payroll."),
        (2, "KPI cards", "Funnel health: new inquiries, today's follow-ups, conversions, pending decisions."),
        (3, "Funnel chart", "Stage-by-stage drop-off. The bar that shrinks most = where to fix the process."),
        (4, "Source breakdown", "Which marketing channel brings most inquiries — guides ad spend decisions."),
        (5, "Follow-ups list", "Daily task queue. Overdue items flagged red so nothing slips through."),
    ],
)

# ─── 4. Accountant ───
accountant = page_html(
    title="Accountant Dashboard — School SaaS",
    subtitle="Accountant — handles fees, invoices, payments & receipts",
    url="https://platform.yourschoolsaas.pk/school/accountant/dashboard",
    accent="#B45309",
    sidebar_bg="#0F172A",
    sidebar_items=[
        {"label": "Fees", "items": [
            {"name": "Dashboard", "icon": "▣", "active": True},
            {"name": "Invoices", "icon": "🧾", "count": "542"},
            {"name": "Payments", "icon": "💰"},
            {"name": "Receipts", "icon": "📄"},
        ]},
        {"label": "Tracking", "items": [
            {"name": "Defaulters", "icon": "⚠", "badge": "37"},
            {"name": "Pending Invoices", "icon": "◷", "badge": "12"},
            {"name": "Scholarships", "icon": "🎓"},
        ]},
        {"label": "Reports", "items": [
            {"name": "Monthly Collection", "icon": "📊"},
            {"name": "Class-wise Reports", "icon": "📈"},
            {"name": "Export", "icon": "⬇"},
        ]},
    ],
    topbar_btn_label="+ New Invoice",
    kpis_html="""<div class="stats">
        <div class="stat-card"><div class="stat-label">Collected (Month)</div><div class="stat-value">PKR 480K</div><div class="stat-delta up">87% of target</div></div>
        <div class="stat-card"><div class="stat-label">Outstanding</div><div class="stat-value">PKR 71K</div><div class="stat-delta down">13% of monthly</div></div>
        <div class="stat-card"><div class="stat-label">Defaulters</div><div class="stat-value">37</div><div class="stat-delta warn">8 new this week</div></div>
        <div class="stat-card"><div class="stat-label">Today's Receipts</div><div class="stat-value">PKR 24K</div><div class="stat-delta">18 payments</div></div>
    </div>""",
    main_content_html="""<div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Monthly Collection — Last 6 Months</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>May</span><span>PKR 410K</span></div><div class="bar-track"><div class="bar-fill" style="width:74%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Jun</span><span>PKR 425K</span></div><div class="bar-track"><div class="bar-fill" style="width:77%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Jul</span><span>PKR 380K</span></div><div class="bar-track"><div class="bar-fill" style="width:69%;background:#3B82F6;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Aug</span><span>PKR 455K</span></div><div class="bar-track"><div class="bar-fill" style="width:82%;background:#3B82F6;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Sep</span><span>PKR 470K</span></div><div class="bar-track"><div class="bar-fill" style="width:85%;background:#3B82F6;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Oct</span><span>PKR 480K</span></div><div class="bar-track"><div class="bar-fill" style="width:87%;background:#0F766E;"></div></div></div>
          <div style="margin-top:14px;padding-top:10px;border-top:1px dashed #E2E8F0;font-size:10.5px;color:#475569;">
            <strong style="color:#1E293B;">Trend:</strong> Improving. September school reopening pushed collections up.
          </div>
        </div>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Defaulters by Class</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>Class 1</span><span>3</span></div><div class="bar-track"><div class="bar-fill" style="width:8%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Class 5</span><span>6</span></div><div class="bar-track"><div class="bar-fill" style="width:16%;background:#B45309;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Class 8</span><span>11</span></div><div class="bar-track"><div class="bar-fill" style="width:30%;background:#DC2626;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Class 10</span><span>17</span></div><div class="bar-track"><div class="bar-fill" style="width:46%;background:#DC2626;"></div></div></div>
          <div style="margin-top:14px;padding:8px 10px;background:#FEE2E2;border-radius:5px;font-size:10.5px;color:#991B1B;line-height:1.4;">
            <strong>Class 10 has 46% of all defaulters.</strong> Suggests fee review for senior classes.
          </div>
        </div>
      </div>
    </div>
    <div class="panel-card">
      <div class="panel-header"><div class="panel-title">Recent Payments</div><a class="panel-link">View all →</a></div>
      <table><thead><tr><th>Receipt #</th><th>Student</th><th>Class</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>R-1042</td><td>Ali Hassan</td><td>5-A</td><td>PKR 4,500</td><td>Cash</td><td><span class="status-pill pill-paid">Paid</span></td></tr>
        <tr><td>R-1041</td><td>Sara Imran</td><td>3-B</td><td>PKR 3,800</td><td>Bank Transfer</td><td><span class="status-pill pill-paid">Paid</span></td></tr>
        <tr><td>R-1040</td><td>Hamza Tariq</td><td>8-A</td><td>PKR 5,200</td><td>JazzCash</td><td><span class="status-pill pill-paid">Paid</span></td></tr>
        <tr><td>R-1039</td><td>Zara Ahmed</td><td>10-A</td><td>PKR 6,500</td><td>—</td><td><span class="status-pill pill-overdue">Overdue</span></td></tr>
      </tbody></table>
    </div>""",
    annotations=[
        (1, "Sidebar", "Money-only navigation: invoices, payments, receipts, defaulters, reports. No access to academics or admissions."),
        (2, "KPI cards", "Cash-flow health: collected this month, outstanding, defaulters count, today's receipts."),
        (3, "Collection chart", "6-month trend. Shows seasonality — dip in summer break, peak at session restart."),
        (4, "Defaulters breakdown", "Class-wise view. Quickly spots where to focus reminder calls/SMS."),
        (5, "Recent payments", "Live activity log. PDF receipt auto-generated on each 'Paid' entry."),
    ],
)

# ─── 5. Teacher ───
teacher = page_html(
    title="Teacher Dashboard — School SaaS",
    subtitle="Teacher — daily classroom operations: attendance & marks",
    url="https://platform.yourschoolsaas.pk/school/teacher/dashboard",
    accent="#0891B2",
    sidebar_bg="#0F172A",
    sidebar_items=[
        {"label": "My Classes", "items": [
            {"name": "Dashboard", "icon": "▣", "active": True},
            {"name": "My Timetable", "icon": "📅"},
            {"name": "My Students", "icon": "🎓", "count": "128"},
        ]},
        {"label": "Daily Tasks", "items": [
            {"name": "Mark Attendance", "icon": "✓", "badge": "2"},
            {"name": "Enter Marks", "icon": "✏", "badge": "1"},
            {"name": "Homework", "icon": "📓"},
        ]},
        {"label": "Records", "items": [
            {"name": "My Attendance", "icon": "🕐"},
            {"name": "Lesson Plans", "icon": "📋"},
            {"name": "Student Notes", "icon": "💬"},
        ]},
    ],
    topbar_btn_label="Mark Today's Attendance",
    kpis_html="""<div class="stats">
        <div class="stat-card"><div class="stat-label">My Classes</div><div class="stat-value">4</div><div class="stat-delta">Class 5, 6, 7, 8</div></div>
        <div class="stat-card"><div class="stat-label">Students Taught</div><div class="stat-value">128</div><div class="stat-delta">across all sections</div></div>
        <div class="stat-card"><div class="stat-label">Attendance Pending</div><div class="stat-value">2</div><div class="stat-delta warn">Class 7-A · 8-B</div></div>
        <div class="stat-card"><div class="stat-label">Marks Pending</div><div class="stat-value">1</div><div class="stat-delta warn">Class 5 mid-term</div></div>
    </div>""",
    main_content_html="""<div class="panel-card">
      <div class="panel-header"><div class="panel-title">Today's Timetable — Wednesday</div><a class="panel-link">Full week →</a></div>
      <table><thead><tr><th>Period</th><th>Time</th><th>Class</th><th>Section</th><th>Subject</th><th>Room</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>08:00 – 08:45</td><td>Class 5</td><td>A</td><td>Mathematics</td><td>R-12</td><td><span class="status-pill pill-active">Done</span></td></tr>
        <tr><td>2</td><td>08:50 – 09:35</td><td>Class 6</td><td>B</td><td>Mathematics</td><td>R-15</td><td><span class="status-pill pill-active">Done</span></td></tr>
        <tr><td>3</td><td>09:40 – 10:25</td><td>Class 7</td><td>A</td><td>Mathematics</td><td>R-09</td><td><span class="status-pill pill-pending">Now</span></td></tr>
        <tr><td>4</td><td>10:30 – 11:15</td><td>—</td><td>—</td><td>Free Period</td><td>—</td><td>—</td></tr>
        <tr><td>5</td><td>11:20 – 12:05</td><td>Class 8</td><td>B</td><td>Mathematics</td><td>R-18</td><td><span class="status-pill pill-pending">Upcoming</span></td></tr>
      </tbody></table>
    </div>
    <div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Pending Tasks</div></div>
        <table><thead><tr><th>Task</th><th>Class</th><th>Due</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>Mark attendance</td><td>7-A</td><td>Today · 10:25</td><td><span style="color:#0891B2;font-weight:600;">Open</span></td></tr>
          <tr><td>Mark attendance</td><td>8-B</td><td>Today · 12:05</td><td><span style="color:#0891B2;font-weight:600;">Open</span></td></tr>
          <tr><td>Enter mid-term marks</td><td>5-A (52 students)</td><td>Friday EOD</td><td><span style="color:#0891B2;font-weight:600;">Start</span></td></tr>
        </tbody></table>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">My Students — Class 7-A</div></div>
        <div class="section-row" style="font-size:11px;color:#475569;line-height:1.6;">
          <strong style="color:#1E293B;">32 students</strong> · 18 boys, 14 girls<br><br>
          <strong>Avg attendance (month):</strong> 89%<br>
          <strong>Avg mid-term result:</strong> 76%<br>
          <strong>Needs attention:</strong> 4 students<br>
          <strong>Top performer:</strong> Ahmed Raza (94%)
          <div style="margin-top:12px;padding:8px 10px;background:#E0F2FE;border-radius:5px;color:#0369A1;font-size:10.5px;line-height:1.4;">
            4 students below 70% attendance. Send note to parents?
          </div>
        </div>
      </div>
    </div>""",
    annotations=[
        (1, "Sidebar", "Teacher-scoped. Sees only own classes, own students, own attendance. Cannot view other teachers' data."),
        (2, "KPI cards", "Today's workload: classes, students, attendance/marks pending — the two daily tasks."),
        (3, "Today's timetable", "Period-by-period schedule. 'Now' pill shows current class. Free periods shown."),
        (4, "Pending tasks", "Smart to-do. Reminds teacher what to mark/enter before day ends. Auto-shared with principal."),
        (5, "My students view", "Per-class snapshot. Flags students needing attention so teacher can act fast."),
    ],
)

# ─── 6. Parent ───
parent = page_html(
    title="Parent Portal — School SaaS",
    subtitle="Parent — read-only view of child's progress & fees",
    url="https://platform.yourschoolsaas.pk/parent/dashboard",
    accent="#DB2777",
    sidebar_bg="#0F172A",
    sidebar_items=[
        {"label": "My Children", "items": [
            {"name": "Dashboard", "icon": "▣", "active": True},
            {"name": "Ali (Class 5-A)", "icon": "👦"},
            {"name": "Sara (Class 3-B)", "icon": "👧"},
        ]},
        {"label": "Tracking", "items": [
            {"name": "Attendance", "icon": "📅"},
            {"name": "Results", "icon": "🏆"},
            {"name": "Fees & Receipts", "icon": "🧾"},
            {"name": "Notices", "icon": "📣", "badge": "3"},
        ]},
        {"label": "Actions", "items": [
            {"name": "Pay Fees Online", "icon": "💳"},
            {"name": "Apply Leave", "icon": "✉"},
            {"name": "Message School", "icon": "💬"},
        ]},
    ],
    topbar_btn_label="Pay Fees",
    kpis_html="""<div class="stats">
        <div class="stat-card"><div class="stat-label">Selected Child</div><div class="stat-value" style="font-size:14px;">Ali Hassan</div><div class="stat-delta">Class 5-A · Roll 14</div></div>
        <div class="stat-card"><div class="stat-label">Attendance (Month)</div><div class="stat-value">94%</div><div class="stat-delta up">Excellent</div></div>
        <div class="stat-card"><div class="stat-label">Pending Fees</div><div class="stat-value">PKR 4,500</div><div class="stat-delta warn">Due in 5 days</div></div>
        <div class="stat-card"><div class="stat-label">Latest Result</div><div class="stat-value">82%</div><div class="stat-delta up">Mid-Term</div></div>
    </div>""",
    main_content_html="""<div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Attendance — This Month</div></div>
        <table><thead><tr><th>Date</th><th>Status</th><th>Marked by</th></tr></thead>
        <tbody>
          <tr><td>Wed, 12 Oct</td><td><span class="status-pill pill-active">Present</span></td><td>Ms. Sana</td></tr>
          <tr><td>Tue, 11 Oct</td><td><span class="status-pill pill-active">Present</span></td><td>Ms. Sana</td></tr>
          <tr><td>Mon, 10 Oct</td><td><span class="status-pill pill-pending">Late</span></td><td>Ms. Sana</td></tr>
          <tr><td>Fri, 7 Oct</td><td><span class="status-pill pill-active">Present</span></td><td>Ms. Sana</td></tr>
          <tr><td>Thu, 6 Oct</td><td><span class="status-pill pill-suspended">Absent</span></td><td>Ms. Sana</td></tr>
        </tbody></table>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Subjects — Mid-Term Result</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>Mathematics</span><span>88%</span></div><div class="bar-track"><div class="bar-fill" style="width:88%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>English</span><span>78%</span></div><div class="bar-track"><div class="bar-fill" style="width:78%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Urdu</span><span>82%</span></div><div class="bar-track"><div class="bar-fill" style="width:82%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Science</span><span>75%</span></div><div class="bar-track"><div class="bar-fill" style="width:75%;background:#B45309;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Islamiat</span><span>91%</span></div><div class="bar-track"><div class="bar-fill" style="width:91%;background:#0F766E;"></div></div></div>
        </div>
      </div>
    </div>
    <div class="row-grid-1-1">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Recent Fee Receipts</div><a class="panel-link">All →</a></div>
        <table><thead><tr><th>Receipt #</th><th>Month</th><th>Amount</th><th>Method</th><th>Download</th></tr></thead>
        <tbody>
          <tr><td>R-1042</td><td>September</td><td>PKR 4,500</td><td>Cash</td><td><span style="color:#DB2777;font-weight:600;">PDF</span></td></tr>
          <tr><td>R-0987</td><td>August</td><td>PKR 4,500</td><td>JazzCash</td><td><span style="color:#DB2777;font-weight:600;">PDF</span></td></tr>
          <tr><td>R-0912</td><td>July</td><td>PKR 4,500</td><td>Bank</td><td><span style="color:#DB2777;font-weight:600;">PDF</span></td></tr>
        </tbody></table>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Recent Notices</div></div>
        <div class="section-row" style="font-size:10.5px;color:#475569;line-height:1.55;">
          <div style="padding:8px 10px;background:#FCE7F3;border-radius:5px;margin-bottom:8px;">
            <strong style="color:#9F1239;">PTM — Saturday 22 Oct</strong><br>Parent-teacher meeting 10 AM – 12 PM.
          </div>
          <div style="padding:8px 10px;background:#FEF3C7;border-radius:5px;margin-bottom:8px;">
            <strong style="color:#92400E;">Mid-term holidays</strong><br>School closed 24–28 Oct.
          </div>
          <div style="padding:8px 10px;background:#D1FAE5;border-radius:5px;">
            <strong style="color:#065F46;">Science exhibition</strong><br>Class 5 students invited. 30 Oct, 11 AM.
          </div>
        </div>
      </div>
    </div>""",
    annotations=[
        (1, "Sidebar", "Parent sees only own children. Multi-child selector at top. No access to other students' data."),
        (2, "KPI cards", "One-glance: which child is selected, attendance %, fees due, latest result."),
        (3, "Attendance log", "Day-by-day with 'Late' as separate status. Builds parent trust through transparency."),
        (4, "Subject results", "Visual bars per subject. Parent instantly sees where child needs help."),
        (5, "Fee receipts + Pay", "Past receipts downloadable as PDF. 'Pay Fees' triggers JazzCash/Easypaisa flow."),
        (6, "Notices", "School-wide + class-specific announcements. SMS also sent for urgent ones."),
    ],
)

# ─── 7. Student ───
student = page_html(
    title="Student Dashboard — School SaaS",
    subtitle="Student — own academic record (read-only)",
    url="https://platform.yourschoolsaas.pk/student/dashboard",
    accent="#059669",
    sidebar_bg="#0F172A",
    sidebar_items=[
        {"label": "Me", "items": [
            {"name": "Dashboard", "icon": "▣", "active": True},
            {"name": "My Attendance", "icon": "📅"},
            {"name": "My Results", "icon": "🏆"},
            {"name": "My Timetable", "icon": "🗓"},
        ]},
        {"label": "Resources", "items": [
            {"name": "Homework", "icon": "📓", "badge": "2"},
            {"name": "Notices", "icon": "📣"},
            {"name": "Library", "icon": "📚"},
        ]},
        {"label": "Account", "items": [
            {"name": "My Profile", "icon": "👤"},
            {"name": "Change Password", "icon": "🔒"},
        ]},
    ],
    topbar_btn_label="My Profile",
    kpis_html="""<div class="stats">
        <div class="stat-card"><div class="stat-label">My Attendance</div><div class="stat-value">94%</div><div class="stat-delta up">Excellent</div></div>
        <div class="stat-card"><div class="stat-label">My Result (Mid-Term)</div><div class="stat-value">82%</div><div class="stat-delta up">+4% vs last term</div></div>
        <div class="stat-card"><div class="stat-label">Class Rank</div><div class="stat-value">6 / 52</div><div class="stat-delta up">Top 12%</div></div>
        <div class="stat-card"><div class="stat-label">Pending Homework</div><div class="stat-value">2</div><div class="stat-delta warn">due this week</div></div>
    </div>""",
    main_content_html="""<div class="panel-card">
      <div class="panel-header"><div class="panel-title">Today's Timetable — Wednesday (Class 5-A)</div></div>
      <table><thead><tr><th>Period</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th><th>Homework</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>08:00 – 08:45</td><td>Mathematics</td><td>Ms. Sana</td><td>R-12</td><td>Ex 4.2 Q1-5</td></tr>
        <tr><td>2</td><td>08:50 – 09:35</td><td>English</td><td>Mr. Bilal</td><td>R-15</td><td>Read Ch. 6</td></tr>
        <tr><td>3</td><td>09:40 – 10:25</td><td>Science</td><td>Mr. Tariq</td><td>Lab-1</td><td>—</td></tr>
        <tr><td>4</td><td>10:30 – 11:15</td><td>Break</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>5</td><td>11:20 – 12:05</td><td>Urdu</td><td>Ms. Hina</td><td>R-09</td><td>Learn poem</td></tr>
      </tbody></table>
    </div>
    <div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">My Subjects — Mid-Term</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>Mathematics</span><span>88% · A</span></div><div class="bar-track"><div class="bar-fill" style="width:88%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>English</span><span>78% · B</span></div><div class="bar-track"><div class="bar-fill" style="width:78%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Urdu</span><span>82% · A</span></div><div class="bar-track"><div class="bar-fill" style="width:82%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Science</span><span>75% · B</span></div><div class="bar-track"><div class="bar-fill" style="width:75%;background:#B45309;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Islamiat</span><span>91% · A+</span></div><div class="bar-track"><div class="bar-fill" style="width:91%;background:#0F766E;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Social Studies</span><span>79% · B</span></div><div class="bar-track"><div class="bar-fill" style="width:79%;"></div></div></div>
        </div>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Recent Attendance</div></div>
        <table><thead><tr><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Wed, 12 Oct</td><td><span class="status-pill pill-active">Present</span></td></tr>
          <tr><td>Tue, 11 Oct</td><td><span class="status-pill pill-active">Present</span></td></tr>
          <tr><td>Mon, 10 Oct</td><td><span class="status-pill pill-pending">Late</span></td></tr>
          <tr><td>Fri, 7 Oct</td><td><span class="status-pill pill-active">Present</span></td></tr>
          <tr><td>Thu, 6 Oct</td><td><span class="status-pill pill-suspended">Absent</span></td></tr>
        </tbody></table>
      </div>
    </div>""",
    annotations=[
        (1, "Sidebar", "Student-scoped, fully read-only. No editing rights anywhere. Sees only own data."),
        (2, "KPI cards", "Personal academic snapshot: attendance, latest result, class rank, pending homework."),
        (3, "Today's timetable", "Own class schedule with homework column. Single source of truth — printed diaries become optional."),
        (4, "Subject results", "Visual per-subject bars with grade. Helps student self-assess strengths & weaknesses."),
        (5, "Attendance log", "Personal attendance history. 'Late' counts separately so student learns punctuality."),
    ],
)


DASHBOARDS = [
    ("01_school_admin", school_admin),
    ("02_principal", principal),
    ("03_admission_officer", admission),
    ("04_accountant", accountant),
    ("05_teacher", teacher),
    ("06_parent", parent),
    ("07_student", student),
]


def render_all():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, html in DASHBOARDS:
            html_path = os.path.join(DASH_DIR, f"{name}.html")
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html)
            png_path = os.path.join(OUT_DIR, f"{name}.png")
            ctx = browser.new_context(viewport={"width": 1560, "height": 1200}, device_scale_factor=2)
            page = ctx.new_page()
            page.goto(f"file://{html_path}")
            page.wait_for_load_state("networkidle")
            box = page.evaluate("""() => {
                const el = document.querySelector('.canvas') || document.body;
                const r = el.getBoundingClientRect();
                return {w: Math.ceil(r.width), h: Math.ceil(r.height)};
            }""")
            page.set_viewport_size({"width": max(1560, box["w"]+80), "height": max(1200, box["h"]+80)})
            page.wait_for_timeout(150)
            page.screenshot(path=png_path, full_page=True)
            ctx.close()
            size = os.path.getsize(png_path)
            print(f"OK  {name}.png  ({size//1024} KB)")
        browser.close()


if __name__ == "__main__":
    render_all()
    print("All dashboards rendered.")
