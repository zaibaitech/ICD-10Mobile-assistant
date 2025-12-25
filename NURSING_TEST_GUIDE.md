# 🧪 Quick Test Guide - Nursing Module

## Test the Role-Based Navigation

### Step 1: Login/Register as Nurse

1. Start the app: `npm start`
2. If you don't have a nurse account:
   - Tap "Register"
   - Fill in details
   - **Important**: Select "Nurse" as your role
   - Complete registration
3. Or login with existing nurse account

### Step 2: Verify Tab Navigation

**Expected tabs for NURSE:**
1. 🏠 Home
2. 🔍 ICD-10
3. 💬 AI
4. 👥 Patients
5. 📋 **Nursing** ← Should be visible!
6. 📚 Guides
7. 📝 Visit

**The Nursing tab should:**
- Show clipboard icon (📋)
- Be the 5th tab from the left
- Highlight in blue when tapped

### Step 3: Test Nursing Features

#### 3.1 Search NANDA Diagnoses
1. Tap the **Nursing** tab (clipboard icon)
2. Should see "Search NANDA diagnoses..." screen
3. Try searches:
   - Type "pain" → Should find "Acute Pain", "Chronic Pain"
   - Type "skin" → Should find "Impaired Skin Integrity"
   - Type "infection" → Should find "Risk for Infection"

#### 3.2 View NANDA Details
1. Tap any diagnosis (e.g., "Acute Pain")
2. Should see:
   - ✅ Full definition
   - ✅ Domain & Class
   - ✅ Diagnosis type (actual/risk)
   - ✅ Risk factors
   - ✅ Defining characteristics
   - ✅ NIC Interventions section
   - ✅ NOC Outcomes section

#### 3.3 Browse by Filters
1. On NANDA Search screen, use tabs:
   - **Type**: Actual | Risk | Health Promotion | Syndrome
   - **Domain**: Safety/Protection, Nutrition, etc.
2. Try "Risk" tab → Should see only risk diagnoses
3. Try "Safety/Protection" → Should filter by domain

#### 3.4 View Popular Diagnoses
1. Scroll to "Popular Diagnoses" section
2. Should see common diagnoses like:
   - Risk for Falls
   - Acute Pain
   - Anxiety
   - Impaired Gas Exchange

### Step 4: Test ICD-10 → NANDA Bridge

This is **THE DIFFERENTIATOR** feature!

1. Go to ICD-10 Search tab
2. Search for a diagnosis, e.g., "Hypertension" (code I10)
3. Tap the result
4. Look for a button/link to "View Nursing Diagnoses" or similar
5. Should show related NANDA diagnoses:
   - Primary: Risk for Decreased Cardiac Tissue Perfusion
   - Secondary: Ineffective Health Self-Management
   - Related: Deficient Knowledge

### Step 5: Test Care Plan Builder

1. Tap **Nursing** tab
2. Navigate to "Care Plan Builder" (might be a button/link)
3. **Option 1: Manual**:
   - Search and select NANDA diagnoses
   - Choose NIC interventions
   - Set NOC outcomes
   - Add notes
   - Save

4. **Option 2: Auto-generate from ICD-10**:
   - Enter ICD-10 codes (e.g., I10, E11.9)
   - Tap "Generate Care Plan"
   - Should auto-suggest NANDA diagnoses
   - Review and customize
   - Save

### Step 6: Test SBAR Generator

1. From Nursing tab, find "SBAR Generator"
2. Fill in template:
   - **S**ituation: Patient condition
   - **B**ackground: History/context
   - **A**ssessment: Current status
   - **R**ecommendation: Proposed actions
3. Should generate formatted SBAR report
4. Test share functionality

## Test as Different Roles

### Test as Pharmacist:
1. Logout
2. Login/register as **Pharmacist**
3. **Expected**: NO Nursing tab
4. Should only see: Home, ICD-10, AI, Guides

### Test as Doctor:
1. Logout
2. Login/register as **Doctor**
3. **Expected**: Nursing tab IS visible
4. Should see all tabs including Nursing

### Test as Student:
1. Logout
2. Login/register as **Medical Student**
3. **Expected**: NO Nursing tab
4. Limited to: Home, ICD-10, AI, Guides

## Expected Results

### ✅ Success Criteria:
- [ ] Nursing tab visible for nurses
- [ ] Nursing tab visible for doctors
- [ ] Nursing tab HIDDEN for pharmacists/students/others
- [ ] NANDA search returns results
- [ ] Can view NANDA details with NIC/NOC
- [ ] Filters work (type, domain)
- [ ] Popular diagnoses display
- [ ] ICD-10→NANDA bridge shows mappings
- [ ] Care plan builder accessible
- [ ] SBAR generator accessible

### ❌ Known Issues to Watch For:
- If Nursing tab doesn't show: Check user role in profile
- If search returns no results: Database might not be seeded
- If navigation crashes: Clear Metro cache and restart

## Troubleshooting

### Issue: Nursing Tab Not Visible
**Solution:**
1. Check your profile role: Go to Profile screen
2. Should say "Nurse" or "Doctor"
3. If not, you may need to update your profile

### Issue: No Search Results
**Solution:**
1. Database might not be seeded with sample data
2. Run: `node test-nursing-backend.js` to verify data
3. Check Supabase dashboard → nursing tables should have data

### Issue: Navigation Errors
**Solution:**
```bash
# Clear cache and restart
npm start -- --clear
# or
npx expo start -c
```

## Quick Database Check

If features aren't working, verify data exists:

```bash
node test-nursing-backend.js
```

Should show:
- ✅ 26 NANDA diagnoses
- ✅ 12 NIC interventions  
- ✅ 9 NOC outcomes
- ✅ 16 ICD-10→NANDA mappings

## Report Issues

If you find bugs:
1. Note the role you're logged in as
2. Which screen/feature isn't working
3. Any error messages in console
4. Screenshots if possible

---

**Happy Testing!** 🎉

The Nursing Module is a unique feature that sets this app apart from other ICD-10 apps!
