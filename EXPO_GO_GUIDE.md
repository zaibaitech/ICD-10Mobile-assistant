# Running App in Expo Go

## Current Status
✅ **App now works in Expo Go** (online mode only)

## What Changed
The app now detects if it's running in Expo Go and **skips offline database initialization**.

- **Expo Go**: Uses Supabase directly (requires internet)
- **Custom Build**: Full offline support with expo-sqlite

## Test on Your Phone

### 1. Restart Metro Bundler
```bash
cd ICD-10Mobile-assistant
npx expo start --clear
```

### 2. Scan QR Code
- Open Expo Go app on your phone
- Scan the QR code from terminal
- App should load without errors

### 3. What Works in Expo Go
✅ ICD-10 search (via Supabase API)
✅ Patient management
✅ Favorites
✅ Encounter notes
✅ All screens and navigation

### 4. What Doesn't Work in Expo Go
❌ Offline mode (no expo-sqlite)
❌ Background sync
❌ Local ICD-10 database

## For Full Features (Build Custom App)

See `BUILD_NATIVE.md` for instructions on building with EAS.

**Free**: 30 builds/month with EAS Free tier

## Current Mode Detection

```typescript
// App automatically detects environment:
if (running in Expo Go) {
  → Online mode only
  → Direct Supabase connection
} else {
  → Full offline support
  → Local SQLite database
}
```

## Zero-Cost Status
Still $0 - Expo Go is free, builds are free (EAS tier)
