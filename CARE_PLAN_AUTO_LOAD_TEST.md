# Care Plan Auto-Load Testing Guide

## Quick Test Steps

### Test 1: Patient with ICD-10 Codes
1. Open the app
2. Go to **Patients** tab
3. Select a patient (or create one)
4. Create an encounter for the patient
5. Add ICD-10 codes to the encounter (e.g., I10, E11.9, J18.9)
6. Go back to Patient Detail screen
7. Click **"Create Care Plan"** button

**Expected Result:**
- ✅ Care Plan Builder opens
- ✅ Green patient info card shows at top with patient name
- ✅ ICD-10 codes (I10, E11.9, J18.9) appear as pills
- ✅ NANDA diagnosis suggestions automatically display
- ✅ Suggestions show mapped NANDA diagnoses for each ICD-10 code

### Test 2: Patient without ICD-10 Codes
1. Go to **Patients** tab
2. Select a patient with no encounters (or encounters without codes)
3. Click **"Create Care Plan"** button

**Expected Result:**
- ✅ Care Plan Builder opens
- ✅ Green patient info card shows at top
- ✅ No ICD-10 codes pre-loaded
- ✅ User can manually add codes
- ✅ No warning message about selecting patient

### Test 3: Preview Mode (No Patient)
1. Go to **Nursing** tab
2. Click "Care Plan Builder"
3. Manually add ICD-10 codes (e.g., I10)

**Expected Result:**
- ✅ No patient info card shows
- ✅ Yellow warning shows about selecting patient
- ✅ Can still view suggestions
- ✅ Cannot generate care plan (blocked)

## What to Look For

### ✅ Success Indicators
- Patient info card (green) displays correctly
- ICD-10 codes from encounter appear automatically
- NANDA suggestions load without clicking anything
- No errors in console
- Can proceed to generate care plan

### ❌ Error Indicators
- No patient info when patient selected
- Codes don't appear automatically
- Suggestions don't load
- Console errors about missing data

## Manual Testing Checklist

- [ ] Patient info card displays correct name
- [ ] Patient info card shows sex and birth year
- [ ] ICD-10 codes from encounter pre-load
- [ ] Can remove pre-loaded codes
- [ ] Can add additional codes
- [ ] Suggestions auto-generate on load
- [ ] Suggestions match ICD-10 codes
- [ ] Generate button works
- [ ] Care plan saves to patient
- [ ] Care plan links to encounter

## Sample Data for Testing

### Test Patient
```
Name: John Doe
Sex: Male
Year of Birth: 1955
```

### Test Encounter
```
Chief Complaint: Chest pain and shortness of breath
Date: 2025-12-01
```

### Test ICD-10 Codes
```
I10    - Essential (primary) hypertension
E11.9  - Type 2 diabetes mellitus without complications
I50.9  - Heart failure, unspecified
J18.9  - Pneumonia, unspecified organism
```

### Expected NANDA Mappings
- **I10** → Risk for Decreased Cardiac Tissue Perfusion (00200)
- **I10** → Ineffective Health Self-Management (00078)
- **E11.9** → Risk for Unstable Blood Glucose Level (00179)
- **E11.9** → Impaired Skin Integrity (00046)
- **I50.9** → Risk for Decreased Cardiac Tissue Perfusion (00200)
- **I50.9** → Fatigue (00093)
- **J18.9** → Impaired Gas Exchange (00030)
- **J18.9** → Ineffective Airway Clearance (00031)

## Troubleshooting

### Issue: Codes don't pre-load
**Check:**
- Does the patient have encounters?
- Do the encounters have ICD-10 codes?
- Check console for errors

**Fix:**
- Add ICD-10 codes to the encounter first
- Ensure encounter is saved
- Try refreshing patient detail

### Issue: Patient info doesn't show
**Check:**
- Is patientId being passed correctly?
- Check navigation params

**Fix:**
- Verify navigation call in PatientDetailScreen
- Check route params in CarePlanBuilderScreen

### Issue: Suggestions don't load
**Check:**
- Are ICD-10 codes valid?
- Does the database have NANDA mappings?
- Check network connection

**Fix:**
- Verify ICD-10 codes exist in database
- Run nursing-sample-data.sql to ensure mappings
- Check Supabase connection

## Performance Notes

- Initial load may take 1-2 seconds to:
  - Fetch patient data
  - Fetch encounter codes
  - Load NANDA suggestions
  - Query ICD-10 bridge

- This is normal and expected
- Loading indicator should show during fetch

## Success Criteria

✅ **Feature is working correctly if:**
1. Patient info displays when coming from Patient Detail
2. ICD-10 codes from encounter automatically load
3. NANDA suggestions generate without user action
4. User can generate care plan immediately
5. Care plan links to patient and encounter
6. No console errors
7. Smooth navigation flow

## Next Steps After Testing

If all tests pass:
- ✅ Feature ready for production
- ✅ Document in user guide
- ✅ Add to release notes

If tests fail:
- ❌ Check error logs
- ❌ Review code changes
- ❌ Verify database schema
- ❌ Test data seeding
