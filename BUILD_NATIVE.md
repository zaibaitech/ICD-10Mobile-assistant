# Building Native Development Client

## Problem
Expo Go doesn't support native modules like `expo-sqlite`. You need a development build.

## Solution: EAS Build (FREE)

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure EAS
```bash
eas build:configure
```

### 4. Build for Android (FREE)
```bash
# Development build (runs on your phone)
eas build --profile development --platform android

# This will:
# 1. Build APK with expo-sqlite included
# 2. Give you download link
# 3. Install on your phone
# 4. Connect to Metro bundler on your PC
```

### 5. Install on Phone
After build completes:
1. Download APK from EAS dashboard
2. Install on phone (enable "Install from Unknown Sources")
3. Run `npx expo start --dev-client`
4. Scan QR code with custom app (not Expo Go)

## Cost: $0
- EAS Free tier: 30 builds/month
- Perfect for development

## Time: 15-20 minutes first build
