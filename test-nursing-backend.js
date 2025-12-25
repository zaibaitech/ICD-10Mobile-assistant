/**
 * NURSING MODULE BACKEND TEST SUITE
 * Tests all nursing services, ICD-10→NANDA bridge, and database queries
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (details) console.log(`   ${details}`);
  
  results.tests.push({ name, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

// ============================================
// 1. DATABASE TABLES TEST
// ============================================
async function testDatabaseTables() {
  console.log('\n📊 TESTING DATABASE TABLES...\n');

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
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        logTest(`Table exists: ${table}`, false, error.message);
      } else {
        logTest(`Table exists: ${table}`, true, `${count} rows`);
      }
    } catch (err) {
      logTest(`Table exists: ${table}`, false, err.message);
    }
  }
}

// ============================================
// 2. SAMPLE DATA TEST
// ============================================
async function testSampleData() {
  console.log('\n📦 TESTING SAMPLE DATA...\n');

  // Test NANDA diagnoses
  try {
    const { data, error, count } = await supabase
      .from('nanda_diagnoses')
      .select('*', { count: 'exact' });

    const expected = 25;
    const passed = !error && count >= expected;
    logTest('NANDA diagnoses loaded', passed, 
      `Expected: ${expected}, Found: ${count || 0}`);

    if (data && data.length > 0) {
      const sample = data[0];
      const hasFields = sample.code && sample.label && sample.definition;
      logTest('NANDA structure valid', hasFields, 
        `Sample: ${sample.code} - ${sample.label?.substring(0, 30)}...`);
    }
  } catch (err) {
    logTest('NANDA diagnoses loaded', false, err.message);
  }

  // Test NIC interventions
  try {
    const { data, error, count } = await supabase
      .from('nic_interventions')
      .select('*', { count: 'exact' });

    const expected = 12;
    const passed = !error && count >= expected;
    logTest('NIC interventions loaded', passed, 
      `Expected: ${expected}, Found: ${count || 0}`);
  } catch (err) {
    logTest('NIC interventions loaded', false, err.message);
  }

  // Test NOC outcomes
  try {
    const { data, error, count } = await supabase
      .from('noc_outcomes')
      .select('*', { count: 'exact' });

    const expected = 9;
    const passed = !error && count >= expected;
    logTest('NOC outcomes loaded', passed, 
      `Expected: ${expected}, Found: ${count || 0}`);
  } catch (err) {
    logTest('NOC outcomes loaded', false, err.message);
  }

  // Test ICD-10→NANDA mappings (THE KEY DIFFERENTIATOR)
  try {
    const { data, error, count } = await supabase
      .from('icd10_nanda_mappings')
      .select('*', { count: 'exact' });

    const expected = 13;
    const passed = !error && count >= expected;
    logTest('ICD-10→NANDA mappings loaded', passed, 
      `Expected: ${expected}, Found: ${count || 0}`);

    if (data && data.length > 0) {
      const sample = data[0];
      const hasFields = sample.icd10_id && sample.nanda_id && sample.relevance;
      logTest('ICD-10→NANDA structure valid', hasFields, 
        `Sample relevance: ${sample.relevance}, evidence: ${sample.evidence_level}`);
    }
  } catch (err) {
    logTest('ICD-10→NANDA mappings loaded', false, err.message);
  }

  // Test NNN linkages
  try {
    const { data, error, count } = await supabase
      .from('nanda_nic_noc_linkages')
      .select('*', { count: 'exact' });

    const expected = 11;
    const passed = !error && count >= expected;
    logTest('NANDA-NIC-NOC linkages loaded', passed, 
      `Expected: ${expected}, Found: ${count || 0}`);
  } catch (err) {
    logTest('NANDA-NIC-NOC linkages loaded', false, err.message);
  }
}

// ============================================
// 3. ICD-10→NANDA BRIDGE TEST (CRITICAL!)
// ============================================
async function testICD10NANDABridge() {
  console.log('\n🌉 TESTING ICD-10→NANDA BRIDGE (THE DIFFERENTIATOR)...\n');

  // Test: Get NANDA diagnoses for Hypertension (I10)
  try {
    const { data: icd10Data } = await supabase
      .from('icd10_codes')
      .select('id')
      .eq('code', 'I10')
      .single();

    if (icd10Data) {
      const { data, error } = await supabase
        .from('icd10_nanda_mappings')
        .select(`
          *,
          nanda:nanda_diagnoses(code, label, definition, diagnosis_type),
          icd10:icd10_codes(code, short_title)
        `)
        .eq('icd10_id', icd10Data.id);

      const passed = !error && data && data.length >= 3;
      logTest('Hypertension (I10) → NANDA mappings', passed, 
        `Found ${data?.length || 0} mappings (Expected: 3)`);

      if (data && data.length > 0) {
        console.log('   Mappings:');
        data.forEach(m => {
          console.log(`     - ${m.nanda?.code}: ${m.nanda?.label} (${m.relevance})`);
        });
      }
    } else {
      logTest('Hypertension (I10) → NANDA mappings', false, 
        'ICD-10 code I10 not found in database');
    }
  } catch (err) {
    logTest('Hypertension (I10) → NANDA mappings', false, err.message);
  }

  // Test: Get NANDA diagnoses for Diabetes (E11.9)
  try {
    const { data: icd10Data } = await supabase
      .from('icd10_codes')
      .select('id')
      .eq('code', 'E11.9')
      .single();

    if (icd10Data) {
      const { data, error } = await supabase
        .from('icd10_nanda_mappings')
        .select(`
          *,
          nanda:nanda_diagnoses(code, label, diagnosis_type),
          icd10:icd10_codes(code, short_title)
        `)
        .eq('icd10_id', icd10Data.id);

      const passed = !error && data && data.length >= 4;
      logTest('Diabetes (E11.9) → NANDA mappings', passed, 
        `Found ${data?.length || 0} mappings (Expected: 4)`);

      if (data && data.length > 0) {
        console.log('   Mappings:');
        data.forEach(m => {
          console.log(`     - ${m.nanda?.code}: ${m.nanda?.label} (${m.relevance})`);
        });
      }
    } else {
      logTest('Diabetes (E11.9) → NANDA mappings', false, 
        'ICD-10 code E11.9 not found in database');
    }
  } catch (err) {
    logTest('Diabetes (E11.9) → NANDA mappings', false, err.message);
  }

  // Test: Relevance levels
  try {
    const { data, error } = await supabase
      .from('icd10_nanda_mappings')
      .select('relevance')
      .in('relevance', ['primary', 'secondary', 'related']);

    const passed = !error && data && data.length > 0;
    logTest('Relevance levels (primary/secondary/related)', passed, 
      `Found ${data?.length || 0} mappings with valid relevance`);
  } catch (err) {
    logTest('Relevance levels', false, err.message);
  }
}

// ============================================
// 4. NANDA SEARCH & BROWSE TEST
// ============================================
async function testNANDASearch() {
  console.log('\n🔍 TESTING NANDA SEARCH & BROWSE...\n');

  // Test: Search by keyword
  try {
    const { data, error } = await supabase
      .from('nanda_diagnoses')
      .select('*')
      .or('label.ilike.%pain%,definition.ilike.%pain%');

    const passed = !error && data && data.length >= 2;
    logTest('Search NANDA by keyword "pain"', passed, 
      `Found ${data?.length || 0} diagnoses`);

    if (data && data.length > 0) {
      console.log(`   - ${data[0].code}: ${data[0].label}`);
    }
  } catch (err) {
    logTest('Search NANDA by keyword', false, err.message);
  }

  // Test: Filter by domain
  try {
    const { data, error } = await supabase
      .from('nanda_diagnoses')
      .select('*')
      .eq('domain', 'Safety/Protection');

    const passed = !error && data && data.length > 0;
    logTest('Filter NANDA by domain', passed, 
      `Found ${data?.length || 0} diagnoses in Safety/Protection domain`);
  } catch (err) {
    logTest('Filter NANDA by domain', false, err.message);
  }

  // Test: Filter by diagnosis type
  try {
    const { data, error } = await supabase
      .from('nanda_diagnoses')
      .select('*')
      .eq('diagnosis_type', 'risk');

    const passed = !error && data && data.length > 0;
    logTest('Filter NANDA by type (risk)', passed, 
      `Found ${data?.length || 0} risk diagnoses`);
  } catch (err) {
    logTest('Filter NANDA by type', false, err.message);
  }
}

// ============================================
// 5. NNN LINKAGES TEST
// ============================================
async function testNNNLinkages() {
  console.log('\n🔗 TESTING NANDA-NIC-NOC LINKAGES...\n');

  // Test: Get NIC & NOC for a NANDA diagnosis
  try {
    const { data: nandaData } = await supabase
      .from('nanda_diagnoses')
      .select('id')
      .eq('code', '00030') // Impaired Gas Exchange
      .single();

    if (nandaData) {
      const { data, error } = await supabase
        .from('nanda_nic_noc_linkages')
        .select(`
          *,
          nanda:nanda_diagnoses(code, label),
          nic:nic_interventions(code, label),
          noc:noc_outcomes(code, label)
        `)
        .eq('nanda_id', nandaData.id);

      const passed = !error && data && data.length >= 2;
      logTest('NNN linkages for Impaired Gas Exchange', passed, 
        `Found ${data?.length || 0} linkages`);

      if (data && data.length > 0) {
        console.log('   Linkages:');
        data.forEach(l => {
          console.log(`     - NIC ${l.nic?.code}: ${l.nic?.label}`);
          console.log(`       NOC ${l.noc?.code}: ${l.noc?.label}`);
        });
      }
    }
  } catch (err) {
    logTest('NNN linkages', false, err.message);
  }

  // Test: Priority levels
  try {
    const { data, error } = await supabase
      .from('nanda_nic_noc_linkages')
      .select('*')
      .eq('priority', 1);

    const passed = !error && data && data.length > 0;
    logTest('Priority 1 linkages exist', passed, 
      `Found ${data?.length || 0} high-priority linkages`);
  } catch (err) {
    logTest('Priority linkages', false, err.message);
  }
}

// ============================================
// 6. VIEWS TEST
// ============================================
async function testViews() {
  console.log('\n👁️  TESTING DATABASE VIEWS...\n');

  // Test: icd10_with_nanda view
  try {
    const { data, error } = await supabase
      .from('icd10_with_nanda')
      .select('*')
      .limit(5);

    const passed = !error && data && data.length > 0;
    logTest('icd10_with_nanda view', passed, 
      `Returned ${data?.length || 0} rows`);

    if (data && data.length > 0) {
      const sample = data[0];
      console.log(`   Sample: ICD ${sample.icd10_code} → NANDA ${sample.nanda_code}`);
    }
  } catch (err) {
    logTest('icd10_with_nanda view', false, err.message);
  }

  // Test: care_plans_complete view
  try {
    const { data, error } = await supabase
      .from('care_plans_complete')
      .select('*')
      .limit(1);

    // May be empty if no care plans created yet, but view should exist
    const passed = !error;
    logTest('care_plans_complete view', passed, 
      error ? error.message : 'View accessible (may be empty)');
  } catch (err) {
    logTest('care_plans_complete view', false, err.message);
  }
}

// ============================================
// 7. RLS POLICIES TEST
// ============================================
async function testRLSPolicies() {
  console.log('\n🔒 TESTING RLS POLICIES...\n');

  // Test: Public read access to reference tables
  try {
    const { data, error } = await supabase
      .from('nanda_diagnoses')
      .select('code')
      .limit(1);

    const passed = !error;
    logTest('RLS allows read: nanda_diagnoses', passed, 
      error ? error.message : 'Read access granted');
  } catch (err) {
    logTest('RLS read access', false, err.message);
  }

  try {
    const { data, error } = await supabase
      .from('nic_interventions')
      .select('code')
      .limit(1);

    const passed = !error;
    logTest('RLS allows read: nic_interventions', passed, 
      error ? error.message : 'Read access granted');
  } catch (err) {
    logTest('RLS read access', false, err.message);
  }

  try {
    const { data, error } = await supabase
      .from('noc_outcomes')
      .select('code')
      .limit(1);

    const passed = !error;
    logTest('RLS allows read: noc_outcomes', passed, 
      error ? error.message : 'Read access granted');
  } catch (err) {
    logTest('RLS read access', false, err.message);
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   NURSING MODULE BACKEND TEST SUITE            ║');
  console.log('║   Testing Database, Services, & ICD-10 Bridge  ║');
  console.log('╚════════════════════════════════════════════════╝');

  try {
    await testDatabaseTables();
    await testSampleData();
    await testICD10NANDABridge();
    await testNANDASearch();
    await testNNNLinkages();
    await testViews();
    await testRLSPolicies();

    // Summary
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║              TEST SUMMARY                      ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Total:  ${results.passed + results.failed}`);
    
    const percentage = Math.round((results.passed / (results.passed + results.failed)) * 100);
    console.log(`\n📈 Success Rate: ${percentage}%`);

    if (results.failed > 0) {
      console.log('\n⚠️  FAILED TESTS:');
      results.tests
        .filter(t => !t.passed)
        .forEach(t => {
          console.log(`   - ${t.name}`);
          if (t.details) console.log(`     ${t.details}`);
        });
    }

    if (percentage === 100) {
      console.log('\n🎉 ALL TESTS PASSED! Backend is fully functional! 🎉');
    } else if (percentage >= 80) {
      console.log('\n✨ Most tests passed. Minor issues to resolve.');
    } else {
      console.log('\n⚠️  Several tests failed. Review database setup.');
    }

    process.exit(results.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
