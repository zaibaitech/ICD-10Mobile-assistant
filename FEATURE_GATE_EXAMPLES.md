# Feature Gate Usage Examples

## 🎯 Real-World Implementation Examples

This guide shows exactly how to use the new authentication system in your existing screens.

---

## 📱 Example 1: Encounter Detail Screen

**Scenario**: Only doctors should see "AI Analysis" button

### Before Enhancement
```typescript
// src/screens/EncounterDetailScreen.tsx

export default function EncounterDetailScreen({ route }) {
  const { encounterId } = route.params;
  
  return (
    <ScrollView>
      <EncounterInfo encounterId={encounterId} />
      
      {/* Everyone sees this - NO PERMISSION CHECK */}
      <Button 
        title="Run AI Analysis" 
        onPress={handleAIAnalysis} 
      />
      
      <DiagnosisList />
    </ScrollView>
  );
}
```

### After Enhancement ✅
```typescript
// src/screens/EncounterDetailScreen.tsx

import { FeatureGate } from '../components/FeatureGate';

export default function EncounterDetailScreen({ route }) {
  const { encounterId } = route.params;
  
  return (
    <ScrollView>
      <EncounterInfo encounterId={encounterId} />
      
      {/* Only doctors see this */}
      <FeatureGate feature="ai_clinical_analysis">
        <Button 
          title="Run AI Analysis" 
          onPress={handleAIAnalysis} 
        />
      </FeatureGate>
      
      <DiagnosisList />
    </ScrollView>
  );
}
```

**What happens**:
- Doctor logs in → Sees AI button ✅
- Nurse logs in → Button hidden ❌
- Student logs in → Button hidden ❌

---

## 📋 Example 2: Dashboard Screen

**Scenario**: Show different cards based on role

### Implementation
```typescript
// src/screens/DashboardScreen.tsx

import { useAuth } from '../context/AuthContext';
import { useFeatureAccess, RoleGate } from '../components/FeatureGate';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const canManagePatients = useFeatureAccess('patient_management');
  const canUseAI = useFeatureAccess('ai_clinical_analysis');

  return (
    <ScrollView style={styles.container}>
      {/* Welcome message with role */}
      <View style={styles.header}>
        <Text style={styles.welcome}>
          Welcome, Dr. {profile?.last_name} 👋
        </Text>
        <Text style={styles.role}>{profile?.role}</Text>
      </View>

      {/* Always visible */}
      <DashboardCard 
        title="ICD-10 Search"
        icon="🔍"
        onPress={() => navigation.navigate('Search')}
      />

      {/* Conditional cards based on permissions */}
      {canManagePatients && (
        <DashboardCard 
          title="My Patients"
          icon="👥"
          onPress={() => navigation.navigate('Patients')}
        />
      )}

      {canUseAI && (
        <DashboardCard 
          title="AI Assistant"
          icon="🤖"
          badge="Doctors Only"
          onPress={() => navigation.navigate('AI')}
        />
      )}

      {/* Show only to doctors and nurses */}
      <RoleGate roles={['doctor', 'nurse']}>
        <DashboardCard 
          title="Encounters"
          icon="📋"
          onPress={() => navigation.navigate('Encounters')}
        />
      </RoleGate>
    </ScrollView>
  );
}
```

**Dashboard View by Role**:

**Doctor sees**:
- ICD-10 Search ✅
- My Patients ✅
- AI Assistant ✅
- Encounters ✅

**Nurse sees**:
- ICD-10 Search ✅
- My Patients ✅
- AI Assistant ❌
- Encounters ✅

**Student sees**:
- ICD-10 Search ✅
- My Patients ❌
- AI Assistant ❌
- Encounters ❌

---

## 🗂️ Example 3: Navigation Tabs

**Scenario**: Show different bottom tabs based on role

