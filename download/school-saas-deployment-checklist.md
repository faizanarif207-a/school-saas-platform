# School SaaS Deployment — Required Services Checklist

## Already jo aap ke paas hai (pichli chat se)
- ✅ **GitHub account** — code ka version control
- ✅ **Vercel account** — current project `school-saas-platform` deployed hai
- ✅ **Vercel deployment URL** — `school-saas-platform-faizanarif207-9717.vercel.app`

## Abhi zaroori cheezein (deployment ke liye)

### 1. Database — Supabase (HIGHLY recommended, free tier)
**Kyun chahiye:** PostgreSQL database + Auth + Storage, sab ek jagah. Free tier mein 500MB DB + 50,000 monthly auth users — starter ke liye kaafi.
**Kaise banayein:**
1. Jao https://supabase.com
2. "Start your project" → GitHub se sign in
3. New project banao (name: `school-saas`)
4. Database password set karo (save kar lo kahin)
5. Region select karo (Singapore — Pakistan ke liye fastest)
6. 2-3 minute wait — project ready
**Mujhe kya dena hoga:**
- Project URL (jaise `https://xyzcompany.supabase.co`)
- Anon public key (`eyJ...` format mein)
- Service role key (sirf backend ke liye, secret rakhna)
- Database URL (`postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`)

### 2. Domain (optional abhi, baad mein)
**Kyun chahiye:** `platform.yourschoolsaas.pk` jaisa custom domain, schools ko dikhane ke liye professional.
**Abhi ke liye:** Vercel ka free `.vercel.app` subdomain kaafi hai (already deployed hai).
**Baad mein:** Namecheap / GoDaddy se `.pk` ya `.com` khareed kar Vercel mein add karna.

### 3. Email service (Phase 2 mein)
**Kyun chahiye:** User invites, password reset emails.
**Option:** Resend (https://resend.com) — free tier mein 3000 emails/month. Abhi skip kar sakte hain.

### 4. SMS provider (Phase 2 mein)
**Kyun chahiye:** Parents ko attendance/fee SMS.
**Options Pakistan mein:**
- Twilio (international, reliable)
- JazzCash/Easypaisa Business API
- Local SMS gateway (jaisesms.jazz.com.pk)
**Abhi skip** — Phase 2 mein add karenge.

### 5. Payment gateway (Phase 3 mein)
**Kyun chahiye:** Online fee collection (parents se).
**Options:** JazzCash, Easypaisa, 2Checkout, Stripe (agar international).
**Abhi skip** — cashier se cash/bank transfer se shuru karenge.

---

## Aap Ka Working Plan — Step by Step

### Step 1: Supabase account banao (15-20 min)
- Supabase.com pe jao, GitHub se sign in
- New project banao, password set karo
- Mujhe 4 cheezein bhejo:
  ```
  1. Project URL: https://____.supabase.co
  2. Anon Key: eyJ...
  3. Service Role Key: eyJ...
  4. Database URL: postgresql://postgres.[ref]:[password]@...
  ```

### Step 2: Main database schema banaunga
- Prisma schema likhunga (jo hum ne ERD mein plan kiya)
- Tables create karunga: schools, users, students, classes, fees, etc.
- Supabase mein RLS (Row Level Security) policies set karunga taake schools ka data alag rahe

### Step 3: Auth connect karunga
- Supabase Auth setup (email/password login)
- Roles define (Super Admin, School Admin, Teacher, Parent, Student)
- Login page banaunga

### Step 4: Real working features (Phase 1 MVP)
- Super Admin dashboard (schools create/suspend)
- School setup (classes, sections, students)
- Attendance marking
- Fees + receipts (PDF)
- Parent portal (read-only)
- Sab connected to live Supabase database

### Step 5: Vercel pe deploy
- Aap ke existing `school-saas-platform` project ko update karenge
- Environment variables add karenge (Supabase keys)
- Build → Deploy → Live URL
- Aap, aap ki team, pilot schools sab access kar sakenge

---

## Subdomain Setup (jab aap ready hon)

Aap Vercel mein custom subdomain add kar sakte hain bina domain khareede:

### Option A: Free Vercel subdomain (recommended abhi)
- Already deployed: `school-saas-platform-faizanarif207-9717.vercel.app`
- Custom subdomain chahiye to: Vercel project settings → Domains → Add
- Pattern: `[anything].vercel.app` (free, available on free plan)

### Option B: Custom domain (jab serious ho jaye)
- Domain khareedo: Namecheap/Cloudflare se `.com` (~$10/year) ya `.pk` (~PKR 3000/year)
- Vercel mein add karo
- DNS mein CNAME record: `platform` → `cname.vercel-dns.com`
- Phir `platform.yourschoolsaas.pk` live ho jayega

---

## Summary — Kya Karna Hai Abhi

| Step | Kaun karega | Time |
|------|------------|------|
| 1. Supabase account + project | Aap | 15-20 min |
| 2. 4 keys/URL mujhe bhejna | Aap | 5 min |
| 3. Database schema + auth setup | Main | 30-40 min |
| 4. Phase 1 features coding | Main | 2-3 hours |
| 5. Vercel pe deploy | Main + Aap ki Vercel access | 10-15 min |
| 6. Live link testing | Aap + Main | 10-15 min |

**Total time to working demo: ~3-4 hours** (agar aap Supabase account abhi bana lein)

---

## Aap Ka Faisla

**Agar ready ho:**
1. Supabase.com pe jao
2. Project banao
3. 4 cheezein mujhe bhejo (URL, anon key, service key, database URL)

**Main turant:**
- Database schema banaunga
- Auth setup karunga
- Phase 1 working features likhunga
- Vercel pe deploy karunga
- Aap ko live working link dunga jahan aap schools create kar sakenge, students add kar sakenge, fees generate kar sakenge

**Agar koi cheez skip karni ho ya confusion ho**, bata dain — main step-by-step guide karunga.
