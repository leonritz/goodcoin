# 🎯 Farcaster Miniapp Setup Guide

This guide will help you get your Goodcoin app showing up in the Farcaster/Base preview.

## 📋 What You Need

1. ✅ Your Vercel deployment URL (e.g., `goodcoin.vercel.app`)
2. ✅ Farcaster account with FID
3. ✅ Access to Farcaster Developer Portal

---

## 🚀 Step-by-Step Setup

### Step 1: Get Your Vercel URL

1. Go to your Vercel dashboard
2. Find your project deployment
3. Copy the production URL (e.g., `https://goodcoin-abc123.vercel.app`)

### Step 2: Update `minikit.config.ts`

You need to update the account association for YOUR domain.

**Current domain in config**: `goodcoin-henna.vercel.app`  
**Your new domain**: `[YOUR_VERCEL_URL]`

#### Option A: Generate New Account Association (Recommended)

1. Go to: https://miniapps.farcaster.xyz/
2. Click "Create New MiniApp"
3. Enter your Vercel URL
4. Sign with your Farcaster account
5. Copy the generated `accountAssociation` object
6. Replace the one in `minikit.config.ts`

#### Option B: Manual Update (Quick Fix for Testing)

For now, you can update just the `payload` field:

```typescript
// minikit.config.ts
accountAssociation: {
  header: "eyJmaWQiOjEzODE5NTAsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhEMkRjODJFYWQ0Yjg3ZkQ1Y0U5ODM1MmU3OEQ2QzkyQTk0QjA4NzlFIn0",
  // 👇 UPDATE THIS - base64 encode {"domain":"YOUR_DOMAIN"}
  payload: "eyJkb21haW4iOiJ5b3VyLWFjdHVhbC1kb21haW4udmVyY2VsLmFwcCJ9",
  signature: "..." // Will be invalid, but app will still load
}
```

### Step 3: Update App Metadata

In `minikit.config.ts`, update these fields:

```typescript
miniapp: {
  name: "Goodcoin",
  subtitle: "Reward Good Deeds",
  description: "A social platform where users donate Goodcoins to positive actions and content",
  primaryCategory: "social",
  tags: ["social", "charity", "donations", "community"],
  tagline: "Spread positivity, one Goodcoin at a time",
  ogTitle: "Goodcoin - Reward Good Deeds",
  ogDescription: "Donate Goodcoins to positive posts and make the world better",
  // ... rest stays the same
}
```

### Step 4: Test the Manifest

After deploying, visit these URLs to verify:

1. **Manifest**: `https://YOUR_DOMAIN/api/manifest.json`
   - Should return JSON with your app config
   
2. **Webhook**: `https://YOUR_DOMAIN/api/webhook`
   - Should return `{"message": "Goodcoin webhook endpoint is active"}`

### Step 5: Register with Farcaster

1. Go to: https://miniapps.farcaster.xyz/
2. Click "Submit MiniApp"
3. Enter your Vercel URL
4. Submit for review

---

## 🔍 Testing Your MiniApp

### Local Testing
```bash
npm run dev
# Visit: http://localhost:3000/api/manifest.json
```

### Production Testing
```bash
# After deployment, test:
curl https://YOUR_DOMAIN/api/manifest.json
curl https://YOUR_DOMAIN/api/webhook
```

### In Farcaster Client

1. Open Warpcast app
2. Go to: `https://warpcast.com/~/miniapps`
3. Search for "Goodcoin" or paste your URL
4. Your app should appear!

---

## ⚙️ Environment Variables for Vercel

Make sure these are set in Vercel:

```env
NEXT_PUBLIC_URL=https://your-domain.vercel.app
```

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add:
- **Key**: `NEXT_PUBLIC_URL`
- **Value**: Your full Vercel URL (e.g., `https://goodcoin-abc123.vercel.app`)
- **Environments**: Production, Preview, Development

---

## 🐛 Troubleshooting

### App not showing in Farcaster preview?

1. ✅ Check manifest is accessible: `/api/manifest.json`
2. ✅ Verify account association is valid
3. ✅ Wait 5-10 minutes for Farcaster to index
4. ✅ Try clearing Warpcast cache

### "Invalid account association" error?

- You need to generate a NEW account association for your domain
- Use: https://miniapps.farcaster.xyz/ to generate it

### Manifest returns 404?

- Make sure you deployed the new API routes
- Check Vercel build logs
- Verify the routes are in `app/api/manifest.json/route.ts`

---

## 📱 Quick Test Commands

```bash
# Test manifest locally
curl http://localhost:3000/api/manifest.json

# Test manifest in production (replace with your URL)
curl https://your-app.vercel.app/api/manifest.json

# Test webhook
curl https://your-app.vercel.app/api/webhook
```

---

## ✅ Checklist

- [ ] Created `/api/manifest.json` endpoint
- [ ] Created `/api/webhook` endpoint
- [ ] Updated `minikit.config.ts` with new domain
- [ ] Set `NEXT_PUBLIC_URL` in Vercel env vars
- [ ] Deployed to Vercel
- [ ] Tested manifest URL
- [ ] Submitted to Farcaster directory
- [ ] App appears in Warpcast

---

## 🔗 Useful Links

- **Farcaster MiniApps Docs**: https://miniapps.farcaster.xyz/docs
- **Submit Your App**: https://miniapps.farcaster.xyz/
- **Warpcast MiniApps**: https://warpcast.com/~/miniapps
- **Base Build**: https://build.onbase.org/

---

Need help? The endpoints are now ready - just update your domain and deploy! 🚀

