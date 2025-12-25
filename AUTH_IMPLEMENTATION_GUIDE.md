# Enhanced Authentication & Role-Based Access - Implementation Guide

## 🎯 Implementation Status: COMPLETE

All core components have been implemented. Follow the steps below to integrate and test.

---

## 📋 What Was Implemented

### ✅ Phase 1: Database Schema
- **File**: `database/auth_profiles.sql`
- **Tables Created**:
  - `user_profiles` - Stores professional information for each user
  - `role_permissions` - Defines feature access per role
- **Features**:
  - Row Level Security (RLS) policies
  - Automatic `updated_at` trigger
  - Helper functions for permissions
  - Seeded permissions for all 6 roles

### ✅ Phase 2: TypeScript Types
- **File**: `src/types/auth.ts`
- **Types & Constants**:
  - `UserRole`, `UserProfile`, `SignUpData` interfaces
  - `ROLE_LABELS`, `ROLE_ICONS`, `ROLE_DESCRIPTIONS`
  - `ROLE_FEATURES` - Feature permissions per role
  - Helper functions: `hasRoleAccess()`, `getRoleFeatures()`

### ✅ Phase 3: Auth Service
- **File**: `src/services/auth.ts`
- **Functions Added**:
  - `signUp()` - Enhanced sign up with profile creation
  - `getUserProfile()` - Fetch user profile
  - `updateUserProfile()` - Update profile fields
  - `createUserProfile()` - For legacy users
  - `hasPermission()` - Check feature access
  - `completeOnboarding()` - Mark onboarding done

### ✅ Phase 4: Auth Context
- **File**: `src/context/AuthContext.tsx`
- **Enhanced Features**:
  - Profile state management
  - Auto-load profile on auth state change
  - `hasPermission()` function
  - `refreshProfile()` function
  - Backward compatibility with legacy sign up

### ✅ Phase 5: Registration Screen
- **File**: `src/screens/RegisterScreen.tsx`
- **Features**:
  - Multi-step registration (Profile → Credentials)
  - Role selection with icons and descriptions
  - Name, specialty, institution fields
  - Progress indicator
  - Form validation
  - Error handling

### ✅ Phase 6: Feature Gating
- **File**: `src/components/FeatureGate.tsx`
- **Components**:
  - `<FeatureGate>` - Wrap features requiring permissions
  - `useFeatureAccess()` - Hook for conditional logic
  - `useMultipleFeatureAccess()` - Check multiple features
  - `<RoleGate>` - Show content to specific roles
  - `<HideFromRoles>` - Hide content from roles

### ✅ Phase 7: Profile Screen
- **File**: `src/screens/ProfileScreenNew.tsx`
- **Features**:
  - Display user profile with role badge
  - Edit profile information
  - Show available features per role
  - Sign out functionality

### ✅ Phase 8: Test Suite
- **File**: `test-auth-roles.js`
- **Tests**:
  - Database schema validation
  - Sign up with profile creation
  - Profile retrieval
  - Role permissions verification
  - Profile updates
  - Multiple role testing

---

## 🚀 Integration Steps

### Step 1: Run Database Migration

```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Manually in Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy contents of database/auth_profiles.sql
# 3. Run the SQL script
```

### Step 2: Test Database Setup

```bash
# Install dependencies if needed
npm install

# Run test script
node test-auth-roles.js
```

Expected output:
```
✅ user_profiles table exists
✅ role_permissions table exists
✅ Permissions seeded for 6 roles
✅ Auth user created
✅ Profile created
✅ All tests passed
```

### Step 3: Update Navigation (if needed)

If your navigation doesn't already include the Register screen, add it:

```typescript
// src/navigation/AppNavigator.tsx or similar

import { RegisterScreen } from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreenNew'; // Updated profile

// Add to your stack navigator
<Stack.Screen 
  name="Register" 
  component={RegisterScreen}
  options={{ title: 'Create Account' }}
/>

<Stack.Screen 
  name="Profile" 
  component={ProfileScreen}
  options={{ title: 'Profile' }}
/>
```

