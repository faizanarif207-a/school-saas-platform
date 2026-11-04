# SchoolSaaS Platform — Complete Specification Document
**Emerson Technology · Version 1.0 · November 2026**

> "We Build Digital Products That Move Business Forward."

---

## Table of Contents

1. [Overview & Vision](#1-overview--vision)
2. [Roles Hierarchy & Permissions Matrix](#2-roles-hierarchy--permissions-matrix)
3. [User Onboarding Flows](#3-user-onboarding-flows)
4. [Per-Role Module Specifications](#4-per-role-module-specifications)
5. [Core Features Specifications](#5-core-features-specifications)
6. [Edge Cases & Solutions](#6-edge-cases--solutions)
7. [Database Schema Additions](#7-database-schema-additions)
8. [API Endpoints List](#8-api-endpoints-list)
9. [UI/UX Specs & Emerson Branding Rules](#9-uiux-specs--emerson-branding-rules)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Overview & Vision

### 1.1 What We're Building

SchoolSaaS is a **multi-tenant school management platform** built by Emerson Technology for Pakistani schools. One platform serves many schools — each school's data is isolated at the database level (Row-Level Security).

### 1.2 Business Model

- **SaaS subscription** — schools pay monthly/yearly
- **4 pricing tiers:** Starter (PKR 5K/mo) → Growth (PKR 11K) → Pro (PKR 22K) → Enterprise (Custom)
- **One-time setup fee:** PKR 15,000-30,000 (covers data migration, training)
- **30-day free trial** — no credit card required
- **Founder's price** — first 10-20 schools get lifetime rate lock
- **Referral reward** — bring a school, get 1 month free
- **Pass-through SMS** — actual cost + 10-15% margin

### 1.3 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui |
| Backend | Next.js API Routes (serverless) |
| Database | Supabase PostgreSQL (cloud) |
| ORM | Prisma 6.x |
| Auth | JWT-based sessions + RBAC |
| File Storage | Supabase Storage (student photos, documents) |
| Email Service | Resend (invites, notifications) |
| SMS Service | Twilio + local Pakistani provider (Phase 3) |
| Hosting | Vercel (production) + Supabase (database) |
| Monitoring | Sentry (error tracking) |

### 1.4 Multi-Tenant Model

```
Supabase PostgreSQL (single database)
  ↓
  Row-Level Security (RLS) enforces tenant isolation
  ↓
  Every table has school_id column
  ↓
  Every query auto-filtered by school_id (at DB level, not just app)
  ↓
  Cross-school data access = impossible (database guarantees)
```

### 1.5 Branding — Emerson Technology

- **Primary Blue:** `#0064C8`
- **Growth Green:** `#0E9E56` (success states)
- **Energy Amber:** `#F5A800` (highlights, 3-bar logo)
- **Ink:** `#1C232D` (text)
- **Background:** `#FDFDFB` (warm off-white)
- **Logo:** 3 colored bars (amber/green/blue) + "Emerson" wordmark
- **Font:** Inter (body) + Manrope (headings)
- **Radius:** 12px (cards, buttons)
- **Modes:** Light + Dark toggle (next-themes)

---

## 2. Roles Hierarchy & Permissions Matrix

### 2.1 Role Hierarchy

```
Super Admin (You — Platform Owner)
  ↓
  School Owner (per school — multi-branch)
    ↓
    Principal (per branch)
    Accountant (school-level OR branch-level)
    Admission Officer (per branch)
      ↓
      Teacher (per class/section)
        ↓
        Parent (read-only, per child)
        Student (read-only, Class 6+ only)
```

### 2.2 Permissions Matrix

| Capability | Super Admin | Owner | Principal | Accountant | Admission | Teacher | Parent | Student |
|---|---|---|---|---|---|---|---|---|
| Create/suspend schools | ✓ | — | — | — | — | — | — | — |
| Set platform pricing | ✓ | — | — | — | — | — | — | — |
| View platform MRR | ✓ | — | — | — | — | — | — | — |
| Create branches | — | ✓ (plan limit) | — | — | — | — | — | — |
| Invite staff | — | ✓ | ✓ (own branch) | — | — | — | — | — |
| Configure fee plans | — | ✓ | ✓ (own branch) | — | — | — | — | — |
| Set defaulters policy | — | ✓ | — | — | — | — | — | — |
| View all branches | — | ✓ | — | — | — | — | — | — |
| View own branch | — | ✓ | ✓ | ✓ (if branch) | ✓ | — | — | — |
| Approve leaves | — | ✓ (all) | ✓ (own) | — | — | — | — | — |
| Approve result cards | — | ✓ | ✓ | — | — | — | — | — |
| Mark attendance | — | — | — | — | — | ✓ (own class) | — | — |
| Enter marks | — | — | — | — | — | ✓ (own subject) | — | — |
| Generate invoices | — | ✓ | — | ✓ | — | — | — | — |
| Record payments | — | — | — | ✓ | — | — | — | — |
| Download receipts | — | ✓ | ✓ | ✓ | — | — | ✓ (own child) | — |
| View student list | — | ✓ | ✓ | ✓ | ✓ | ✓ (own class) | — | — |
| Add student (admission) | — | ✓ | — | — | ✓ | — | — | — |
| Edit student profile | — | ✓ | ✓ | — | ✓ | — | — | — |
| View own child's data | — | — | — | — | — | — | ✓ | — |
| View own data | — | — | — | — | — | — | — | ✓ |
| Pay fees online | — | — | — | — | — | — | ✓ | — |
| Apply leave (self) | — | — | — | — | — | ✓ | ✓ (for child) | — |
| Post notices | — | ✓ (school-wide) | ✓ (branch) | — | — | ✓ (own class) | — | — |
| Generate reports | — | ✓ | ✓ | ✓ | — | — | — | — |
| Export Excel/PDF | — | ✓ | ✓ | ✓ | — | — | — | — |
| View audit log | ✓ | ✓ (own school) | — | — | — | — | — | — |

### 2.3 Authentication Rules

- **JWT-based session**, 7-day expiry, httpOnly cookie
- **Server-side role check on EVERY API call** — UI hiding is not enough
- **Password policy:** min 8 chars, must include 1 letter + 1 number
- **Password reset:** email link OR SMS OTP (depending on school's setup)
- **Account lock:** 5 failed attempts → 15 min lockout
- **Session invalidation:** when school suspended, all its users' sessions expire

---

## 3. User Onboarding Flows

### 3.1 New School Onboarding (Super Admin → School Owner)

```
Super Admin → /admin → "Add School" button
  ↓
Form: School Name*, City*, Owner Email*, Owner Name*, Plan*, Initial Status (Trial/Active)
  ↓
On submit (server-side):
  1. Create School record (status: trial OR active, plan_id assigned)
  2. Create Subscription record (30-day trial, auto-renew date)
  3. Create Owner user record (role: SCHOOL_OWNER, school_id, password_hash = temp random)
  4. Generate temporary password (12-char alphanumeric)
  5. Send welcome email to Owner via Resend:
     - Subject: "Welcome to SchoolSaaS — Your school is ready"
     - Body: Login URL + temp password + setup guide link
  6. Create audit log: "school.create" by Super Admin
  ↓
Owner checks email → clicks login link
  ↓
Owner enters email + temp password → system validates
  ↓
System shows "Set New Password" page (temp password expired on first login)
  ↓
Owner sets new password → redirected to /school (dashboard)
  ↓
Onboarding wizard starts (see 3.2)
```

**Edge cases:**
- Owner email already exists (another school owner) → error: "Email already in use, contact Super Admin"
- Owner email bounces → Super Admin can resend invite OR change email
- Owner doesn't login within 7 days → reminder email sent, after 14 days invite expires

### 3.2 Owner Onboarding Wizard (First Login)

When Owner logs in for the first time, a 5-step wizard appears:

```
Step 1: School Profile (logo, address, contact, timezone)
Step 2: Defaulters Policy Settings (configurable defaults)
  - SMS reminder days before due date: 5
  - Late fee amount: 0 PKR
  - Portal access block after: 30 days
  - Account suspend after: 60 days
Step 3: First Branch Setup (name, address, city)
Step 4: Academic Year (2024-25, start/end dates, mark active)
Step 5: Invite First Staff (Principal: name, email — invite sent)
  ↓
After wizard complete → dashboard shows "Setup complete!" + quick links
```

### 3.3 Owner → Staff Invitation

```
Owner → /school/staff → "Invite Staff" button
  ↓
Form: Name*, Email*, Role* (Principal/Accountant/Admission/Teacher), Branch* (dropdown), Class/Section (if Teacher)
  ↓
On submit:
  1. Create user record with role + school_id + branch_id (if applicable)
  2. Generate temp password
  3. Send email invite (similar to Owner invite)
  4. Audit log: "staff.invite"
  ↓
Staff member logs in → password reset → dashboard
```

**Plan limit check:**
- Starter: max 5 staff
- Growth: max 20 staff
- Pro: unlimited
- Enterprise: unlimited
- If limit exceeded → error: "Plan limit reached. Upgrade to add more staff."

### 3.4 Student Admission → Parent Invitation

```
School Admin / Admission Officer → /school/students/new
  ↓
Form: Student Name*, Father Name*, DOB*, Gender*, Class*, Section*
       Optional: Address, Guardian Phone, Email, Photo
  ↓
On submit:
  1. Generate Admission ID: BSS-LHR-2026-0014 (SCHOOL_CODE-CITY-YEAR-SEQ)
  2. Create Student record (status: active)
  3. Create Enrollment record (student_id + academic_year_id + section_id + roll_no auto)
  4. Create Guardian record (if provided)
  5. Create Parent User record (role: PARENT, password_hash = temp)
     - Linked to student_id
     - If same guardian has multiple children → link to all
  6. Send SMS to guardian phone: "Welcome to SchoolSaaS. Login: portal-link Temp PW: XXXX"
  7. Send WhatsApp message (if phone has WhatsApp)
  8. Audit log: "student.admit"
  ↓
Parent receives SMS → clicks link → sets password → parent portal
```

**Alternative — Parent Self-Signup:**

```
Parent visits /parent/login → "Don't have an account? Sign up"
  ↓
Form: Admission ID*, Date of Birth*, Your Phone* (must match school record)
  ↓
On submit:
  1. Verify Admission ID + DOB matches student record
  2. Verify phone matches guardian phone
  3. Create Parent User (linked to student)
  4. Send OTP to phone → verify
  5. Set password → portal access
  ↓
If any field mismatch → error: "Contact your school admin"
```

### 3.5 Student Login (Class 6+ only)

```
School Admin → /school/students → click student → "Enable Student Login" toggle
  ↓
System checks: student's class >= Class 6? Yes → proceed
  ↓
Create Student User (role: STUDENT, linked to student_id, temp password)
  ↓
SMS to parent: "Your child's portal login is ready. Share login: portal-link Temp PW: XXXX"
  ↓
Student logs in → password set → student dashboard (read-only)
```

**Class 5 and below:** Student login toggle is hidden (not applicable).

---

## 4. Per-Role Module Specifications

### 4.1 Super Admin Dashboard

**Pages:**
- `/admin` — Platform overview (MRR, total schools, trial conversions)
- `/admin/schools` — All schools list (search, filter by plan/status)
- `/admin/schools/new` — Add school form
- `/admin/plans` — Pricing tiers management
- `/admin/billing` — Subscription billing (Phase 3)
- `/admin/audit` — Platform-wide audit log
- `/admin/settings` — Platform settings

**KPIs:**
- Total Schools, Active, Trial, Suspended
- Monthly Recurring Revenue (MRR)
- Trial conversion rate
- Total students across all schools
- Avg students per school

**Actions:**
- Create school (auto-invite Owner)
- Suspend school (immediate access loss for all its users)
- Activate school (restore access)
- Delete school (60-day grace period, then permanent)
- Change school's plan
- View school's audit log
- Force logout all users of a school

### 4.2 School Owner Dashboard

**Pages:**
- `/school` — Multi-branch overview
- `/school/branches` — Branch management
- `/school/branches/new` — Add branch (plan limit checked)
- `/school/staff` — Staff management
- `/school/staff/invite` — Invite staff
- `/school/settings` — School settings (defaulters policy, branding)
- `/school/reports` — Aggregated reports (all branches)

**KPIs:**
- Total branches
- Total staff (vs plan limit)
- Total students (across all branches)
- Total fee collected (this month, all branches)
- Total pending fees
- Defaulters count
- Trial days remaining (if trial)

**Actions:**
- Add branch (plan limit enforced)
- Invite Principal / Accountant / Admission Officer / Teacher
- Edit defaulters policy (school-wide)
- Set fee plans (per branch OR school-wide)
- View audit log (own school only)
- Export aggregated reports (Excel)
- Brand customization (Enterprise plan: white-label)

### 4.3 Principal Dashboard (Per Branch)

**Pages:**
- `/principal` — Branch overview
- `/principal/approvals` — Pending approvals queue
- `/principal/teachers` — Teacher performance
- `/principal/reports` — Class-wise reports
- `/principal/audit` — Branch audit log

**KPIs:**
- Total students in branch
- Today's attendance %
- Avg result (last exam)
- Pending approvals count (leaves + result cards)
- Teacher count + attendance marking discipline

**Pending Approvals Queue:**
- Teacher leave requests (approve/reject)
- Result card submissions (review before publish to parents)
- Fee waiver requests (from Accountant)
- Class change requests (from parents)

**Actions:**
- Approve/reject leaves (with comment)
- Approve/reject result cards (with comment)
- View teacher performance (result %, attendance marking %)
- Generate class reports (Excel/PDF)
- Branch audit log

### 4.4 Accountant Dashboard

**Pages:**
- `/accountant` — Fees overview
- `/accountant/invoices` — Invoices list + filters
- `/accountant/invoices/generate` — Bulk invoice generation
- `/accountant/payments` — Record payment
- `/accountant/defaulters` — Defaulters report
- `/accountant/reports` — Financial reports

**Two Modes (school-configurable):**
- **School-level Accountant** — sees all branches' fees
- **Branch-level Accountant** — sees only assigned branch

**Search Student (Same Names Solution):**
- Primary search: Admission ID (BSS-LHR-2026-0014)
- Secondary: Roll # + Section (e.g., "14" + "5-A")
- Tertiary: Parent phone last 4 digits
- Results show: Name + Admission ID + Class-Section + Father Name + Guardian Phone

**KPIs:**
- Total invoiced (this month)
- Total collected (this month)
- Outstanding amount
- Defaulters count
- Today's receipts (count + amount)

**Actions:**
- Generate bulk invoices per class (1 click, all students of fee plan's class)
- Record payment (cash/bank/JazzCash/Easypaisa/cheque)
- Generate PDF receipt (branded)
- View defaulters (per class, sorted by amount overdue)
- Send reminder SMS to defaulters (manual button)
- Export Excel/PDF reports

### 4.5 Teacher Dashboard

**Pages:**
- `/teacher` — Today's timetable + pending tasks
- `/teacher/attendance` — Mark attendance
- `/teacher/marks` — Enter marks (per exam + subject)
- `/teacher/leave` — Apply for leave
- `/teacher/students` — My class students
- `/teacher/homework` — Assign homework (optional)
- `/teacher/my-attendance` — My own attendance

**KPIs:**
- Today's classes count
- Attendance pending (current class)
- Marks pending (current exam)
- My attendance % (this month)

**Today's Timetable:**
- Period-by-period schedule
- Current period highlighted ("Now" pill)
- Click period → mark attendance for that class/section
- Free periods shown

**Attendance Marking:**
- Section students list (sorted by roll #)
- 3 buttons per student: Present (green ✓), Absent (red ✗), Late (amber ⏰)
- Quick action: "Mark All Present"
- Save button at bottom
- Edit window: 24 hours (after that, only Principal can edit)

**Leave Application:**
- Form: date(s) + reason + type (Casual/Sick/Emergency/Maternity)
- Submitted → Principal's approval queue
- Notification: approved/rejected
- If approved → timetable auto-adjusts (substitute placeholder shown)

### 4.6 Parent Portal

**Pages:**
- `/parent` — Multi-child dashboard
- `/parent/attendance` — Child attendance calendar
- `/parent/results` — Subject-wise results
- `/parent/fees` — Fees + pay online
- `/parent/receipts` — Download past receipts
- `/parent/notices` — Notice board
- `/parent/leave` — Apply leave for child

**Multi-Child Selector:**
- If parent has 2+ children in same school → dropdown at top
- Switch between children with one click
- All data updates for selected child

**Attendance Calendar:**
- Monthly calendar view
- Color-coded: Green (Present), Red (Absent), Yellow (Late), Gray (Holiday)
- Click day → details (marked by teacher name, time)

**Subject Results:**
- Bar chart per subject (latest exam)
- Compare with class average (anonymized)
- Trend line (last 3 exams)
- Grade displayed (A+, A, B, C, D, F)

**Online Payment:**
- Pending fees shown
- "Pay Now" → redirect to JazzCash/Easypaisa gateway
- After payment → auto-update invoice + receipt generation
- Download PDF receipt

**Notice Board:**
- School-wide notices (PTM, holidays)
- Class-specific notices (field trips, exams)
- Sorted by date (newest first)
- Unread badge on parent dashboard

### 4.7 Student Dashboard (Class 6+ only)

**Pages:**
- `/student` — My overview
- `/student/attendance` — My attendance history
- `/student/results` — My results
- `/student/timetable` — My class timetable
- `/student/homework` — Homework (if assigned)
- `/student/notices` — Class notices

**Strictly read-only** — no editing rights anywhere.

### 4.8 Admission Officer Dashboard (CRM)

**Pages:**
- `/admission` — Inquiry funnel
- `/admission/inquiries` — All inquiries
- `/admission/inquiries/new` — Log new inquiry
- `/admission/followups` — Today's follow-ups
- `/admission/sources` — Inquiry sources tracking
- `/admission/reports` — Conversion stats

**Admission Funnel:**
1. Inquired (lead generation)
2. Campus Visit (scheduled)
3. Form Submitted (paid admission form fee)
4. Interview/Assessment (for senior classes)
5. Admitted (converted to student)

**Actions:**
- Log inquiry (parent name, phone, source, class interest)
- Schedule follow-up (date + action)
- Mark stage advancement
- Convert lead to student (auto-fill admission form)

---

## 5. Core Features Specifications

### 5.1 Student Management

#### 5.1.1 Admission Form

**Required fields:**
- Student Name (text)
- Father Name (text)
- Date of Birth (date picker)
- Gender (male/female dropdown)
- Class (dropdown from school's classes)
- Section (dropdown, depends on class)

**Optional fields:**
- Address (text)
- Guardian Phone (text, validated)
- Email (text, validated)
- Student Photo (image upload, max 2MB)
- Father CNIC (text, validated format)
- Previous School (text)
- Medical Conditions (text)

**Auto-generated:**
- Admission ID (format: `[SCHOOL_CODE]-[CITY]-[YEAR]-[SEQ]`)
  - Example: BSS-LHR-2026-0014 (14th admission of Beaconhouse Lahore in 2026)
  - Sequence resets per year per school
- Roll Number (next available in section, e.g., 15 if 14 already exists)
- Enrollment ID (internal, links student + academic_year + section)

#### 5.1.2 Same Names Solution

**Search combinations (any one works):**
1. Admission ID (most reliable, always unique)
2. Roll # + Section (e.g., "14" + "5-A")
3. Father's phone last 4 digits (e.g., "4567")

**Display in search results:**
```
Ali Hassan (BSS-LHR-2026-0014)
  Class 5-A, Roll 14, S/O Hassan Mahmood
  Guardian: +92 300 1234567

Ali Hassan (BSS-LHR-2026-0008)
  Class 3-B, Roll 5, S/O Imran Sheikh
  Guardian: +92 300 9876654
```

#### 5.1.3 Student Status Management

- `active` — currently enrolled
- `graduated` — completed current academic year (preserved for history)
- `left` — left school mid-year (data preserved, can be re-enrolled)
- `suspended` — fee defaulter (portal access blocked per policy)

#### 5.1.4 Bulk Import (Excel)

- Template download (Excel format with required columns)
- Upload file → preview → confirm → import
- Validation:
  - Duplicate Admission IDs rejected
  - Required fields missing → row skipped with reason
  - Class/Section names must match existing
- After import: students shown in list, parents auto-invited via SMS

### 5.2 Attendance

#### 5.2.1 Daily Marking Flow

```
Teacher → /teacher/attendance
  ↓
Select Section (auto: current period's section)
Select Date (default: today)
  ↓
System loads section's students (sorted by roll #)
  ↓
For each student: P / A / L button
  ↓
Quick action: "Mark All Present"
  ↓
Teacher clicks Save
  ↓
System:
  1. Delete any existing attendance for this section+date (idempotent)
  2. Insert new attendance records
  3. For absent students: trigger SMS to parent (if policy enabled)
  4. Audit log: "attendance.marked" by teacher
```

#### 5.2.2 Edit Window

- Teacher can edit attendance for 24 hours
- After 24 hours: only Principal can edit (with reason, audit logged)
- Why? To prevent attendance manipulation after reports generated

#### 5.2.3 SMS to Absent Parents

- Triggered automatically on save (if school has SMS configured)
- Template: "Dear Parent, your child [Name] (Roll #[X]) was absent on [Date]. Please contact school if needed."
- Cost: pass-through + 10% margin

#### 5.2.4 Attendance Reports

- Per-student monthly summary (X/30 days present = Y%)
- Per-class daily summary
- Below 80% threshold students list (Principal action)
- Excel + PDF export

### 5.3 Fees & Invoicing

#### 5.3.1 Fee Plans

- Per-class fee plans (Monthly Tuition PKR 4,500 for Class 5)
- Frequency: Monthly, Quarterly, Yearly, One-time
- Multiple plans per class (e.g., Tuition + Admission Fee + Exam Fee)
- School-wide plans (no class = applies to all)

#### 5.3.2 Bulk Invoice Generation

```
Accountant → /accountant/invoices/generate
  ↓
Select: Month (YYYY-MM) + Fee Plan
  ↓
System:
  1. Find all enrollments matching fee plan's class + active academic year
  2. For each enrollment: check if invoice already exists for month + plan
  3. If not exists → create invoice (amount = fee plan amount, due date = 15th of month)
  4. Skip students with status != active
  5. Return: created count + skipped count
  ↓
Toast: "Generated X invoices, Y already existed"
```

#### 5.3.3 Payment Recording

```
Accountant → Invoice detail → "Record Payment" button
  ↓
Form auto-fills: amount = remaining (invoice amount - already paid)
Fields: amount, method (cash/bank/JazzCash/Easypaisa/cheque), notes
  ↓
On submit:
  1. Validate amount <= remaining
  2. Generate receipt number: R-[BRANCH_CODE]-[YYYYMMDD]-[SEQ]
     Example: R-LHR-20260115-0042
  3. Create Payment record
  4. Update invoice status (paid / partial / unpaid)
  5. Generate branded PDF receipt (HTML page, print-ready)
  6. Audit log: "payment.recorded"
```

#### 5.3.4 PDF Receipt Format

- Branded with school name + Emerson 3-bar logo
- Receipt No, Date, Student Name, Class, Roll #, Guardian
- Fee title, Month, Invoice amount, Paid amount, Balance
- Payment method tag (colored pill)
- Authorized signature line
- Print button (browser's Print → Save as PDF)

#### 5.3.5 Defaulters Policy (School-Configurable)

Owner sets these in `/school/settings`:

| Setting | Default | Description |
|---|---|---|
| Reminder days before | 5 | SMS sent X days before due date |
| Late fee amount | 0 PKR | Added to invoice after due date |
| Portal block days | 30 | Parent portal access blocked X days after due |
| Account suspend days | 60 | Student account suspended X days after due |

**Auto-escalation flow (cron job runs daily):**
1. Find all invoices past due date
2. Days 0-5: nothing
3. Day 5: send reminder SMS (per policy)
4. Day 0 (due date): if not paid, status = overdue
5. Day 0 + late fee grace: add late fee to next invoice
6. Day 30: parent portal access blocked
7. Day 60: student account suspended (Principal notified)

### 5.4 Exams & Results

#### 5.4.1 Exam Creation (Principal/Owner)

- Exam name (Mid-Term, Final, Monthly Test 1)
- Class scope (all classes OR specific class)
- Subjects included (multi-select from school's subjects)
- Total marks per subject
- Pass percentage (default 40%)
- Date range

#### 5.4.2 Marks Entry (Teacher)

- Teacher sees only own class + own subjects
- Grid: students (rows) × subjects (columns)
- Enter marks per cell (0 to total)
- Save → status: "submitted" (waiting Principal approval)

#### 5.4.3 Result Card Generation (Principal approves)

- Teacher submits marks → Principal's approval queue
- Principal reviews → approve/reject (with comment)
- On approve: result card auto-generated (PDF)
- Result card template: board-specific (Federal, Aga Khan, custom)
- Published to parent portal

#### 5.4.4 Grade Calculation

- 90%+ = A+
- 80-89% = A
- 70-79% = B
- 60-69% = C
- 50-59% = D
- Below 50% = F (Fail)
- Configurable per school

### 5.5 Reports & Exports

#### 5.5.1 Excel Exports

- Students list (with admission ID, class, guardian)
- Attendance monthly summary
- Fee collection report
- Defaulters list
- Result summary (per class)
- All with date/branch filters

#### 5.5.2 PDF Branded Reports

- Class-wise summary (school logo + Emerson logo)
- Monthly collection report (for accounts)
- Defaulters notice (for parents)
- Result cards (per student)
- All printable A4 size

### 5.6 Notice Board

#### 5.6.1 Notice Types

- **School-wide** — Owner posts (PTM, holidays)
- **Branch-wide** — Principal posts (branch events)
- **Class-specific** — Teacher posts (homework, field trips)

#### 5.6.2 Notice Visibility

- All parents see school-wide notices
- Branch parents see branch notices
- Class parents see class notices
- Unread badge on parent dashboard

#### 5.6.3 SMS Integration

- For urgent notices (PTM reminder, holiday announced): auto-send SMS
- Cost: pass-through + margin
- School can disable SMS for non-urgent notices (cost control)

### 5.7 Leave Management

#### 5.7.1 Teacher Leave Flow

```
Teacher → /teacher/leave → "Apply Leave"
  ↓
Form: date(s)*, type (Casual/Sick/Emergency/Maternity)*, reason*
  ↓
On submit:
  1. Create leave request (status: pending)
  2. Send notification to Principal
  3. Show in Principal's "Pending Approvals"
  ↓
Principal reviews:
  - Approve → teacher notified, timetable auto-adjusted
  - Reject (with comment) → teacher notified
  ↓
If approved:
  - That day's classes marked as "Substitute needed"
  - Other teachers can volunteer OR Principal assigns
  - Affected students' parents notified
```

#### 5.7.2 Parent Leave (for child)

```
Parent → /parent/leave → "Apply Leave for Child"
  ↓
Form: date(s), reason
  ↓
Sent to class teacher + Principal
  ↓
Teacher approves/rejects (with comment)
  ↓
Parent notified
```

---

## 6. Edge Cases & Solutions

### 6.1 Same Names Problem

**Issue:** 500 students, 10 named "Ali Hassan"

**Solution:**
- Auto-generated Admission ID (BSS-LHR-2026-0014)
- Search supports 3 ways (Admission ID, Roll#+Section, Phone last 4)
- All dropdowns display: "Name (Admission ID) — Class Section"
- Receipt shows Admission ID prominently

### 6.2 Authentication Failure

**Issue:** Parent phone wrong, OTP not delivered

**Solution:**
- Backup login: Admission ID + DOB
- Self-signup also requires matching school records
- After 3 failed OTP attempts → fallback to email (if provided)
- If no email → must contact school admin

### 6.3 Student Leaves Mid-Year

**Issue:** Student leaves school, data retention policy

**Solution:**
- Status changes to `left`
- Data preserved for 5 years (Pakistan legal requirement)
- Login access revoked
- Can be re-enrolled (new Admission ID or restore old)
- Reports can still be generated for past period

### 6.4 Multi-Branch Fee Discrepancy

**Issue:** Branch A fee PKR 4,500, Branch B fee PKR 5,000

**Solution:**
- Fee plans are per-branch (default) OR school-wide (Owner choice)
- Reports show per-branch breakdown
- Aggregated reports sum up all branches
- Owner can see comparison view (branch A vs B)

### 6.5 SMS Gateway Failure

**Issue:** SMS provider down

**Solution:**
- Primary: Twilio
- Fallback: Local Pakistani provider (auto-switch if primary fails 3x)
- Last resort: Email (if parent has email)
- Failed SMS logged for retry

### 6.6 Internet Down at School

**Issue:** Rural areas, slow internet

**Solution (Phase 3):**
- PWA (Progressive Web App) — installable on phone
- Offline mode: mark attendance offline
- Auto-sync when internet restored
- Cached data: student list, today's timetable

### 6.7 Parent Has Multiple Children

**Issue:** One parent, 2+ children in same school

**Solution:**
- Single Parent User linked to multiple student_ids
- Multi-child selector dropdown on portal
- Switch children with one click
- All data updates for selected child

### 6.8 Fee Defaulters — Auto Actions

**Issue:** School wants consistent policy

**Solution:**
- Owner configures policy in settings (5 reminders, 30-day portal block, 60-day suspend)
- Daily cron job enforces policy
- All actions audit logged
- Manual override: Owner/Principal can waive (with reason)

### 6.9 Teacher Leaves Mid-Term

**Issue:** Classes unassigned

**Solution:**
- Substitute assignment tool
- Class migration: bulk reassign students to new section
- Old teacher's attendance/marks preserved under old teacher's name
- New teacher sees historical data (read-only) for continuity

### 6.10 Receipt Number Collision

**Issue:** 2 branches generate receipts same time

**Solution:**
- Branch prefix in receipt number: R-LHR-2026-001, R-KHI-2026-001
- Sequence per branch per year
- Database unique constraint on receipt_no + branch_id

### 6.11 Wrong Attendance Marked

**Issue:** Teacher marked wrong day

**Solution:**
- 24-hour edit window (teacher can self-correct)
- After 24 hours: Principal edit only (with reason)
- All edits audit logged (old value, new value, who, when)

### 6.12 Fee Amount Change Mid-Year

**Issue:** School raises fee in September

**Solution:**
- Fee plan versioning: old plan expires Aug 31, new plan starts Sep 1
- Old invoices (Jan-Aug) use old amount
- New invoices (Sep-Dec) use new amount
- Reports show plan change history

### 6.13 Result Card Format

**Issue:** Different boards have different formats

**Solution:**
- Multiple templates: Federal Board, Aga Khan Board, custom
- School selects default template in settings
- Per-exam override possible
- PDF generation uses selected template

### 6.14 Premium Branding (Sales "Greed")

**Issue:** Schools hesitant to buy

**Solution:** 4 elements on landing page:
1. **Demo Video** — 2-min screen recording showing actual dashboard
2. **Live Dashboard Preview** — interactive read-only demo (no signup)
3. **Before/After Visual** — paper register vs digital dashboard split image
4. **ROI Calculator** — "How many students?" → "You save PKR X/month + Y hours/week"

### 6.15 Audit Trail

**Issue:** Who changed what?

**Solution:**
- Every sensitive action audit logged (already implemented)
- Log includes: user_id, action, entity, entity_id, metadata, timestamp
- Owner can view own school's audit log
- Super Admin can view all schools' audit logs
- Exportable as Excel

### 6.16 Data Backup / Export

**Issue:** School wants to leave platform

**Solution:**
- "Export My Data" button in Owner settings
- Generates ZIP file: Excel files for each table + PDF reports
- Available for 30 days after subscription ends
- After 30 days: data permanently deleted (legal compliance)

### 6.17 Custom Branding (Enterprise)

**Issue:** Big schools want own logo

**Solution:**
- Enterprise plan feature: white-label
- School can upload own logo (replaces Emerson in receipts)
- Custom subdomain (e.g., beaconhouse.schoolsaas.pk)
- School colors override (limited palette)

### 6.18 Multi-Language

**Issue:** Urdu + English

**Solution (Phase 3):**
- Toggle in user settings (Urdu/English)
- Subject names shown in both (e.g., "Mathematics / ریاضی")
- Result cards can be printed in either language
- Notices can be posted in either

### 6.19 Scalability

**Issue:** 1000+ schools performance

**Solution:**
- Supabase handles 10K+ schools easily
- Database indexes on school_id, status, created_at
- Pagination on all list views (default 50 per page)
- Read replicas for reports (Phase 3)
- Caching: TanStack Query (5-min stale time for lists)

### 6.20 Duplicate Invitations

**Issue:** Owner invites same email twice

**Solution:**
- Unique constraint on email + school_id
- If existing user → "Resend invite" instead of "Create new"
- Existing user can be promoted to new role (e.g., teacher → principal)

---

## 7. Database Schema Additions

### 7.1 New Tables Required

```sql
-- Branches (multi-campus per school)
CREATE TABLE Branch (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES School(id),
  name VARCHAR NOT NULL,
  address VARCHAR,
  city VARCHAR,
  phone VARCHAR,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update User table to add branch_id (nullable for school-level roles)
ALTER TABLE User ADD COLUMN branch_id UUID REFERENCES Branch(id);
ALTER TABLE User ADD COLUMN temp_password VARCHAR;
ALTER TABLE User ADD COLUMN password_set_at TIMESTAMP;
ALTER TABLE User ADD COLUMN failed_login_attempts INT DEFAULT 0;
ALTER TABLE User ADD COLUMN locked_until TIMESTAMP;

-- Admission IDs
ALTER TABLE Student ADD COLUMN admission_id VARCHAR UNIQUE;
ALTER TABLE Student ADD COLUMN photo_url VARCHAR;

-- Leave requests
CREATE TABLE LeaveRequest (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES User(id),
  branch_id UUID REFERENCES Branch(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type VARCHAR, -- casual, sick, emergency, maternity
  reason TEXT,
  status VARCHAR DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES User(id),
  approved_at TIMESTAMP,
  approver_comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notices
CREATE TABLE Notice (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES School(id),
  branch_id UUID REFERENCES Branch(id),
  class_id UUID REFERENCES Class(id),
  posted_by UUID REFERENCES User(id),
  title VARCHAR NOT NULL,
  body TEXT,
  notice_type VARCHAR, -- school_wide, branch_wide, class_specific
  send_sms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notice reads (track which parents saw)
CREATE TABLE NoticeRead (
  notice_id UUID REFERENCES Notice(id),
  user_id UUID REFERENCES User(id),
  read_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (notice_id, user_id)
);

-- Settings (school-configurable)
CREATE TABLE SchoolSettings (
  school_id UUID PRIMARY KEY REFERENCES School(id),
  defaulters_reminder_days INT DEFAULT 5,
  defaulters_late_fee INT DEFAULT 0,
  defaulters_portal_block_days INT DEFAULT 30,
  defaulters_suspend_days INT DEFAULT 60,
  sms_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  student_login_min_class VARCHAR DEFAULT 'Class 6',
  branding_logo_url VARCHAR,
  custom_subdomain VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Parent-student link (many-to-many for multi-child)
CREATE TABLE ParentStudent (
  parent_id UUID REFERENCES User(id),
  student_id UUID REFERENCES Student(id),
  relation VARCHAR, -- father, mother, guardian
  PRIMARY KEY (parent_id, student_id)
);
```

### 7.2 Updated Prisma Schema Sections

```prisma
model Branch {
  id        String   @id @default(cuid())
  schoolId  String
  name      String
  address   String?
  city      String?
  phone     String?
  isMain    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  school   School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  users    User[]
  classes  Class[]
  
  @@index([schoolId])
}

model User {
  // ... existing fields
  branchId       String?
  branch         Branch?      @relation(fields: [branchId], references: [id])
  tempPassword   String?
  passwordSetAt  DateTime?
  failedLoginAttempts Int  @default(0)
  lockedUntil    DateTime?
  
  leaveRequests  LeaveRequest[]
  postedNotices  Notice[]
  noticeReads    NoticeRead[]
  
  @@index([branchId])
}

model Student {
  // ... existing fields
  admissionId  String?  @unique
  photoUrl     String?
  
  parents      ParentStudent[]
}

model LeaveRequest {
  id           String   @id @default(cuid())
  userId       String
  branchId     String?
  startDate    DateTime
  endDate      DateTime
  type         String   // casual, sick, emergency, maternity
  reason       String
  status       String   @default("pending")
  approvedBy   String?
  approvedAt   DateTime?
  approverComment String?
  createdAt    DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  branch       Branch?  @relation(fields: [branchId], references: [id])
  approver     User?    @relation("LeaveApprover", fields: [approvedBy], references: [id])
  
  @@index([userId])
  @@index([status])
}

model Notice {
  id          String   @id @default(cuid())
  schoolId    String
  branchId    String?
  classId      String?
  postedBy     String
  title       String
  body        String
  noticeType  String
  sendSms     Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  school      School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  branch      Branch?  @relation(fields: [branchId], references: [id])
  postedByUser User    @relation(fields: [postedBy], references: [id])
  reads       NoticeRead[]
  
  @@index([schoolId])
  @@index([branchId])
}

model NoticeRead {
  noticeId  String
  userId    String
  readAt    DateTime @default(now())
  
  notice    Notice   @relation(fields: [noticeId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@id([noticeId, userId])
}

model SchoolSettings {
  schoolId                  String   @id
  defaultersReminderDays    Int      @default(5)
  defaultersLateFee         Int      @default(0)
  defaultersPortalBlockDays Int      @default(30)
  defaultersSuspendDays     Int      @default(60)
  smsEnabled                Boolean  @default(true)
  whatsappEnabled           Boolean  @default(false)
  studentLoginMinClass      String   @default("Class 6")
  brandingLogoUrl           String?
  customSubdomain           String?
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt
  
  school                    School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)
}

model ParentStudent {
  parentId    String
  studentId   String
  relation    String   // father, mother, guardian
  
  parent      User     @relation(fields: [parentId], references: [id], onDelete: Cascade)
  student     Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  @@id([parentId, studentId])
}
```

---

## 8. API Endpoints List

### 8.1 Auth

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/api/auth/login` | Login (any role) | Public |
| POST | `/api/auth/logout` | Logout | Authenticated |
| GET | `/api/auth/me` | Current user | Authenticated |
| POST | `/api/auth/forgot-password` | Request reset | Public |
| POST | `/api/auth/reset-password` | Reset with token | Public |
| POST | `/api/auth/change-password` | Change password | Authenticated |

### 8.2 Super Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stats/platform` | Platform KPIs |
| GET | `/api/schools` | List all schools |
| POST | `/api/schools` | Create school (auto-invite Owner) |
| GET | `/api/schools/[id]` | School detail |
| POST | `/api/schools/[id]/suspend` | Suspend school |
| POST | `/api/schools/[id]/activate` | Activate school |
| DELETE | `/api/schools/[id]` | Delete school (60-day grace) |
| GET | `/api/plans` | List plans |
| POST | `/api/plans` | Create plan |
| PATCH | `/api/plans/[id]` | Update plan |
| GET | `/api/audit` | Platform audit log |

### 8.3 School Owner

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/school/branches` | List branches |
| POST | `/api/school/branches` | Create branch (plan limit checked) |
| GET | `/api/school/staff` | List staff |
| POST | `/api/school/staff/invite` | Invite staff |
| DELETE | `/api/school/staff/[id]` | Remove staff |
| GET | `/api/school/settings` | Get settings |
| PATCH | `/api/school/settings` | Update settings (defaulters policy) |
| GET | `/api/school/reports/aggregate` | Aggregated reports (all branches) |

### 8.4 Principal

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/principal/approvals` | Pending approvals |
| POST | `/api/principal/approvals/[id]/approve` | Approve |
| POST | `/api/principal/approvals/[id]/reject` | Reject |
| GET | `/api/principal/teachers` | Teacher performance |
| GET | `/api/principal/reports/class` | Class reports |
| GET | `/api/principal/audit` | Branch audit |

### 8.5 Accountant

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/accountant/search` | Search students (3 ways) |
| GET | `/api/accountant/invoices` | List invoices |
| POST | `/api/accountant/invoices/generate` | Bulk generate |
| POST | `/api/accountant/invoices/[id]/payment` | Record payment |
| GET | `/api/accountant/invoices/[id]/receipt` | PDF receipt (HTML) |
| GET | `/api/accountant/defaulters` | Defaulters report |
| GET | `/api/accountant/reports` | Financial reports |

### 8.6 Teacher

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/teacher/timetable` | Today's timetable |
| GET | `/api/teacher/attendance` | Section students for date |
| POST | `/api/teacher/attendance` | Save attendance |
| GET | `/api/teacher/students` | My class students |
| GET | `/api/teacher/marks` | Marks entry form |
| POST | `/api/teacher/marks` | Save marks |
| POST | `/api/teacher/leave` | Apply leave |
| GET | `/api/teacher/my-attendance` | My attendance |

### 8.7 Parent

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/parent/children` | List my children |
| GET | `/api/parent/child/[id]/attendance` | Child attendance |
| GET | `/api/parent/child/[id]/results` | Child results |
| GET | `/api/parent/child/[id]/fees` | Child fees |
| POST | `/api/parent/child/[id]/pay` | Pay online |
| GET | `/api/parent/child/[id]/receipts` | Past receipts |
| GET | `/api/parent/notices` | Notices |
| POST | `/api/parent/child/[id]/leave` | Apply leave for child |

### 8.8 Student (Class 6+)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/student/attendance` | My attendance |
| GET | `/api/student/results` | My results |
| GET | `/api/student/timetable` | My timetable |
| GET | `/api/student/notices` | Class notices |

### 8.9 Admission Officer

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admission/inquiries` | List inquiries |
| POST | `/api/admission/inquiries` | Log new inquiry |
| PATCH | `/api/admission/inquiries/[id]` | Update stage |
| POST | `/api/admission/inquiries/[id]/convert` | Convert to student |
| GET | `/api/admission/followups` | Today's follow-ups |
| GET | `/api/admission/funnel` | Conversion stats |

### 8.10 Notices (shared)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notices` | List (filtered by scope) |
| POST | `/api/notices` | Post notice (Owner/Principal/Teacher) |
| POST | `/api/notices/[id]/read` | Mark as read |

### 8.11 Public (Sales Website)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/contact` | Contact form submission |
| GET | `/api/roi-calculator` | Calculate ROI (input: students count) |

---

## 9. UI/UX Specs & Emerson Branding Rules

### 9.1 Color System

| Token | Hex | Usage |
|---|---|---|
| Primary Blue | `#0064C8` | Primary buttons, active states, links, sidebar active |
| Primary Blue Dark | `#0A56A8` | Hover states |
| Growth Green | `#0E9E56` | Success states (paid, present, active) |
| Energy Amber | `#F5A800` | Warnings, highlights, "Most Popular" badge |
| Cream | `#FEF4DD` | Highlight backgrounds (cream pill bg) |
| Cream Ink | `#7A5200` | Text on cream bg |
| Ink | `#1C232D` | Main text |
| Muted | `#5B6672` | Secondary text |
| Background | `#FDFDFB` | App background (warm off-white) |
| Border | `#E6E8E4` | Card borders, dividers |
| Danger | `#DC2626` | Errors, delete, suspend |
| Purple | `#7C3AED` | Principal accent |
| Rose | `#E11D48` | Parent accent |
| Cyan | `#0891B2` | Teacher accent |

### 9.2 Status Pill Colors

| Status | Background | Text | Border | Use |
|---|---|---|---|---|
| Active/Paid/Present | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` | Success |
| Pending/Trial/Late | `bg-blue-50` | `text-blue-700` | `border-blue-200` | Info |
| Suspended/Overdue/Absent | `bg-red-50` | `text-red-700` | `border-red-200` | Error |
| Warning/Partial | `bg-amber-50` | `text-amber-700` | `border-amber-200` | Warning |
| Neutral | `bg-zinc-100` | `text-zinc-600` | `border-zinc-200` | Default |

### 9.3 Typography

- **Headings:** Inter (Bold 700, letter-spacing -0.02em)
- **Body:** Inter (Regular 400, line-height 1.6)
- **Numbers/Data:** JetBrains Mono (tabular)
- **Hierarchy:**
  - H1: 52px / 1.1
  - H2: 34px / 1.2
  - H3: 18px / 1.4 (cards)
  - Body: 16px / 1.6
  - Eyebrow: 12px UPPERCASE +0.14em (labels)
  - Data: 13px mono

### 9.4 Component Specs

#### 9.4.1 Buttons
- Primary: `bg-primary text-white rounded-lg px-4 py-2.5 font-semibold`
- Secondary: `bg-white text-ink border border-border rounded-lg px-4 py-2.5`
- Hover: 5% darker, no size change
- Disabled: opacity 60%, no hover

#### 9.4.2 Cards
- White background
- 1px border `border-border`
- 12px radius
- Padding: 24px (default), 16px (compact)
- Subtle shadow on hover

#### 9.4.3 Tables
- Header: `bg-muted/30 text-xs uppercase tracking-wider`
- Row: `border-b last:border-0 hover:bg-muted/30`
- Cell padding: 12px 16px

#### 9.4.4 KPI Cards (Dashboard)
- 3px primary color top strip
- Label: 10px uppercase muted
- Value: 24px bold
- Sub: 11px muted
- Icon: 20px in soft background square

### 9.5 Sidebar Specs

- Width: 256px (w-64)
- Background: `bg-sidebar` (light theme: cream, dark: navy)
- Logo + role label at top
- Nav sections with uppercase labels
- Active item: gradient bg + white text + shadow
- Theme toggle + Sign Out at bottom

### 9.6 Page Layout

```
[Sidebar 256px] [Main content - flex-1]
                [Page padding: p-6 lg:p-8]
                [Max width: full width (no max-w on admin)]
                [Sticky footer if any]
```

### 9.7 Responsive Breakpoints

- Mobile-first design
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- Mobile: sidebar collapses to hamburger menu
- Tables: horizontal scroll on mobile

### 9.8 Dark Mode

- Toggle in sidebar/header
- Persisted in localStorage (next-themes)
- All components dark-mode ready
- Background: `oklch(0.145 0 0)` (not pure black)
- Text: `oklch(0.985 0 0)` (not pure white)

### 9.9 Toast Notifications

- Use `sonner` library
- Position: top-right
- Variants: success (green), error (red), info (blue), warning (amber)
- Auto-dismiss: 4 seconds
- Rich colors with icons

### 9.10 Loading States

- Spinner: `Loader2` icon with `animate-spin`
- Skeleton: gray placeholder blocks for tables
- Disabled state with spinner on buttons during async

### 9.11 Empty States

- Centered icon (muted)
- Headline text (medium weight)
- Description (muted)
- CTA button (if actionable)
- Example: "No students yet. Add your first student."

### 9.12 Form Patterns

- Labels: 12px font-semibold, required asterisk red
- Inputs: h-11 (44px height for touch targets)
- Error messages: red, 12px, below input
- Validation: client-side + server-side
- Submit button: full-width on mobile, auto on desktop

---

## 10. Implementation Roadmap

### 10.1 Phase 3.2a — School Owner Dashboard (2-3 days)

**Tasks:**
1. Add Branch + SchoolSettings tables to Prisma schema
2. Push schema to Supabase
3. Create `/api/school/branches` CRUD endpoints
4. Create `/api/school/staff` endpoints (invite, list, remove)
5. Create `/api/school/settings` endpoints
6. Build Owner dashboard page (`/school` already exists, extend it)
7. Build Branches page (`/school/branches`)
8. Build Staff page (`/school/staff`)
9. Build Settings page (`/school/settings`)
10. Seed: link demo schools to branches
11. Test with agent-browser

### 10.2 Phase 3.2b — Principal Dashboard (1-2 days)

**Tasks:**
1. Create `/principal/login` page
2. Create `/principal` dashboard
3. Build pending approvals queue
4. Build teacher performance view
5. Build class reports page (Excel + PDF)
6. Add LeaveRequest API endpoints
7. Build leave approval flow

### 10.3 Phase 3.2c — Accountant Dashboard (1-2 days)

**Tasks:**
1. Create `/accountant/login` page
2. Create `/accountant` dashboard
3. Build student search (3 ways)
4. Build invoice list with filters
5. Build bulk invoice generation
6. Build payment recording dialog
7. Build PDF receipt endpoint (branded)
8. Build defaulters report

### 10.4 Phase 3.3a — Teacher Dashboard (1-2 days)

**Tasks:**
1. Create `/teacher/login` page
2. Create `/teacher` dashboard with timetable
3. Build attendance marking page (per-section)
4. Build marks entry page
5. Build leave application page
6. Build my class students view
7. Build homework assignment (optional)

### 10.5 Phase 3.3b — Parent Portal (2-3 days)

**Tasks:**
1. Create `/parent/login` page + self-signup flow
2. Create `/parent` dashboard (multi-child selector)
3. Build attendance calendar view
4. Build subject results bar charts
5. Build fees + online payment integration (JazzCash/Easypaisa)
6. Build receipts download
7. Build notice board
8. Build leave application for child

### 10.6 Phase 3.3c — Student Dashboard (Class 6+) (1 day)

**Tasks:**
1. Create `/student/login` page
2. Create `/student` dashboard
3. Build attendance view
4. Build results view
5. Build timetable view

### 10.7 Phase 3.3d — Admission Officer CRM (1-2 days)

**Tasks:**
1. Create `/admission/login` page
2. Create `/admission` dashboard (funnel)
3. Build inquiries list + new inquiry form
4. Build follow-ups page (today's tasks)
5. Build conversion (inquiry → student)

### 10.8 Phase 3.3e — Reports + Exports (1-2 days)

**Tasks:**
1. Install `xlsx` library for Excel export
2. Build Excel export endpoints (students, attendance, fees, defaulters)
3. Build PDF branded report templates
4. Add date/branch filters
5. Test exports with real data

### 10.9 Phase 3.3f — Notice Board + SMS (2-3 days)

**Tasks:**
1. Build Notice + NoticeRead tables
2. Build notice API endpoints
3. Build notice board UI (per role scope)
4. Integrate SMS provider (Twilio + local)
5. Build SMS send logic for notices + attendance + reminders
6. Add SMS logs view

### 10.10 Phase 3.3g — Sales Website Premium Add-ons (1-2 days)

**Tasks:**
1. Record demo video (2-min screen recording)
2. Embed video on landing hero
3. Build live dashboard preview (read-only iframe with sample data)
4. Create before/after visual (split image)
5. Build ROI calculator (interactive component)
6. Test conversion flows

### 10.11 Phase 3.3h — Multi-Language (Optional, 1-2 days)

1. Add next-intl for i18n
2. Translate UI strings (English + Urdu)
3. Allow user language preference
4. Translate report templates

### 10.12 Phase 3.3i — PWA / Offline Mode (Optional, 3-4 days)

1. Add manifest.json
2. Add service worker
3. Cache student list + timetable
4. Offline attendance marking
5. Auto-sync when online

---

## Total Estimated Time

| Phase | Days |
|---|---|
| 3.2a Owner Dashboard | 2-3 |
| 3.2b Principal Dashboard | 1-2 |
| 3.2c Accountant Dashboard | 1-2 |
| 3.3a Teacher Dashboard | 1-2 |
| 3.3b Parent Portal | 2-3 |
| 3.3c Student Dashboard | 1 |
| 3.3d Admission CRM | 1-2 |
| 3.3e Reports + Exports | 1-2 |
| 3.3f Notices + SMS | 2-3 |
| 3.3g Sales Premium Add-ons | 1-2 |
| **Total (Core)** | **13-22 days** |
| Optional: i18n + PWA | 4-6 days |
| **Grand Total** | **17-28 days** |

For full-time solo developer. Part-time would multiply by 1.7x.

---

## Appendix A: Login Credentials (For Testing)

| Role | URL | Email | Password |
|---|---|---|---|
| Super Admin | `/login` | admin@schoolsaas.pk | admin123 |
| School Admin (current) | `/school/login` | admin@beaconhouse.edu.pk | school123 |
| Owner (Phase 3.2a) | `/school/login` | owner@beaconhouse.edu.pk | (TBD) |
| Principal (Phase 3.2b) | `/principal/login` | principal@beaconhouse.edu.pk | (TBD) |
| Accountant (Phase 3.2c) | `/accountant/login` | accountant@beaconhouse.edu.pk | (TBD) |
| Teacher (Phase 3.3a) | `/teacher/login` | sana@beaconhouse.edu.pk | (TBD) |
| Parent (Phase 3.3b) | `/parent/login` | hassan@example.com | (TBD) |
| Admission Officer | `/admission/login` | admission@beaconhouse.edu.pk | (TBD) |

---

## Appendix B: Live URLs

- **Production:** https://school-saas-platform-indol.vercel.app
- **Marketing:** https://school-saas-platform-indol.vercel.app/
- **Super Admin:** https://school-saas-platform-indol.vercel.app/login
- **School Admin:** https://school-saas-platform-indol.vercel.app/school/login

---

## Appendix C: Demo Data Currently in Supabase

- 5 schools (Beaconhouse, City School, Roots, Emerson Test, Vercel Test)
- 4 plans (Starter, Growth, Pro, Enterprise)
- 2 users (Super Admin + School Admin)
- For Beaconhouse: 5 classes, 11 sections, 6 subjects, 5 fee plans, 8 students

---

## Sign-off

This document represents the complete specification for SchoolSaaS Phase 3 implementation. Once approved, implementation will proceed in the order specified in Section 10.

**Prepared by:** Z.ai (Emerson Technology development partner)
**Date:** November 2026
**Version:** 1.0
