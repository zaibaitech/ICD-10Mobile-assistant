#!/usr/bin/env node
/**
 * Phase 3 Database Migration Script
 * Run with: node scripts/migrate-phase3.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting Phase 3 database migration...\n');

  // Read SQL file
  const sqlPath = path.join(__dirname, '../database/phase3_clinical.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('📄 Loaded SQL from:', sqlPath);
  console.log('📊 SQL length:', sql.length, 'characters\n');

  try {
    console.log('⚙️  Executing migration...');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.error('\nNote: The exec_sql function may not exist. You need to create it in Supabase:');
      console.error(`
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;
      `);
      process.exit(1);
    }

    console.log('✅ Migration executed successfully!\n');
    console.log('📋 Verifying tables...');

    // Verify tables were created
    const tables = ['patients', 'encounters', 'encounter_icd10_codes', 'encounter_ai_results', 'clinical_analysis_logs'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ⚠️  ${table}: Not accessible (${error.message})`);
      } else {
        console.log(`   ✓ ${table}: Ready (${count || 0} rows)`);
      }
    }

    console.log('\n🎉 Phase 3 migration complete!');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

runMigration();
