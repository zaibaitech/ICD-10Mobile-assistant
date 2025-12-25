/**
 * NURSING MODULE DATABASE SETUP
 * Run this with: node setup-nursing-db.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  console.error('   Required: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🏥 Phase 6 Nursing Module Database Setup');
console.log('========================================');
console.log('');

async function runSQLFile(filePath, description) {
  console.log(`📄 ${description}...`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Note: Supabase JS client doesn't support raw SQL execution for schema changes
    // We need to use the REST API or CLI
    console.log('⚠️  Direct SQL execution requires Supabase service_role key or CLI');
    console.log('');
    console.log('Please run the following in Supabase SQL Editor:');
    console.log(`https://supabase.com/dashboard/project/${supabaseUrl.match(/https:\/\/([^.]+)/)[1]}/sql/new`);
    console.log('');
    console.log('Copy and paste this file content:');
    console.log(`   ${filePath}`);
    console.log('');
    
    return false;
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return false;
  }
}

async function verifyTables() {
  console.log('🔍 Verifying tables exist...');
  console.log('');
  
  const tables = [
    'nanda_diagnoses',
    'nic_interventions', 
    'noc_outcomes',
    'icd10_nanda_mappings',
    'nanda_nic_noc_linkages',
    'nursing_care_plans',
    'care_plan_items',
    'sbar_reports',
    'nursing_assessments'
  ];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: Not found`);
      } else {
        console.log(`✅ ${table}: ${count} rows`);
      }
    } catch (error) {
      console.log(`❌ ${table}: Error - ${error.message}`);
    }
  }
}

async function main() {
  console.log('Option 1: Manual Setup (Recommended)');
  console.log('=====================================');
  console.log('');
  console.log('1. Open Supabase SQL Editor:');
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log('');
  console.log('2. Copy and paste the contents of:');
  console.log('   database/nursing-schema.sql');
  console.log('   Then click "Run"');
  console.log('');
  console.log('3. Copy and paste the contents of:');
  console.log('   database/seeds/nursing-sample-data.sql');
  console.log('   Then click "Run"');
  console.log('');
  console.log('4. Run this script again to verify:');
  console.log('   node setup-nursing-db.js --verify');
  console.log('');
  
  if (process.argv.includes('--verify')) {
    console.log('');
    console.log('Verification Mode');
    console.log('=================');
    console.log('');
    await verifyTables();
  }
  
  console.log('');
  console.log('Option 2: Using Supabase CLI');
  console.log('============================');
  console.log('');
  console.log('If you have Supabase CLI installed:');
  console.log('  chmod +x setup-nursing-db.sh');
  console.log('  ./setup-nursing-db.sh');
  console.log('');
}

main().catch(console.error);
