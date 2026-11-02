"""Premium School SaaS — Generate and render all 7 role dashboards."""
import os
from playwright.sync_api import sync_playwright

DASH_DIR = "/home/z/my-project/scripts/school-saas-dashboards"
OUT_DIR = "/home/z/my-project/download/school-saas-dashboards"
os.makedirs(OUT_DIR, exist_ok=True)

with open(os.path.join(DASH_DIR, "premium.css"), "r", encoding="utf-8") as f:
    SHARED_CSS = f.read()


# Per-role accent themes
THEMES = {
    "school_admin": {
        "grad": "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
        "grad_start": "#0EA5E9", "grad_end": "#0284C7",
        "soft": "#E0F2FE", "soft_border": "#BAE6FD", "text": "#0369A1",
        "glow": "rgba(14,165,233,0.18)", "shadow": "rgba(2,132,199,0.30)",
        "sidebar": "linear-gradient(180deg, #0B1220 0%, #111B2E 100%)",
    },
    "principal": {
        "grad": "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
        "grad_start": "#7C3AED", "grad_end": "#6D28D9",
        "soft": "#F5F3FF", "soft_border": "#EDE9FE", "text": "#6D28D9",
        "glow": "rgba(124,58,237,0.18)", "shadow": "rgba(109,40,217,0.30)",
        "sidebar": "linear-gradient(180deg, #0B1220 0%, #111B2E 100%)",
    },
    "admission": {
        "grad": "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
        "grad_start": "#2563EB", "grad_end": "#1D4ED8",
        "soft": "#EFF6FF", "soft_border": "#DBEAFE", "text": "#1D4ED8",
        "glow": "rgba(37,99,235,0.18)", "shadow": "rgba(29,78,216,0.30)",
        "sidebar": "linear-gradient(180deg, #0B1220 0%, #111B2E 100%)",
    },
    "accountant": {
        "grad": "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
        "grad_start": "#D97706", "grad_end": "#B45309",
        "soft": "#FFFBEB", "soft_border": "#FDE68A", "text": "#B45309",
        "glow": "rgba(217,119,6,0.18)", "shadow": "rgba(180,83,9,0.30)",
        "sidebar": "linear-gradient(180deg, #0B1220 0%, #111B2E 100%)",
    },
    "teacher": {
        "grad": "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)",
        "grad_start": "#0891B2", "grad_end": "#0E7490",
        "soft": "#ECFEFF", "soft_border": "#CFFAFE", "text": "#0E7490",
        "glow": "rgba(8,145,178,0.18)", "shadow": "rgba(14,116,144,0.30)",
        "sidebar": "linear-gradient(180deg, #0B1220 0%, #111B2E 100%)",
    },
    "parent": {
        "grad": "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
        "grad_start": "#DB2777", "grad_end": "#BE185D",
        "soft": "#FDF2F8", "soft_border": "#FBCFE8", "text": "#BE185D",
        "glow": "rgba(219,39,119,0.18)", "shadow": "rgba(190,24,93,0.30)",
        "sidebar": "linear-gradient(180deg, #0B1220 0%, #111B2E 100%)",
    },
    "student": {
        "grad": "linear-gradient(135deg, #059669 0%, #047857 100%)",
        "grad_start": "#059669", "grad_end": "#047857",
        "soft": "#ECFDF5", "soft_border": "#A7F3D0", "text": "#047857",
        "glow": "rgba(5,150,105,0.18)", "shadow": "rgba(4,120,87,0.30)",
        "sidebar": "linear-gradient(180deg, #0B1220 0%, #111B2E 100%)",
    },
}


def build_sidebar(sections):
    out = []
    for sec in sections:
        out.append(f'<div class="nav-section"><div class="nav-label">{sec["label"]}</div>')
        for it in sec["items"]:
            badge = ""
            if it.get("badge"):
                badge = f'<span class="nav-badge">{it["badge"]}</span>'
            elif it.get("count"):
                badge = f'<span class="nav-count">{it["count"]}</span>'
            active = " active" if it.get("active") else ""
            out.append(
                f'<div class="nav-item{active}"><span class="nav-icon">{it["icon"]}</span>'
                f'<span>{it["name"]}</span>{badge}</div>'
            )
        out.append('</div>')
    return ''.join(out)


def build_annotations(items):
    out = []
    for num, label, desc in items:
        out.append(
            f'<div class="annot-item"><span class="annot-num">{num}</span>'
            f'<span class="annot-label">{label}</span>'
            f'<div class="annot-desc">{desc}</div></div>'
        )
    return ''.join(out)


