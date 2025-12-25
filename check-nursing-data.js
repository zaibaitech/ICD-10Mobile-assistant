// Check if nursing tables have real data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkNursingData() {
  console.log('🔍 Checking Nursing Module Tables:\n');
  
  // Check NANDA diagnoses
  const { data: nanda, error: nandaError } = await supabase
    .from('nanda_diagnoses')
    .select('id, code, label')
    .limit(5);
  
  console.log('📊 NANDA Diagnoses:', nandaError ? '❌ ERROR: ' + nandaError.message : `✅ ${nanda?.length || 0} records (showing first 5)`);
  if (nanda) nanda.forEach(d => console.log('   •', d.code, '-', d.label));
  
  // Check NIC interventions
  const { data: nic, error: nicError } = await supabase
    .from('nic_interventions')
    .select('id, code, label')
    .limit(5);
  
  console.log('\n📊 NIC Interventions:', nicError ? '❌ ERROR: ' + nicError.message : `✅ ${nic?.length || 0} records (showing first 5)`);
  if (nic) nic.forEach(i => console.log('   •', i.code, '-', i.label));
  
  // Check NOC outcomes
  const { data: noc, error: nocError } = await supabase
    .from('noc_outcomes')
    .select('id, code, label')
    .limit(5);
  
  console.log('\n📊 NOC Outcomes:', nocError ? '❌ ERROR: ' + nocError.message : `✅ ${noc?.length || 0} records (showing first 5)`);
  if (noc) noc.forEach(o => console.log('   •', o.code, '-', o.label));
  
  // Check ICD-10 to NANDA mappings
  const { data: mappings, error: mappingsError } = await supabase
    .from('icd10_nanda_mappings')
    .select('id, relevance')
    .limit(5);
  
  console.log('\n📊 ICD-10→NANDA Mappings:', mappingsError ? '❌ ERROR: ' + mappingsError.message : `✅ ${mappings?.length || 0} records`);
  
  // Check NNN linkages
  const { data: linkages, error: linkagesError } = await supabase
    .from('nanda_nic_noc_linkages')
    .select('id, priority')
    .limit(5);
  
  console.log('📊 NNN Linkages:', linkagesError ? '❌ ERROR: ' + linkagesError.message : `✅ ${linkages?.length || 0} records`);
  
  // Get total counts
  console.log('\n📈 Total Counts:');
  const { count: nandaCount } = await supabase.from('nanda_diagnoses').select('*', { count: 'exact', head: true });
  const { count: nicCount } = await supabase.from('nic_interventions').select('*', { count: 'exact', head: true });
  const { count: nocCount } = await supabase.from('noc_outcomes').select('*', { count: 'exact', head: true });
  const { count: mappingsCount } = await supabase.from('icd10_nanda_mappings').select('*', { count: 'exact', head: true });
  const { count: linkagesCount } = await supabase.from('nanda_nic_noc_linkages').select('*', { count: 'exact', head: true });
  
  console.log('   • NANDA Diagnoses:', nandaCount || 0);
  console.log('   • NIC Interventions:', nicCount || 0);
  console.log('   • NOC Outcomes:', nocCount || 0);
  console.log('   • ICD-10→NANDA Mappings:', mappingsCount || 0);
  console.log('   • NNN Linkages:', linkagesCount || 0);
  
  // Summary
  console.log('\n🎯 Summary:');
  const hasData = nandaCount && nicCount && nocCount && mappingsCount && linkagesCount;
  if (hasData) {
    console.log('✅ All nursing tables contain real data');
    console.log('✅ The nursing features are using REAL DATABASE DATA');
  } else {
    console.log('❌ Some nursing tables are empty or missing data');
    console.log('⚠️  You may need to run the seed file: database/seeds/nursing-sample-data.sql');
  }
}

checkNursingData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
