# Crowdin Quick Reference

Quick commands and workflow for managing translations with Crowdin.

---

## 🚀 Quick Start

### First Time Setup (5 minutes)

1. **Get Crowdin Credentials**
   - Create account at https://crowdin.com
   - Apply for OSS license: https://crowdin.com/page/open-source-project-setup-request
   - Create new project
   - Get Project ID from project settings
   - Generate API token at https://crowdin.com/settings#api-key

2. **Configure Environment**
   ```bash
   # Add to your .env file
   CROWDIN_PROJECT_ID=your_project_id
   CROWDIN_PERSONAL_TOKEN=your_token_here
   ```

3. **Upload Source File**
   ```bash
   npm run crowdin:upload
   ```

---

## 📝 Daily Commands

```bash
# Check translation coverage
npm run i18n:check

# Upload new English strings to Crowdin
npm run crowdin:upload

# Download completed translations from Crowdin
npm run crowdin:download

# Do both (upload + download)
npm run crowdin:sync
```

---

## 🔄 Typical Workflow

### Adding New Feature with Translations

1. **Add English strings** to `src/i18n/locales/en.json`
   ```json
   {
     "newFeature": {
       "title": "New Feature",
       "description": "This is a new feature"
     }
   }
   ```

2. **Check what's missing**
   ```bash
   npm run i18n:check
   ```

3. **Upload to Crowdin**
   ```bash
   npm run crowdin:upload
   ```

4. **Wait for translations** (community translates)

5. **Download when ready**
   ```bash
   npm run crowdin:download
   ```

6. **Commit changes**
   ```bash
   git add src/i18n/locales/*.json
   git commit -m "feat: add translations for new feature"
   ```

---

## 📊 Current Status

Run `npm run i18n:check` to see:

```
┌─────────────┬────────────┬─────────┬──────────┐
│ Language    │ Translated │ Missing │ Coverage │
├─────────────┼────────────┼─────────┼──────────┤
│ ✅ es       │        141 │       0 │     100% │
│ ✅ fr       │        141 │       0 │     100% │
│ ❌ ar       │         55 │      86 │      39% │
│ ❌ hi       │         55 │      86 │      39% │
│ ❌ pt       │         55 │      86 │      39% │
│ ❌ sw       │         55 │      86 │      39% │
└─────────────┴────────────┴─────────┴──────────┘
```

**Next Steps:**
- Spanish & French are complete ✅
- Arabic, Hindi, Portuguese, Swahili need 86 more strings each

---

## 🤖 Automation

### GitHub Actions (Optional)

If you set up GitHub Actions (see `CROWDIN_SETUP.md`):

1. **Add secrets** to GitHub repo settings:
   - `CROWDIN_PROJECT_ID`
   - `CROWDIN_PERSONAL_TOKEN`

2. **Automatic behavior:**
   - When `en.json` changes → uploads to Crowdin
   - Weekly → downloads new translations
   - Creates pull request with translation updates

---

## 💡 Tips

### Translation Quality
- Keep strings short and clear
- Avoid concatenation (use placeholders)
- Provide context in Crowdin interface
- Upload screenshots for visual context

### Medical Terms
- Create glossary in Crowdin for:
  - ICD-10 codes
  - Medical abbreviations
  - Drug names
  - Symptoms

### Regional Variations
- Spanish: Consider Latin America vs Spain
- Portuguese: Brazil vs Portugal
- Arabic: MSA vs dialects
- French: France vs Africa

---

## 🆘 Troubleshooting

### "Command not found: crowdin"
```bash
npm install --save-dev @crowdin/cli --legacy-peer-deps
```

### "Invalid credentials"
- Check `.env` has correct `CROWDIN_PROJECT_ID` and `CROWDIN_PERSONAL_TOKEN`
- Verify token has proper scopes (project, file, translation)

### "File not found"
- Verify `crowdin.yml` exists in project root
- Check file paths in `crowdin.yml` match your structure

### Translations not updating
```bash
# Force re-download
rm -rf src/i18n/locales/*.json  # Backup first!
npm run crowdin:download
```

---

## 📁 Files

```
.
├── crowdin.yml                    # Crowdin configuration
├── .crowdin.env.example           # Environment template
├── CROWDIN_SETUP.md               # Full setup guide
├── CROWDIN_QUICK_REFERENCE.md     # This file
├── scripts/
│   └── check-translations.js      # Coverage checker
├── .github/workflows/
│   └── crowdin.yml                # GitHub Actions
└── src/i18n/locales/
    ├── en.json                    # Source (English)
    ├── es.json                    # Spanish
    ├── fr.json                    # French
    ├── pt.json                    # Portuguese
    ├── hi.json                    # Hindi
    ├── sw.json                    # Swahili
    └── ar.json                    # Arabic
```

---

## ✅ Checklist

- [ ] Crowdin account created
- [ ] OSS license approved
- [ ] Project created
- [ ] Credentials in `.env`
- [ ] Crowdin CLI installed (`@crowdin/cli`)
- [ ] Source file uploaded
- [ ] Translators invited
- [ ] GitHub Actions configured (optional)

---

**Quick Help:** Read `CROWDIN_SETUP.md` for detailed instructions.

**Last Updated:** November 30, 2025
