# Installation Guide - Zero-Cost Features

## Prerequisites

- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- Python 3.8+ (for ICD-10 import script)

---

## Step 1: Install Dependencies

```bash
# Install Node.js packages (all FREE)
npm install

# This installs:
# - expo-sqlite: Local database for offline mode
# - @react-native-community/netinfo: Network status detection
# - Spanish translation support (already configured)
```

**Cost**: $0

---

## Step 2: Import ICD-10 Dataset (72,000 codes)

### A. Get Supabase Service Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/hwclojaalnzruviubxju/settings/api)
2. Copy the `service_role` key (NOT the anon key)
3. Set environment variable:

```powershell
# Windows PowerShell
$env:SUPABASE_SERVICE_KEY = "your-service-role-key-here"
```

### B. Run Import Script

```bash
# Install Python dependencies (one-time)
pip install requests

# Import CDC ICD-10-CM dataset
python tools/import_icd10.py --dataset cdc --year 2024

# This will:
# 1. Download 72,616 ICD-10 codes (12 MB) - FREE
# 2. Parse XML file
# 3. Upload to Supabase in batches
# 4. Verify import success
```

**Expected output**:
```
📥 Downloading CDC ICD-10-CM 2024 dataset...
✅ Downloaded 12.3 MB
📖 Parsing cdc_icd10cm_2024.xml...
  Chapter 01: Certain infectious and parasitic diseases
  Chapter 02: Neoplasms
  ...
✅ Parsed 72,616 ICD-10 codes from 21 chapters

📤 Uploading 72,616 codes to Supabase...
  Batch 146/146: 72,616/72,616 (100%) ✅

✅ Upload complete!
   Uploaded: 72,616
   Failed: 0
   Success rate: 100%

🔍 Verifying import...
✅ Total ICD-10 codes in database: 72616
```

**Time**: 5-10 minutes  
**Cost**: $0

---

## Step 3: Test Offline Mode

```bash
# Start the app
npm start

# OR run on device
npm run android  # Android
npm run ios      # iOS
```

**What happens on first launch**:

1. App initializes offline database (expo-sqlite)
2. Downloads all 72K ICD codes to local device (~35 MB)
3. Creates full-text search index (FTS5)
4. Ready to use 100% offline!

**Cost**: $0

---

## Step 4: Verify Features

### ✅ Offline Search
- Turn off WiFi/data
- Search for "diabetes" or "malaria"
- Should return instant results from local database

### ✅ Spanish Translation
- Go to Profile > Settings > Language
- Select "Español"
- UI should switch to Spanish

### ✅ Offline Patient Records
- Create a patient while offline
- Data saved locally
- Auto-syncs when back online

---

## Troubleshooting

### Error: "expo-sqlite not found"

```bash
# Clear cache and reinstall
npm install --legacy-peer-deps
expo prebuild --clean
```

### Error: "Import failed"

Check:
1. Supabase service key is correct
2. Internet connection is stable
3. Supabase free tier has space (500 MB limit)

**Fix**:
```bash
# Verify Supabase connection
python tools/import_icd10.py --verify-only
```

### Error: "Offline database initialization failed"

**Fix**: App will still work, but without offline mode. Check console logs:

```bash
# View logs
npx expo start --dev-client
```

---

## Optional: Advanced Setup

### Enable Background Sync

Already configured! The app automatically:
- Detects network status
- Queues changes while offline
- Syncs in background every 30 seconds when online
- Retries failed uploads with exponential backoff

**No configuration needed** - it just works.

### Add More Languages

Follow crowdsource guide (coming soon):

1. Copy `src/i18n/locales/es.json` to `hi.json` (Hindi)
2. Translate strings (use Google Translate + medical students)
3. Add to `src/i18n/index.ts`:
   ```typescript
   import hi from './locales/hi.json';
   
   resources: {
     en: { translation: en },
     fr: { translation: fr },
     es: { translation: es },
     hi: { translation: hi }, // Add this
   }
   ```

**Cost**: $0 (crowdsource or use free translation tools)

---

## What's Next?

✅ **Completed**:
- Full ICD-10 database (72K codes)
- Offline-first architecture
- Spanish translation
- Background sync

⏳ **Coming Soon** (Week 2-4):
- SMS/USSD interface
- Disease modules (Malaria, TB, Dengue)
- Grant applications

---

## Support

- **Issues**: Check console logs first
- **Questions**: See `tools/README.md`
- **Updates**: Run `git pull` for latest features

**Everything is FREE** - no paid services required!

---

**Installation complete!** 🎉

Your app now:
- Works 100% offline
- Has 72,000 ICD-10 codes locally
- Supports English, French, Spanish
- Syncs automatically when online

**Total cost**: $0.00  
**Time to install**: ~15 minutes  
**Lives improved**: Priceless 🌍