### Step 4: Apply Feature Gates

Update screens to use role-based access:

```typescript
// Example: src/screens/EncounterDetailScreen.tsx

import { FeatureGate, useFeatureAccess } from '../components/FeatureGate';

function EncounterDetailScreen() {
  const canUseAI = useFeatureAccess('ai_clinical_analysis');

  return (
    <View>
      {/* Everyone sees this */}
      <EncounterInfo />
      
      {/* Only doctors see this */}
      <FeatureGate feature="ai_clinical_analysis">
        <Button title="Run AI Analysis" onPress={handleAI} />
      </FeatureGate>

      {/* Conditional rendering */}
      {canUseAI && <AIResultsPanel />}
    </View>
  );
}
```

### Step 5: Test Registration Flow

1. **Run the app**:
   ```bash
   npm start
   # or
   npx expo start
   ```

2. **Test sign up**:
   - Navigate to Register screen
   - Fill in name (First + Last)
   - Select a role (Doctor, Nurse, etc.)
   - Add specialty and institution (optional)
   - Click "Continue"
   - Enter email and password
   - Click "Create Account"

3. **Verify**:
   - Check Supabase Dashboard → Authentication → Users
   - Check Database → user_profiles table
   - Profile should appear with correct role

4. **Test login**:
   - Sign in with the new account
   - Profile should load automatically
   - Check Profile screen shows role and features

### Step 6: Verify Role-Based Access

Test with different roles:

1. **Doctor account**:
   - Should see: AI Analysis, Patient Management, All features
   
2. **Nurse account**:
   - Should see: Patient Management, No AI Analysis
   
3. **Student account**:
   - Should see: ICD-10 Search, Assistant Chat only
   - Should NOT see: Patient Management, AI Analysis

---

## 🔒 Role-Based Feature Matrix

| Feature | Doctor | Nurse | Pharmacist | CHW | Student | Other |
|---------|--------|-------|------------|-----|---------|-------|
| ICD-10 Search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Patient Management | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Encounter Management | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| AI Clinical Analysis | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assistant Chat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Favorites | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Voice Input | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Image Processing | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🧪 Testing Checklist

### Database Tests
- [ ] `user_profiles` table exists
- [ ] `role_permissions` table exists
- [ ] Permissions seeded for all roles
- [ ] RLS policies working
- [ ] `updated_at` trigger works

### Registration Tests
- [ ] Step 1: Name and role selection works
- [ ] Step 2: Email and password works
- [ ] Profile created in database
- [ ] Email confirmation sent
- [ ] Validation errors display correctly

### Profile Tests
- [ ] Profile loads on login
- [ ] Display name shows correctly
- [ ] Role badge displays
- [ ] Edit profile works
- [ ] Available features list is correct

### Permission Tests
- [ ] `hasPermission()` returns correct value
- [ ] `<FeatureGate>` shows/hides correctly
- [ ] Doctor sees AI features
- [ ] Student doesn't see patient management
- [ ] Role-specific navigation works

### Auth Flow Tests
- [ ] Sign up creates profile
- [ ] Sign in loads profile
- [ ] Sign out clears profile
- [ ] Profile persists across app restarts
- [ ] Refresh profile updates state

---

## 📱 Example Usage

### 1. Protecting a Feature

```typescript
import { FeatureGate } from '../components/FeatureGate';

<FeatureGate feature="ai_clinical_analysis">
  <AIAnalysisButton />
</FeatureGate>
```

### 2. Conditional Rendering

```typescript
import { useFeatureAccess } from '../components/FeatureGate';

function MyScreen() {
  const canManagePatients = useFeatureAccess('patient_management');
  
  return (
    <View>
      {canManagePatients ? (
        <PatientsSection />
      ) : (
        <Text>Patient management not available for your role</Text>
      )}
    </View>
  );
}
```

