# Professional Email Configuration Guide

## Problem
Currently, confirmation emails contain `localhost:3000` links that don't work in production. Users can't verify their email addresses.

## Solution Options

### **Option 1: Deep Links (Mobile App) - RECOMMENDED**
Best for native mobile apps. Users click email link → opens your app directly.

### **Option 2: Web Redirect + Deep Link**
Best for cross-platform. Email → web page → redirects to app or web version.

### **Option 3: Disable Email Confirmation** (Development Only)
Quick fix for testing, NOT recommended for production.

---

## 🎯 Option 1: Deep Links Setup (RECOMMENDED)

### Step 1: Configure App Scheme

Add to `app.json`:
```json
{
  "expo": {
    "scheme": "icd10assistant",
    "ios": {
      "bundleIdentifier": "com.yourcompany.icd10assistant",
      "supportsTablet": true
    },
    "android": {
      "package": "com.yourcompany.icd10assistant"
    }
  }
}
```

### Step 2: Configure Supabase Email Templates

1. Go to Supabase Dashboard → Authentication → Email Templates
2. For **Confirm Signup** template, replace with:

```html
<h2>Confirm your signup</h2>

<p>Hello {{ .Name }},</p>

<p>Welcome to ICD-10 Mobile Assistant! Please confirm your email address to complete your registration.</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
    Confirm your email
  </a>
</p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email</p>

<p>This link expires in 24 hours.</p>

<p>If you didn't create an account, you can safely ignore this email.</p>

<p>Best regards,<br>ICD-10 Assistant Team</p>
```

3. Set **Site URL** to your deep link scheme: `icd10assistant://`

### Step 3: Handle Deep Links in App

Create `src/navigation/LinkingConfiguration.ts`:
```typescript
import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.createURL('/'), 'icd10assistant://'],
  config: {
    screens: {
      Auth: {
        screens: {
          ConfirmEmail: 'auth/confirm',
        },
      },
      Main: {
        screens: {
          Home: 'home',
        },
      },
    },
  },
};
```

### Step 4: Create Email Confirmation Handler

See `src/screens/ConfirmEmailScreen.tsx` (created below)

---

## 🌐 Option 2: Web Redirect + Deep Link

### Step 1: Deploy Simple Redirect Page

Use Vercel/Netlify to deploy a redirect page at your domain.

Create `public/auth/confirm.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Email Confirmation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      max-width: 400px;
      text-align: center;
    }
    h1 { color: #333; margin-bottom: 1rem; }
    p { color: #666; line-height: 1.6; }
    .loading { margin: 1rem 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>✅ Email Confirmed!</h1>
    <p class="loading">Redirecting to app...</p>
    <p>If app doesn't open automatically:</p>
    <p><a href="icd10assistant://auth/confirmed" style="color: #667eea;">Click here to open app</a></p>
  </div>
  <script>
    // Extract token from URL
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');
    const type = params.get('type');
    
    // Attempt to open app with deep link
    if (tokenHash) {
      window.location.href = `icd10assistant://auth/confirm?token_hash=${tokenHash}&type=${type}`;
    }
    
    // Fallback after 3 seconds
    setTimeout(() => {
      document.querySelector('.loading').textContent = 'Opening app...';
    }, 3000);
  </script>
</body>
</html>
```

### Step 2: Configure Supabase

1. Deploy redirect page to your domain (e.g., `https://yourdomain.com`)
2. In Supabase → Authentication → URL Configuration:
   - **Site URL**: `https://yourdomain.com`
   - **Redirect URLs**: Add `icd10assistant://*`

---

## ⚡ Option 3: Disable Email Confirmation (Development Only)

### Quick Fix for Testing

1. Go to Supabase Dashboard → Authentication → Settings
2. Scroll to **Email Auth**
3. **Disable** "Enable email confirmations"

⚠️ **WARNING**: Users won't need to verify emails. Only use for development/testing!

---

## 🎨 Custom Email Templates

### Professional Branding

Customize in Supabase Dashboard → Authentication → Email Templates:

**Confirm Signup:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">ICD-10 Assistant</h1>
  </div>
  
  <div style="padding: 30px; background: #f9fafb;">
    <h2 style="color: #1f2937;">Welcome, Dr. {{ .Name }}!</h2>
    
    <p style="color: #4b5563; line-height: 1.6;">
      Thank you for joining ICD-10 Mobile Assistant. Please confirm your email to access:
    </p>
    
    <ul style="color: #4b5563; line-height: 2;">
      <li>🔍 ICD-10 Code Search</li>
      <li>🤖 AI Clinical Assistant</li>
      <li>📊 Patient Management</li>
      <li>📸 Medical Image Analysis</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email" 
         style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
        Confirm Email Address
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Or copy this link: <br>
      <code style="background: #e5e7eb; padding: 8px; display: block; margin-top: 8px; word-break: break-all;">
        {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
      </code>
    </p>
    
    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
      This link expires in 24 hours. If you didn't create this account, please ignore this email.
    </p>
  </div>
  
  <div style="background: #1f2937; padding: 20px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
      © 2025 ICD-10 Mobile Assistant. All rights reserved.
    </p>
  </div>
</div>
```

**Magic Link:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 30px;">
  <h2 style="color: #1f2937;">Your Login Link</h2>
  
  <p style="color: #4b5563;">Click the button below to sign in to ICD-10 Assistant:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink" 
       style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
      Sign In Securely
    </a>
  </div>
  
  <p style="color: #6b7280; font-size: 14px;">
    This link expires in 1 hour and can only be used once.
  </p>
</div>
```

**Password Reset:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 30px;">
  <h2 style="color: #1f2937;">Reset Your Password</h2>
  
  <p style="color: #4b5563;">We received a request to reset your password. Click below to create a new password:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery" 
       style="background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
      Reset Password
    </a>
  </div>
  
  <p style="color: #dc2626; font-size: 14px; background: #fee2e2; padding: 12px; border-radius: 6px;">
    ⚠️ If you didn't request this, please ignore this email and ensure your account is secure.
  </p>
</div>
```

---

## 🚀 Quick Start (Recommended Path)

### For Development/Testing:
1. **Disable email confirmation** (Option 3) - 2 minutes
2. Test your app functionality
3. Implement proper deep links before production

### For Production:
1. **Set up deep links** (Option 1) - 15 minutes
2. **Configure email templates** with your branding
3. **Test email flow** end-to-end
4. Deploy and monitor

---

## 📱 Testing Email Flow

1. **Sign up with test email**
2. **Check inbox** (check spam folder)
3. **Click confirmation link**
4. **Verify app opens** or shows success page
5. **Confirm user is authenticated** in app

---

## 🆘 Troubleshooting

### Email not received?
- Check Supabase logs: Dashboard → Authentication → Logs
- Verify email rate limits not exceeded
- Check spam folder
- Confirm email provider allows Supabase emails

### Link doesn't work?
- Verify Site URL matches your deployment
- Check redirect URLs include your app scheme
- Ensure deep link configuration in app.json
- Test deep link with: `npx uri-scheme open icd10assistant:// --ios`

### App doesn't open?
- Verify app scheme registered: `npx uri-scheme list`
- Test on physical device (deep links don't work well in simulators)
- Check Linking configuration in navigation

---

## 📚 Additional Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Expo Deep Linking](https://docs.expo.dev/guides/linking/)
- [React Navigation Linking](https://reactnavigation.org/docs/deep-linking/)

---

**Next Steps:** Choose your option and follow the implementation guide below! ⬇️
