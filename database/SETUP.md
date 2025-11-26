# Database Setup Guide

This guide will help you set up the Supabase database for the ICD-10 Mobile Assistant.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create a free account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: ICD-10 Mobile Assistant
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the closest region to your users
5. Click "Create new project"
6. Wait for the project to be provisioned (~2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase project, go to the **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see success messages for each table created

## Step 3: Verify the Setup

### Check Tables

1. Go to **Table Editor** in the left sidebar
2. You should see two tables:
   - `icd10_codes` - should have 15 sample records
   - `user_favorites` - should be empty

### Check Row Level Security

1. Click on `user_favorites` table
2. Click the **RLS** (Row Level Security) tab
3. Verify that:
   - RLS is **Enabled**
   - Policy "Users manage own favorites" exists

## Step 4: Get Your API Credentials

1. Go to **Settings** > **API** (left sidebar)
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 5: Configure the Mobile App

1. In your project root, copy the `.env.example` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 6: Enable Email Authentication

1. In Supabase, go to **Authentication** > **Providers**
2. Make sure **Email** provider is enabled (it should be by default)
3. Configure email settings if needed:
   - Go to **Authentication** > **Email Templates** to customize emails
   - Go to **Authentication** > **URL Configuration** for redirect URLs

## Optional: Add More ICD-10 Codes

The schema includes 15 sample codes. To add more:

1. Use the **Table Editor**:
   - Go to `icd10_codes` table
   - Click "Insert row"
   - Fill in the fields

2. Or use SQL bulk insert:
   ```sql
   INSERT INTO icd10_codes (code, short_title, long_description, chapter) VALUES
   ('A00.0', 'Cholera due to Vibrio cholerae', 'Cholera due to Vibrio cholerae 01, biovar cholerae', 'Infectious Diseases'),
   ('B20', 'HIV disease', 'Human immunodeficiency virus [HIV] disease', 'Infectious Diseases');
   -- Add more codes as needed
   ```

## Troubleshooting

### Issue: "relation does not exist"
- Make sure you ran the entire schema.sql file
- Check that you're in the correct project

### Issue: "permission denied"
- Verify RLS policies are set up correctly
- Make sure you're using the anon key, not the service role key in the app

### Issue: Can't insert into user_favorites
- The user must be authenticated
- The icd10_id must exist in the icd10_codes table
- Check RLS policy allows the operation

### Issue: Search returns no results
- Verify data was inserted correctly
- Check that indexes were created successfully
- Try running: `SELECT * FROM icd10_codes LIMIT 10;`

## Testing the Database

You can test the database directly in Supabase SQL Editor:

```sql
-- Test 1: Check if codes exist
SELECT COUNT(*) FROM icd10_codes;

-- Test 2: Search for a code
SELECT * FROM icd10_codes WHERE code ILIKE '%I10%';

-- Test 3: Get all chapters
SELECT DISTINCT chapter FROM icd10_codes ORDER BY chapter;

-- Test 4: Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_favorites';
```

## Phase 3: Clinical Support Module (Patients & Encounters)

If you need the full clinical support features, run the Phase 3 schema:

### Run Phase 3 Schema

1. In Supabase SQL Editor, create a new query
2. Copy the contents of `database/phase3_clinical.sql`
3. Paste and click **Run**

This creates 5 additional tables:
- `patients` - Patient records
- `encounters` - Clinical encounters/visits
- `encounter_icd10_codes` - Links encounters to ICD-10 codes
- `encounter_ai_results` - Detailed AI analysis results
- `clinical_analysis_logs` - Audit trail for all analyses

### Verify Phase 3 Setup

```sql
-- Check that Phase 3 tables exist
SELECT tablename FROM pg_tables 
WHERE tablename IN ('patients', 'encounters', 'encounter_icd10_codes', 'encounter_ai_results', 'clinical_analysis_logs')
ORDER BY tablename;

-- Should return 5 tables
```

### Phase 3 Testing

```sql
-- Test 1: Insert a test patient
INSERT INTO patients (user_id, display_label, year_of_birth, sex)
VALUES (auth.uid(), 'Test Patient', 1980, 'unknown')
RETURNING *;

-- Test 2: Verify RLS on patients
SELECT * FROM patients;
```

## Next Steps

Once your database is set up:

1. Verify your `.env` file has the correct credentials
2. Run `npm install` to ensure all dependencies are installed
3. Run `npm start` to launch the Expo development server
4. Create a test account in the app
5. Start searching and saving ICD-10 codes!

## Need Help?

- Supabase Docs: https://supabase.com/docs
- React Native Docs: https://reactnative.dev/docs/getting-started
- Expo Docs: https://docs.expo.dev/
