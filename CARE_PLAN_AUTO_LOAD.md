# Care Plan Auto-Load Feature

## Overview
When a patient is selected and has encounters with ICD-10 codes, clicking "Create Care Plan" now automatically detects and loads the patient's data into the Care Plan Builder.

## How It Works

### 1. Patient Detail Screen
When users click "Create Care Plan" from the Patient Detail screen:
- **Fetches** the most recent encounter with ICD-10 codes
- **Extracts** all ICD-10 codes from that encounter
- **Passes** patient ID, encounter ID, and ICD-10 codes to Care Plan Builder

### 2. Care Plan Builder Screen
The Care Plan Builder now:
- **Displays** patient information in a green card at the top
- **Pre-loads** ICD-10 codes passed from the patient
- **Auto-generates** NANDA diagnosis suggestions based on those codes
- **Links** the care plan to the patient and encounter

## User Flow

### Scenario: Patient with Existing Encounter
1. User goes to **Patients** tab
2. Selects a patient with encounters
3. Clicks **"Create Care Plan"** button
4. Care Plan Builder opens with:
   - ✅ Patient info displayed at top
   - ✅ ICD-10 codes from encounter pre-loaded
   - ✅ NANDA suggestions automatically shown
   - ✅ Ready to generate care plan

### Scenario: Patient without Encounters
1. User goes to **Patients** tab
2. Selects a patient without encounters
3. Clicks **"Create Care Plan"** button
4. Care Plan Builder opens with:
   - ✅ Patient info displayed at top
   - ⚠️ No codes pre-loaded (user can add manually)

## Technical Details

### PatientDetailScreen Changes
```typescript
const handleCreateCarePlan = async () => {
  // Finds most recent encounter with ICD-10 codes
  // Extracts codes and encounter ID
  // Navigates with patient context and codes
  (navigation as any).navigate('Nursing', {
    screen: 'CarePlanBuilder',
    params: { 
      patientId,
      encounterId: selectedEncounterId,
      icd10Codes: icd10Codes.length > 0 ? icd10Codes : undefined
    }
  });
};
```

### CarePlanBuilderScreen Enhancements
```typescript
// Accepts route params
const { patientId, encounterId, icd10Codes = [] } = route?.params || {};

// Loads patient data
useEffect(() => {
  if (patientId) {
    loadPatientData();
  }
}, [patientId]);

// Pre-loads codes and auto-generates suggestions
const [selectedCodes, setSelectedCodes] = useState<string[]>(icd10Codes);
```

### UI Components Added
1. **Patient Info Card** (green banner)
   - Shows patient name
   - Shows demographics (sex, year of birth)
   - Confirms patient selection with checkmark

2. **Auto-Load Behavior**
   - ICD-10 codes appear in pill format
   - Suggestions load automatically
   - No manual code entry required

## Data Flow

```
Patient Detail Screen
  ↓
  Fetch encounters for patient
  ↓
  Find most recent encounter with ICD-10 codes
  ↓
  Extract: patientId, encounterId, icd10Codes[]
  ↓
  Navigate to Care Plan Builder
  ↓
  Care Plan Builder
  ↓
  Load patient data (name, demographics)
  ↓
  Display patient info card
  ↓
  Pre-load ICD-10 codes
  ↓
  Auto-fetch NANDA suggestions via bridge
  ↓
  Display suggestions
  ↓
  Ready to generate care plan
```

## Benefits

1. **Time Saving**: No need to manually enter ICD-10 codes
2. **Error Reduction**: Uses existing encounter data
3. **Context Awareness**: Care plan linked to specific encounter
4. **Better UX**: Patient sees their info at top of screen
5. **Seamless Flow**: From patient → encounter → care plan

## Example Use Case

**Scenario**: Patient with Heart Failure

1. Patient has encounter with ICD-10 codes:
   - I50.9 (Heart Failure, unspecified)
   - E11.9 (Type 2 Diabetes)
   - I10 (Hypertension)

2. User clicks "Create Care Plan"

3. Care Plan Builder opens showing:
   ```
   👤 Patient: John Doe
   ✓ Male • Born 1955

   ICD-10 Codes:
   [I50.9] [E11.9] [I10]

   ✨ 6 Care Plan Suggestions:
   - Risk for Decreased Cardiac Tissue Perfusion
   - Ineffective Health Self-Management
   - Risk for Unstable Blood Glucose Level
   - Impaired Skin Integrity
   ... etc
   ```

4. User enters care plan name: "CHF Management"

5. Clicks "Generate Care Plan"

6. Complete care plan created with NANDA, NIC, NOC items

## Files Modified

1. **src/screens/PatientDetailScreen.tsx**
   - Added `getEncounterCodes` import
   - Updated `handleCreateCarePlan` to fetch and pass ICD-10 codes
   - Async function now loads encounter codes before navigation

2. **src/screens/nursing/CarePlanBuilderScreen.tsx**
   - Added patient data loading
   - Added patient info card display
   - Pre-loads ICD-10 codes from route params
   - Auto-triggers suggestions on load

## Testing

### Test Case 1: Patient with Encounters
- ✅ Navigate to patient with encounters
- ✅ Click "Create Care Plan"
- ✅ Verify patient info displays
- ✅ Verify ICD-10 codes pre-loaded
- ✅ Verify suggestions auto-load

### Test Case 2: Patient without Encounters
- ✅ Navigate to patient without encounters
- ✅ Click "Create Care Plan"
- ✅ Verify patient info displays
- ✅ Verify no codes pre-loaded
- ✅ User can add codes manually

### Test Case 3: Multiple Encounters
- ✅ Patient has 3 encounters
- ✅ Most recent has ICD-10 codes
- ✅ Those codes are used
- ✅ Correct encounter ID passed

## Future Enhancements

1. **Encounter Selection**: Let user choose which encounter to use
2. **Code Editing**: Allow removing/adding codes before generation
3. **Smart Defaults**: Auto-generate care plan name from diagnoses
4. **Care Plan History**: Show previous care plans for this patient
5. **Quick Templates**: Common care plan templates for conditions

## Notes

- Uses existing ICD-10 → NANDA bridge infrastructure
- No database schema changes required
- Backward compatible (works with or without pre-loaded codes)
- Graceful fallback if encounter has no codes
