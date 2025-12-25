// Test ICD-10 → NANDA Bridge fix
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testBridge() {
  console.log('🧪 Testing ICD-10 → NANDA Bridge Service\n');
  
  try {
    // Step 1: Get an ICD-10 code that has mappings (Hypertension - I10)
    const { data: icd10, error: icd10Error } = await supabase
      .from('icd10_codes')
      .select('id, code, short_title, long_description')
      .eq('code', 'I10')
      .single();
    
    if (icd10Error) {
      console.error('❌ Error getting ICD-10 code:', icd10Error.message);
      return;
    }
    
    console.log('✅ Found ICD-10 Code:');
    console.log('   Code:', icd10.code);
    console.log('   Title:', icd10.short_title);
    console.log('   Description:', icd10.long_description);
    console.log();
    
    // Step 2: Test the bridge query with correct column names
    const { data: mappings, error: mappingError } = await supabase
      .from('icd10_nanda_mappings')
      .select(`
        *,
        icd10_code:icd10_codes(id, code, short_title, long_description),
        nanda_diagnosis:nanda_diagnoses(*)
      `)
      .eq('icd10_id', icd10.id);
    
    if (mappingError) {
      console.error('❌ Error getting mappings:', mappingError.message);
      return;
    }
    
    console.log(`✅ Found ${mappings?.length || 0} NANDA mappings for ${icd10.code}:\n`);
    
    mappings?.forEach((mapping, index) => {
      console.log(`${index + 1}. NANDA ${mapping.nanda_diagnosis.code} - ${mapping.nanda_diagnosis.label}`);
      console.log(`   Relevance: ${mapping.relevance.toUpperCase()}`);
      console.log(`   Rationale: ${mapping.rationale}`);
      console.log(`   Evidence: ${mapping.evidence_level}`);
      console.log();
    });
    
    // Step 3: Test NNN linkages for first mapping
    if (mappings && mappings.length > 0) {
      const firstMapping = mappings[0];
      const { data: linkages, error: linkageError } = await supabase
        .from('nanda_nic_noc_linkages')
        .select(`
          *,
          nic:nic_interventions(*),
          noc:noc_outcomes(*)
        `)
        .eq('nanda_id', firstMapping.nanda_id);
      
      if (!linkageError && linkages && linkages.length > 0) {
        console.log(`📊 NNN Linkages for ${firstMapping.nanda_diagnosis.code}:\n`);
        linkages.forEach(link => {
          console.log(`   Intervention: ${link.nic.code} - ${link.nic.label}`);
          console.log(`   Outcome: ${link.noc.code} - ${link.noc.label}`);
          console.log(`   Priority: ${link.priority}, Evidence: ${link.evidence_level}`);
          console.log();
        });
      }
    }
    
    console.log('🎉 Bridge test completed successfully!');
    console.log('✅ All queries use correct column names (short_title, long_description)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBridge()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