def page(name, title, subtitle, role_label, url, topbar_btn, kpis, main, annotations, avatar_initials):
    t = THEMES[name]
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>{title}</title>
<style>{SHARED_CSS}
:root {{
  --accent-grad: {t["grad"]};
  --accent-grad-start: {t["grad_start"]};
  --accent-grad-end: {t["grad_end"]};
  --accent-soft: {t["soft"]};
  --accent-soft-border: {t["soft_border"]};
  --accent-text: {t["text"]};
  --accent-glow: {t["glow"]};
  --accent-shadow: {t["shadow"]};
}}
.canvas {{ width: 1520px; }}
</style></head><body>
<div class="canvas">
  <div class="header">
    <h1>{title}</h1>
    <p>{subtitle}</p>
    <div class="role-pill">{role_label}</div>
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
              <div class="logo-mark">
                <div class="logo-icon">S</div>
                <div class="logo-text">SchoolSaaS</div>
              </div>
              <div class="logo-sub">{role_label}</div>
            </div>
            {build_sidebar(SIDEBARS[name])}
          </div>
          <div class="main">
            <div class="topbar">
              <div class="page-title">
                <h2>{title.split("—")[1].strip() if "—" in title else title}</h2>
                <div class="breadcrumb">Home <span class="current">› Dashboard</span></div>
              </div>
              <div class="topbar-actions">
                <button class="btn">Export</button>
                <button class="btn btn-primary">{topbar_btn}</button>
                <div class="avatar">{avatar_initials}</div>
              </div>
            </div>
            {kpis}
            {main}
          </div>
        </div>
      </div>
    </div>
    <div class="annot-panel">
      <div class="annot-title">Wireframe Guide</div>
      <div class="annot-sub">{role_label} — key sections explained</div>
      {build_annotations(annotations)}
    </div>
  </div>
