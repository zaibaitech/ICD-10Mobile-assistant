#!/bin/bash

# Email Configuration Setup Script
# Helps configure professional email confirmations for ICD-10 Assistant

echo "======================================"
echo "📧 Email Setup for ICD-10 Assistant"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Extract Supabase URL
SUPABASE_URL=$(grep EXPO_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2)
PROJECT_ID=$(echo $SUPABASE_URL | grep -oP '(?<=https://)[^.]+')

echo -e "${BLUE}📋 Your Supabase Project:${NC}"
echo "URL: $SUPABASE_URL"
echo "Project ID: $PROJECT_ID"
echo ""

echo "======================================"
echo "Choose Setup Option:"
echo "======================================"
echo ""
echo "1. Quick Fix (Development) - Disable email confirmation"
echo "2. Production Setup - Configure deep links"
echo "3. View email template HTML"
echo "4. Test deep link configuration"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}⚡ Quick Fix - Development Mode${NC}"
        echo ""
        echo "To disable email confirmation (DEVELOPMENT ONLY):"
        echo ""
        echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_ID/auth/url-configuration"
        echo "2. Scroll to 'Email Auth'"
        echo "3. UNCHECK 'Enable email confirmations'"
        echo "4. Click 'Save'"
        echo ""
        echo -e "${RED}⚠️  WARNING: Users won't need to verify emails!${NC}"
        echo -e "${RED}   Only use for development/testing${NC}"
        ;;
        
    2)
        echo ""
        echo -e "${GREEN}🎯 Production Setup${NC}"
        echo ""
        echo "Step 1: Configure Supabase URLs"
        echo "==============================="
        echo ""
        echo "Go to: https://supabase.com/dashboard/project/$PROJECT_ID/auth/url-configuration"
        echo ""
        echo "Set these values:"
        echo "  Site URL: icd10assistant://"
        echo "  Redirect URLs (add): icd10assistant://**"
        echo ""
        read -p "Press Enter when done..."
        
        echo ""
        echo "Step 2: Update Email Template"
        echo "==============================="
        echo ""
        echo "Go to: https://supabase.com/dashboard/project/$PROJECT_ID/auth/templates"
        echo ""
        echo "Click 'Confirm signup' and use this template:"
        echo ""
        cat << 'EOF'
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">ICD-10 Assistant</h1>
  </div>
  
  <div style="padding: 30px; background: white;">
    <h2 style="color: #1f2937;">Welcome!</h2>
    
    <p style="color: #4b5563; line-height: 1.6;">
      Thank you for signing up. Click below to confirm your email:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .SiteURL }}auth/confirm?token_hash={{ .TokenHash }}&type=email" 
         style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
        Confirm Email Address
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      This link expires in 24 hours.
    </p>
  </div>
</div>
EOF
        echo ""
        read -p "Press Enter when template is updated..."
        
        echo ""
        echo "Step 3: Rebuild Your App"
        echo "==============================="
        echo ""
        echo "Deep links require a rebuild (not just reload):"
        echo ""
        echo "For iOS:"
        echo "  npx expo run:ios"
        echo ""
        echo "For Android:"
        echo "  npx expo run:android"
        echo ""
        echo -e "${GREEN}✅ Setup complete!${NC}"
        echo ""
        echo "Test by signing up with a real email address."
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}📧 Email Template HTML${NC}"
        echo ""
        echo "Copy this into Supabase → Auth → Email Templates:"
        echo ""
        cat << 'EOF'
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">ICD-10 Assistant</h1>
  </div>
  
  <div style="padding: 30px; background: white;">
    <h2 style="color: #1f2937;">Welcome to ICD-10 Assistant!</h2>
    
    <p style="color: #4b5563; line-height: 1.6;">
      Thank you for signing up. Click the button below to confirm your email and get started:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .SiteURL }}auth/confirm?token_hash={{ .TokenHash }}&type=email" 
         style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
        Confirm Email Address
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Or copy this link: <br>
      <code style="background: #e5e7eb; padding: 8px; display: block; margin-top: 8px; word-break: break-all;">
        {{ .SiteURL }}auth/confirm?token_hash={{ .TokenHash }}&type=email
      </code>
    </p>
    
    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
      This link expires in 24 hours. If you didn't create this account, please ignore this email.
    </p>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
      © 2025 ICD-10 Mobile Assistant. All rights reserved.
    </p>
  </div>
</div>
EOF
        ;;
        
    4)
        echo ""
        echo -e "${BLUE}🧪 Testing Deep Link Configuration${NC}"
        echo ""
        
        # Check if scheme is in app.json
        if grep -q "\"scheme\": \"icd10assistant\"" app.json; then
            echo -e "${GREEN}✅ Deep link scheme configured in app.json${NC}"
        else
            echo -e "${RED}❌ Deep link scheme NOT found in app.json${NC}"
            echo "   Add: \"scheme\": \"icd10assistant\""
        fi
        
        echo ""
        echo "To test deep links on device:"
        echo ""
        echo "iOS Simulator:"
        echo "  xcrun simctl openurl booted \"icd10assistant://auth/confirm?token_hash=test&type=email\""
        echo ""
        echo "Android:"
        echo "  adb shell am start -W -a android.intent.action.VIEW -d \"icd10assistant://auth/confirm?token_hash=test&type=email\""
        echo ""
        echo "List registered schemes:"
        echo "  npx uri-scheme list"
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo -e "${BLUE}📚 More Information:${NC}"
echo "  - EMAIL_QUICK_SETUP.md"
echo "  - EMAIL_SETUP_GUIDE.md (detailed)"
echo "======================================"
