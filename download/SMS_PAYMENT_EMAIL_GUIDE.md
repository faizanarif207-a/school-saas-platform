# SMS + Payment + Email Integration Guide

## 1. SMS Integration (Twilio)

### Step 1: Create Twilio Account
1. Go to https://www.twilio.com
2. Sign up (free trial gives $15 credit)
3. Get a phone number

### Step 2: Get Credentials
- Account SID: found on dashboard
- Auth Token: found on dashboard
- From Phone: your Twilio number

### Step 3: Add Environment Variables
In Vercel → Settings → Environment Variables:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_PHONE=+1234567890
```

### Step 4: Install Twilio
```bash
npm install twilio
```

### Step 5: Update src/lib/sms.ts
Uncomment the Twilio code in sendSms() function and it will start sending real SMS.

### Cost
- Free trial: $15 credit (~500 SMS to Pakistan)
- Per SMS to Pakistan: ~$0.03 (PKR 8)
- Pass-through to schools: cost + 10-15% margin

---

## 2. Payment Gateway Integration

### Option A: JazzCash
1. Go to https://www.jazzcash.com.pk/business
2. Apply for merchant account
3. Get: Merchant ID, Password, Integrity Salt
4. Add to Vercel environment:
```
JAZZCASH_MERCHANT_ID=MCxxxxxxxx
JAZZCASH_PASSWORD=xxxxxxxx
JAZZCASH_INTEGRITY_SALT=xxxxxxxx
JAZZCASH_RETURN_URL=https://yourdomain.com/api/payment/jazzcash/callback
```

### Option B: Easypaisa
1. Go to https://www.easypaisa.com.pk/business
2. Apply for merchant account
3. Get: Store ID, Hash Key
4. Add to Vercel environment:
```
EASYPAISA_STORE_ID=xxxxxxx
EASYPAISA_HASH_KEY=xxxxxxxx
EASYPAISA_RETURN_URL=https://yourdomain.com/api/payment/easypaisa/callback
```

### Implementation
The payment page (`/parent/payment`) is ready. When you have credentials:
1. Create callback API: `/api/payment/jazzcash/callback`
2. Redirect to JazzCash payment page
3. Handle callback → update invoice → generate receipt

### Cost
- JazzCash: 1.5-2.5% per transaction
- Easypaisa: 1.5-2.5% per transaction
- No monthly fee

---

## 3. Email Service (Resend)

### Step 1: Create Resend Account
1. Go to https://www.resend.com
2. Sign up (free: 3,000 emails/month)
3. Verify your domain (or use onboarding email)

### Step 2: Get API Key
- API Key: found on dashboard

### Step 3: Add Environment Variable
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=SchoolSaaS <noreply@emersontechnology.com>
```

### Step 4: Install Resend
```bash
npm install resend
```

### Step 5: Create Email Helper
Create `src/lib/email.ts`:
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@schoolsaas.app',
    to,
    subject,
    html,
  });
}
```

### Use Cases
- Staff invitation emails (when owner invites staff)
- School welcome email (when super admin creates school)
- Password reset emails
- Fee reminder emails

### Cost
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Sufficient for most schools

---

## Summary: What You Need to Do

| Integration | Where to Sign Up | Cost | Time |
|---|---|---|---|
| SMS (Twilio) | twilio.com | ~PKR 8/SMS | 30 min |
| JazzCash | jazzcash.com.pk/business | 1.5-2.5% per txn | 1-2 days (approval) |
| Easypaisa | easypaisa.com.pk/business | 1.5-2.5% per txn | 1-2 days (approval) |
| Email (Resend) | resend.com | Free (3K/month) | 15 min |
| Custom Domain | namecheap.com | ~$10-15/year | 30 min |

## Next Steps
1. Sign up for accounts above
2. Share credentials with me (via secure channel)
3. I'll integrate them into the codebase
4. Deploy with real integrations
