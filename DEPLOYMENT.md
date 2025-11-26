# Deployment Guide

This guide covers deploying the ICD-10 Mobile Assistant to various platforms.

## Table of Contents
1. [Development Setup](#development-setup)
2. [Testing Deployment](#testing-deployment)
3. [Production Deployment](#production-deployment)
4. [Platform-Specific Guides](#platform-specific-guides)

---

## Development Setup

### Prerequisites
- ✅ Supabase project configured
- ✅ `.env` file with credentials
- ✅ Dependencies installed (`npm install`)

### Run Locally
```bash
npm start
```

---

## Testing Deployment

### Web (Quick Testing)
```bash
npm run web
```
Opens in browser at `http://localhost:8081`

**Pros:**
- Fast development cycle
- Easy debugging
- No device/simulator needed

**Cons:**
- Some native features may not work
- Different from mobile experience

### iOS Simulator (macOS only)
```bash
npm run ios
```

**Requirements:**
- Xcode installed
- iOS Simulator configured

### Android Emulator
```bash
npm run android
```

**Requirements:**
- Android Studio installed
- Android emulator configured

### Physical Device (Expo Go)
1. Install Expo Go app on your phone
2. Run `npm start`
3. Scan QR code with:
   - iOS: Camera app
   - Android: Expo Go app

---

## Production Deployment

### Option 1: Expo Application Services (EAS) [Recommended]

#### Setup EAS
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project
eas build:configure
```

#### Build for iOS
```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

#### Build for Android
```bash
# Development build
eas build --platform android --profile development

# Production build (AAB for Google Play)
eas build --platform android --profile production
```

#### Submit to App Stores
```bash
# Submit to Apple App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

### Option 2: Manual Build

#### iOS (macOS only)
```bash
# Generate native iOS project
npx expo prebuild --platform ios

# Open in Xcode
open ios/ICD10MobileAssistant.xcworkspace

# Build and archive in Xcode
# Upload to App Store Connect
```

#### Android
```bash
# Generate native Android project
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/
```

---

## Platform-Specific Guides

### iOS App Store

#### Requirements
- Apple Developer account ($99/year)
- Xcode on macOS
- App Store Connect setup

#### Steps
1. **Prepare App**
   - Update `app.json` with iOS bundle ID
   - Add app icon (1024x1024)
   - Add splash screen
   - Set version and build number

2. **Create App in App Store Connect**
   - Go to appstoreconnect.apple.com
   - Create new app
   - Fill in metadata
   - Upload screenshots

3. **Build and Upload**
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios
   ```

4. **Submit for Review**
   - Complete app information
   - Submit for review
   - Wait for approval (1-3 days)

#### app.json iOS Configuration
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.icd10assistant",
      "buildNumber": "1.0.0",
      "supportsTablet": true,
      "infoPlist": {
        "NSHealthShareUsageDescription": "This app helps document ICD-10 codes for healthcare visits."
      }
    }
  }
}
```

### Android Play Store

#### Requirements
- Google Play Console account ($25 one-time)
- Signed APK/AAB
- Privacy policy URL

#### Steps
1. **Prepare App**
   - Update `app.json` with Android package name
   - Add app icon
   - Add splash screen
   - Set version code and name

2. **Create App in Play Console**
   - Go to play.google.com/console
   - Create new app
   - Fill in store listing
   - Upload screenshots

3. **Build and Upload**
   ```bash
   eas build --platform android --profile production
   eas submit --platform android
   ```

4. **Release**
   - Create production release
   - Roll out to percentage or all users
   - Review can take 1-7 days

#### app.json Android Configuration
```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.icd10assistant",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": []
    }
  }
}
```

---

## Environment Variables for Production

### Expo EAS Secrets
```bash
# Set secrets for EAS builds
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co"
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJxxx..."
```

### app.json Environment Configuration
```json
{
  "expo": {
    "extra": {
      "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}
```

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console.log statements in production code
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations
- [ ] Proper error handling

### App Configuration
- [ ] App name set in app.json
- [ ] Bundle ID / Package name set
- [ ] Version numbers set
- [ ] App icon added (1024x1024)
- [ ] Splash screen added
- [ ] Privacy policy created

### Testing
- [ ] Tested on iOS device/simulator
- [ ] Tested on Android device/emulator
- [ ] All user flows tested
- [ ] Authentication tested
- [ ] Database operations tested
- [ ] Offline behavior tested (graceful degradation)

### Security
- [ ] Environment variables secured
- [ ] No API keys in code
- [ ] Supabase RLS policies tested
- [ ] User data privacy verified

### Performance
- [ ] App loads in < 3 seconds
- [ ] Search results appear quickly
- [ ] Images optimized (when Phase 2 adds them)
- [ ] Bundle size optimized

### Legal
- [ ] Privacy policy written
- [ ] Terms of service written
- [ ] Medical disclaimer included
- [ ] App store compliance verified

---

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to EAS

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm install -g eas-cli
      - run: eas build --platform all --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## Monitoring and Analytics

### Recommended Tools
- **Sentry** - Error tracking
- **Firebase Analytics** - User analytics
- **Supabase Logs** - Backend monitoring

### Installation
```bash
# Sentry
npm install @sentry/react-native

# Firebase
npm install @react-native-firebase/app @react-native-firebase/analytics
```

---

## Update Strategy

### Over-the-Air (OTA) Updates with Expo
```bash
# Publish update
eas update --branch production --message "Bug fixes"
```

**Benefits:**
- Instant updates
- No app store review
- Can roll back quickly

**Limitations:**
- Can't update native code
- Only JS/asset changes

### Full App Updates
For major versions or native changes:
1. Increment version in app.json
2. Build new version with EAS
3. Submit to app stores
4. Users update through stores

---

## Cost Considerations

### Development (Free)
- Expo: Free
- Supabase: Free tier (500MB database, 2GB bandwidth)
- Testing: Free

### Production
- **Expo EAS**: 
  - Free: 30 builds/month
  - Paid: $29/month (unlimited)
- **Apple Developer**: $99/year
- **Google Play**: $25 one-time
- **Supabase Pro**: $25/month (recommended for production)

---

## Support and Maintenance

### Regular Maintenance
- Update dependencies monthly
- Monitor Supabase usage
- Review crash reports
- Respond to user feedback
- Update ICD-10 codes database

### Security Updates
- Patch security vulnerabilities immediately
- Update Expo SDK annually
- Keep React Native current
- Monitor Supabase security advisories

---

## Rollback Plan

### If Issues Found in Production

1. **OTA Update**
   ```bash
   eas update --branch production --message "Rollback" --rollback
   ```

2. **App Store Rollback**
   - iOS: Can't rollback, must submit hotfix
   - Android: Can halt rollout, revert to previous version

3. **Database Rollback**
   - Supabase has point-in-time recovery
   - Test database migrations before production

---

## Next Steps After Deployment

1. Monitor initial user feedback
2. Track analytics and usage
3. Fix critical bugs quickly
4. Plan Phase 2 features
5. Gather healthcare professional input
6. Ensure HIPAA compliance if needed
7. Scale Supabase plan as needed

---

## Resources

- **Expo EAS**: https://docs.expo.dev/eas/
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Play Store Policies**: https://play.google.com/about/developer-content-policy/
- **Supabase Production**: https://supabase.com/docs/guides/platform/going-into-prod

---

**Ready for deployment!** 🚀

Start with testing deployment, then move to production when ready.
