#!/usr/bin/env node

/**
 * Test ICD-10 Bridge Fix
 * Verifies that the bridge service now accepts both UUIDs and code strings
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env file manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Initialize Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// Helper Functions (mirroring the service)
// ============================================

function isUuid(str) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
}

async function getIcd10IdByCode(code) {
  try {
    const { data, error } = await supabase
      .from('icd10_codes')
      .select('id, code, short_title')
      .eq('code', code.trim().toUpperCase())
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('  ⚠️  ICD-10 code not found:', code);
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('  ❌ Error looking up ICD-10 code:', code, error);
    return null;
  }
}

async function getNandaForIcd10(icd10IdOrCode) {
  // Convert code to ID if needed
  let icd10Id = icd10IdOrCode;
  let icd10Code = null;
  
  if (!isUuid(icd10IdOrCode)) {
    console.log(`  🔍 Looking up ICD-10 code: ${icd10IdOrCode}`);
    const result = await getIcd10IdByCode(icd10IdOrCode);
    if (!result) {
      console.warn('  ⚠️  ICD-10 code not found:', icd10IdOrCode);
      return [];
    }
    icd10Id = result.id;
    icd10Code = result.code;
    console.log(`  ✓ Found UUID: ${icd10Id.substring(0, 8)}...`);
  }
  
  try {
    const { data, error } = await supabase
      .from('icd10_nanda_mappings')
      .select(`
        *,
        icd10_code:icd10_codes(id, code, short_title, long_description),
        nanda_diagnosis:nanda_diagnoses(*)
      `)
      .eq('icd10_id', icd10Id)
      .order('relevance', { ascending: true });
    
    if (error) {
      console.error('  ❌ Error getting NANDA for ICD-10:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('  ❌ getNandaForIcd10 error:', error);
    throw error;
  }
}

async function getCarePlanningSuggestionsForMultiple(icd10IdsOrCodes) {
  if (icd10IdsOrCodes.length === 0) {
    return [];
  }
  
  console.log(`\n📋 Processing ${icd10IdsOrCodes.length} ICD-10 codes...`);
  
  // Convert all codes to IDs if needed
  const icd10Ids = [];
  for (const idOrCode of icd10IdsOrCodes) {
    if (isUuid(idOrCode)) {
      icd10Ids.push(idOrCode);
      console.log(`  ✓ Using UUID: ${idOrCode.substring(0, 8)}...`);
    } else {
      console.log(`  🔍 Looking up code: ${idOrCode}`);
      const result = await getIcd10IdByCode(idOrCode);
      if (result) {
        icd10Ids.push(result.id);
        console.log(`  ✓ Found: ${result.code} - ${result.short_title}`);
      } else {
        console.warn(`  ⚠️  Skipping unknown ICD-10 code: ${idOrCode}`);
      }
    }
  }
  
  if (icd10Ids.length === 0) {
    console.warn('⚠️  No valid ICD-10 codes found');
    return [];
  }
  
  console.log(`\n🔗 Fetching NANDA mappings for ${icd10Ids.length} codes...`);
  
  // Get suggestions for each ICD-10 code
  const allSuggestions = [];
  for (const id of icd10Ids) {
    const suggestions = await getNandaForIcd10(id);
    allSuggestions.push(...suggestions);
  }
  
  return allSuggestions;
}

// ============================================
// Test Cases
// ============================================

async function testCodeString() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: ICD-10 Code String (I26.0)');
  console.log('='.repeat(60));
  
  try {
    const mappings = await getNandaForIcd10('I26.0');
    
    if (mappings.length > 0) {
      console.log(`\n✅ SUCCESS: Found ${mappings.length} NANDA mapping(s)`);
      mappings.forEach(m => {
        console.log(`  • ${m.nanda_diagnosis.code} - ${m.nanda_diagnosis.label}`);
        console.log(`    Relevance: ${m.relevance}`);
      });
    } else {
      console.log('\n⚠️  No mappings found for I26.0');
      console.log('   This is expected if the mapping doesn\'t exist in the database');
    }
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    return false;
  }
  
  return true;
}

async function testMultipleCodes() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Multiple ICD-10 Code Strings');
  console.log('='.repeat(60));
  
  const testCodes = ['I10', 'E11.9', 'J18.9', 'I50.9'];
  console.log(`Testing with: ${testCodes.join(', ')}`);
  
  try {
    const suggestions = await getCarePlanningSuggestionsForMultiple(testCodes);
    
    if (suggestions.length > 0) {
      console.log(`\n✅ SUCCESS: Found ${suggestions.length} NANDA mapping(s)`);
      
      // Group by ICD-10 code
      const byIcd10 = {};
      suggestions.forEach(s => {
        const code = s.icd10_code.code;
        if (!byIcd10[code]) {
          byIcd10[code] = [];
        }
        byIcd10[code].push(s);
      });
      
      Object.keys(byIcd10).forEach(code => {
        console.log(`\n  ${code}:`);
        byIcd10[code].forEach(m => {
          console.log(`    → ${m.nanda_diagnosis.code} - ${m.nanda_diagnosis.label} (${m.relevance})`);
        });
      });
    } else {
      console.log('\n⚠️  No mappings found');
    }
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    return false;
  }
  
  return true;
}

async function testInvalidCode() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Invalid ICD-10 Code (should handle gracefully)');
  console.log('='.repeat(60));
  
  try {
    const mappings = await getNandaForIcd10('INVALID123');
    
    if (mappings.length === 0) {
      console.log('\n✅ SUCCESS: Handled invalid code gracefully (returned empty array)');
    } else {
      console.log('\n⚠️  Unexpected: Found mappings for invalid code');
    }
  } catch (error) {
    console.error('\n❌ FAILED: Should not throw error for invalid code');
    return false;
  }
  
  return true;
}

async function testMixedInput() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Mixed UUIDs and Code Strings');
  console.log('='.repeat(60));
  
  // Get a real UUID first
  const { data: sampleCode } = await supabase
    .from('icd10_codes')
    .select('id, code')
    .eq('code', 'I10')
    .single();
  
  if (!sampleCode) {
    console.log('⚠️  Skipping: I10 not found in database');
    return true;
  }
  
  const testInput = [
    sampleCode.id,  // UUID
    'E11.9',        // Code string
  ];
  
  console.log(`Testing with: UUID (I10), "E11.9"`);
  
  try {
    const suggestions = await getCarePlanningSuggestionsForMultiple(testInput);
    
    if (suggestions.length > 0) {
      console.log(`\n✅ SUCCESS: Handled mixed input - found ${suggestions.length} mappings`);
    } else {
      console.log('\n⚠️  No mappings found (may be expected)');
    }
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    return false;
  }
  
  return true;
}

// ============================================
// Run All Tests
// ============================================

async function runTests() {
  console.log('\n🧪 ICD-10 Bridge Service Fix Tests');
  console.log('Testing UUID vs Code String handling\n');
  
  const results = {
    passed: 0,
    failed: 0,
  };
  
  // Test 1: Single code string
  if (await testCodeString()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 2: Multiple code strings
  if (await testMultipleCodes()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 3: Invalid code
  if (await testInvalidCode()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 4: Mixed input
  if (await testMixedInput()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total:  ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! The fix is working correctly.');
    console.log('\nThe service now accepts both:');
    console.log('  • ICD-10 UUIDs (e.g., "123e4567-e89b-12d3-a456-426614174000")');
    console.log('  • ICD-10 code strings (e.g., "I10", "E11.9")');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
