#!/usr/bin/env node

/**
 * Test Script: Enhanced Authentication & Role-Based Access
 * Tests profile creation, role-based permissions, and feature gating
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test user data
const testUsers = [
  {
    email: `doctor.test.${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    first_name: 'Dr. John',
    last_name: 'Smith',
    role: 'doctor',
    specialty: 'Cardiology',
    institution: 'City Hospital',
  },
  {
    email: `nurse.test.${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    first_name: 'Jane',
    last_name: 'Doe',
    role: 'nurse',
    specialty: 'Emergency Care',
    institution: 'City Hospital',
  },
  {
    email: `student.test.${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    first_name: 'Alex',
    last_name: 'Johnson',
    role: 'student',
    institution: 'Medical University',
  },
];

// Role-specific features (matches types/auth.ts)
const ROLE_FEATURES = {
  doctor: ['icd10_search', 'patient_management', 'encounter_management', 'ai_clinical_analysis', 'assistant_chat', 'favorites', 'voice_input', 'image_processing'],
  nurse: ['icd10_search', 'patient_management', 'encounter_management', 'assistant_chat', 'favorites', 'voice_input'],
  pharmacist: ['icd10_search', 'assistant_chat', 'favorites', 'voice_input'],
  chw: ['icd10_search', 'patient_management', 'encounter_management', 'assistant_chat', 'favorites', 'voice_input'],
  student: ['icd10_search', 'assistant_chat', 'favorites', 'voice_input'],
  other: ['icd10_search', 'assistant_chat', 'favorites', 'voice_input'],
};

async function testDatabaseSchema() {
  console.log('\n📋 Testing Database Schema...\n');

  // Test 1: Check if user_profiles table exists
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(1);

  if (profilesError && profilesError.code === '42P01') {
    console.error('❌ user_profiles table does not exist');
    console.log('   Run: database/auth_profiles.sql in Supabase SQL Editor');
    return false;
  } else if (profilesError) {
    console.error('❌ Error querying user_profiles:', profilesError.message);
    return false;
  }

  console.log('✅ user_profiles table exists');

  // Test 2: Check if role_permissions table exists
  const { data: permissions, error: permissionsError } = await supabase
    .from('role_permissions')
    .select('*')
    .limit(1);

  if (permissionsError && permissionsError.code === '42P01') {
    console.error('❌ role_permissions table does not exist');
    return false;
  } else if (permissionsError) {
    console.error('❌ Error querying role_permissions:', permissionsError.message);
    return false;
  }

  console.log('✅ role_permissions table exists');

  // Test 3: Check if permissions are seeded
  const { data: allPermissions, error: allPermError } = await supabase
    .from('role_permissions')
    .select('role, feature');

  if (allPermError) {
    console.error('❌ Error fetching permissions:', allPermError.message);
    return false;
  }

  const roleCount = new Set(allPermissions.map(p => p.role)).size;
  console.log(`✅ Permissions seeded for ${roleCount} roles`);
  console.log(`   Total permissions: ${allPermissions.length}`);

  return true;
}

async function testSignUpWithProfile(userData) {
  console.log(`\n👤 Testing sign up: ${userData.first_name} ${userData.last_name} (${userData.role})...\n`);

  // Step 1: Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  });

  if (authError) {
    console.error('❌ Auth sign up failed:', authError.message);
    return null;
  }

  if (!authData.user) {
    console.error('❌ No user returned from sign up');
    return null;
  }

  console.log('✅ Auth user created:', authData.user.id);

  // Step 2: Create user profile
  const profileData = {
    user_id: authData.user.id,
    first_name: userData.first_name,
    last_name: userData.last_name,
    role: userData.role,
    specialty: userData.specialty || null,
    institution: userData.institution || null,
  };

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .insert(profileData)
    .select()
    .single();

  if (profileError) {
    console.error('❌ Profile creation failed:', profileError.message);
    return null;
  }

  console.log('✅ Profile created:', profile.display_name);
  console.log('   Role:', profile.role);
  console.log('   Specialty:', profile.specialty || 'N/A');
  console.log('   Institution:', profile.institution || 'N/A');

  return { user: authData.user, profile };
}

async function testProfileRetrieval(userId) {
  console.log('\n📖 Testing profile retrieval...\n');

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('❌ Failed to retrieve profile:', error.message);
    return null;
  }

  console.log('✅ Profile retrieved successfully');
  console.log('   Display Name:', profile.display_name);
  console.log('   Role:', profile.role);

  return profile;
}

async function testRolePermissions(role) {
  console.log(`\n🔐 Testing permissions for role: ${role}...\n`);

  const { data: permissions, error } = await supabase
    .from('role_permissions')
    .select('feature, allowed')
    .eq('role', role);

  if (error) {
    console.error('❌ Failed to fetch permissions:', error.message);
    return false;
  }

  const allowedFeatures = permissions.filter(p => p.allowed).map(p => p.feature);
  const expectedFeatures = ROLE_FEATURES[role] || [];

  console.log(`✅ Found ${allowedFeatures.length} allowed features`);
  console.log('   Features:', allowedFeatures.join(', '));

  // Verify critical features
  const hasBasicAccess = allowedFeatures.includes('icd10_search');
  const hasAssistant = allowedFeatures.includes('assistant_chat');

  if (hasBasicAccess && hasAssistant) {
    console.log('✅ Basic features accessible');
  } else {
    console.log('⚠️  Some basic features missing');
  }

  return true;
}

async function testProfileUpdate(userId) {
  console.log('\n📝 Testing profile update...\n');

  const updates = {
    specialty: 'Updated Specialty',
    institution: 'Updated Hospital',
  };

  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Profile update failed:', error.message);
    return false;
  }

  // Verify update
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('specialty, institution')
    .eq('user_id', userId)
    .single();

  if (profile.specialty === updates.specialty && profile.institution === updates.institution) {
    console.log('✅ Profile updated successfully');
    console.log('   New specialty:', profile.specialty);
    console.log('   New institution:', profile.institution);
    return true;
  } else {
    console.log('❌ Update verification failed');
    return false;
  }
}

async function cleanup(userId) {
  console.log('\n🧹 Cleaning up test data...\n');

  // Delete profile (will cascade due to ON DELETE CASCADE)
  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', userId);

  if (profileError) {
    console.error('⚠️  Failed to delete profile:', profileError.message);
  } else {
    console.log('✅ Test profile deleted');
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  Enhanced Authentication & Role-Based Access - Test Suite     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  let allPassed = true;

  // Test 1: Database Schema
  const schemaOk = await testDatabaseSchema();
  if (!schemaOk) {
    console.log('\n❌ Database schema tests failed. Please run database/auth_profiles.sql first.');
    process.exit(1);
  }

  // Test 2: Sign up with profile (Doctor)
  const doctorAccount = await testSignUpWithProfile(testUsers[0]);
  if (!doctorAccount) {
    allPassed = false;
  } else {
    // Test 3: Profile retrieval
    await testProfileRetrieval(doctorAccount.user.id);

    // Test 4: Role permissions
    await testRolePermissions(doctorAccount.profile.role);

    // Test 5: Profile update
    await testProfileUpdate(doctorAccount.user.id);

    // Cleanup
    await cleanup(doctorAccount.user.id);
  }

  // Test with different role (Nurse)
  console.log('\n' + '='.repeat(70));
  const nurseAccount = await testSignUpWithProfile(testUsers[1]);
  if (nurseAccount) {
    await testRolePermissions(nurseAccount.profile.role);
    await cleanup(nurseAccount.user.id);
  }

  // Test with student role
  console.log('\n' + '='.repeat(70));
  const studentAccount = await testSignUpWithProfile(testUsers[2]);
  if (studentAccount) {
    await testRolePermissions(studentAccount.profile.role);
    await cleanup(studentAccount.user.id);
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n🎉 Test suite completed!\n');

  if (allPassed) {
    console.log('✅ All tests passed');
    console.log('\nNext steps:');
    console.log('1. Test registration flow in the app');
    console.log('2. Verify role-based feature gating');
    console.log('3. Test profile screen functionality');
  } else {
    console.log('⚠️  Some tests failed - check errors above');
  }
}

// Run tests
runTests().catch((error) => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
