# Phase 3 Clinical Support Module - Implementation Guide

## ✅ What Has Been Implemented

### 1. Database Schema (`database/phase3_clinical.sql`)
- ✅ `patients` table - Store patient records
- ✅ `encounters` table - Store clinical encounters/visits
- ✅ `encounter_icd10_codes` table - Link encounters to ICD-10 codes
- ✅ `encounter_ai_results` table - Store detailed AI analysis
- ✅ `clinical_analysis_logs` table - Audit trail for all analyses
- ✅ All tables have RLS (Row Level Security) policies
- ✅ Proper indexes for performance

### 2. TypeScript Types (`src/types/index.ts`)
- ✅ `Patient`, `PatientInput` - Patient data structures
- ✅ `Encounter`, `EncounterInput` - Encounter data structures
- ✅ `StructuredEncounterData` - Symptom checklist and vitals
- ✅ `ClinicalAnalysisResult` - AI analysis output
- ✅ `PossibleCondition` - Differential diagnosis suggestions
- ✅ All supporting enums and helper types

### 3. Clinical Reasoner Service (`src/services/clinicalReasoner.ts`)
- ✅ `analyzeEncounter()` - Main analysis function
- ✅ Rule-based symptom detection
- ✅ Red flag identification
- ✅ Risk level calculation (low/moderate/high)
- ✅ Condition suggestions with ICD-10 codes
- ✅ Clarifying questions generation
- ✅ Age-based risk adjustments

### 4. Logging Service (`src/services/logging.ts`)
- ✅ `logClinicalAnalysis()` - Audit trail logging
- ✅ `saveAiResult()` - Store detailed AI results
- ✅ `updateEncounterWithAi()` - Update encounter with summary
- ✅ Privacy-conscious logging (omits identifiable data)

### 5. Usage Examples (`src/services/clinicalAnalysisExample.tsx`)
- ✅ Complete implementation examples
- ✅ React component patterns
- ✅ Form data structuring
- ✅ Results display templates

---

## 🚀 Next Steps: What You Need to Build

### 1. Database Migration
**Priority: HIGH**
```bash
# In Supabase SQL Editor, run:
database/phase3_clinical.sql
```

### 2. Patient Management Screens
**Priority: HIGH**

#### A. `PatientsListScreen.tsx`
```typescript
// Features needed:
- List all patients for current user
- Search/filter patients
- "Add New Patient" button
- Navigate to PatientDetailScreen on tap
```

#### B. `PatientDetailScreen.tsx`
```typescript
// Features needed:
- Display patient info (name, age, sex, notes)
- Edit patient button
- List patient's encounters (most recent first)
- "New Encounter" button
- Navigate to EncounterDetailScreen on tap
```

#### C. `PatientFormScreen.tsx` (optional, can use modal)
```typescript
// Features needed:
- Input: display_label (required)
- Input: year_of_birth (optional)
- Select: sex (male/female/other/unknown)
- TextArea: notes (optional)
- Save button
```

### 3. Encounter Management Screens
**Priority: HIGH**

#### A. `EncounterFormScreen.tsx`
```typescript
// Features needed:
- Input: chief_complaint (required)
- DatePicker: encounter_date
- Symptom checklist:
  • Fever
  • Cough
  • Shortness of breath
  • Chest pain
  • Severe abdominal pain
  • Confusion
- Duration picker (hours/days/weeks/months)
- Pain details section
- Vitals section (optional)
- Red flags checklist
- Free text notes
- Save button
```

#### B. `EncounterDetailScreen.tsx`
```typescript
// Features needed:
- Display encounter details
- Show chief complaint and structured data
- "Run AI Analysis" button (uses clinicalReasoner)
- Display AI results (if already analyzed)
- List associated ICD-10 codes
- "Add ICD-10 Code" button
- Edit encounter button
```

### 4. UI Components
**Priority: MEDIUM**

#### A. `RiskBadge.tsx`
```typescript
// Display risk level with color coding:
- HIGH: Red background
- MODERATE: Orange background
- LOW: Green background
- UNKNOWN: Gray background
```

