# Phase 5: Quick Test Guide (5 Minutes)
## Fast-track testing for busy developers

## 🚀 Run Database Migration

**Option 1: Supabase Dashboard** (Easiest)
1. Go to https://supabase.com/dashboard
2. Click SQL Editor → New Query
3. Paste contents of `database/phase5_clinical_features.sql`
4. Click Run
5. Look for ✅ success message

**Option 2: Command Line**
```bash
# Replace with your Supabase credentials
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" \
  < database/phase5_clinical_features.sql
```

---

## ✅ Verify Setup (30 seconds)

Run in Supabase SQL Editor:

```sql
-- Should return: 14, 10, 8, 16
SELECT 
  (SELECT COUNT(*) FROM medications) as meds,
  (SELECT COUNT(*) FROM drug_interactions) as interactions,
  (SELECT COUNT(*) FROM drug_contraindications) as contras,
  (SELECT COUNT(*) FROM lab_tests) as labs;
```

---

## 📱 Test in App (3 minutes)

### Drug Checker Test
1. Open app → Clinical Tools → Drug Checker
2. Add: "Warfarin"
3. Add: "Aspirin"
4. Click "Check Interactions"
5. **Expected**: Safety score ~25, 1 Major interaction (red), bleeding risk warning

### Lab Interpreter Test
1. Switch to "Lab Interpreter" tab
2. Add: Test="Glucose", Value="450", Unit="mg/dL"
3. Click "Interpret Results"
4. **Expected**: Critical-High (red), "Severe hyperglycemia" warning

---

## ✅ Success Checklist

- [ ] Database migration completed
- [ ] Drug checker shows Warfarin+Aspirin interaction
- [ ] Lab interpreter flags high glucose
- [ ] No errors in console
- [ ] UI looks good

**If all ✅ → Phase 5 is DONE!** 🎉

---

## 🆘 Quick Fixes

**"Table already exists" error?**
```sql
DROP TABLE IF EXISTS patient_lab_results, lab_tests, 
  patient_medications, drug_contraindications, 
  drug_interactions, medications CASCADE;
```
Then re-run migration.

**"No interactions found"?**
- Try exact spelling: "Warfarin", "Aspirin" (capital W, A)
- Drug matching is case-sensitive in database

**Functions not working?**
```sql
-- Re-create functions only
-- (Copy lines 368-440 from phase5_clinical_features.sql)
```

---

## 📊 Test Data

### Good Drug Combinations to Test
- ✅ Warfarin + Aspirin (Major - bleeding)
- ✅ Metformin + Renal Failure (Absolute contraindication)
- ✅ ACE Inhibitor + Potassium (Moderate - hyperkalemia)
- ✅ SSRI + NSAID (Moderate - GI bleeding)

### Good Lab Values to Test
- ✅ Hemoglobin: 9.5 g/dL (Low - anemia)
- ✅ Glucose: 450 mg/dL (Critical-High - DKA risk)
- ✅ Potassium: 6.5 mmol/L (Critical-High - cardiac arrest)
- ✅ WBC: 1.5 ×10⁹/L (Critical-Low - neutropenia)

---

**Time to completion: 5-10 minutes** ⏱️

---

**Last Updated**: November 29, 2025
