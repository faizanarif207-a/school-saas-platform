# Phase 8 — Real Integration Setup Guide

## 📧 1. Resend Email (FREE 3,000 emails/month)

### Step 1: Sign Up
1. Go to https://resend.com
2. Click "Sign Up" (free, no credit card)
3. Verify your email

### Step 2: Get API Key
1. Go to Dashboard → API Keys
2. Click "Create API Key"
3. Name: `schoolsaas-prod`
4. Copy the key (starts with `re_`)

### Step 3: Add to Vercel
1. Go to https://vercel.com/dashboard
2. Open "school-saas-platform" project
3. Settings → Environment Variables
4. Add these 2 variables:
```
RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM = SchoolSaaS <noreply@resend.dev>
```
5. Click "Save" for all environments (Production, Preview, Development)

### Step 4: Redeploy
- Vercel → Deployments → "Redeploy" on latest
- OR tell me "Resend key added" and I'll redeploy

### What Happens After:
- Staff invitations → real email sent with login credentials
- School creation → welcome email to owner
- All emails branded with Emerson 3-bar logo

### Cost: FREE (3,000 emails/month)

---

## 📲 2. Twilio SMS (FREE $15 trial credit ≈ 500 SMS)

### Step 1: Sign Up
1. Go to https://www.twilio.com
2. Click "Sign up" (free trial)
3. Verify your email + phone number

### Step 2: Get a Phone Number
1. Go to Console → Phone Numbers → Get a Trial Number
2. Copy the number (starts with +1)

### Step 3: Get Credentials
1. Go to Console Dashboard
2. Copy:
   - Account SID (starts with `AC`)
   - Auth Token (long string)
   - From Phone (your Twilio number)

### Step 4: Add to Vercel
Add these 3 variables in Vercel → Settings → Environment Variables:
```
TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_PHONE = +1234567890
```

### Step 5: Redeploy
- Tell me "Twilio keys added" → I'll redeploy

### What Happens After:
- Attendance absent → SMS to parent automatically
- Fee reminder → SMS on due date
- Notice posted → SMS to parents (if enabled in settings)

### Cost: ~$0.03 per SMS (PKR 8), $15 free trial

### ⚠️ Trial Limitation:
Twilio trial only sends to "verified" numbers. To send to ANY number:
1. Go to Console → Phone Numbers → Verified Caller IDs
2. Add parent phone numbers (verify via OTP)
3. OR upgrade to paid account ($1/month + per SMS)

---

## 💳 3. JazzCash Payment Gateway

### Step 1: Apply for Merchant Account
1. Go to https://www.jazzcash.com.pk/business
2. Click "Sign Up" or "Get Started"
3. Fill merchant application form:
   - Business name: Emerson Technology (or your school name)
   - Business type: Education/Software
   - Bank account details
4. Submit documents:
   - CNIC copy
   - Business registration
   - Bank statement

### Step 2: Wait for Approval (1-2 business days)

### Step 3: Get Credentials
After approval, JazzCash will provide:
- Merchant ID
- Password
- Integrity Salt (hash key)

### Step 4: Add to Vercel
```
JAZZCASH_MERCHANT_ID = MCxxxxxxxx
JAZZCASH_PASSWORD = xxxxxxxxxxxx
JAZZCASH_INTEGRITY_SALT = xxxxxxxxxxxxxxxxxx
JAZZCASH_RETURN_URL = https://school-saas-platform-indol.vercel.app/api/payment/jazzcash/callback
```

### Cost: 1.5-2.5% per transaction (no monthly fee)

---

## 📱 4. Easypaisa Payment Gateway

### Same process as JazzCash:
1. Go to https://www.easypaisa.com.pk/business
2. Apply for merchant account
3. Get: Store ID + Hash Key
4. Add to Vercel:
```
EASYPAISA_STORE_ID = xxxxxxxxx
EASYPAISA_HASH_KEY = xxxxxxxxxxxxxxxxxx
EASYPAISA_RETURN_URL = https://school-saas-platform-indol.vercel.app/api/payment/easypaisa/callback
```

### Cost: 1.5-2.5% per transaction

---

## 🌐 5. Custom Domain Setup

### Step 1: Buy a Domain
- Go to https://www.namecheap.com or https://www.cloudflare.com
- Search: `emersontechnology.com` or `schoolsaas.pk`
- Purchase (~$10-15/year for .com)

### Step 2: Add to Vercel
1. Vercel → school-saas-platform → Settings → Domains
2. Add your domain
3. Vercel shows DNS instructions

### Step 3: Set DNS (at your domain registrar)
Add CNAME record:
```
Type:  CNAME
Name:  app (or platform, or @)
Value: cname.vercel-dns.com
```

### Step 4: Update AUTH_URL
In Vercel → Environment Variables:
```
AUTH_URL = https://app.yourdomain.com
```

### Step 5: Redeploy
- SSL is automatic (free)
- Your app is now live on your domain

---

## 📋 Summary Checklist

| Integration | Where | Cost | Time | Status |
|---|---|---|---|---|
| Email (Resend) | resend.com | FREE | 5 min | Code ready ✅ |
| SMS (Twilio) | twilio.com | ~PKR 8/SMS | 10 min | Code ready ✅ |
| JazzCash | jazzcash.com.pk/business | 1.5-2.5%/txn | 1-2 days | Demo ready ✅ |
| Easypaisa | easypaisa.com.pk/business | 1.5-2.5%/txn | 1-2 days | Demo ready ✅ |
| Domain | namecheap.com | ~$10/year | 30 min | Guide ready ✅ |

## Next Step
1. Sign up for accounts above
2. Share API keys with me
3. I'll add them to Vercel and redeploy
4. Everything goes live — real emails, real SMS, real payments!