### Implementation
```typescript
// src/navigation/BottomTabs.tsx

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { hasPermission } = useAuth();

  return (
    <Tab.Navigator>
      {/* Always visible */}
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ tabBarIcon: () => <Icon name="search" /> }}
      />

      {/* Only if user can manage patients */}
      {hasPermission('patient_management') && (
        <Tab.Screen 
          name="Patients" 
          component={PatientsScreen}
          options={{ tabBarIcon: () => <Icon name="people" /> }}
        />
      )}

      {/* Only if user can use AI */}
      {hasPermission('ai_clinical_analysis') && (
        <Tab.Screen 
          name="AI" 
          component={AIScreen}
          options={{ tabBarIcon: () => <Icon name="robot" /> }}
        />
      )}

      {/* Always visible */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarIcon: () => <Icon name="person" /> }}
      />
    </Tab.Navigator>
  );
}
```

**Tab Bar by Role**:
- Doctor: Search | Patients | AI | Profile (4 tabs)
- Nurse: Search | Patients | Profile (3 tabs)
- Student: Search | Profile (2 tabs)

---

## 💊 Example 4: Clinical Tools Screen

**Scenario**: Different tools for different roles

### Implementation
```typescript
// src/screens/ClinicalToolsScreen.tsx

import { FeatureGate, HideFromRoles } from '../components/FeatureGate';

export default function ClinicalToolsScreen() {
  return (
    <ScrollView>
      <Text style={styles.title}>Clinical Tools</Text>

      {/* Everyone can use this */}
      <ToolCard
        title="ICD-10 Code Lookup"
        icon="🔍"
        description="Search and browse ICD-10 codes"
        onPress={() => navigation.navigate('ICD10Search')}
      />

      {/* Doctors and Nurses only */}
      <FeatureGate feature="encounter_management">
        <ToolCard
          title="Encounter Documentation"
          icon="📋"
          description="Document patient encounters"
          onPress={() => navigation.navigate('Encounters')}
        />
      </FeatureGate>

      {/* Doctors only */}
      <FeatureGate 
        feature="ai_clinical_analysis"
        showRestricted={true}  // Shows "locked" message instead of hiding
      >
        <ToolCard
          title="AI Clinical Analysis"
          icon="🤖"
          description="Get AI-powered diagnostic suggestions"
          onPress={() => navigation.navigate('AIAnalysis')}
        />
      </FeatureGate>

      {/* Hide from students */}
      <HideFromRoles roles={['student', 'other']}>
        <ToolCard
          title="Patient Management"
          icon="👥"
          description="Manage your patient list"
          onPress={() => navigation.navigate('Patients')}
        />
      </HideFromRoles>

      {/* Everyone can use this */}
      <ToolCard
        title="Favorites"
        icon="⭐"
        description="Quick access to saved codes"
        onPress={() => navigation.navigate('Favorites')}
      />
    </ScrollView>
  );
}
```

---

## 🎤 Example 5: Voice Input Feature

**Scenario**: All roles can use voice, but show different options

### Implementation
```typescript
// src/components/VoiceInputButton.tsx

import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../types/auth';

export default function VoiceInputButton() {
  const { role, hasPermission } = useAuth();
  const canUseAI = hasPermission('ai_clinical_analysis');

  const handleVoiceInput = async (transcript: string) => {
    // All roles can do basic ICD-10 search
    if (transcript.includes('search for') || transcript.includes('find code')) {
      searchICD10(transcript);
    }

    // Only doctors can use AI analysis
    if (canUseAI && transcript.includes('analyze')) {
      runAIAnalysis(transcript);
    }

    // Role-specific prompts
    switch (role) {
      case 'doctor':
        // Suggest: "Analyze symptoms", "Search diagnosis"
        break;
      case 'nurse':
        // Suggest: "Document vitals", "Search procedure"
        break;
      case 'student':
        // Suggest: "Learn about code", "What is ICD-10"
        break;
    }
  };

  return (
    <TouchableOpacity onPress={startListening}>
      <Icon name="mic" />
      <Text>Voice Input ({ROLE_LABELS[role]})</Text>
    </TouchableOpacity>
  );
}
```

---

## 👤 Example 6: Profile Screen Usage

**Scenario**: Display user profile with role badge

