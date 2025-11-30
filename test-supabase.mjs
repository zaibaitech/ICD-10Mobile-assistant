import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hwclojaalnzruviubxju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2xvamFhbG56cnV2aXVieGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyODUxMDEsImV4cCI6MjA3OTY0NTEwMX0.mgisYL-sNWjWPbfOEpy9s2gv9J3QT9-qY82m6V-sw4E'
);

console.log('🔍 Testing Supabase Database\n');

// Test 1: Check drug_interactions table
console.log('1️⃣  Checking drug_interactions table...');
const { data: interactions, error: intError } = await supabase
  .from('drug_interactions')
  .select('*');

if (intError) {
  console.log('❌ Error:', intError.message);
  console.log('   Code:', intError.code);
  console.log('   Details:', intError.details);
} else {
  console.log(`✅ Found ${interactions?.length || 0} interactions`);
  if (interactions?.length > 0) {
    console.log('   Sample:', interactions[0].drug1_name, '+', interactions[0].drug2_name, '=', interactions[0].severity);
  }
}

// Test 2: Test RPC function with exact names from database
console.log('\n2️⃣  Testing check_drug_interactions() RPC...');
const testNames = ['Warfarin', 'Aspirin'];
console.log('   Input:', testNames);

const { data: rpcResult, error: rpcError } = await supabase
  .rpc('check_drug_interactions', { medication_names: testNames });

if (rpcError) {
  console.log('❌ RPC Error:', rpcError.message);
  console.log('   Code:', rpcError.code);
} else {
  console.log(`✅ RPC returned ${rpcResult?.length || 0} interactions`);
  if (rpcResult?.length > 0) {
    console.log('   Result:', JSON.stringify(rpcResult[0], null, 2));
  }
}

// Test 3: Test with lowercase (what the app might be sending)
console.log('\n3️⃣  Testing with normalized names (lowercase)...');
const normalizedNames = ['warfarin', 'aspirin'];
console.log('   Input:', normalizedNames);

const { data: rpcResult2, error: rpcError2 } = await supabase
  .rpc('check_drug_interactions', { medication_names: normalizedNames });

if (rpcError2) {
  console.log('❌ Error:', rpcError2.message);
} else {
  console.log(`✅ Found ${rpcResult2?.length || 0} interactions`);
  if (rpcResult2?.length > 0) {
    console.log('   Result:', rpcResult2[0].drug1, '+', rpcResult2[0].drug2);
  }
}

// Test 4: Check lab_tests
console.log('\n4️⃣  Checking lab_tests table...');
const { data: labs, error: labError } = await supabase
  .from('lab_tests')
  .select('test_name, unit')
  .limit(5);

if (labError) {
  console.log('❌ Error:', labError.message);
} else {
  console.log(`✅ Found ${labs?.length || 0} lab tests`);
  if (labs) {
    labs.forEach(lab => console.log('   -', lab.test_name, `(${lab.unit})`));
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 DIAGNOSIS:');
if (!intError && interactions?.length === 0) {
  console.log('⚠️  Tables exist but are EMPTY - SQL not run yet!');
  console.log('   Action: Run phase5_clinical_features.sql in Supabase');
} else if (intError) {
  console.log('❌ Tables do not exist - SQL not run!');
  console.log('   Action: Run phase5_clinical_features.sql in Supabase');
} else if (rpcResult?.length === 0 && rpcResult2?.length === 0) {
  console.log('⚠️  Data exists but RPC function has issues');
  console.log('   Check: Case sensitivity in drug names');
} else {
  console.log('✅ Everything works! App should show interactions.');
  console.log('   If app shows "no interactions", check console for errors');
}
console.log('='.repeat(60));
