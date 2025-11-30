# Crowdin Translation Setup Guide

This guide explains how to set up Crowdin for managing translations in the ICD-10 Mobile Assistant app.

---

## 🎯 Overview

**Crowdin** is a localization management platform that makes it easy to:
- Manage translations across 7+ languages
- Allow community contributions
- Maintain translation quality with voting and proofreading
- Automatically sync translations to your codebase

**Cost**: **$0** for open-source projects (99% free tier limit)

---

## 📋 Current Translation Status

| Language | File | Strings | Status |
|----------|------|---------|--------|
| English (en) | Base language | 176 | ✅ Complete |
| Spanish (es) | `src/i18n/locales/es.json` | 175 | ✅ Complete |
| French (fr) | `src/i18n/locales/fr.json` | 175 | ✅ Complete |
| Portuguese (pt) | `src/i18n/locales/pt.json` | 67 | 🟡 38% (needs expansion) |
| Hindi (hi) | `src/i18n/locales/hi.json` | 67 | 🟡 38% (needs expansion) |
| Swahili (sw) | `src/i18n/locales/sw.json` | 67 | 🟡 38% (needs expansion) |
| Arabic (ar) | `src/i18n/locales/ar.json` | 67 | 🟡 38% (needs expansion) |

---

## 🚀 Setup Instructions

### Step 1: Create Crowdin Account (5 minutes)

1. **Visit**: https://crowdin.com/
2. **Sign up** with GitHub account (recommended for OSS)
3. **Apply for Open Source License**:
   - Go to: https://crowdin.com/page/open-source-project-setup-request
   - Fill out form with project details:
     - Project name: ICD-10 Mobile Assistant
     - Repository: https://github.com/zaibaitech/ICD-10Mobile-assistant
     - License: MIT (or your license)
     - Description: Mobile health assistant for ICD-10 coding
   - Wait 1-3 days for approval (usually instant)

### Step 2: Create Crowdin Project (5 minutes)

1. **Click** "Create Project" in Crowdin dashboard
2. **Configure**:
   - Name: `ICD-10 Mobile Assistant`
   - Source language: `English`
   - Target languages: 
     - Spanish (Español)
     - French (Français)
     - Portuguese (Português)
     - Hindi (हिन्दी)
     - Swahili (Kiswahili)
     - Arabic (العربية)
     - *(Optional: Chinese, German, Japanese, etc.)*
   - Public project: ✅ Yes (for community contributions)
   - Workflow: `Translation + Proofreading`