</div>
</body></html>"""


# ─── Sidebars per role ───
SIDEBARS = {
    "school_admin": [
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
    "principal": [
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
    "admission": [
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
    "accountant": [
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
    "teacher": [
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
    "parent": [
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
    "student": [
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
}


# ─── KPI blocks per role ───
KPIS = {
    "school_admin": """<div class="stats">
        <div class="stat-card"><div class="stat-icon">🎓</div><div class="stat-label">Total Students</div><div class="stat-value">542</div><div class="stat-delta up">12 new this week</div></div>
        <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-label">Total Staff</div><div class="stat-value">28</div><div class="stat-delta neutral">22 teachers · 6 admin</div></div>
        <div class="stat-card"><div class="stat-icon">🏛</div><div class="stat-label">Classes</div><div class="stat-value">10</div><div class="stat-delta neutral">24 sections</div></div>
        <div class="stat-card"><div class="stat-icon">₹</div><div class="stat-label">Fee Collected (Month)</div><div class="stat-value">PKR 480K</div><div class="stat-delta up">87% of target</div></div>
    </div>""",
    "principal": """<div class="stats">
        <div class="stat-card"><div class="stat-icon">🎓</div><div class="stat-label">Total Students</div><div class="stat-value">542</div><div class="stat-delta neutral">across 10 classes</div></div>
        <div class="stat-card"><div class="stat-icon">✓</div><div class="stat-label">Attendance Today</div><div class="stat-value">88%</div><div class="stat-delta up">+2% vs avg</div></div>
        <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-label">Avg Result (Mid-Term)</div><div class="stat-value">73%</div><div class="stat-delta warn">-3% vs last term</div></div>
        <div class="stat-card"><div class="stat-icon">◷</div><div class="stat-label">Pending Approvals</div><div class="stat-value">4</div><div class="stat-delta down">2 results · 2 leaves</div></div>
    </div>""",
    "admission": """<div class="stats">
        <div class="stat-card"><div class="stat-icon">📞</div><div class="stat-label">New Inquiries (Month)</div><div class="stat-value">47</div><div class="stat-delta up">+18% vs last month</div></div>
        <div class="stat-card"><div class="stat-icon">🔄</div><div class="stat-label">Follow-ups Due Today</div><div class="stat-value">8</div><div class="stat-delta down">3 overdue</div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-label">Converted (Month)</div><div class="stat-value">12</div><div class="stat-delta up">26% conversion</div></div>
        <div class="stat-card"><div class="stat-icon">◷</div><div class="stat-label">Pending Decisions</div><div class="stat-value">23</div><div class="stat-delta warn">need nurturing</div></div>
    </div>""",
    "accountant": """<div class="stats">
        <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-label">Collected (Month)</div><div class="stat-value">PKR 480K</div><div class="stat-delta up">87% of target</div></div>
        <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-label">Outstanding</div><div class="stat-value">PKR 71K</div><div class="stat-delta down">13% of monthly</div></div>
        <div class="stat-card"><div class="stat-icon">⚠</div><div class="stat-label">Defaulters</div><div class="stat-value">37</div><div class="stat-delta warn">8 new this week</div></div>
        <div class="stat-card"><div class="stat-icon">🧾</div><div class="stat-label">Today's Receipts</div><div class="stat-value">PKR 24K</div><div class="stat-delta neutral">18 payments</div></div>
    </div>""",
    "teacher": """<div class="stats">
        <div class="stat-card"><div class="stat-icon">📚</div><div class="stat-label">My Classes</div><div class="stat-value">4</div><div class="stat-delta neutral">Class 5, 6, 7, 8</div></div>
        <div class="stat-card"><div class="stat-icon">🎓</div><div class="stat-label">Students Taught</div><div class="stat-value">128</div><div class="stat-delta neutral">across all sections</div></div>
        <div class="stat-card"><div class="stat-icon">✓</div><div class="stat-label">Attendance Pending</div><div class="stat-value">2</div><div class="stat-delta warn">Class 7-A · 8-B</div></div>
        <div class="stat-card"><div class="stat-icon">✏</div><div class="stat-label">Marks Pending</div><div class="stat-value">1</div><div class="stat-delta warn">Class 5 mid-term</div></div>
    </div>""",
    "parent": """<div class="stats">
        <div class="stat-card"><div class="stat-icon">👦</div><div class="stat-label">Selected Child</div><div class="stat-value" style="font-size:15px;">Ali Hassan</div><div class="stat-delta neutral">Class 5-A · Roll 14</div></div>
        <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-label">Attendance (Month)</div><div class="stat-value">94%</div><div class="stat-delta up">Excellent</div></div>
        <div class="stat-card"><div class="stat-icon">🧾</div><div class="stat-label">Pending Fees</div><div class="stat-value">PKR 4,500</div><div class="stat-delta warn">Due in 5 days</div></div>
        <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-label">Latest Result</div><div class="stat-value">82%</div><div class="stat-delta up">Mid-Term</div></div>
    </div>""",
    "student": """<div class="stats">
        <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-label">My Attendance</div><div class="stat-value">94%</div><div class="stat-delta up">Excellent</div></div>
        <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-label">My Result (Mid-Term)</div><div class="stat-value">82%</div><div class="stat-delta up">+4% vs last term</div></div>
        <div class="stat-card"><div class="stat-icon">🏅</div><div class="stat-label">Class Rank</div><div class="stat-value">6 / 52</div><div class="stat-delta up">Top 12%</div></div>
        <div class="stat-card"><div class="stat-icon">📓</div><div class="stat-label">Pending Homework</div><div class="stat-value">2</div><div class="stat-delta warn">due this week</div></div>
    </div>""",
}


# ─── Main content blocks per role ───
MAINS = {
    "school_admin": """
    <div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Class Strength (2024-25)</div><a class="panel-link">View all →</a></div>
        <table><thead><tr><th>Class</th><th>Sections</th><th>Students</th><th>Avg Attendance</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td><strong>Class 1</strong></td><td>A, B</td><td>52</td><td>92%</td><td><span class="status-pill pill-active">Healthy</span></td></tr>
          <tr><td><strong>Class 5</strong></td><td>A, B, C</td><td>78</td><td>89%</td><td><span class="status-pill pill-active">Healthy</span></td></tr>
          <tr><td><strong>Class 8</strong></td><td>A, B</td><td>64</td><td>81%</td><td><span class="status-pill pill-pending">Watch</span></td></tr>
          <tr><td><strong>Class 10</strong></td><td>A</td><td>34</td><td>76%</td><td><span class="status-pill pill-suspended">Low</span></td></tr>
        </tbody></table>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Recent Admissions</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>This week</span><span class="value">12 new</span></div><div class="bar-track"><div class="bar-fill" style="width:60%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>This month</span><span class="value">38 new</span></div><div class="bar-track"><div class="bar-fill" style="width:78%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Pending approval</span><span class="value">3</span></div><div class="bar-track"><div class="bar-fill" style="width:15%;background:linear-gradient(135deg,#D97706,#B45309);"></div></div></div>
          <div class="callout callout-info">
            <span class="callout-icon">💡</span>
            <div>Top source: <strong>Walk-ins (47%)</strong>, then Referral (28%). Both cheap & convert fast.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-card">
      <div class="panel-header"><div class="panel-title">Staff Overview</div><a class="panel-link">Manage →</a></div>
      <table><thead><tr><th>Name</th><th>Role</th><th>Subject</th><th>Classes</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td><strong>Ayesha Khan</strong></td><td>Principal</td><td>—</td><td>All</td><td><span class="status-pill pill-active">Active</span></td></tr>
        <tr><td><strong>Imran Sheikh</strong></td><td>Accountant</td><td>—</td><td>—</td><td><span class="status-pill pill-active">Active</span></td></tr>
        <tr><td><strong>Sana Mir</strong></td><td>Teacher</td><td>Mathematics</td><td>5, 6</td><td><span class="status-pill pill-active">Active</span></td></tr>
        <tr><td><strong>Bilal Ahmed</strong></td><td>Teacher</td><td>English</td><td>7, 8</td><td><span class="status-pill pill-pending">On leave</span></td></tr>
      </tbody></table>
    </div>""",
    "principal": """
    <div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Pending Approvals</div><a class="panel-link">View all →</a></div>
        <table><thead><tr><th>Type</th><th>Submitted by</th><th>Detail</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td><strong>Result Card</strong></td><td>Ms. Sana (Class 5)</td><td>Mid-Term · 52 students</td><td><span style="color:#7C3AED;font-weight:700;">Review →</span></td></tr>
          <tr><td><strong>Result Card</strong></td><td>Mr. Bilal (Class 8)</td><td>Mid-Term · 64 students</td><td><span style="color:#7C3AED;font-weight:700;">Review →</span></td></tr>
          <tr><td><strong>Leave Request</strong></td><td>Ms. Hina (Urdu)</td><td>2 days · Medical</td><td><span style="color:#7C3AED;font-weight:700;">Approve →</span></td></tr>
          <tr><td><strong>Leave Request</strong></td><td>Mr. Tariq (Science)</td><td>1 day · Personal</td><td><span style="color:#7C3AED;font-weight:700;">Approve →</span></td></tr>
        </tbody></table>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Today's Attendance by Class</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>Class 1</span><span class="value">94%</span></div><div class="bar-track"><div class="bar-fill" style="width:94%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Class 5</span><span class="value">89%</span></div><div class="bar-track"><div class="bar-fill" style="width:89%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Class 8</span><span class="value">81%</span></div><div class="bar-track"><div class="bar-fill" style="width:81%;background:linear-gradient(135deg,#D97706,#B45309);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Class 10</span><span class="value">76%</span></div><div class="bar-track"><div class="bar-fill" style="width:76%;background:linear-gradient(135deg,#DC2626,#B91C1C);"></div></div></div>
          <div class="callout callout-warn">
            <span class="callout-icon">⚠</span>
            <div><strong>Action needed:</strong> Class 10 attendance below 80% threshold for 3rd consecutive day.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-card">
      <div class="panel-header"><div class="panel-title">Teacher Performance — Mid-Term</div><a class="panel-link">Detailed report →</a></div>
      <table><thead><tr><th>Teacher</th><th>Subject</th><th>Classes</th><th>Avg Result</th><th>Attendance Marked</th><th>Flag</th></tr></thead>
      <tbody>
        <tr><td><strong>Sana Mir</strong></td><td>Mathematics</td><td>5, 6</td><td>78%</td><td>100%</td><td><span class="status-pill pill-active">On track</span></td></tr>
        <tr><td><strong>Imran S.</strong></td><td>Physics</td><td>9, 10</td><td>71%</td><td>96%</td><td><span class="status-pill pill-active">On track</span></td></tr>
        <tr><td><strong>Hina Q.</strong></td><td>Urdu</td><td>3, 4</td><td>62%</td><td>88%</td><td><span class="status-pill pill-pending">Review</span></td></tr>
        <tr><td><strong>Tariq M.</strong></td><td>Science</td><td>7, 8</td><td>54%</td><td>72%</td><td><span class="status-pill pill-suspended">Concern</span></td></tr>
      </tbody></table>
    </div>""",
    "admission": """
    <div class="panel-card">
      <div class="panel-header"><div class="panel-title">Admission Funnel (This Month)</div><a class="panel-link">Drill down →</a></div>
      <div class="section-row">
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div class="funnel-row"><div class="funnel-stage" style="width:100%;"><span><span class="stage-num">1</span>Inquired</span><span>47</span></div></div>
          <div class="funnel-row"><div class="funnel-stage" style="width:68%;background:linear-gradient(135deg,#3B82F6,#2563EB);"><span><span class="stage-num">2</span>Campus Visit</span><span>32</span></div></div>
          <div class="funnel-row"><div class="funnel-stage" style="width:45%;background:linear-gradient(135deg,#1D4ED8,#1E40AF);"><span><span class="stage-num">3</span>Form Submitted</span><span>21</span></div></div>
          <div class="funnel-row"><div class="funnel-stage" style="width:34%;background:linear-gradient(135deg,#1E40AF,#1E3A8A);"><span><span class="stage-num">4</span>Interview</span><span>16</span></div></div>
          <div class="funnel-row"><div class="funnel-stage" style="width:26%;background:linear-gradient(135deg,#059669,#047857);"><span><span class="stage-num">5</span>Admitted</span><span>12</span></div></div>
        </div>
        <div class="callout callout-info" style="margin-top:16px;">
          <span class="callout-icon">💡</span>
          <div><strong>Biggest drop:</strong> Visit → Form (34% drop). Parents visit but don't submit. Suggest on-spot form assistance.</div>
        </div>
      </div>
    </div>
    <div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Inquiries by Source</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>Walk-in</span><span class="value">22 (47%)</span></div><div class="bar-track"><div class="bar-fill" style="width:47%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Facebook Ads</span><span class="value">13 (28%)</span></div><div class="bar-track"><div class="bar-fill" style="width:28%;background:linear-gradient(135deg,#3B82F6,#2563EB);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Referral</span><span class="value">8 (17%)</span></div><div class="bar-track"><div class="bar-fill" style="width:17%;background:linear-gradient(135deg,#059669,#047857);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Website</span><span class="value">4 (8%)</span></div><div class="bar-track"><div class="bar-fill" style="width:8%;background:linear-gradient(135deg,#D97706,#B45309);"></div></div></div>
        </div>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Conversion Snapshot</div></div>
        <div class="section-row" style="text-align:center;padding-top:24px;padding-bottom:24px;">
          <div style="font-family:'Manrope',sans-serif;font-size:42px;font-weight:800;background:linear-gradient(135deg,#2563EB,#1D4ED8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-1.5px;">26%</div>
          <div style="font-size:11px;color:#64748B;font-weight:600;margin-top:4px;">Conversion Rate</div>
          <div style="font-size:10px;color:#059669;font-weight:600;margin-top:8px;">▲ +4% vs last month</div>
        </div>
      </div>
    </div>
    <div class="panel-card">
      <div class="panel-header"><div class="panel-title">Today's Follow-ups</div><a class="panel-link">All follow-ups →</a></div>
      <table><thead><tr><th>Parent</th><th>Phone</th><th>Stage</th><th>Last Contact</th><th>Next Action</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td><strong>Asad Mahmood</strong></td><td>0301-2233445</td><td>Visit done</td><td>2 days ago</td><td>Send fee structure</td><td><span class="status-pill pill-pending">Due today</span></td></tr>
        <tr><td><strong>Fariha Noor</strong></td><td>0302-5567890</td><td>Form submitted</td><td>5 days ago</td><td>Schedule assessment</td><td><span class="status-pill pill-suspended">Overdue</span></td></tr>
        <tr><td><strong>Kamran Ali</strong></td><td>0312-9988776</td><td>Inquired</td><td>Yesterday</td><td>Invite for campus visit</td><td><span class="status-pill pill-active">Today</span></td></tr>
        <tr><td><strong>Rabia Shah</strong></td><td>0333-1122334</td><td>Visit done</td><td>3 days ago</td><td>Discount approval call</td><td><span class="status-pill pill-pending">Due today</span></td></tr>
      </tbody></table>
    </div>""",
    "accountant": """
    <div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Monthly Collection — Last 6 Months</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>May</span><span class="value">PKR 410K</span></div><div class="bar-track"><div class="bar-fill" style="width:74%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Jun</span><span class="value">PKR 425K</span></div><div class="bar-track"><div class="bar-fill" style="width:77%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Jul</span><span class="value">PKR 380K</span></div><div class="bar-track"><div class="bar-fill" style="width:69%;background:linear-gradient(135deg,#3B82F6,#2563EB);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Aug</span><span class="value">PKR 455K</span></div><div class="bar-track"><div class="bar-fill" style="width:82%;background:linear-gradient(135deg,#3B82F6,#2563EB);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Sep</span><span class="value">PKR 470K</span></div><div class="bar-track"><div class="bar-fill" style="width:85%;background:linear-gradient(135deg,#3B82F6,#2563EB);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Oct</span><span class="value">PKR 480K</span></div><div class="bar-track"><div class="bar-fill" style="width:87%;background:linear-gradient(135deg,#059669,#047857);"></div></div></div>
          <div class="callout callout-success">
            <span class="callout-icon">📈</span>
            <div><strong>Trend:</strong> Improving. September school reopening pushed collections up by 17%.</div>
          </div>
        </div>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Defaulters by Class</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>Class 1</span><span class="value">3</span></div><div class="bar-track"><div class="bar-fill" style="width:8%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Class 5</span><span class="value">6</span></div><div class="bar-track"><div class="bar-fill" style="width:16%;background:linear-gradient(135deg,#D97706,#B45309);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Class 8</span><span class="value">11</span></div><div class="bar-track"><div class="bar-fill" style="width:30%;background:linear-gradient(135deg,#DC2626,#B91C1C);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Class 10</span><span class="value">17</span></div><div class="bar-track"><div class="bar-fill" style="width:46%;background:linear-gradient(135deg,#DC2626,#991B1B);"></div></div></div>
          <div class="callout callout-danger">
            <span class="callout-icon">🚨</span>
            <div><strong>Class 10 = 46%</strong> of all defaulters. Suggest fee review for senior classes.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel-card">
      <div class="panel-header"><div class="panel-title">Recent Payments</div><a class="panel-link">View all →</a></div>
      <table><thead><tr><th>Receipt #</th><th>Student</th><th>Class</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td><strong>R-1042</strong></td><td>Ali Hassan</td><td>5-A</td><td>PKR 4,500</td><td>Cash</td><td><span class="status-pill pill-paid">Paid</span></td></tr>
        <tr><td><strong>R-1041</strong></td><td>Sara Imran</td><td>3-B</td><td>PKR 3,800</td><td>Bank Transfer</td><td><span class="status-pill pill-paid">Paid</span></td></tr>
        <tr><td><strong>R-1040</strong></td><td>Hamza Tariq</td><td>8-A</td><td>PKR 5,200</td><td>JazzCash</td><td><span class="status-pill pill-paid">Paid</span></td></tr>
        <tr><td><strong>R-1039</strong></td><td>Zara Ahmed</td><td>10-A</td><td>PKR 6,500</td><td>—</td><td><span class="status-pill pill-overdue">Overdue</span></td></tr>
      </tbody></table>
    </div>""",
    "teacher": """
    <div class="panel-card">
      <div class="panel-header"><div class="panel-title">Today's Timetable — Wednesday</div><a class="panel-link">Full week →</a></div>
      <table><thead><tr><th>Period</th><th>Time</th><th>Class</th><th>Section</th><th>Subject</th><th>Room</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td><strong>1</strong></td><td>08:00 – 08:45</td><td><strong>Class 5</strong></td><td>A</td><td>Mathematics</td><td>R-12</td><td><span class="status-pill pill-active">Done</span></td></tr>
        <tr><td><strong>2</strong></td><td>08:50 – 09:35</td><td><strong>Class 6</strong></td><td>B</td><td>Mathematics</td><td>R-15</td><td><span class="status-pill pill-active">Done</span></td></tr>
        <tr><td><strong>3</strong></td><td>09:40 – 10:25</td><td><strong>Class 7</strong></td><td>A</td><td>Mathematics</td><td>R-09</td><td><span class="status-pill pill-pending">Now</span></td></tr>
        <tr><td><strong>4</strong></td><td>10:30 – 11:15</td><td colspan="4" style="text-align:center;color:#94A3B8;font-style:italic;">Free Period</td></tr>
        <tr><td><strong>5</strong></td><td>11:20 – 12:05</td><td><strong>Class 8</strong></td><td>B</td><td>Mathematics</td><td>R-18</td><td><span class="status-pill pill-trial">Upcoming</span></td></tr>
      </tbody></table>
    </div>
    <div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Pending Tasks</div></div>
        <table><thead><tr><th>Task</th><th>Class</th><th>Due</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td><strong>Mark attendance</strong></td><td>7-A</td><td>Today · 10:25</td><td><span style="color:#0891B2;font-weight:700;">Open →</span></td></tr>
          <tr><td><strong>Mark attendance</strong></td><td>8-B</td><td>Today · 12:05</td><td><span style="color:#0891B2;font-weight:700;">Open →</span></td></tr>
          <tr><td><strong>Enter mid-term marks</strong></td><td>5-A (52 students)</td><td>Friday EOD</td><td><span style="color:#0891B2;font-weight:700;">Start →</span></td></tr>
        </tbody></table>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">My Students — Class 7-A</div></div>
        <div class="section-row">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <div style="font-family:'Manrope',sans-serif;font-size:24px;font-weight:800;color:#0F172A;">32</div>
            <div style="font-size:10.5px;color:#64748B;text-align:right;line-height:1.5;">18 boys<br>14 girls</div>
          </div>
          <div class="bar"><div class="bar-label"><span>Avg attendance</span><span class="value">89%</span></div><div class="bar-track"><div class="bar-fill" style="width:89%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Avg mid-term result</span><span class="value">76%</span></div><div class="bar-track"><div class="bar-fill" style="width:76%;background:linear-gradient(135deg,#059669,#047857);"></div></div></div>
          <div class="callout callout-info">
            <span class="callout-icon">💡</span>
            <div><strong>Top performer:</strong> Ahmed Raza (94%). <strong>Needs attention:</strong> 4 students below 70% attendance.</div>
          </div>
        </div>
      </div>
    </div>""",
    "parent": """
    <div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Attendance — This Month</div><a class="panel-link">Full log →</a></div>
        <table><thead><tr><th>Date</th><th>Status</th><th>Marked by</th></tr></thead>
        <tbody>
          <tr><td><strong>Wed, 12 Oct</strong></td><td><span class="status-pill pill-active">Present</span></td><td>Ms. Sana</td></tr>
          <tr><td><strong>Tue, 11 Oct</strong></td><td><span class="status-pill pill-active">Present</span></td><td>Ms. Sana</td></tr>
          <tr><td><strong>Mon, 10 Oct</strong></td><td><span class="status-pill pill-pending">Late</span></td><td>Ms. Sana</td></tr>
          <tr><td><strong>Fri, 7 Oct</strong></td><td><span class="status-pill pill-active">Present</span></td><td>Ms. Sana</td></tr>
          <tr><td><strong>Thu, 6 Oct</strong></td><td><span class="status-pill pill-suspended">Absent</span></td><td>Ms. Sana</td></tr>
        </tbody></table>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Subjects — Mid-Term</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>Mathematics</span><span class="value">88% · A</span></div><div class="bar-track"><div class="bar-fill" style="width:88%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>English</span><span class="value">78% · B</span></div><div class="bar-track"><div class="bar-fill" style="width:78%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Urdu</span><span class="value">82% · A</span></div><div class="bar-track"><div class="bar-fill" style="width:82%;background:linear-gradient(135deg,#059669,#047857);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Science</span><span class="value">75% · B</span></div><div class="bar-track"><div class="bar-fill" style="width:75%;background:linear-gradient(135deg,#D97706,#B45309);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Islamiat</span><span class="value">91% · A+</span></div><div class="bar-track"><div class="bar-fill" style="width:91%;background:linear-gradient(135deg,#059669,#047857);"></div></div></div>
          <div class="callout callout-info">
            <span class="callout-icon">💡</span>
            <div><strong>Strength:</strong> Islamiat. <strong>Focus area:</strong> Science — 6% below class avg.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="row-grid-1-1">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Recent Fee Receipts</div><a class="panel-link">All →</a></div>
        <table><thead><tr><th>Receipt #</th><th>Month</th><th>Amount</th><th>Method</th><th>Download</th></tr></thead>
        <tbody>
          <tr><td><strong>R-1042</strong></td><td>September</td><td>PKR 4,500</td><td>Cash</td><td><span style="color:#DB2777;font-weight:700;">PDF ↓</span></td></tr>
          <tr><td><strong>R-0987</strong></td><td>August</td><td>PKR 4,500</td><td>JazzCash</td><td><span style="color:#DB2777;font-weight:700;">PDF ↓</span></td></tr>
          <tr><td><strong>R-0912</strong></td><td>July</td><td>PKR 4,500</td><td>Bank</td><td><span style="color:#DB2777;font-weight:700;">PDF ↓</span></td></tr>
        </tbody></table>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Recent Notices</div></div>
        <div class="section-row">
          <div class="notice-card notice-ptm"><strong>📅 PTM — Saturday 22 Oct</strong>Parent-teacher meeting 10 AM – 12 PM. Class 5-A slot: 10:30 AM.</div>
          <div class="notice-card notice-holiday"><strong>🏖 Mid-term holidays</strong>School closed 24–28 Oct. Classes resume Monday 31 Oct.</div>
          <div class="notice-card notice-event"><strong>🔬 Science exhibition</strong>Class 5 students invited. 30 Oct, 11 AM. Bring model + report.</div>
        </div>
      </div>
    </div>""",
    "student": """
    <div class="panel-card">
      <div class="panel-header"><div class="panel-title">Today's Timetable — Wednesday (Class 5-A)</div></div>
      <table><thead><tr><th>Period</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th><th>Homework</th></tr></thead>
      <tbody>
        <tr><td><strong>1</strong></td><td>08:00 – 08:45</td><td>Mathematics</td><td>Ms. Sana</td><td>R-12</td><td>Ex 4.2 Q1-5</td></tr>
        <tr><td><strong>2</strong></td><td>08:50 – 09:35</td><td>English</td><td>Mr. Bilal</td><td>R-15</td><td>Read Ch. 6</td></tr>
        <tr><td><strong>3</strong></td><td>09:40 – 10:25</td><td>Science</td><td>Mr. Tariq</td><td>Lab-1</td><td><span style="color:#94A3B8;">—</span></td></tr>
        <tr><td><strong>4</strong></td><td>10:30 – 11:15</td><td colspan="5" style="text-align:center;color:#94A3B8;font-style:italic;">Break</td></tr>
        <tr><td><strong>5</strong></td><td>11:20 – 12:05</td><td>Urdu</td><td>Ms. Hina</td><td>R-09</td><td>Learn poem</td></tr>
      </tbody></table>
    </div>
    <div class="row-grid">
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">My Subjects — Mid-Term</div></div>
        <div class="section-row">
          <div class="bar"><div class="bar-label"><span>Mathematics</span><span class="value">88% · A</span></div><div class="bar-track"><div class="bar-fill" style="width:88%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>English</span><span class="value">78% · B</span></div><div class="bar-track"><div class="bar-fill" style="width:78%;"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Urdu</span><span class="value">82% · A</span></div><div class="bar-track"><div class="bar-fill" style="width:82%;background:linear-gradient(135deg,#059669,#047857);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Science</span><span class="value">75% · B</span></div><div class="bar-track"><div class="bar-fill" style="width:75%;background:linear-gradient(135deg,#D97706,#B45309);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Islamiat</span><span class="value">91% · A+</span></div><div class="bar-track"><div class="bar-fill" style="width:91%;background:linear-gradient(135deg,#059669,#047857);"></div></div></div>
          <div class="bar"><div class="bar-label"><span>Social Studies</span><span class="value">79% · B</span></div><div class="bar-track"><div class="bar-fill" style="width:79%;"></div></div></div>
          <div class="callout callout-success">
            <span class="callout-icon">🏆</span>
            <div><strong>Class Rank 6 of 52</strong> — Top 12%. Keep up the great work, Ali!</div>
          </div>
        </div>
      </div>
      <div class="panel-card">
        <div class="panel-header"><div class="panel-title">Recent Attendance</div></div>
        <table><thead><tr><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td><strong>Wed, 12 Oct</strong></td><td><span class="status-pill pill-active">Present</span></td></tr>
          <tr><td><strong>Tue, 11 Oct</strong></td><td><span class="status-pill pill-active">Present</span></td></tr>
          <tr><td><strong>Mon, 10 Oct</strong></td><td><span class="status-pill pill-pending">Late</span></td></tr>
          <tr><td><strong>Fri, 7 Oct</strong></td><td><span class="status-pill pill-active">Present</span></td></tr>
          <tr><td><strong>Thu, 6 Oct</strong></td><td><span class="status-pill pill-suspended">Absent</span></td></tr>
        </tbody></table>
      </div>
    </div>""",
}


# ─── Annotations per role ───
ANNOTATIONS = {
    "school_admin": [
        (1, "Sidebar", "School-scoped navigation. Admin sees setup + billing. Cannot see platform-level controls."),
        (2, "Topbar", "Quick '+ Add Student' opens admission form. Export downloads CSV/Excel."),
        (3, "KPI cards", "School health at a glance: students, staff, classes, this month's fee collection vs target."),
        (4, "Class strength", "Per-class roll with attendance %. Color pill flags classes that need attention."),
        (5, "Recent admissions", "Trend bars show weekly/monthly intake. Insight callout suggests where to focus marketing."),
        (6, "Staff table", "All users of this school with their role + current status. Admin can edit / deactivate."),
    ],
    "principal": [
        (1, "Sidebar", "Academics-focused menu. Sees exams, results, teachers. Cannot edit fee plans or payroll."),
        (2, "KPI cards", "Academic health metrics: attendance, avg result, pending approvals queue."),
        (3, "Approvals queue", "Result cards submitted by teachers need principal sign-off before going to parents."),
        (4, "Class attendance", "Today's attendance per class. Auto-flags classes below 80% for 3+ days."),
        (5, "Teacher performance", "Cross-tab of result % + attendance-marking discipline. Identifies who needs coaching."),
    ],
    "admission": [
        (1, "Sidebar", "CRM-only navigation. Sees inquiries, follow-ups, sources. Cannot access fees or payroll."),
        (2, "KPI cards", "Funnel health: new inquiries, today's follow-ups, conversions, pending decisions."),
        (3, "Funnel chart", "Stage-by-stage drop-off as gradient bars. The biggest shrink = where to fix the process."),
        (4, "Source breakdown", "Which marketing channel brings most inquiries — guides ad spend decisions."),
        (5, "Conversion snapshot", "Large gradient percentage — single number that summarizes CRM health."),
        (6, "Follow-ups list", "Daily task queue. Overdue items flagged red so nothing slips through."),
    ],
    "accountant": [
        (1, "Sidebar", "Money-only navigation: invoices, payments, receipts, defaulters, reports. No access to academics or admissions."),
        (2, "KPI cards", "Cash-flow health: collected this month, outstanding, defaulters count, today's receipts."),
        (3, "Collection trend", "6-month trend. Shows seasonality — dip in summer break, peak at session restart."),
        (4, "Defaulters breakdown", "Class-wise view. Red flag callout identifies where to focus reminder calls/SMS."),
        (5, "Recent payments", "Live activity log. PDF receipt auto-generated on each 'Paid' entry."),
    ],
    "teacher": [
        (1, "Sidebar", "Teacher-scoped. Sees only own classes, own students, own attendance. Cannot view other teachers' data."),
        (2, "KPI cards", "Today's workload: classes, students, attendance/marks pending — the two daily tasks."),
        (3, "Today's timetable", "Period-by-period schedule. 'Now' pill shows current class. Free periods shown."),
        (4, "Pending tasks", "Smart to-do. Reminds teacher what to mark/enter before day ends. Auto-shared with principal."),
        (5, "My students view", "Per-class snapshot. Insight callout flags students needing attention."),
    ],
    "parent": [
        (1, "Sidebar", "Parent sees only own children. Multi-child selector at top. No access to other students' data."),
        (2, "KPI cards", "One-glance: which child is selected, attendance %, fees due, latest result."),
        (3, "Attendance log", "Day-by-day with 'Late' as separate status. Builds parent trust through transparency."),
        (4, "Subject results", "Visual bars per subject with grades. Insight callout highlights focus area."),
        (5, "Fee receipts + Pay", "Past receipts downloadable as PDF. 'Pay Fees' triggers JazzCash/Easypaisa flow."),
        (6, "Notices", "Color-coded cards: PTM, holidays, events. SMS also sent for urgent ones."),
    ],
    "student": [
        (1, "Sidebar", "Student-scoped, fully read-only. No editing rights anywhere. Sees only own data."),
        (2, "KPI cards", "Personal academic snapshot: attendance, latest result, class rank, pending homework."),
        (3, "Today's timetable", "Own class schedule with homework column. Single source of truth — printed diaries become optional."),
        (4, "Subject results", "Visual per-subject bars with grade. Helps student self-assess strengths & weaknesses."),
        (5, "Achievement callout", "Positive reinforcement. Class rank shown prominently for motivation."),
        (6, "Attendance log", "Personal attendance history. 'Late' counts separately so student learns punctuality."),
    ],
}


# ─── Build all dashboards ───
DASHBOARD_META = [
    ("school_admin", "School Admin Dashboard — School SaaS",
     "Runs one school's day-to-day setup, staff & billing configuration",
     "School Admin · One Tenant", "platform.yourschoolsaas.pk/school/admin",
     "+ Add Student", "SA"),
    ("principal", "Principal Dashboard — School SaaS",
     "Academic head — monitors attendance, results & approves teacher submissions",
     "Principal · Academic Head", "platform.yourschoolsaas.pk/school/principal",
     "Approve Pending", "AK"),
    ("admission", "Admission Officer Dashboard — School SaaS",
     "Manages inquiries → enrollment funnel (CRM)",
     "Admission Officer · CRM", "platform.yourschoolsaas.pk/school/admission",
     "+ New Inquiry", "AO"),
    ("accountant", "Accountant Dashboard — School SaaS",
     "Handles fees, invoices, payments & PDF receipts",
     "Accountant · Finance", "platform.yourschoolsaas.pk/school/accountant",
     "+ New Invoice", "IS"),
    ("teacher", "Teacher Dashboard — School SaaS",
     "Daily classroom operations — attendance & marks entry",
     "Teacher · Class 5-8 Maths", "platform.yourschoolsaas.pk/school/teacher",
     "Mark Today's Attendance", "SM"),
    ("parent", "Parent Portal — School SaaS",
     "Read-only view of child's progress, attendance & fees",
     "Parent · 2 Children Enrolled", "platform.yourschoolsaas.pk/parent",
     "Pay Fees", "AH"),
    ("student", "Student Dashboard — School SaaS",
     "Own academic record — fully read-only",
     "Student · Class 5-A · Roll 14", "platform.yourschoolsaas.pk/student",
     "My Profile", "AH"),
]


def render_all():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, title, subtitle, role_label, url, topbar_btn, initials in DASHBOARD_META:
            html = page(name, title, subtitle, role_label, url, topbar_btn,
                        KPIS[name], MAINS[name], ANNOTATIONS[name], initials)
            html_path = os.path.join(DASH_DIR, f"premium_{name}.html")
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html)
            png_path = os.path.join(OUT_DIR, f"{name}.png")
            ctx = browser.new_context(viewport={"width": 1600, "height": 1100}, device_scale_factor=2)
            page_obj = ctx.new_page()
            page_obj.goto(f"file://{html_path}")
            page_obj.wait_for_load_state("networkidle")
            page_obj.wait_for_timeout(800)  # extra wait for font loading
            box = page_obj.evaluate("""() => {
                const el = document.querySelector('.canvas') || document.body;
                const r = el.getBoundingClientRect();
                return {w: Math.ceil(r.width), h: Math.ceil(r.height)};
            }""")
            page_obj.set_viewport_size({"width": max(1600, box["w"]+40), "height": max(1100, box["h"]+40)})
            page_obj.wait_for_timeout(200)
            page_obj.screenshot(path=png_path, full_page=True)
            ctx.close()
            size = os.path.getsize(png_path)
            print(f"OK  {name}.png  ({size//1024} KB)")
        browser.close()


if __name__ == "__main__":
    render_all()
    print("All premium dashboards rendered.")
