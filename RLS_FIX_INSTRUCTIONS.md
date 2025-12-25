# Fix for RLS Profile Creation Error

## Problem
Getting error `42501: new row violates row-level security policy` when creating user profiles during signup.

## Root Cause
During signup, the profile insert happens before the user session is fully established, so `auth.uid()` returns null and the RLS policy blocks the insert.

## Solution
Use a secure database function that runs with elevated privileges (`SECURITY DEFINER`) to create profiles during signup.

## Steps to Apply Fix

### 1. Run SQL in Supabase Dashboard
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `database/fix_rls_policy.sql`
5. Click **Run**

### 2. Verify Function Creation
Run this query to verify the function exists:
```sql
SELECT proname, proowner 
FROM pg_proc 
WHERE proname = 'create_user_profile_on_signup';
```

Should return 1 row.

### 3. Test Registration
1. Stop and restart your app: `npm start`
2. Navigate to Register screen
3. Create a new account with:
   - Valid email (e.g., `test@example.com`)
   - Password (min 6 characters)
   - Your name
   - Select a role

### 4. Verify Success
You should see:
```
✅ Auth user created: [user-id]
✅ Sign up successful with profile for: [email]
```

## What Changed

### Database (`fix_rls_policy.sql`)
- Created `create_user_profile_on_signup()` function with `SECURITY DEFINER`
- Function bypasses RLS and runs with elevated privileges
- Granted execute permission to `authenticated` and `anon` roles

### Code (`src/services/auth.ts`)
- Changed from direct `.insert()` to `.rpc('create_user_profile_on_signup')`
- Passes all profile fields as function parameters
- More secure and RLS-compatible

## Why This Works
1. Direct INSERT requires RLS policy check → fails because no auth context during signup
2. RPC function runs with SECURITY DEFINER → bypasses RLS
3. Function validates inputs and safely creates profile
4. More secure than disabling RLS or making policy too permissive

## Rollback (If Needed)
If you need to rollback this change:
```sql
DROP FUNCTION IF EXISTS create_user_profile_on_signup;
```

Then revert `src/services/auth.ts` to use direct insert (check git history).