3. **Save** and note your Project ID (you'll need this)

### Step 3: Generate API Token (2 minutes)

1. **Go to**: https://crowdin.com/settings#api-key
2. **Click** "New Token"
3. **Configure**:
   - Name: `ICD-10 Mobile Assistant CLI`
   - Scopes: Select all (or at minimum: `project`, `file`, `translation`)
4. **Copy** the token (save it securely, it won't be shown again)

### Step 4: Configure Environment Variables (2 minutes)

1. **Copy** the example file:
   ```bash
   cp .crowdin.env.example .env.crowdin
   ```

2. **Edit** `.env.crowdin` and add your credentials:
   ```bash
   CROWDIN_PROJECT_ID=123456
   CROWDIN_PERSONAL_TOKEN=your_long_token_here
   ```

3. **Or** add to your main `.env` file:
   ```bash
   # Add these lines to your existing .env
   CROWDIN_PROJECT_ID=123456
   CROWDIN_PERSONAL_TOKEN=your_long_token_here
   ```

### Step 5: Install Crowdin CLI (3 minutes)

```bash
# Install globally
npm install -g @crowdin/cli

# Or install as dev dependency (recommended)
npm install --save-dev @crowdin/cli

# Verify installation
crowdin --version
```

### Step 6: Upload Source Files (2 minutes)

```bash
# Upload English source file to Crowdin
crowdin upload sources

# Expected output:
# ✓ Uploading '/src/i18n/locales/en.json'
# ✓ Successfully uploaded 1 file
```

### Step 7: Invite Translators (5 minutes)

1. **Share** your Crowdin project URL: `https://crowdin.com/project/your-project-name`
2. **Invite** community members via:
   - GitHub README badge
   - Twitter/social media
   - Local health worker communities
   - Medical translation volunteers

3. **Add** project badge to README:
   ```markdown
   [![Crowdin](https://badges.crowdin.net/icd10-mobile-assistant/localized.svg)](https://crowdin.com/project/icd10-mobile-assistant)
   ```

---

## 🔄 Daily Workflow

### When You Add New Strings

1. **Update** `src/i18n/locales/en.json` with new English strings
2. **Upload** to Crowdin:
   ```bash
   crowdin upload sources
   ```
3. Translators will be notified automatically

### When Translations Are Ready

1. **Download** translations from Crowdin:
   ```bash
   crowdin download
   ```
2. **Review** updated files in `src/i18n/locales/`
3. **Commit** to git:
   ```bash
   git add src/i18n/locales/*.json
   git commit -m "chore: update translations from Crowdin"
   git push
   ```

---

## 🤖 Automation (Optional)

### GitHub Actions Integration

Create `.github/workflows/crowdin.yml`:

```yaml
name: Crowdin Sync

on:
  push:
    branches: [main]
    paths:
      - 'src/i18n/locales/en.json'
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Upload to Crowdin
        uses: crowdin/github-action@v1
        with:
          upload_sources: true
          upload_translations: false
          download_translations: true
          create_pull_request: true
        env:
          CROWDIN_PROJECT_ID: ${{ secrets.CROWDIN_PROJECT_ID }}
          CROWDIN_PERSONAL_TOKEN: ${{ secrets.CROWDIN_PERSONAL_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Setup**:
1. Add secrets to GitHub repository settings:
   - `CROWDIN_PROJECT_ID`
   - `CROWDIN_PERSONAL_TOKEN`
2. Enable GitHub Actions in repository

---

## 📊 Translation Quality

### Best Practices

1. **Context**: Add context for translators
   ```json
   {
     "search": "Search",
     "_search_context": "Button label for search functionality"
   }
   ```

2. **Placeholders**: Use consistent placeholder format
   ```json
   {
     "greeting": "Hello, {{name}}!",
     "_greeting_context": "{{name}} will be replaced with user's name"
   }
   ```

3. **Glossary**: Create Crowdin glossary for medical terms
   - ICD-10 → International Classification of Diseases
   - EHR → Electronic Health Record
   - etc.

4. **Screenshots**: Upload UI screenshots to Crowdin for visual context

---

## 🌍 Supported Languages

### Current (7 languages)
- 🇬🇧 English (en) - Base
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇵🇹 Portuguese (pt)
- 🇮🇳 Hindi (hi)
- 🇹🇿 Swahili (sw)
- 🇸🇦 Arabic (ar)

### Recommended Additions
- 🇨🇳 Chinese Simplified (zh-CN) - 1.1B speakers
- 🇩🇪 German (de) - Medical community
- 🇯🇵 Japanese (ja) - Advanced healthcare
- 🇰🇷 Korean (ko) - Medical technology
- 🇷🇺 Russian (ru) - 250M speakers
- 🇮🇹 Italian (it) - Medical heritage
- 🇳🇱 Dutch (nl) - WHO reports
- 🇹🇷 Turkish (tr) - 80M speakers
- 🇻🇳 Vietnamese (vi) - SEA healthcare

---

## 💡 Tips

### Translation Priority
1. **High**: Common actions (search, save, cancel)
2. **Medium**: Medical terms, error messages
3. **Low**: Documentation, tooltips

### Medical Translation Guidelines
- Use official WHO/ICD-10 translations when available
- Maintain consistency with local medical terminology
- Get review from native-speaking healthcare workers
- Consider regional variations (Latin America vs Spain Spanish)

### Cost Control
- Crowdin free tier: Unlimited strings for OSS
- If you exceed limits: Apply for OSS license renewal
- Community translations = $0 cost

---

## 📞 Support

### Crowdin Support
- Docs: https://support.crowdin.com/
- Community: https://community.crowdin.com/
- Email: support@crowdin.com

### Project Maintainers
- Open issue on GitHub for translation questions
- Tag translations with `i18n` label

---

## ✅ Success Checklist

- [ ] Crowdin account created
- [ ] Open-source license approved
- [ ] Project created with 7+ languages
- [ ] API token generated and saved
- [ ] Environment variables configured
- [ ] Crowdin CLI installed
- [ ] Source file uploaded
- [ ] Project URL shared publicly
- [ ] README badge added
- [ ] (Optional) GitHub Actions configured

---

## 🎉 What You Get

✅ **Professional translation management**  
✅ **Community contributions** (crowdsourced)  
✅ **Translation memory** (reuse across strings)  
✅ **Quality voting** (community validates)  
✅ **Version control** (track all changes)  
✅ **Automated sync** (GitHub Actions)  
✅ **$0 cost** (OSS license)

---

**Time to Complete**: 20-30 minutes  
**Difficulty**: Easy  
**Impact**: Global reach for your app  
**Cost**: $0  

---

**Status**: Ready to Configure  
**Version**: 1.0  
**Last Updated**: November 30, 2025
