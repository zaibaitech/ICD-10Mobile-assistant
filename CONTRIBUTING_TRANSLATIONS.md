# 🌍 Help Translate ICD-10 Mobile Assistant

Thank you for your interest in translating this medical coding app! Your contribution will help healthcare workers worldwide access this tool in their native language.

---

## 📊 Current Translation Status

Run `npm run i18n:check` to see latest coverage:

| Language | Progress | Strings | Status |
|----------|----------|---------|--------|
| 🇬🇧 English | 100% | 141/141 | ✅ Complete (source) |
| 🇪🇸 Spanish | 100% | 141/141 | ✅ Complete |
| 🇫🇷 French | 100% | 141/141 | ✅ Complete |
| 🇵🇹 Portuguese | 39% | 55/141 | 🔄 In Progress |
| 🇮🇳 Hindi | 39% | 55/141 | 🔄 In Progress |
| 🇹🇿 Swahili | 39% | 55/141 | 🔄 In Progress |
| 🇸🇦 Arabic | 39% | 55/141 | 🔄 In Progress |

**Total**: 7 languages, 59.3% average coverage

---

## 🚀 Two Ways to Contribute

### Option 1: Via Crowdin (Recommended)

**Best for**: Non-technical contributors, community translators

1. **Visit our Crowdin project**: [Coming Soon - Add your URL here]
2. **Sign up** for free Crowdin account
3. **Select** your language
4. **Start translating**:
   - See English source text
   - Enter translation
   - Vote on other translations
   - Discuss with community
5. **Submit** - Automatically synced to app!

**Benefits**:
- No coding knowledge needed
- Visual interface with context
- Translation memory (reuse past translations)
- Quality voting system
- Mobile app available

### Option 2: Direct GitHub Contribution

**Best for**: Developers, bulk translations

1. **Fork** the repository
2. **Edit** language file: `src/i18n/locales/[language_code].json`
3. **Translate** missing strings (compare with `en.json`)
4. **Test** locally: `npm run i18n:check`
5. **Submit** pull request

---

## 📝 Translation Guidelines

### Medical Accuracy
- **Use official terminology** when available
  - WHO translations for disease names
  - Local medical standards for drug names
  - ICD-10 official translations
- **Verify with medical professionals** when unsure
- **Keep consistency** with local healthcare systems

### Language Style
- **Formal tone** for medical terms
- **Simple language** for general UI
- **Clear and concise** (avoid long phrases)
- **Professional** (this is for healthcare workers)

### Technical Formatting
- **Preserve placeholders**: `{{name}}`, `{{count}}`, etc.
- **Keep HTML tags**: `<strong>`, `<br>`, etc. (if any)
- **Maintain capitalization** patterns
- **Don't translate**: 
  - ICD-10 codes (e.g., "A15.0")
  - API keys, technical terms
  - Brand names (Supabase, etc.)

### Examples

✅ **Good Translation** (Spanish):
```json
{
  "search": "Buscar",
  "results": "Resultados ({{count}})",
  "icd10Code": "Código CIE-10"
}
```

❌ **Bad Translation**:
```json
{
  "search": "Búsqueda avanzada de información",  // Too verbose
  "results": "{{count}} resultados",  // Wrong placeholder position
  "icd10Code": "Código ICD-10"  // Should use local abbreviation CIE-10
}
```

---

## 🎯 Priority Strings

Translate these first for maximum impact:

### High Priority (Core UI)
- `common.*` - Search, save, cancel, loading, etc.
- `auth.*` - Login, register, logout
- `search.*` - ICD-10 search interface
- `favorites.*` - Favorites system

### Medium Priority (Features)
- `assistant.*` - AI assistant messages
- `dashboard.*` - Dashboard screen
- `detail.*` - Code detail view

### Low Priority (Advanced)
- `clinical.*` - Clinical tools
- `sync.*` - Sync status messages
- `offline.*` - Offline mode

---

## 🌍 Language-Specific Notes

### Portuguese (pt)
- **Dialect**: Brazilian Portuguese preferred (largest user base)
- **Medical terms**: Follow Brazilian ANVISA standards
- **ICD-10**: Use "CID-10" (not "ICD-10")

### Hindi (hi)
- **Script**: Devanagari required
- **Medical terms**: Mix Hindi + English medical terms (common practice)
- **Formality**: Use formal register (आप not तुम)

### Swahili (sw)
- **Dialect**: Standard Swahili (Tanzania/Kenya)
- **Medical terms**: Use WHO East Africa translations when available
- **Technical terms**: English loanwords acceptable

### Arabic (ar)
- **Dialect**: Modern Standard Arabic (MSA)
- **Direction**: RTL properly handled in app
- **Medical terms**: Follow WHO Arabic guidelines

---

## 🔍 Testing Your Translations

### Option 1: Visual Test (Recommended)

1. **Change language** in app settings
2. **Navigate** through all screens
3. **Check for**:
   - Text overflow (too long)
   - Missing translations (shows English)
   - Broken layouts (RTL issues)
   - Cultural appropriateness

### Option 2: Coverage Test

```bash
npm run i18n:check
```

Look for your language:
- ✅ 100% = Complete
- 🟡 50-99% = Good progress
- ❌ <50% = Needs work

---

## 💡 Resources

### Medical Translation References
- **WHO**: https://www.who.int/health-topics (multilingual)
- **ICD-10 Official**: https://www.who.int/standards/classifications/classification-of-diseases
- **Medical Dictionaries**: MedlinePlus (multilingual)

### Language-Specific
- **Portuguese**: ANVISA medical terminology
- **Hindi**: AIIMS medical glossary
- **Swahili**: WHO East Africa resources
- **Arabic**: WHO EMRO publications

### Translation Tools
- **Crowdin**: Context, screenshots, glossary
- **Google Translate**: Quick reference only
- **DeepL**: Better for European languages
- **Native speakers**: Best resource!

---

## 🏆 Recognition

All contributors will be:
- **Listed** in CONTRIBUTORS.md
- **Credited** in app about page
- **Thanked** in release notes

Top contributors:
- **Featured** on project homepage
- **Early access** to new features
- **Certificate** of contribution (on request)

---

## ❓ FAQ

**Q: I'm not fluent in medical terminology. Can I still help?**  
A: Yes! Focus on UI strings first (buttons, menus). Medical terms can be reviewed by healthcare professionals.

**Q: How long does translation take?**  
A: ~2-3 hours for all 141 strings (casual pace)

**Q: What if my language isn't listed?**  
A: Open a GitHub issue! We'll add it if there's interest.

**Q: Can I translate documentation too?**  
A: Not yet, but planned for future. UI translations are priority.

**Q: Do I need to translate everything?**  
A: No! Even partial translations help. We'll mark incomplete sections in English.

**Q: How do I get added to Crowdin project?**  
A: Contact project maintainer with GitHub issue or email (see CROWDIN_SETUP.md)

---

## 📧 Get Help

- **Questions**: Open GitHub issue with `i18n` label
- **Chat**: [Add Discord/Slack link if available]
- **Email**: [Add maintainer email if public]

---

## ✅ Quick Start Checklist

- [ ] Read translation guidelines above
- [ ] Choose contribution method (Crowdin or GitHub)
- [ ] Review priority strings
- [ ] Start with 5-10 strings to get familiar
- [ ] Test your translations (visual check)
- [ ] Submit for review
- [ ] Celebrate! 🎉

---

**Thank you for making healthcare tools accessible to everyone!** 🌍💙

---

**Last Updated**: November 30, 2025  
**Languages**: 7 (growing!)  
**Contributors**: [Add count from CONTRIBUTORS.md]