### Implementation
```typescript
// src/screens/SettingsScreen.tsx

import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, ROLE_ICONS } from '../types/auth';

export default function SettingsScreen() {
  const { profile, user, signOut } = useAuth();

  if (!profile) return <LoadingSpinner />;

  return (
    <ScrollView>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Text style={styles.icon}>{ROLE_ICONS[profile.role]}</Text>
        <Text style={styles.name}>{profile.display_name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {ROLE_LABELS[profile.role]}
          </Text>
        </View>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Profile Info */}
      <SettingsSection title="Professional Information">
        <SettingsRow label="Specialty" value={profile.specialty || 'Not set'} />
        <SettingsRow label="Institution" value={profile.institution || 'Not set'} />
      </SettingsSection>

      {/* Available Features */}
      <SettingsSection title="Available Features">
        <Text style={styles.featuresNote}>
          Based on your role as {ROLE_LABELS[profile.role]}
        </Text>
        {getRoleFeatures(profile.role).map(feature => (
          <FeatureRow key={feature} feature={feature} />
        ))}
      </SettingsSection>

      <Button title="Sign Out" onPress={signOut} />
    </ScrollView>
  );
}
```

---

## 🔐 Example 7: Admin Features

**Scenario**: Future admin panel (for clinic managers)

### Implementation
```typescript
// src/screens/AdminScreen.tsx

import { RoleGate } from '../components/FeatureGate';

export default function AdminScreen() {
  return (
    <RoleGate 
      roles={['admin']}  // Future role
      fallback={
        <View style={styles.restricted}>
          <Text>🔒 Admin access required</Text>
          <Text>Contact your clinic manager for access</Text>
        </View>
      }
    >
      <AdminDashboard />
    </RoleGate>
  );
}
```

---

## 📊 Example 8: Analytics & Reports

**Scenario**: Different analytics based on role

### Implementation
```typescript
// src/screens/AnalyticsScreen.tsx

import { useAuth } from '../context/AuthContext';
import { FeatureGate } from '../components/FeatureGate';

export default function AnalyticsScreen() {
  const { role } = useAuth();

  return (
    <ScrollView>
      <Text style={styles.title}>Analytics</Text>

      {/* Personal stats - everyone */}
      <StatsCard 
        title="Your Activity"
        data={personalStats}
      />

      {/* Patient stats - doctors and nurses */}
      <FeatureGate feature="patient_management">
        <StatsCard 
          title="Patient Statistics"
          data={patientStats}
        />
      </FeatureGate>

      {/* AI usage - doctors only */}
      <FeatureGate feature="ai_clinical_analysis">
        <StatsCard 
          title="AI Analysis Usage"
          data={aiStats}
        />
      </FeatureGate>

      {/* Learning progress - students */}
      {role === 'student' && (
        <StatsCard 
          title="Learning Progress"
          data={learningStats}
        />
      )}
    </ScrollView>
  );
}
```

---

## ✅ Best Practices

### ✓ DO:
- Use `<FeatureGate>` for simple show/hide
- Use `useFeatureAccess()` for complex conditional logic
- Use `<RoleGate>` when specific roles need access
- Check permissions at the component level
- Provide fallback UI for restricted features

### ✗ DON'T:
- Don't rely on client-side checks for security
- Don't forget to add server-side validation
- Don't hardcode role names (use constants)
- Don't show features then disable them (hide instead)

---

## 🎓 Quick Reference

```typescript
// Import what you need
import { useAuth } from '../context/AuthContext';
import { 
  FeatureGate, 
  useFeatureAccess, 
  RoleGate 
} from '../components/FeatureGate';
import { ROLE_LABELS, ROLE_ICONS } from '../types/auth';

// In your component
const { user, profile, role, hasPermission } = useAuth();
const canUseAI = useFeatureAccess('ai_clinical_analysis');

// Show to all
<Button title="Search" />

// Show to specific roles
<RoleGate roles={['doctor', 'nurse']}>
  <Button title="Patients" />
</RoleGate>

// Show if has permission
<FeatureGate feature="ai_clinical_analysis">
  <Button title="AI Analysis" />
</FeatureGate>

// Conditional rendering
{canUseAI && <AIPanel />}

// Check in code
if (hasPermission('patient_management')) {
  loadPatients();
}
```

---

## 🚀 Ready to Implement!

Copy these examples and adapt them to your screens. Start with the most critical features first:

1. AI Analysis features → Doctors only
2. Patient Management → Doctors, Nurses, CHWs
3. Navigation tabs → Role-based
4. Profile screen → Show role and features

Need more examples? Check `AUTH_IMPLEMENTATION_GUIDE.md`!
