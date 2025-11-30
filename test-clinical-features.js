const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hwclojaalnzruviubxju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2xvamFhbG56cnV2aXVieGp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA4MTYzNCwiZXhwIjoyMDc5NjU3NjM0fQ.1em5TT2fvcUFU-fEnfKB26_V4PTvL00jiYS6kOBaHDU'
);

async function testClinicalFeatures() {
  console.log('🔍 Testing Phase 5 Clinical Features Database Integration\n');
  console.log('='.repeat(60) + '\n');
  
  // 1. Check Phase 5 Tables
  console.log('📊 Phase 5 Tables:');
  const tables = [
    'medications',
    'drug_interactions',
    'drug_contraindications',
    'patient_medications',
    'lab_tests',
    'patient_lab_results'
  ];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`  ❌ ${table}: ERROR (${error.message})`);
    } else {
      console.log(`  ✅ ${table}: ${count} rows`);
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 2. Test Drug Interactions Function
  console.log('💊 Testing Drug Interactions:\n');
  
  const testCases = [
    {
      name: 'Warfarin + Aspirin (Major Interaction)',
      medications: ['warfarin', 'aspirin']
    },
    {
      name: 'Warfarin + Ibuprofen (Major Interaction)',
      medications: ['warfarin', 'ibuprofen']
    },
    {
      name: 'Metformin + Lisinopril (No Interaction)',
      medications: ['metformin', 'lisinopril']
    }
  ];
  
  for (const test of testCases) {
    console.log(`Test: ${test.name}`);
    const { data, error } = await supabase
      .rpc('check_drug_interactions', { medication_names: test.medications });
    
    if (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
    } else if (!data || data.length === 0) {
      console.log(`  ℹ️  No interactions found\n`);
    } else {
      data.forEach(interaction => {
        console.log(`  ⚠️  ${interaction.severity.toUpperCase()}: ${interaction.drug1} + ${interaction.drug2}`);
        console.log(`     ${interaction.description}`);
        console.log(`     Recommendation: ${interaction.recommendation}\n`);
      });
    }
  }
  
  console.log('='.repeat(60) + '\n');
  
  // 3. Test Contraindications
  console.log('🚫 Testing Drug Contraindications:\n');
  
  const { data: contraindications, error: contrError } = await supabase
    .from('drug_contraindications')
    .select('*')
    .ilike('drug_name', '%metformin%')
    .ilike('condition', '%renal%');
  
  if (contrError) {
    console.log(`  ❌ Error: ${contrError.message}\n`);
  } else if (contraindications && contraindications.length > 0) {
    contraindications.forEach(c => {
      console.log(`  🛑 ${c.severity.toUpperCase()}: ${c.drug_name} + ${c.condition}`);
      console.log(`     ${c.description}`);
      if (c.alternatives && c.alternatives.length > 0) {
        console.log(`     Alternatives: ${c.alternatives.join(', ')}\n`);
      } else {
        console.log('');
      }
    });
  } else {
    console.log(`  ℹ️  No contraindications found\n`);
  }
  
  console.log('='.repeat(60) + '\n');
  
  // 4. Test Lab Interpretation Function
  console.log('🧪 Testing Lab Results Interpretation:\n');
  
  const labTests = [
    { name: 'glucose', value: 180, expected: 'HIGH' },
    { name: 'glucose', value: 90, expected: 'NORMAL' },
    { name: 'potassium', value: 2.0, expected: 'CRITICAL-LOW' },
    { name: 'hemoglobin', value: 14, expected: 'NORMAL' },
  ];
  
  for (const lab of labTests) {
    console.log(`Test: ${lab.name} = ${lab.value} (expecting ${lab.expected})`);
    const { data, error } = await supabase
      .rpc('interpret_lab_result', { 
        test_name: lab.name, 
        test_value: lab.value 
      });
    
    if (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
    } else if (!data || data.length === 0) {
      console.log(`  ℹ️  No interpretation available\n`);
    } else {
      const result = data[0];
      const statusMatch = result.status.toUpperCase().replace(/-/g, '-') === lab.expected;
      const icon = statusMatch ? '✅' : '⚠️';
      console.log(`  ${icon} Status: ${result.status.toUpperCase()}`);
      console.log(`     ${result.interpretation}`);
      console.log(`     Clinical: ${result.clinical_significance}\n`);
    }
  }
  
  console.log('='.repeat(60) + '\n');
  
  // 5. Sample Medications
  console.log('💊 Sample Medications in Database:\n');
  const { data: meds } = await supabase
    .from('medications')
    .select('generic_name, drug_class')
    .limit(10);
  
  if (meds) {
    meds.forEach(m => console.log(`  • ${m.generic_name} (${m.drug_class})`));
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // 6. Sample Lab Tests
  console.log('🧪 Sample Lab Tests in Database:\n');
  const { data: labs } = await supabase
    .from('lab_tests')
    .select('test_name, normal_range_min, normal_range_max, unit')
    .limit(10);
  
  if (labs) {
    labs.forEach(l => {
      console.log(`  • ${l.test_name}: ${l.normal_range_min}-${l.normal_range_max} ${l.unit}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Clinical Features Database Integration Test Complete!\n');
}

testClinicalFeatures().catch(console.error);
