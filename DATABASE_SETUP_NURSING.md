# 🏥 Nursing Module Database Setup Guide

## Quick Start

You have **3 options** to set up the nursing database:

---

## ✅ **Option 1: Supabase Dashboard (Easiest - Recommended)**

### Step 1: Open Supabase SQL Editor

Go to your project's SQL Editor:
```
https://supabase.com/dashboard/project/hwclojaalnzruviubxju/sql/new
```

### Step 2: Run Schema Migration

1. Click **"New Query"**
2. Copy the entire contents of `database/nursing-schema.sql`
3. Paste into the SQL editor
4. Click **"Run"** (or press Ctrl/Cmd + Enter)

You should see: ✅ Success. No rows returned

### Step 3: Load Sample Data

1. Click **"New Query"** again
2. Copy the entire contents of `database/seeds/nursing-sample-data.sql`
3. Paste into the SQL editor
4. Click **"Run"**

You should see: ✅ Success. No rows returned

### Step 4: Verify Tables

Run this query in SQL Editor:
```sql
-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (
    table_name LIKE 'nanda%' 
    OR table_name LIKE 'nic%' 
    OR table_name LIKE 'noc%'
    OR table_name LIKE 'nursing%'
    OR table_name LIKE 'care%'
    OR table_name LIKE 'sbar%'
  )
ORDER BY table_name;

-- Check data counts
SELECT 
  (SELECT COUNT(*) FROM nanda_diagnoses) as nanda_count,
  (SELECT COUNT(*) FROM nic_interventions) as nic_count,
  (SELECT COUNT(*) FROM noc_outcomes) as noc_count,
  (SELECT COUNT(*) FROM icd10_nanda_mappings) as mapping_count,
  (SELECT COUNT(*) FROM nanda_nic_noc_linkages) as linkages_count;
```

**Expected Results:**
- 9 tables created
- nanda_count: 25
- nic_count: 12
- noc_count: 9
- mapping_count: 13
- linkages_count: 11

---

## 🛠️ **Option 2: Using Node Script**

```bash
# Run the setup script
node setup-nursing-db.js

# Follow the instructions printed
# Then verify with:
node setup-nursing-db.js --verify
```

---

## 🚀 **Option 3: Using Supabase CLI** (If Installed)

```bash
# Make script executable
chmod +x setup-nursing-db.sh

# Run the script
./setup-nursing-db.sh
```

This will:
1. Link to your Supabase project
2. Run the schema migration
3. Load sample data
4. Verify tables were created

---

## 📋 What Gets Created

### Tables (9 total)
1. **nanda_diagnoses** - 25 nursing diagnoses
2. **nic_interventions** - 12 interventions
3. **noc_outcomes** - 9 outcomes
4. **icd10_nanda_mappings** - 13 ICD-10→NANDA mappings ⭐
5. **nanda_nic_noc_linkages** - 11 evidence-based NNN links
6. **nursing_care_plans** - Patient care plans (empty, ready for use)
7. **care_plan_items** - Care plan items (empty)
8. **sbar_reports** - SBAR reports (empty)
9. **nursing_assessments** - Assessments (empty)

### Sample Data Includes
- Pain diagnoses (Acute Pain, Chronic Pain)
- Respiratory issues (Ineffective Breathing Pattern, Gas Exchange)
- Cardiac diagnoses (Activity Intolerance, Decreased Cardiac Output)
- Infection control (Risk for Infection)
- Fall prevention (Risk for Falls)
- And more...

---

## 🔍 Troubleshooting

### Error: "relation already exists"
This is fine! Tables already exist. The schema uses `CREATE TABLE IF NOT EXISTS`.

### Error: "permission denied"
Make sure you're using the SQL Editor with your project credentials, not the anon key.

### No data returned after running sample data
This is expected! The INSERT statements don't return rows. Run the verification query to confirm data was loaded.

### Can't find the SQL Editor
Go to: Supabase Dashboard → Your Project → SQL Editor (left sidebar)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] All 9 tables exist
- [ ] 25 NANDA diagnoses loaded
- [ ] 12 NIC interventions loaded
- [ ] 9 NOC outcomes loaded
- [ ] 13 ICD-10→NANDA mappings loaded
- [ ] RLS policies enabled on care_plans, sbar_reports, assessments

---

## 🎯 Next Steps

Once database is set up:

1. **Test the backend services:**
   ```bash
   node test-nursing-backend.js
   ```

2. **Integrate navigation:**
   See `PHASE6_NAVIGATION_EXAMPLE.tsx`

3. **Test the UI:**
   Run the app and try:
   - Search NANDA diagnoses
   - Create a care plan from ICD-10 codes
   - Generate an SBAR report

---

## 📚 Files Reference

- **Schema**: `database/nursing-schema.sql` (420 lines)
- **Sample Data**: `database/seeds/nursing-sample-data.sql` (600+ lines)
- **Setup Script**: `setup-nursing-db.js` (Node.js)
- **Setup Script**: `setup-nursing-db.sh` (Bash)

---

**Need Help?** Check the complete guide in `PHASE6_IMPLEMENTATION_GUIDE.md`
