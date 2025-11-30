#!/usr/bin/env node

/**
 * Phase 5 Database Migration Runner
 * Executes the clinical features database schema
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../mcp-server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting Phase 5 Clinical Features Migration...\n');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../database/phase5_clinical_features.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Read SQL file:', sqlPath);
    console.log('📏 SQL content length:', sqlContent.length, 'characters\n');
    
    // Execute the SQL
    console.log('⚡ Executing SQL migration...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });
    
    if (error) {
      // Try direct approach if RPC doesn't exist
      console.log('📝 RPC not available, trying direct SQL execution...');
      
      // Split SQL into individual statements and execute them
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`📊 Found ${statements.length} SQL statements to execute\n`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (stmt.trim()) {
          try {
            console.log(`[${i + 1}/${statements.length}] Executing statement...`);
            
            // Use the raw SQL query method
            const { error: execError } = await supabase
              .from('_temp')  // This will fail but allows us to execute raw SQL
              .select('*')
              .limit(0);
            
            // Try using the SQL editor approach
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey
              },
              body: JSON.stringify({ sql: stmt + ';' })
            });
            
            if (response.ok) {
              successCount++;
              console.log(`✅ Statement ${i + 1} executed successfully`);
            } else {
              errorCount++;
              const errorText = await response.text();
              console.log(`⚠️ Statement ${i + 1} failed: ${errorText}`);
            }
          } catch (stmtError) {
            errorCount++;
            console.log(`⚠️ Statement ${i + 1} error: ${stmtError.message}`);
          }
        }
      }
      
      console.log(`\n📊 Migration Summary:`);
      console.log(`✅ Successful statements: ${successCount}`);
      console.log(`⚠️ Failed statements: ${errorCount}`);
      
      if (errorCount === 0) {
        console.log('\n🎉 Phase 5 migration completed successfully!');
      } else {
        console.log(`\n⚠️ Migration completed with ${errorCount} errors. Please check the statements manually.`);
      }
      
    } else {
      console.log('✅ SQL executed successfully via RPC');
      console.log('Response:', data);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Provide manual instructions
    console.log('\n📝 Manual Migration Instructions:');
    console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Paste the contents of database/phase5_clinical_features.sql');
    console.log('4. Click "Run" to execute the migration');
    console.log('\nThe SQL file contains all necessary tables, indexes, and seed data.');
    
    process.exit(1);
  }
}

// Alternative: Simple table check
async function checkTables() {
  console.log('\n🔍 Checking if Phase 5 tables exist...');
  
  try {
    const tables = [
      'medications',
      'drug_interactions', 
      'drug_contraindications',
      'patient_medications',
      'lab_tests',
      'patient_lab_results'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`❌ Table ${table}: Not found (${error.message})`);
      } else {
        console.log(`✅ Table ${table}: Exists`);
      }
    }
    
    // Check for seed data
    console.log('\n📊 Checking seed data...');
    const { data: medications } = await supabase
      .from('medications')
      .select('count', { count: 'exact' });
      
    const { data: interactions } = await supabase
      .from('drug_interactions')
      .select('count', { count: 'exact' });
      
    console.log(`💊 Medications: ${medications?.[0]?.count || 0} records`);
    console.log(`🔗 Drug interactions: ${interactions?.[0]?.count || 0} records`);
    
  } catch (error) {
    console.log('❌ Could not check tables:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🏥 Phase 5: Clinical Features Database Migration\n');
  
  // First check if tables already exist
  await checkTables();
  
  console.log('\n' + '='.repeat(50));
  console.log('Starting migration...\n');
  
  await runMigration();
  
  // Check tables again after migration
  await checkTables();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Test the Clinical Tools screen in your app');
  console.log('2. Verify drug interaction checker works');
  console.log('3. Verify lab results interpreter works');
  console.log('4. Follow PHASE5_QUICK_TEST.md for testing guide');
  
  console.log('\n✨ Phase 5 migration process complete!');
}

if (require.main === module) {
  main().catch(console.error);
}