#### B. `ResearchModeBanner.tsx`
```typescript
// Disclaimer component for AI screens
- Yellow/orange background
- 🔬 icon
- "Research Mode - Not Medical Advice" text
- Full disclaimer text from caution_text
```

#### C. `PossibleConditionCard.tsx`
```typescript
// Display condition with:
- Condition name
- ICD-10 code (tappable to view details)
- Likelihood badge
- Explanation text
- "Add to Encounter" button
```

#### D. `RedFlagAlert.tsx`
```typescript
// Display red flag warnings:
- ⚠️ icon
- Red background
- Bold text
- Urgent action suggestions
```

### 5. Service Functions
**Priority: MEDIUM**

#### A. `src/services/patients.ts`
```typescript
// CRUD operations for patients:
- createPatient(input: PatientInput)
- getPatients(userId: string)
- getPatient(id: string)
- updatePatient(id: string, updates: Partial<PatientInput>)
- deletePatient(id: string)
```

#### B. `src/services/encounters.ts`
```typescript
// CRUD operations for encounters:
- createEncounter(input: EncounterInput)
- getEncounters(patientId: string)
- getEncounter(id: string)
- updateEncounter(id: string, updates: Partial<EncounterInput>)
- deleteEncounter(id: string)
- linkIcd10Code(encounterId: string, icd10Id: string, source: CodeSource)
- unlinkIcd10Code(encounterId: string, icd10Id: string)
```

### 6. Navigation Updates
**Priority: HIGH**

Update `src/navigation/AppNavigator.tsx`:

```typescript
// Add Patients tab to MainTabNavigator
<Tab.Screen
  name="Patients"
  component={PatientsStackNavigator}
  options={{
    tabBarLabel: 'Patients',
    tabBarIcon: ({ color }) => <Icon name="people" color={color} />,
  }}
/>

// Create PatientsStackNavigator
const PatientsStack = createStackNavigator<PatientsStackParamList>();

function PatientsStackNavigator() {
  return (
    <PatientsStack.Navigator>
      <PatientsStack.Screen name="PatientsList" component={PatientsListScreen} />
      <PatientsStack.Screen name="PatientDetail" component={PatientDetailScreen} />
      <PatientsStack.Screen name="EncounterDetail" component={EncounterDetailScreen} />
      <PatientsStack.Screen name="EncounterForm" component={EncounterFormScreen} />
    </PatientsStack.Navigator>
  );
}
```

---

## 📋 Implementation Checklist

### Database & Backend
- [ ] Run `phase3_clinical.sql` in Supabase
- [ ] Verify all 5 tables created
- [ ] Test RLS policies
- [ ] Create `patients.ts` service
- [ ] Create `encounters.ts` service

### UI Components
- [ ] Create `RiskBadge.tsx`
- [ ] Create `ResearchModeBanner.tsx`
- [ ] Create `PossibleConditionCard.tsx`
- [ ] Create `RedFlagAlert.tsx`
- [ ] Create `PatientCard.tsx`

### Screens
- [ ] Build `PatientsListScreen.tsx`
- [ ] Build `PatientDetailScreen.tsx`
- [ ] Build `PatientFormScreen.tsx` (or modal)
- [ ] Build `EncounterFormScreen.tsx`
- [ ] Build `EncounterDetailScreen.tsx`

### Navigation
- [ ] Add Patients tab to bottom navigator
- [ ] Create PatientsStackNavigator
- [ ] Update navigation types

### Testing
- [ ] Create test patient
- [ ] Create test encounter
- [ ] Run AI analysis on test encounter
- [ ] Verify logging to audit tables
- [ ] Test linking ICD-10 codes to encounters

---

## 🎨 UI/UX Recommendations

### 1. Symptom Checklist UI
Use switch/toggle components for easy one-tap selection:
```
☑️ Fever
☐ Cough
☑️ Shortness of breath
☐ Chest pain
```

### 2. Vitals Input
Use number pads with appropriate ranges:
```
Temperature: [___] °C/°F
Heart Rate: [___] bpm
BP: [___] / [___] mmHg
O2 Sat: [___] %
```

### 3. Risk Level Display
Make it prominent and color-coded:
```
┌─────────────────────────┐
│ 🚨 RISK LEVEL: HIGH     │
│ (Red background)        │
└─────────────────────────┘
```