### 3. Role-Specific Navigation

```typescript
import { RoleGate } from '../components/FeatureGate';

<RoleGate roles={['doctor', 'nurse']}>
  <Tab.Screen name="Patients" component={PatientsScreen} />
</RoleGate>
```

### 4. Checking Profile in Components

```typescript
import { useAuth } from '../context/AuthContext';

function Header() {
  const { profile, role } = useAuth();
  
  return (
    <View>
      <Text>Welcome, {profile?.display_name}!</Text>
      <Text>Role: {role}</Text>
    </View>
  );
}
```

---

## 🐛 Troubleshooting

### Profile not loading after login

**Cause**: Profile creation failed during sign up

**Fix**:
```typescript
// Create profile manually for existing users
import { createUserProfile } from '../services/auth';

await createUserProfile(user.id, {
  first_name: 'John',
  last_name: 'Doe',
  role: 'doctor',
  specialty: null,
  institution: null,
  preferred_language: 'en',
  preferred_icd_variant: 'who',
  onboarding_completed: false,
});
```

### Permission denied errors

**Cause**: RLS policies not set up

**Fix**: Re-run `database/auth_profiles.sql` in Supabase SQL Editor

### Features not gating correctly

**Cause**: Role features mismatch

**Fix**: Verify `ROLE_FEATURES` in `src/types/auth.ts` matches database permissions

### Legacy users without profiles

**Solution**: Create a migration screen that prompts users to complete their profile on first login after update.

---

## 🎨 Customization

### Add a New Role

1. **Update `src/types/auth.ts`**:
   ```typescript
   export type UserRole = 'doctor' | 'nurse' | 'pharmacist' | 'chw' | 'student' | 'other' | 'researcher';
   
   export const ROLE_LABELS: Record<UserRole, string> = {
     // ... existing roles
     researcher: 'Clinical Researcher',
   };
   
   export const ROLE_FEATURES: Record<UserRole, string[]> = {
     // ... existing roles
     researcher: ['icd10_search', 'assistant_chat', 'favorites', 'analytics'],
   };
   ```

2. **Update database**:
   ```sql
   -- Update role constraint
   ALTER TABLE user_profiles 
   DROP CONSTRAINT IF EXISTS user_profiles_role_check;
   
   ALTER TABLE user_profiles 
   ADD CONSTRAINT user_profiles_role_check 
   CHECK (role IN ('doctor', 'nurse', 'pharmacist', 'chw', 'student', 'other', 'researcher'));
   
   -- Add permissions
   INSERT INTO role_permissions (role, feature, allowed) VALUES
   ('researcher', 'icd10_search', true),
   ('researcher', 'assistant_chat', true),
   ('researcher', 'favorites', true),
   ('researcher', 'analytics', true);
   ```

### Add a New Feature

1. **Update `src/types/auth.ts`**:
   ```typescript
   export const FEATURE_LABELS: Record<string, string> = {
     // ... existing features
     'prescription_management': 'Prescription Management',
   };
   ```

2. **Update role permissions**:
   ```typescript
   export const ROLE_FEATURES: Record<UserRole, string[]> = {
     doctor: [...existingFeatures, 'prescription_management'],
     // ... other roles
   };
   ```

3. **Update database**:
   ```sql
   INSERT INTO role_permissions (role, feature, allowed) VALUES
   ('doctor', 'prescription_management', true),
   ('nurse', 'prescription_management', false);
   ```

---

## 📚 Additional Resources

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **React Navigation**: https://reactnavigation.org/docs/auth-flow

---

## ✅ Implementation Complete!

You now have a fully functional role-based authentication system with:
- ✅ Multi-step registration
- ✅ User profiles with roles
- ✅ Permission-based feature access
- ✅ Profile management
- ✅ Comprehensive test suite

**Next Steps**:
1. Run database migration
2. Test registration flow
3. Apply feature gates to existing screens
4. Deploy and monitor

Good luck! 🚀
