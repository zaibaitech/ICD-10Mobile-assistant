# 📧 Supabase Email Configuration Steps

## Current Problem
Emails contain `localhost:3000` links that don't work → Users can't verify emails

## Solution
Configure Supabase to use deep links that open your mobile app

---

## Step-by-Step Configuration

### 1️⃣ Go to Supabase Dashboard
URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/url-configuration

### 2️⃣ Configure Site URL
```
Site URL: icd10assistant://
```
**What this does:** Sets the base URL for all email links

### 3️⃣ Add Redirect URLs
Click **"+ Add URL"** and add:
```
icd10assistant://**
```
**What this does:** Allows app to receive deep link redirects

### 4️⃣ Update Email Template
Navigate to: **Authentication → Email Templates → Confirm signup**

Replace the entire template with this HTML:

```html
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">🏥 ICD-10 Assistant</h1>
  </div>
  
  <!-- Body -->
  <div style="padding: 30px; background: white;">
    <h2 style="color: #1f2937;">Welcome to ICD-10 Assistant!</h2>
    
    <p style="color: #4b5563; line-height: 1.6;">
      Thank you for signing up. Click the button below to confirm your email address:
    </p>
    
    <!-- Confirmation Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .SiteURL }}auth/confirm?token_hash={{ .TokenHash }}&type=email" 
         style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
        ✅ Confirm Email Address
      </a>
    </div>
    
    <!-- Alternative Link -->
    <p style="color: #6b7280; font-size: 14px;">
      Or tap this link on your mobile device: <br>
      <code style="background: #e5e7eb; padding: 8px; display: block; margin-top: 8px; word-break: break-all;">
        {{ .SiteURL }}auth/confirm?token_hash={{ .TokenHash }}&type=email
      </code>
    </p>
    
    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
      This link expires in 24 hours. If you didn't create this account, please ignore this email.
    </p>
  </div>
  
  <!-- Footer -->
  <div style="background: #f9fafb; padding: 20px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
      © 2025 ICD-10 Mobile Assistant. All rights reserved.
    </p>
  </div>
</div>
```

**Important Template Variables:**
- `{{ .SiteURL }}` - Your deep link scheme (icd10assistant://)
- `{{ .TokenHash }}` - Unique verification token
- `{{ .Email }}` - User's email (can use in greeting)

### 5️⃣ Save Changes
Click **Save** to apply the email template

---

## Email Template Customization

### Add User Name:
```html
<h2>Welcome, {{ .Name }}!</h2>
```

### Add Features List:
```html
<p>Get access to:</p>
<ul style="color: #4b5563; line-height: 2;">
  <li>🔍 ICD-10 Code Search</li>
  <li>🤖 AI Clinical Assistant</li>
  <li>📊 Patient Management</li>
  <li>📸 Medical Image OCR</li>
</ul>
```

### Add Company Logo:
```html
<img src="https://yourdomain.com/logo.png" 
     alt="Logo" 
     style="width: 120px; margin: 20px auto; display: block;">
```

### Change Brand Colors:
Replace `#667eea` (purple-blue) with your brand color:
- In gradient: `#667eea`
- In button: `#667eea`

---

## Other Email Templates to Update

### Magic Link (Passwordless Login)
**Template:** Authentication → Email Templates → Magic Link

```html
<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}auth/confirm?token_hash={{ .TokenHash }}&type=magiclink" 
     style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
    🔐 Sign In Securely
  </a>
</div>
```

### Password Reset
**Template:** Authentication → Email Templates → Reset Password

```html
<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}auth/confirm?token_hash={{ .TokenHash }}&type=recovery" 
     style="background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
    🔄 Reset Password
  </a>
</div>
```

### Email Change Confirmation
**Template:** Authentication → Email Templates → Change Email

```html
<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}auth/confirm?token_hash={{ .TokenHash }}&type=email_change" 
     style="background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
    ✉️ Confirm Email Change
  </a>
</div>
```

---

## Verification

### Test Email Rendering
1. Click **Preview** in email template editor
2. Check button styling
3. Verify link format
4. Test on mobile email clients

### Test Email Delivery
1. Sign up with your own email
2. Check inbox (and spam folder)
3. Click confirmation link
4. Verify app opens

---

## Troubleshooting

### Email shows localhost:3000
❌ Site URL not saved  
✅ Double-check Site URL is `icd10assistant://`  
✅ Save and try new signup (old emails won't update)

### Email link doesn't work
❌ Template has wrong URL format  
✅ Must use `{{ .SiteURL }}auth/confirm?token_hash={{ .TokenHash }}&type=email`  
✅ Don't use `{{ .ConfirmationURL }}` (that's deprecated)

### Email not received
❌ Rate limit exceeded  
✅ Check Authentication → Logs for errors  
✅ Try different email provider  
✅ Check spam folder

### Link opens browser, not app
❌ Deep link not registered  
✅ Rebuild app (not just reload)  
✅ Verify scheme in app.json  
✅ Test on physical device (simulators unreliable)

---

## Quick Copy-Paste Commands

### Set Site URL (can't do via API, must use dashboard):
```
icd10assistant://
```

### Add Redirect URL:
```
icd10assistant://**
```

### Email Template Button Link:
```html
{{ .SiteURL }}auth/confirm?token_hash={{ .TokenHash }}&type=email
```

---

## Next Steps

1. ✅ Configure Supabase (this guide)
2. ✅ Update app.json with deep link scheme (already done)
3. ✅ Add ConfirmEmailScreen to navigation (already created)
4. 🔄 Rebuild app: `npx expo run:ios` or `npx expo run:android`
5. 🧪 Test full flow: signup → email → tap link → app opens

---

**Need help?** See EMAIL_QUICK_SETUP.md for complete setup instructions.