### 4. Condition Cards
Display as expandable cards:
```
┌────────────────────────────────┐
│ Possible Pneumonia      [HIGH] │
│ ICD-10: J18.9                  │
│                                │
│ Fever, cough, and SOB suggest  │
│ lower respiratory infection... │
│                                │
│ [Add to Encounter]             │
└────────────────────────────────┘
```

---

## 🔒 Safety & Compliance

### Always Display Disclaimers
Every screen showing AI analysis MUST display:

```
🔬 Research Mode
This AI analysis is experimental and for educational purposes only.
It does NOT provide medical diagnoses or treatment recommendations.
The clinician is fully responsible for all clinical decisions.
```

### Privacy Considerations
- Patient `display_label` is NOT logged in audit trail
- Only clinical data (symptoms, age, sex) is logged
- All data protected by RLS policies
- Users can only access their own patients/encounters

### Data Retention
Consider implementing:
- Auto-delete old analysis logs (>1 year)
- Patient data export functionality
- GDPR-compliant deletion tools

---

## 📊 Analytics Ideas (Future)

Track these metrics to improve the system:
- Most common chief complaints
- Analysis acceptance rate (which conditions get confirmed)
- Red flag frequency
- Risk level distribution
- Most helpful clarifying questions

Store in separate analytics tables (not implemented yet).

---

## 🐛 Known Limitations

1. **Rule-Based Only**: Current reasoner uses simple keyword matching
   - Replace with real clinical AI API in production
   - Consider: Infermedica, Ada, Isabel, or custom model

2. **Limited Symptoms**: Only covers common respiratory/cardiac symptoms
   - Expand symptom checklist for comprehensive coverage

3. **No Image Analysis**: Image processing not integrated yet
   - Future: Connect to vision model for skin lesions, X-rays, etc.

4. **No Differential Ranking**: Conditions not ranked by true likelihood
   - Future: Use Bayesian inference or ML model

5. **English Only**: All text is English
   - Use i18n for multi-language support

---

## 📚 Reference: Structured Data Keys

| Key | Type | Example |
|-----|------|---------|
| `fever` | boolean | `true` |
| `cough` | boolean | `true` |
| `shortness_of_breath` | boolean | `false` |
| `chest_pain` | boolean | `true` |
| `severe_abdominal_pain` | boolean | `false` |
| `confusion` | boolean | `false` |
| `duration` | string | `'days'` |
| `pain.present` | boolean | `true` |
| `pain.location` | string | `'left chest'` |
| `pain.severity` | number | `7` |
| `pain.radiating` | boolean | `true` |
| `vitals.temperature` | number | `38.5` |
| `vitals.heart_rate` | number | `110` |
| `vitals.bp_systolic` | number | `140` |
| `vitals.bp_diastolic` | number | `90` |
| `vitals.respiratory_rate` | number | `22` |
| `vitals.oxygen_saturation` | number | `94` |
| `red_flags` | string[] | `['chest_pain', 'dyspnea']` |
| `notes` | string | `'Patient reports...'` |

---

## 🎯 Success Criteria

Phase 3 is complete when:
- ✅ User can create and view patients
- ✅ User can create encounters with symptom checklists
- ✅ User can run AI analysis on encounters
- ✅ Results display with risk levels and red flags
- ✅ Conditions can be added to encounter as ICD-10 codes
- ✅ All interactions are logged for audit
- ✅ Disclaimers are always visible
- ✅ App feels safe and trustworthy

---

## 🚀 Deployment Checklist

Before releasing Phase 3 to users:
- [ ] All safety disclaimers in place
- [ ] RLS policies tested thoroughly
- [ ] User acceptance testing completed
- [ ] Legal review of disclaimers (if required)
- [ ] Documentation updated
- [ ] Support team trained on new features
- [ ] Monitoring and logging in place
- [ ] Backup and recovery tested

---

## 📞 Support

For questions about this implementation:
1. Review usage examples in `src/services/clinicalAnalysisExample.tsx`
2. Check type definitions in `src/types/index.ts`
3. Consult Supabase docs for database operations
4. Review React Navigation docs for navigation patterns

Good luck! 🎉
