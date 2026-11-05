# Custom Domain Setup Guide

## Prerequisites
- You need a domain name (e.g., `emersontechnology.com` or `schoolsaas.pk`)
- You can buy from: Namecheap, GoDaddy, Cloudflare, or any domain registrar

## Step 1: Buy a Domain
- Go to https://www.namecheap.com or https://www.godaddy.com
- Search for your desired domain (e.g., `platform.emersontechnology.com`)
- Purchase it (~$10-15/year for .com, ~PKR 3,000/year for .pk)

## Step 2: Add Domain to Vercel
1. Go to https://vercel.com/dashboard
2. Click on "school-saas-platform" project
3. Go to Settings → Domains
4. Click "Add Domain"
5. Enter your domain (e.g., `platform.emersontechnology.com`)
6. Click "Add"

## Step 3: Configure DNS
Vercel will show you DNS records to add. Two options:

### Option A: Subdomain (e.g., platform.emersontechnology.com)
Add a CNAME record in your domain registrar's DNS panel:
```
Type:  CNAME
Name:  platform
Value: cname.vercel-dns.com
```

### Option B: Root Domain (e.g., emersontechnology.com)
Add an A record:
```
Type:  A
Name:  @
Value: 76.76.21.21
```
And a CNAME for www:
```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
```

## Step 4: Wait for DNS Propagation
- DNS changes take 5-30 minutes to propagate
- Vercel will automatically detect when DNS is configured
- You'll see a green checkmark next to your domain

## Step 5: SSL Certificate
- Vercel automatically provisions a free SSL certificate
- Your site will be accessible via HTTPS
- No manual SSL setup needed

## Step 6: Update Environment Variable
After domain is live, update `AUTH_URL` in Vercel:
1. Go to Settings → Environment Variables
2. Find `AUTH_URL`
3. Update to: `https://platform.emersontechnology.com`
4. Redeploy

## Cost
- Domain: ~$10-15/year (.com) or ~PKR 3,000/year (.pk)
- Vercel hosting: FREE (Hobby plan)
- SSL: FREE (Vercel automatic)
- Total: Only domain cost

## Need Help?
If you provide me your domain name, I can:
1. Add it to Vercel for you
2. Give you exact DNS records
3. Update environment variables
4. Redeploy with the new domain
