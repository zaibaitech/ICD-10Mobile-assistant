# 🚨 QUICK FIX: Run Schema Before Sample Data

## The Problem
You tried to run `nursing-sample-data.sql` first, but the tables don't exist yet!

## ✅ The Solution (2 Steps)

### Step 1: Create Tables (Schema)
1. Go to Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/hwclojaalnzruviubxju/sql/new
   ```

2. Copy **ALL** contents from:
   ```
   /workspaces/ICD-10Mobile-assistant/database/nursing-schema.sql
   ```

3. Paste and click **"Run"**
   - You should see: ✅ Success. No rows returned

### Step 2: Load Sample Data
1. Click **"New Query"** in Supabase SQL Editor

2. Copy **ALL** contents from:
   ```
   /workspaces/ICD-10Mobile-assistant/database/seeds/nursing-sample-data.sql
   ```

3. Paste and click **"Run"**
   - You should see: ✅ Success. No rows returned

### Step 3: Verify
Run this query to confirm everything worked:

```sql
SELECT 
  (SELECT COUNT(*) FROM nanda_diagnoses) as nanda,
  (SELECT COUNT(*) FROM nic_interventions) as nic,
  (SELECT COUNT(*) FROM noc_outcomes) as noc,
  (SELECT COUNT(*) FROM icd10_nanda_mappings) as mappings;
```

**Expected Result:**
| nanda | nic | noc | mappings |
|-------|-----|-----|----------|
| 25    | 12  | 9   | 13       |

---

## 🎯 That's It!

Your nursing database will be fully set up and ready to use.
