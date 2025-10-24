# 📁 File Upload Setup Guide

Your app now supports uploading images and videos directly from users' devices!

## ✅ What's New

Users can now:
- **Upload from device** - Photos and videos from their phone/computer
- **Paste URLs** - Still works for external image/video URLs
- **Preview before posting** - See images/videos before sharing
- **Auto-detection** - System automatically detects if it's a photo or video

## 🔧 Setup Required (Vercel Blob Storage)

To enable file uploads, you need to set up Vercel Blob Storage (it's free to start!):

### Step 1: Create Blob Store

1. Go to your Vercel Dashboard: https://vercel.com
2. Select your project (`goodcoin`)
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Blob**
6. Choose **Create**

### Step 2: Get Your Token

After creating the blob store, Vercel will show you:
- `BLOB_READ_WRITE_TOKEN`

This token is automatically added to your project's environment variables!

### Step 3: Verify in Vercel

Check that the environment variable exists:
1. Go to **Settings** → **Environment Variables**
2. Look for `BLOB_READ_WRITE_TOKEN`
3. It should say "All" for environments (Production, Preview, Development)

### Step 4: For Local Development (Optional)

If you want to test uploads locally:

1. Get your token from Vercel dashboard
2. Create `.env.local` file in your project root:
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxx
```

3. Add to `.gitignore` (should already be there):
```
.env.local
```

## 📦 Supported File Types

### Images ✅
- JPEG/JPG
- PNG
- GIF
- WebP

### Videos ✅
- MP4
- WebM
- MOV (QuickTime)
- AVI

### Size Limits
- **Maximum file size**: 50MB per file
- **Vercel Blob Free Tier**: 5GB total storage

## 💰 Vercel Blob Pricing

**Free Tier:**
- 5GB storage
- Bandwidth for ~100k uploads/month
- Perfect for getting started!

**Pro Tier** (if you need more):
- $0.15/GB storage per month
- $0.20/GB bandwidth
- Only pay for what you use

## 🧪 Testing Upload

1. Deploy to Vercel (with blob store setup)
2. Go to your live site
3. Click "Create Post"
4. Click "📁 Upload from Device"
5. Select an image or video
6. Should see upload progress bar
7. Preview appears
8. Submit post!

## 🔍 How It Works

```
User selects file
    ↓
File validated (type & size)
    ↓
Uploaded to Vercel Blob (/api/upload)
    ↓
Returns public URL
    ↓
URL saved in post
    ↓
Post displays image/video from Blob
```

## 📝 Files Added/Modified

### New Files:
- `app/api/upload/route.ts` - Upload endpoint
- `UPLOAD_SETUP.md` - This guide

### Modified Files:
- `components/CreatePostForm.tsx` - Added file upload UI
- `package.json` - Added `@vercel/blob` dependency

## 🎨 UI Features

1. **Big upload button** - Easy to tap on mobile
2. **Upload progress bar** - Shows % while uploading
3. **Live preview** - See image/video before posting
4. **Clear button** - Remove and start over
5. **Supports both** - Can upload file OR paste URL

## 🐛 Troubleshooting

### "No blob store configured"
→ Make sure you created Blob Store in Vercel dashboard

### "Missing BLOB_READ_WRITE_TOKEN"
→ Check environment variables in Vercel settings

### Upload fails locally
→ Make sure you have `.env.local` with token

### "File too large"
→ Max 50MB per file. Compress large videos before uploading

### Upload works but image doesn't show
→ Check that the blob store is in the same region as your deployment

## 🚀 Alternative: Use Cloudinary (Optional)

If you prefer Cloudinary instead of Vercel Blob:

1. Sign up at https://cloudinary.com (free tier available)
2. Get your cloud name, API key, and secret
3. Replace `/api/upload/route.ts` with Cloudinary upload logic
4. Benefits: Better image optimization, transformations, CDN

## 📊 Monitoring Uploads

Track your usage in Vercel:
1. Go to **Storage** tab
2. Click on your Blob store
3. See:
   - Total storage used
   - Number of files
   - Bandwidth usage

## 🔐 Security Notes

✅ **File validation** - Only images/videos allowed
✅ **Size limits** - Max 50MB prevents abuse
✅ **Public URLs** - Files are publicly accessible (for social sharing)
✅ **Random suffixes** - Prevents filename collisions

⚠️ **Consider adding**:
- User upload rate limiting
- Content moderation for inappropriate images
- Virus scanning for uploaded files (Vercel doesn't do this automatically)

## 📱 Mobile Friendly

The upload button works great on mobile:
- Opens native camera on phones
- Can select from photo library
- Shows upload progress
- Optimized for touch

## 🎉 You're Ready!

Once you set up Vercel Blob:
1. Users can upload photos/videos ✅
2. Files stored reliably ✅
3. Fast loading (CDN) ✅
4. Automatic scaling ✅

Deploy and start sharing! 🚀

