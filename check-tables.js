const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hwclojaalnzruviubxju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2xvamFhbG56cnV2aXVieGp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA4MTYzNCwiZXhwIjoyMDc5NjU3NjM0fQ.1em5TT2fvcUFU-fEnfKB26_V4PTvL00jiYS6kOBaHDU'
);

async function checkTables() {
  console.log('🔍 Checking Supabase tables...\n');
  
  const tables = ['icd10_codes', 'favorites', 'user_favorites', 'visit_notes', 'users', 'patients', 'encounters'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count} rows`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  // Try to describe user_favorites if it exists
  console.log('\n📋 Checking user_favorites structure:');
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error:', error.message);
      console.log('Hint:', error.hint);
      console.log('Details:', error.details);
    } else {
      console.log('Sample data:', data);
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
}

checkTables();
