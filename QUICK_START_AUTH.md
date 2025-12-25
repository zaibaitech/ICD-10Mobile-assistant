# 🚀 Quick Start: Enhanced Authentication Implementation

## ⚡ 5-Minute Setup

### Step 1: Run Database Migration (2 min)

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Create new query
# 3. Copy/paste contents of: database/auth_profiles.sql
# 4. Click "Run"
```

**Expected Result**: Tables `user_profiles` and `role_permissions` created with permissions seeded.

---

### Step 2: Test Database (1 min)

```bash
node test-auth-roles.js
```

**Expected Output**:
```
✅ user_profiles table exists
✅ role_permissions table exists
✅ Permissions seeded for 6 roles
✅ All tests passed
```

---

### Step 3: Update App (Optional)

**The registration screen is already updated!** No navigation changes needed if your app already routes to `RegisterScreen.tsx`.

---

### Step 4: Test Registration (2 min)

1. Start app: `npm start` or `npx expo start`
2. Navigate to Register screen
3. Fill in:
   - First Name: Test
   - Last Name: User
   - Role: Select "Doctor"
   - Email: test@example.com
   - Password: SecurePass123
4. Click "Create Account"
5. Check Supabase → Database → user_profiles table

**Expected**: New profile row with role="doctor"

---

## 🎯 What You Get

### ✅ New Features

1. **Multi-step Registration**
   - Step 1: Name + Role selection
   - Step 2: Email + Password
   - Beautiful UI with progress indicator

2. **6 Healthcare Roles**
   - 👨‍⚕️ Doctor/Physician
   - 👩‍⚕️ Nurse
   - 💊 Pharmacist
   - 🏥 Community Health Worker
   - 📚 Medical Student
   - ➕ Other Healthcare Professional

3. **Role-Based Permissions**
   - AI Clinical Analysis → Doctors only
   - Patient Management → Doctors, Nurses, CHWs
   - ICD-10 Search → Everyone

4. **Components Ready to Use**
   - `<FeatureGate>` - Wrap features requiring permissions
   - `useFeatureAccess()` - Hook for conditional logic
   - `<RoleGate>` - Show to specific roles only

---

## 📋 Implementation Checklist

### Database Setup
- [ ] Run `database/auth_profiles.sql` in Supabase
- [ ] Verify tables created
- [ ] Run `node test-auth-roles.js`

### App Integration
- [ ] Registration flow tested
- [ ] Profile screen works
- [ ] Login loads profile correctly

### Feature Gating (Apply as Needed)
- [ ] Wrap AI features with `<FeatureGate feature="ai_clinical_analysis">`
- [ ] Wrap patient management with `<FeatureGate feature="patient_management">`
- [ ] Hide/show navigation based on role

---

## 🔥 Quick Feature Gating Examples

### Example 1: Hide AI Button for Non-Doctors

**Before**:
```typescript
<Button title="Run AI Analysis" onPress={handleAI} />
```

**After**:
```typescript
import { FeatureGate } from '../components/FeatureGate';

<FeatureGate feature="ai_clinical_analysis">
  <Button title="Run AI Analysis" onPress={handleAI} />
</FeatureGate>
```

### Example 2: Conditional Rendering

**Before**:
```typescript
<View>
  <PatientManagementSection />
</View>
```

**After**:
```typescript
import { useFeatureAccess } from '../components/FeatureGate';

function MyScreen() {
  const canManagePatients = useFeatureAccess('patient_management');
  
  return (
    <View>
      {canManagePatients && <PatientManagementSection />}
    </View>
  );
}
```

### Example 3: Show User's Role

```typescript
import { useAuth } from '../context/AuthContext';

function Header() {
  const { profile } = useAuth();
  
  return (
    <Text>Welcome, {profile?.display_name} ({profile?.role})</Text>
  );
}
```

---

## 🎨 Role Permissions Matrix

| Feature | Doctor | Nurse | Pharmacist | CHW | Student |
|---------|--------|-------|------------|-----|---------|
| ICD-10 Search | ✅ | ✅ | ✅ | ✅ | ✅ |
| Patient Mgmt | ✅ | ✅ | ❌ | ✅ | ❌ |
| AI Analysis | ✅ | ❌ | ❌ | ❌ | ❌ |
| Voice Input | ✅ | ✅ | ✅ | ✅ | ✅ |
| Favorites | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🐛 Common Issues

### "Table does not exist"
**Fix**: Run `database/auth_profiles.sql` in Supabase SQL Editor

### "Profile not loading"
**Fix**: Check AuthContext is wrapping your app in App.tsx

### "Permission denied"
**Fix**: Ensure RLS policies were created (check SQL script ran successfully)

### Legacy users without profiles
**Fix**: Create migration screen or manually create profiles:
```typescript
import { createUserProfile } from '../services/auth';

await createUserProfile(user.id, {
  first_name: 'Legacy',
  last_name: 'User',
  role: 'doctor',
  specialty: null,
  institution: null,
  preferred_language: 'en',
  preferred_icd_variant: 'who',
  onboarding_completed: false,
});
```

---

## 📚 Files Created/Modified

### New Files
1. `database/auth_profiles.sql` - Database schema
2. `src/types/auth.ts` - TypeScript types
3. `src/components/FeatureGate.tsx` - Permission components
4. `src/screens/ProfileScreenNew.tsx` - Profile screen
5. `test-auth-roles.js` - Test suite
6. `AUTH_IMPLEMENTATION_GUIDE.md` - Full guide

### Modified Files
1. `src/services/auth.ts` - Enhanced with profile functions
2. `src/context/AuthContext.tsx` - Added profile state
3. `src/screens/RegisterScreen.tsx` - Multi-step registration

---

## ✅ Done!

Your app now has:
- ✅ Professional role-based registration
- ✅ User profiles with specialties
- ✅ Permission-based feature access
- ✅ Beautiful multi-step UI
- ✅ Comprehensive testing

**Time to implement**: ~5 minutes  
**Complexity**: Low  
**Impact**: High 🚀

---

Need help? Check `AUTH_IMPLEMENTATION_GUIDE.md` for detailed instructions!
