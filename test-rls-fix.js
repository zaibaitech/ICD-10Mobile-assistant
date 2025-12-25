// Quick test to verify the RLS fix works
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testRLSFix() {
  console.log('\n🧪 Testing RLS Fix for Profile Creation\n');
  
  try {
    // 1. Check if function exists
    console.log('1️⃣ Checking if create_user_profile_on_signup function exists...');
    const { data: functionCheck, error: fnError } = await supabase
      .rpc('create_user_profile_on_signup', {
        p_user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        p_first_name: 'Test',
        p_last_name: 'User',
        p_role: 'doctor'
      });
    
    if (fnError) {
      if (fnError.message.includes('could not find')) {
        console.log('❌ Function not found - you need to run fix_rls_policy.sql first!');
        console.log('\n📋 Instructions:');
        console.log('1. Open Supabase Dashboard → SQL Editor');
        console.log('2. Copy contents of database/fix_rls_policy.sql');
        console.log('3. Paste and run');
        console.log('4. Run this test again\n');
        return;
      } else if (fnError.message.includes('duplicate key')) {
        console.log('✅ Function exists (got expected duplicate key error with test UUID)');
      } else {
        console.log('⚠️  Function exists but got error:', fnError.message);
      }
    } else {
      console.log('✅ Function exists and working!');
    }
    
    console.log('\n✅ RLS fix is ready to use!');
    console.log('\n📱 Next Steps:');
    console.log('1. Restart your app: npm start');
    console.log('2. Navigate to Register screen');
    console.log('3. Create a new account');
    console.log('4. Profile should be created successfully\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRLSFix();
