# Zero-Cost Implementation Tools

**All tools in this directory use FREE resources only - no API keys, no paid services.**

---

## 🚀 Quick Start

### 1. Import ICD-10 Data (72,000 codes - FREE)

```bash
# Install dependencies
pip install requests

# Set your Supabase service key (one-time setup)
export SUPABASE_SERVICE_KEY="your-service-key-here"

# Download CDC dataset and import to Supabase
python import_icd10.py --dataset cdc --year 2024

# Verify import
python import_icd10.py --verify-only
```

**Expected output**:
```
✅ Downloaded 12.3 MB
✅ Parsed 72,616 ICD-10 codes from 21 chapters
✅ Upload complete!
   Uploaded: 72,616
   Success rate: 100%
```

**Cost**: $0 (uses ~35 MB of Supabase free tier's 500 MB limit)

---

## 📦 What's Included

### `import_icd10.py`
**Import full ICD-10-CM dataset to Supabase**

**Features**:
- Downloads CDC's free ICD-10-CM dataset (updated annually)
- Parses 72K+ codes with descriptions
- Bulk inserts to Supabase in optimized batches
- Progress tracking and error handling
- Verification and export tools

**Usage**:
```bash
# Basic import (recommended)
python import_icd10.py

# Custom year
python import_icd10.py --year 2023

# Export to JSON (backup)
python import_icd10.py --export-json

# Verify existing data
python import_icd10.py --verify-only
```

**Data Sources** (all FREE):
- CDC ICD-10-CM: https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/ICD10CM/
- WHO ICD-10: https://icd.who.int/browse10/Downloads

---

## 🔄 Workflow

### Step 1: Get Supabase Service Key (FREE)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/hwclojaalnzruviubxju/settings/api)
2. Copy the **service_role** key (NOT the anon key)
3. Set environment variable:
   ```bash
   # Windows PowerShell
   $env:SUPABASE_SERVICE_KEY = "your-key-here"
   
   # Linux/Mac
   export SUPABASE_SERVICE_KEY="your-key-here"
   ```

### Step 2: Run Import Script

```bash
python import_icd10.py
```

**What happens**:
1. Downloads CDC dataset (~12 MB) to `./data/`
2. Parses XML file (21 chapters, 72K codes)
3. Uploads to Supabase in batches of 500
4. Verifies upload success
5. Saves backup to `./data/icd10_export.json`

**Time**: ~5-10 minutes depending on internet speed

### Step 3: Verify in Supabase

```bash
python import_icd10.py --verify-only
```

**Expected output**:
```
✅ Total ICD-10 codes in database: 72616

📋 Sample codes:
   A00.0: Cholera due to Vibrio cholerae 01, biovar cholerae...
   A00.1: Cholera due to Vibrio cholerae 01, biovar eltor...
   A00.9: Cholera, unspecified...
```

---

## 🌍 Data Sources (ALL FREE)

### 1. CDC ICD-10-CM (Recommended)
- **URL**: https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/ICD10CM/
- **Format**: XML, TXT
- **Codes**: ~72,000
- **Updated**: Annually (October)
- **License**: Public domain
- **Cost**: FREE

### 2. WHO ICD-10
- **URL**: https://icd.who.int/browse10/Downloads
- **Format**: XML, TXT
- **Codes**: ~14,000 (main categories)
- **Updated**: Periodically
- **License**: Free for non-commercial use
- **Cost**: FREE (requires manual download)

### 3. CMS ICD-10-CM
- **URL**: https://www.cms.gov/Medicare/Coding/ICD10
- **Same as CDC** (CMS mirrors CDC data)

---

## 🛠️ Troubleshooting

### Error: "SUPABASE_SERVICE_KEY not set"

**Fix**:
```bash
# Get your key from Supabase Dashboard
# Settings > API > service_role key

# Set environment variable
export SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Error: "Download failed"

**Fix**:
```bash
# Manual download option
# 1. Go to: https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/ICD10CM/2024/
# 2. Download: icd10cm_tabular_2024.xml
# 3. Save to: ./data/cdc_icd10cm_2024.xml
# 4. Run script again
```

### Error: "Batch upload failed (409 Conflict)"

**Fix**: Duplicate codes detected
```bash
# Script automatically switches to upsert mode
# Or manually delete existing codes first:
python -c "from import_icd10 import *; importer = ICD10Importer(...); importer.db.execute('DELETE FROM icd10_codes')"
```

### Error: "Out of memory"

**Fix**: Reduce batch size
```bash
python import_icd10.py --batch-size 100
```

---

## 📊 Import Statistics

**Expected results**:

| Metric | Value |
|--------|-------|
| Total codes | 72,616 |
| Chapters | 21 |
| Billable codes | ~69,000 |
| Header codes | ~3,600 |
| Download size | 12.3 MB |
| Database size | ~35 MB |
| Import time | 5-10 min |
| **Cost** | **$0** |

**Supabase free tier usage**:
- Database: 35 MB / 500 MB (7%)
- Bandwidth: 12 MB / 2 GB (0.6%)
- **Conclusion**: Plenty of room for 10K+ users

---

## 🔮 Next Steps

After importing ICD-10 data:

1. **Test offline search**: App can now search 72K codes instantly
2. **Add translations**: Import Spanish ICD codes (see translation tools)
3. **Enable offline mode**: Sync data to expo-sqlite (see `src/services/offlineDb.ts`)
4. **Build disease modules**: Use imported codes to create clinical packs

---

## 💡 Advanced Usage

### Export to JSON (for offline mobile app)

```bash
python import_icd10.py --export-json

# Creates: ./data/icd10_export.json (~ 45 MB)
# Use this for initial mobile app database seeding
```

### Import specific chapters only

```python
# Edit import_icd10.py:
# In parse_cdc_xml(), filter by chapter:

for chapter_num, chapter in enumerate(root.findall('.//chapter'), start=1):
    if chapter_num not in [1, 2, 9]:  # Only infectious, neoplasms, circulatory
        continue
    # ... rest of code
```

### Update existing codes (annual refresh)

```bash
# Download new year
python import_icd10.py --year 2025

# Script automatically upserts (updates changed codes)
```

---

## 🤝 Contributing

Found a better free data source? Improved the import speed?

1. Fork the repo
2. Update `import_icd10.py`
3. Test with: `python import_icd10.py --verify-only`
4. Submit PR

---

## 📝 License

All code in this directory: **MIT License** (free to use, modify, distribute)

All data sources: **Public domain** or **Free for non-commercial use**

**No attribution required** (but appreciated!)

---

## 🚨 Important Notes

1. **Service Key Security**: 
   - NEVER commit your service key to Git
   - Use environment variables only
   - Rotate keys if exposed

2. **Free Tier Limits**:
   - Supabase free tier: 500 MB database
   - Import uses ~35 MB (plenty of room)
   - Can handle 100K+ users on free tier

3. **Annual Updates**:
   - CDC releases new codes every October
   - Re-run import script yearly
   - Script handles upserts automatically

4. **Backup**:
   - Always export to JSON first (`--export-json`)
   - Keep local backup before re-importing
   - Supabase has automatic backups (7 days)

---

## 📞 Support

- **Issues**: https://github.com/yourusername/icd10-mobile/issues
- **Discussions**: https://github.com/yourusername/icd10-mobile/discussions
- **Email**: support@yourapp.com

**Free support channels only** - no paid support needed!

---

**Built with ❤️ using only FREE resources**

Cost to import 72,000 ICD-10 codes: **$0.00**

Time saved for clinicians: **Priceless** 🌍
