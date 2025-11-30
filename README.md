# ICD-10 Mobile Assistant

> **A healthcare documentation tool for ICD-10 coding with AI-assisted suggestions**

[![Status](https://img.shields.io/badge/status-beta-yellow)](https://github.com/zaibaitech/ICD-10Mobile-assistant)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-blue)](https://expo.dev)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Translations](https://img.shields.io/badge/translations-7%20languages-brightgreen)](#-localization)

## 🎯 What This App Does

ICD-10 Mobile Assistant helps healthcare workers quickly find and document diagnosis codes using:
- **71,703 ICD-10 codes** via NIH Clinical Tables API (no database needed!)
- **Keyword-based suggestions** for common conditions
- **WHO disease modules** for Malaria, TB, and Dengue
- **Visit note builder** to compile diagnosis codes
- **Favorites system** to save frequently used codes

## ✅ What Works (Core Features)

### 🔍 ICD-10 Code Search
- Search 71,703+ codes using NIH Clinical Tables API
- Filter by chapter (e.g., Infectious diseases, Injuries)
- 7-day offline caching via AsyncStorage
- Auto-updating (CDC maintains the API)

### 📚 Disease Modules
- WHO clinical guidelines for 3 diseases:
  - **Malaria**: Diagnostic criteria, treatment protocols, red flags
  - **Tuberculosis**: WHO guidelines, drug regimens, follow-up
  - **Dengue**: Severity classification, fluid management
- Searchable by keyword or browse by module
- 100% offline after initial load

### 💉 Visit Note Builder
- Add codes to current patient visit
- Live formatted note preview
- Copy to clipboard for EHR
- Persistent during session

### ⭐ Favorites
- Save frequently used codes
- Synced to Supabase (per user)
- Quick access from dedicated tab

### 🔐 Authentication
- Email/password via Supabase Auth
- Persistent sessions
- Row-level security for user data

### 🌍 Localization
- **7 languages supported**:
  - 🇬🇧 English (en) - 141 strings ✅
  - 🇪🇸 Spanish (es) - 141 strings ✅
  - 🇫🇷 French (fr) - 141 strings ✅
  - 🇵🇹 Portuguese (pt) - 55 strings (39%)
  - 🇮🇳 Hindi (hi) - 55 strings (39%)
  - 🇹🇿 Swahili (sw) - 55 strings (39%)
  - 🇸🇦 Arabic (ar) - 55 strings (39%)
- **Crowdin integration** for community translations
- Check coverage: `npm run i18n:check`
- See [CROWDIN_SETUP.md](CROWDIN_SETUP.md) for details

## ⚠️ What's Mock/Incomplete

**See**: [MOCK_VS_REAL_QUICK_REFERENCE.md](MOCK_VS_REAL_QUICK_REFERENCE.md) for visual guide

### 🤖 AI Assistant (Keyword Matching Only)
**Status**: Basic keyword matching, NOT real AI
- Shows **prominent disclaimers** on screen
- Returns hardcoded codes based on text keywords (e.g., "diabetes" → E11.9)
- Does NOT analyze images (despite upload capability)
- Does NOT use GPT-4 or any ML model
- **To fix**: Integrate OpenAI API ($0.03/1K tokens) or similar

### 🎤 Voice Recording (Placeholder)
**Status**: Returns mock transcription
- Records audio but doesn't transcribe
- Shows warning: "⚠️ MOCK TRANSCRIPTION"
- **To fix**: Integrate Whisper API ($0.006/min) or Azure Speech

### 📸 Image Upload (Storage Only)
**Status**: Uploads work, analysis doesn't
- Images upload to Supabase Storage ✅
- No AI vision analysis (mock tags only)
- **To fix**: Integrate GPT-4 Vision ($0.01-0.05/image)

### 🏥 EHR Integration (Templates Only)
**Status**: Code written, not tested in production
- OpenMRS and DHIS2 client code exists
- Never tested with real EHR systems
- **To fix**: Partner with clinic using OpenMRS/DHIS2

### 📱 SMS/USSD (Not Deployed)
**Status**: Code complete, not live
- Webhook exists but not on Vercel
- **To fix**: Deploy to Vercel, configure Africa's Talking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier)
- Expo CLI

### 1. Clone & Install
```bash
git clone https://github.com/zaibaitech/ICD-10Mobile-assistant.git
cd ICD-10Mobile-assistant
npm install
```

### 2. Configure Supabase
Create `.env` in root:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: Supabase Dashboard → Settings → API

### 3. Setup Database
1. Go to Supabase Dashboard → SQL Editor
2. Run `database/migrate_to_api.sql` (sets up favorites table)
3. (Optional) Run `database/storage_setup.sql` (enables image uploads)

### 4. Start Development Server
```bash
npm start
```

Press `w` for web or scan QR for mobile.

### 5. Create Test Account
- Click "Sign Up" in the app
- Use any email (if email confirmation is disabled in Supabase)
- Or manually create user in Supabase Dashboard → Authentication → Users

## 📁 Project Structure

```
ICD-10Mobile-assistant/
├── src/
│   ├── screens/          # 9 main screens
│   │   ├── LoginScreen.tsx
│   │   ├── Icd10SearchScreen.tsx      # NIH API search
│   │   ├── DiseaseModulesScreen.tsx   # WHO guidelines
│   │   ├── FavoritesScreen.tsx
│   │   ├── VisitNoteScreen.tsx
│   │   └── AssistantScreen.tsx        # Keyword matching "AI"
│   ├── services/
│   │   ├── icd10-api.ts              # NIH Clinical Tables API
│   │   ├── auth.ts                   # Supabase authentication
│   │   ├── favorites.ts              # User favorites
│   │   └── assistant.ts              # Mock AI (keyword only)
│   ├── data/disease-modules/         # WHO disease data
│   ├── components/                   # Reusable UI
│   └── navigation/                   # React Navigation
├── database/
│   ├── migrate_to_api.sql           # Favorites table setup
│   └── storage_setup.sql            # Image storage RLS
├── .env                              # Supabase credentials
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: Expo 54 + React Native
- **Language**: TypeScript
- **Backend**: Supabase (Auth, Database, Storage)
- **ICD-10 Data**: NIH Clinical Tables API (free, public)
- **Navigation**: React Navigation 7
- **Caching**: AsyncStorage (7-day TTL)
- **i18n**: react-i18next (7 languages)
- **Translations**: Crowdin (community-powered)

## 📊 Honest Status Report

| Feature | Completion | Notes |
|---------|-----------|-------|
| ICD-10 Search | **95%** | NIH API working, 71K+ codes |
| Disease Modules | **100%** | 3 WHO modules, full UI |
| Favorites | **100%** | Supabase sync working |
| Visit Notes | **100%** | Copy to clipboard works |
| Authentication | **100%** | Email/password via Supabase |
| Mock AI | **30%** | Basic keywords only, NEEDS DISCLAIMER |
| Voice | **10%** | Records but doesn't transcribe |
| Image Analysis | **20%** | Uploads work, no AI vision |
| EHR Integration | **40%** | Code exists, untested |
| SMS/USSD | **70%** | Code complete, not deployed |

**Overall**: ~70% complete for production use

## 🔒 Security & Privacy

- ✅ Row-level security (RLS) on all user data
- ✅ Secure authentication via Supabase
- ✅ HTTPS for all API calls
- ✅ No patient data stored (only ICD codes)
- ⚠️ Not HIPAA compliant (Supabase free tier)
- ⚠️ For educational/research use only

## 📄 Documentation

### Getting Started
- [START_HERE.md](START_HERE.md) - Quick start guide
- [INSTALLATION.md](INSTALLATION.md) - Setup instructions
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment

### Features & Implementation
- [PHASE5_README.md](PHASE5_README.md) - Latest clinical features (Drug interactions, Lab results)
- [ICD10_DATABASE_SOLUTION.md](ICD10_DATABASE_SOLUTION.md) - NIH API implementation
- [STORAGE_BUCKET_SETUP.md](STORAGE_BUCKET_SETUP.md) - Image upload guide

### Mock Data & Upgrades
- [MOCK_VS_REAL_QUICK_REFERENCE.md](MOCK_VS_REAL_QUICK_REFERENCE.md) - **What's mock, what's real**
- [MOCK_DATA_REPLACEMENT_GUIDE.md](MOCK_DATA_REPLACEMENT_GUIDE.md) - **How to replace mock with real APIs**
- [AI_SETUP_GUIDE.md](AI_SETUP_GUIDE.md) - Enable real AI features

### Translations
- [CROWDIN_SETUP.md](CROWDIN_SETUP.md) - Translation management setup
- [CROWDIN_QUICK_REFERENCE.md](CROWDIN_QUICK_REFERENCE.md) - Translation workflow
- [CONTRIBUTING_TRANSLATIONS.md](CONTRIBUTING_TRANSLATIONS.md) - Help translate

### Status Reports
- [HONEST_AUDIT_REPORT.md](HONEST_AUDIT_REPORT.md) - Reality check (65% vs claimed 100%)
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Feature completion tracking

## 🤝 Contributing

This is a learning project. Contributions welcome for:
- Translations (via [Crowdin](CROWDIN_SETUP.md))
- Real AI integration (OpenAI/Claude)
- Production EHR testing
- Additional disease modules
- UI/UX improvements

### Translation Contributors
Help translate into your language! See [CROWDIN_SETUP.md](CROWDIN_SETUP.md) to get started.

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

## ⚠️ Medical Disclaimer

**This application is for educational and research purposes only.**

- NOT approved for clinical use
- NOT a substitute for professional medical judgment
- ALL suggestions must be verified by qualified healthcare providers
- Not HIPAA compliant
- No warranty or liability for medical decisions

---

**Built with ❤️ for healthcare workers in resource-limited settings**