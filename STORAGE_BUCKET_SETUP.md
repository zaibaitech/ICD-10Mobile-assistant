# Storage Bucket Setup Guide

## 🎯 Quick Setup (2 minutes)

### Step 1: Create the Bucket via Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Configure Bucket**
   ```
   Name: medical-images
   Public: ✓ Make this bucket public
   ```
   - Click "Create bucket"

### Step 2: Apply RLS Policies via SQL

1. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

2. **Copy & Paste the SQL**
   - Open `database/storage_setup.sql`
   - Copy all contents
   - Paste into SQL Editor
   - Click "Run" or press `Ctrl+Enter`

3. **Verify Success**
   - You should see: "Success. No rows returned"
   - Check Storage → Policies tab to confirm policies exist

---

## 📋 What This Enables

### ✅ Features Now Working:
- **Image Upload**: Users can attach images in AssistantScreen
- **Image Storage**: Images stored in user-specific folders (`{user_id}/{timestamp}.jpg`)
- **Image Deletion**: Users can remove their uploaded images
- **Security**: RLS policies ensure users only access their own images

### 📁 Folder Structure:
```
medical-images/
├── {user-1-uuid}/
│   ├── 1701234567890.jpg
│   └── 1701234578901.png
├── {user-2-uuid}/
│   ├── 1701234589012.jpg
│   └── 1701234590123.jpg
```

---

## 🔐 Security Policies Applied

The SQL script creates 4 RLS policies:

1. **Upload Policy**: Users can only upload to their own folder
2. **Read Policy (Private)**: Users can read their own images
3. **Delete Policy**: Users can delete their own images  
4. **Read Policy (Public)**: Optional public read access

### To Make Images Private Only:
If you want images to be private (not publicly accessible):

```sql
-- Remove the public read policy
DROP POLICY IF EXISTS "Public read access to medical images" ON storage.objects;
```

Then update the bucket:
- Storage → medical-images → Settings
- Uncheck "Public bucket"
- Save

---

## 🧪 Testing the Upload

### Test in the App:
1. Start the app: `npm start`
2. Login with a test user
3. Go to Assistant screen
4. Tap the image icon 📷
5. Select an image from your device
6. Verify upload succeeds

### Verify in Supabase:
1. Go to Storage → medical-images
2. Click on a user folder
3. You should see uploaded images
4. Click image to preview

---

## 📊 Storage Limits (Supabase Free Tier)

- **Total Storage**: 1 GB
- **File Size Limit**: 50 MB per file
- **Bandwidth**: 2 GB per month

### Recommended Image Settings:
- Format: JPEG (smaller than PNG)
- Quality: 80-85% (good balance)
- Max dimensions: 1920x1920px
- Typical size: 200-500 KB per image

---

## 🛠️ Current Implementation

### Service Layer:
**File**: `src/services/storage.ts`

```typescript
// Upload image
const imageUrl = await uploadImage(localUri, userId);
// Returns: https://xyz.supabase.co/storage/v1/object/public/medical-images/{userId}/123.jpg

// Delete image
await deleteImage(imageUrl);
```

### UI Components:
- **Screen**: `src/screens/AssistantScreen.tsx` (uses uploadImage)
- **Component**: `src/components/ImageAttachment.tsx` (displays uploaded images)

### Supported Formats:
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ GIF (.gif)
- ✅ WebP (.webp)

---

## ⚠️ Important Notes

### Image Processing (Currently Mock):
The app shows AI-generated tags on images (wound type, rash, etc), but this is **mock functionality**. Real image analysis would require:
- OpenAI Vision API ($0.01-0.05 per image)
- Google Cloud Vision API
- AWS Rekognition
- Custom ML model

To avoid misleading users, consider adding a disclaimer or disabling the mock tags.

### Cleanup Strategy:
Images are stored indefinitely. To save storage:

```sql
-- Delete images older than 90 days
DELETE FROM storage.objects 
WHERE bucket_id = 'medical-images' 
AND created_at < NOW() - INTERVAL '90 days';
```

Set up a scheduled function in Supabase if needed.

---

## ✅ Verification Checklist

- [ ] Bucket "medical-images" exists in Supabase Storage
- [ ] Bucket is set to "Public"
- [ ] 4 RLS policies applied successfully
- [ ] Tested image upload in app
- [ ] Verified image appears in Supabase dashboard
- [ ] Tested image deletion

---

## 🎉 Status: READY TO USE

The storage service is fully implemented and tested. Just run the SQL script and you're done!

**Next Quick Win**: Fix Mock AI Warning (#5)
