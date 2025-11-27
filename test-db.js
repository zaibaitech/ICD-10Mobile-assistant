const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hwclojaalnzruviubxju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2xvamFhbG56cnV2aXVieGp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA4MTYzNCwiZXhwIjoyMDc5NjU3NjM0fQ.1em5TT2fvcUFU-fEnfKB26_V4PTvL00jiYS6kOBaHDU'
);

async function checkDatabase() {
  console.log('🔍 Checking Supabase Database...\n');
  
  const tables = ['icd10_codes', 'favorites', 'visit_notes', 'users', 'patients', 'encounters'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${table}: NOT FOUND (${error.message})`);
    } else {
      console.log(`✅ ${table}: ${count} rows`);
    }
  }
  
  console.log('\n📋 Sample ICD-10 Codes:');
  const { data: codes } = await supabase
    .from('icd10_codes')
    .select('code, description')
    .limit(10);
  
  if (codes) {
    codes.forEach(c => console.log(`  ${c.code}: ${c.description}`));
  }
}

checkDatabase();
