# Production Environment Variables — Vercel Setup Checklist

> Yeh file batati hai ke Vercel project settings mein kaun se env vars set karne hain, production ko live karne se pehle.

---

## 1. DATABASE (zaroori — nahi to app crash)

| Variable | Value | Kahan se milega |
|----------|-------|-----------------|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | Supabase → Project Settings → Database → Connection string (pooled) |
| `DIRECT_URL` | `postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` | Supabase → Project Settings → Database → Connection string (direct) |

**Note:** Pooled URL (port 6543) `DATABASE_URL` ke liye — serverless functions ke liye optimized. Direct URL (port 5432) `DIRECT_URL` ke liye — Prisma migrations ke liye.

---

## 2. AUTH (zaroori)

| Variable | Value | Notes |
|----------|-------|-------|
| `JWT_SECRET` | Random 32+ char string | `openssl rand -base64 32` se generate karo |
| `AUTH_URL` | `https://school-saas-platform-indol.vercel.app` | Aap ki production Vercel URL (jahan login emails ke links point karenge) |

---

## 3. EMAIL (zaroori — agar real email bhejni hai)

| Variable | Value | Notes |
|----------|-------|-------|
| `GMAIL_EMAIL` | `youremail@gmail.com` | Jo Gmail se emails bhejna |
| `GMAIL_APP_PASSWORD` | `abcd efgh ijkl mnop` (16 chars) | Google Account → Security → 2-Step Verification → App passwords → generate a new one for "Mail" |

**Note:** Without these vars, emails sirf console mein log hote hain — real users ko nahi bhejti.

---

## 4. SMS (Phase 3 — skip for now if not ready)

| Variable | Value | Notes |
|----------|-------|-------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxx` | Twilio console se |
| `TWILIO_AUTH_TOKEN` | `xxxxxxx` | Twilio console se |
| `TWILIO_PHONE_NUMBER` | `+1XXXXXXXXXX` | Twilio purchased number |

**Note:** Skip karo agar abhi SMS send nahi karna — features gracefully degrade.

---

## 5. STORAGE (zaroori agar student photos / documents upload karne hain)

| Variable | Value | Notes |
|----------|-------|-------|
| `SUPABASE_URL` | `https://[ref].supabase.co` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase → Project Settings → API → service_role key (SECRET — kabhi share mat karna) |
| `SUPABASE_BUCKET` | `school-uploads` | Default — bucket auto-create ho jata hai first upload pe |

**Note:** Without these vars, uploads base64 data URL mein save hote hain (Vercel serverless pe memory limit 4MB — large files fail ho sakti hain).

---

## 6. CRON (zaroori agar defaulters escalation automatic chalana hai)

| Variable | Value | Notes |
|----------|-------|-------|
| `CRON_SECRET` | Random 32-char string | Vercel is value ko automatically `Authorization: Bearer` header mein bhejta hai cron trigger pe |

**Note:** Vercel free plan mein cron jobs daily 1 time allowed. Hum ne 6 AM UTC daily schedule kiya hai (vercel.json mein).

---

## 7. OPTIONAL (Phase 2/3)

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` | Agar client-side Supabase calls chahiye (mostly not needed) |
| `SENTRY_DSN` | `https://...@sentry.io/...` | Error tracking (recommended for production) |

---

## Quick Setup Order

1. ✅ **Supabase project banao** → DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY milte hain
2. ✅ **JWT_SECRET generate karo** → terminal mein `openssl rand -base64 32`
3. ✅ **Gmail App Password banao** → GMAIL_EMAIL, GMAIL_APP_PASSWORD
4. ✅ **CRON_SECRET generate karo** → terminal mein `openssl rand -hex 32`
5. ✅ **Vercel pe jao** → Project Settings → Environment Variables → sab add karo (Production, Preview, Development sab mein)
6. ✅ **Redeploy karo** → Settings save karne ke baad Vercel auto-redeploy karta hai, ya manually trigger karo
7. ✅ **Test karo** → Live URL pe login, access request, upload sab try karo

---

## Verify Karne Ka Tareeqa

Deploy ke baad, in endpoints ko check karo:

- `https://[your-url]/api/upload` (GET) → `{provider: "supabase", configured: true}` aana chahiye agar Supabase storage set hai
- `https://[your-url]/api/school/cron/escalate-defaulters` (GET without secret) → 401 aana chahiye agar CRON_SECRET set hai
- Login → demo accounts se → email received kar sakte ho agar Gmail set hai

---

## Local Dev (.env file)

Local dev ke liye yeh `.env` file banao project root mein:

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="local-dev-secret-change-in-prod"
AUTH_URL="http://localhost:3000"
GMAIL_EMAIL="youremail@gmail.com"
GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"
SUPABASE_URL="https://[ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
SUPABASE_BUCKET="school-uploads"
CRON_SECRET="local-cron-secret"
```

**Note:** `.env` file ko `.gitignore` mein already included hai — kabhi commit mat karna.
