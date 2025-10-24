# Database Testing Guide for Goodcoin

## ✅ Implementation Complete

Your app now uses **server-side database storage** instead of localStorage! All users can now see and interact with each other's posts, comments, and donations.

---

## 🏗️ What Changed

### Before (localStorage)
- ❌ Each user had isolated data
- ❌ Users couldn't see each other's posts
- ❌ Data lost on browser cache clear
- ❌ No real social interaction

### After (Vercel KV Database)
- ✅ All users share the same data
- ✅ Posts/comments visible to everyone
- ✅ Donations work across users
- ✅ Data persists on server

---

## 🧪 Testing Locally (Development)

### Option 1: Local Testing WITHOUT Vercel KV (In-Memory Fallback)

The implementation includes a **development fallback** that uses in-memory storage when Vercel KV is not configured.

**Steps:**
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in **multiple browser windows** or **incognito tabs**

3. Test multi-user scenarios:
   - Window 1: Create a post as User A
   - Window 2: See the same post as User B
   - Window 2: Like or donate to User A's post
   - Window 1: See the updated likes/donations

**⚠️ Limitation:** In-memory storage resets when you restart the dev server.

---

### Option 2: Local Testing WITH Vercel KV (Production-like)

To test with real database persistence:

1. **Create a Vercel KV Database:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to Storage → Create Database → KV
   - Name it "goodcoin-dev" or similar

2. **Get Environment Variables:**
   After creating the database, Vercel will show you:
   ```
   KV_REST_API_URL=https://xxx.upstash.io
   KV_REST_API_TOKEN=AXXXxxx...
   ```

3. **Create `.env.local` file** in your project root:
   ```env
   KV_REST_API_URL=your_url_here
   KV_REST_API_TOKEN=your_token_here
   ```

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

5. **Test:** Now your local app uses the real database! Data persists across restarts.

---

## 🚀 Testing on Vercel (Production)

### Step 1: Set Up Vercel KV Database

1. **In Vercel Dashboard:**
   - Go to your project
   - Storage tab → Create Database → KV
   - Name: "goodcoin-production"

2. **Connect to Project:**
   - After creation, click "Connect to Project"
   - Select your goodcoin project
   - Vercel automatically adds environment variables

### Step 2: Deploy

```bash
git add .
git commit -m "Add server-side database with Vercel KV"
git push origin main
```

Vercel will automatically:
- Build your app
- Connect to the KV database
- Deploy with environment variables

### Step 3: Test Production

1. **Visit your deployed app** (e.g., `goodcoin.vercel.app`)

2. **Multi-user test:**
   - Use different devices or browsers
   - Create posts from different accounts
   - Verify everyone sees the same feed
   - Test donations between users
   - Check comments from multiple users

---

## 🔍 How to Verify It's Working

### ✅ Checklist for Multi-User Testing

**Feed Test:**
- [ ] User A creates a post
- [ ] User B sees User A's post immediately (after refresh)
- [ ] Both users see the post count increment

**Likes Test:**
- [ ] User B likes User A's post
- [ ] Like count increases
- [ ] User A sees the updated like count

**Comments Test:**
- [ ] User B comments on User A's post
- [ ] User A sees User B's comment
- [ ] Comment count increments correctly

**Donations Test:**
- [ ] User B donates 10 Goodcoins to User A's post
- [ ] User B's balance: 100 → 90
- [ ] User A's balance: 100 → 110
- [ ] Post shows "+10 donated"
- [ ] Both users see updated balances

**Profile Test:**
- [ ] User A views their profile
- [ ] Sees correct post count
- [ ] Sees correct balance
- [ ] Sees transaction history

---

## 🐛 Troubleshooting

### Issue: "Data not syncing between users"

**Check:**
1. Are you using the same deployment/URL?
2. Is Vercel KV connected? (Check Vercel Dashboard → Storage)
3. Are environment variables set? (Vercel Dashboard → Settings → Environment Variables)

**Fix:**
```bash
# Redeploy to ensure env vars are loaded
vercel --prod
```

---

### Issue: "Build fails on Vercel"

**Possible causes:**
1. Missing environment variables
2. TypeScript errors

**Fix:**
```bash
# Test build locally first
npm run build

# If successful, commit and push
git push origin main
```

---

### Issue: "API routes return 500 errors"

**Check:**
1. Vercel logs: `vercel logs <deployment-url>`
2. Look for database connection errors
3. Verify KV_REST_API_URL and KV_REST_API_TOKEN are set

---

## 📊 Monitoring Data

### View Database Contents (Vercel Dashboard)

1. Go to Vercel Dashboard → Storage → Your KV Database
2. Click "Data Browser"
3. You'll see keys like:
   - `users:12345` → User data
   - `posts:post_xxx` → Post data
   - `posts:all` → Set of all post IDs
   - `comments:comment_xxx` → Comment data
   - `transactions:tx_xxx` → Transaction data

### Example Queries (in KV Data Browser):

```redis
# Get all post IDs
SMEMBERS posts:all

# Get a specific user
GET users:12345

# Get a specific post
GET posts:post_1234567890_abc123

# Get comments for a post
LRANGE comments:post:post_xxx 0 -1
```

---

## 🔄 Migration from localStorage

**Good news:** The old localStorage data is automatically ignored. Users will start fresh with:
- 100 Goodcoins initial balance
- Empty feed (ready for new posts)

If you want to preserve test data, you'll need to manually recreate it through the UI.

---

## 🎯 Testing Scenarios

### Scenario 1: Simple Post & View
1. User A creates post "Just did my first good deed!"
2. User B refreshes → sees the post
3. **Expected:** Both see the same post with same timestamp

### Scenario 2: Social Interactions
1. User A creates post
2. User B likes it → like count: 1
3. User C comments "Amazing!" → comment count: 1
4. User A refreshes → sees like + comment
5. **Expected:** All counters accurate across all users

### Scenario 3: Goodcoin Economy
1. User A (balance: 100) donates 25 to User B's post
2. User A balance → 75
3. User B balance → 125
4. User C views the post → sees "+25 donated"
5. **Expected:** All balances accurate, transaction recorded

### Scenario 4: Profile Accuracy
1. User A creates 3 posts
2. Receives 2 donations (20 + 30)
3. Profile shows:
   - Posts: 3
   - Balance: 150 (100 + 50)
   - Received: 50 coins
4. **Expected:** Profile data matches actual activity

---

## 💡 Pro Tips

1. **Use Incognito Windows** for multi-user testing (different Farcaster accounts)
2. **Check Network Tab** (F12 → Network) to see API calls
3. **Vercel Logs** show real-time database operations
4. **KV Data Browser** lets you manually inspect/edit data

---

## 🔐 Security Note

The current implementation is **MVP-ready** but not production-hardened:
- ✅ Data validated on server
- ✅ Users can't donate to themselves
- ✅ Balance checked before donation
- ⚠️ No rate limiting yet
- ⚠️ No abuse prevention yet

For production, consider adding:
- Rate limiting (Vercel has built-in options)
- User reputation system
- Content moderation

---

## ✨ Next Steps

1. **Test locally** with the in-memory fallback
2. **Set up Vercel KV** when ready for persistence
3. **Deploy to Vercel** for production testing
4. **Test with real users** on Farcaster

Your database is ready! 🎉

