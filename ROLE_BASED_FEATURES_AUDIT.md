# Role-Based Features Audit & Implementation Plan

**Date**: December 3, 2025  
**Purpose**: Define feature access and UI differences for Doctors vs Nurses  
**Status**: Ready for Implementation

---

## 🎯 Executive Summary

Current system has **6 user roles** but needs clear feature separation between:
- **Doctors (Physicians)**: Full diagnostic and treatment capabilities
- **Nurses**: Patient care, documentation, and nursing-specific tools

**Key Finding**: The nursing module exists but isn't properly separated from doctor features in the UI.

---

## 👥 User Roles Defined

### Current Roles in System
```typescript
export type UserRole = 
  | 'doctor'        // ✅ Full access
  | 'nurse'         // ✅ Care-focused access
  | 'pharmacist'    // Limited to medication coding
  | 'chw'           // Community Health Worker - simplified
  | 'student'       // Learning mode only
  | 'other';        // Basic search only
```

### Role Distribution (Expected)
- **Doctors**: 40% of users
- **Nurses**: 45% of users
- **CHW**: 10% of users
- **Students/Other**: 5% of users

---

## 🏥 DOCTOR FEATURES

### ✅ Full Access Features

#### 1. **ICD-10 Code Search & Management**
- **Location**: `SearchNavigator` → `Icd10SearchScreen`
- **Permissions**: ✅ Full access
- **Capabilities**:
  - Search 71,703 ICD-10 codes
  - View detailed code information
  - Chapter filtering
  - Favorites management
  - Quick add to visit

#### 2. **Patient Management**
- **Location**: `PatientsNavigator` → `PatientsListScreen`
- **Permissions**: ✅ Full access
- **Capabilities**:
  - Create/view patient profiles
  - Track patient demographics
  - Patient history
  - Link encounters to patients

#### 3. **Encounter Management**
- **Location**: `PatientsNavigator` → `EncounterFormScreen`, `EncounterDetailScreen`
- **Permissions**: ✅ Full access
- **Capabilities**:
  - Create clinical encounters
  - Document chief complaints
  - Record structured data (vitals, symptoms)
  - Attach ICD-10 codes
  - AI-powered clinical analysis
  - Risk level assessment (low/moderate/high)
  - Review encounter history

#### 4. **AI Clinical Analysis** 🔒 DOCTOR ONLY
- **Location**: Various screens with AI integration
- **Permissions**: 🔒 **EXCLUSIVE to Doctors**
- **Capabilities**:
  - AI-powered diagnosis suggestions
  - Clinical reasoning explanations
  - Red flag detection
  - Risk stratification
  - Differential diagnosis generation
  - Evidence-based recommendations

#### 5. **Medical Image Processing** 🔒 DOCTOR ONLY
- **Location**: `DocumentScannerScreen`, `AssistantScreen`
- **Permissions**: 🔒 **EXCLUSIVE to Doctors**
- **Capabilities**:
  - Medical image upload
  - Visual symptom analysis
  - Dermatology pattern recognition
  - Wound assessment from images
  - Extract ICD-10 codes from images

#### 6. **Clinical Tools** 🔒 DOCTOR ONLY
- **Location**: `ClinicalToolsScreen`
- **Permissions**: 🔒 **EXCLUSIVE to Doctors**
- **Capabilities**:
  - Drug interaction checker
  - Lab value interpreter
  - Clinical calculators
  - Treatment protocols

#### 7. **Disease Modules**
- **Location**: `DiseaseModulesScreen`
- **Permissions**: ✅ Full access
- **Capabilities**:
  - WHO treatment guidelines
  - Malaria protocols
  - TB diagnostic algorithms
  - Dengue management
  - Emergency protocols

#### 8. **AI Assistant Chat**
- **Location**: `AssistantScreen`
- **Permissions**: ✅ Full access (enhanced features)
- **Capabilities**:
  - Natural language diagnosis queries
  - Symptom-to-ICD mapping
  - Voice input
  - Image attachment analysis
  - Clinical reasoning
  - Code suggestions with confidence levels

#### 9. **Visit Note Management**
- **Location**: `VisitNoteScreen`
- **Permissions**: ✅ Full access
- **Capabilities**:
  - Create visit notes
  - Attach multiple ICD-10 codes
  - Voice recording
  - Image attachments
  - Export/share notes

#### 10. **Favorites & Bookmarks**
- **Location**: `FavoritesNavigator`
- **Permissions**: ✅ Full access
- **Capabilities**:
  - Save frequently used codes
  - Quick access to favorite codes
  - Personal code library

---

## 👩‍⚕️ NURSE FEATURES

### ✅ Full Access Features

#### 1. **ICD-10 Code Search** (Limited Context)
- **Location**: `SearchNavigator` → `Icd10SearchScreen`
- **Permissions**: ✅ Full search access
- **Difference from Doctors**:
  - Same search capabilities
  - Focus on symptom-based searching
  - No diagnostic authority notation
  - Can suggest codes for doctor review

#### 2. **Patient Management**
- **Location**: `PatientsNavigator` → `PatientsListScreen`
- **Permissions**: ✅ Full access
- **Capabilities**:
  - Create/view patient profiles
  - Update patient information
  - Track patient care needs
  - Document nursing assessments

#### 3. **NANDA-I Nursing Diagnoses** 🔒 NURSE PRIORITY
- **Location**: `NursingNavigator` → `NandaSearchScreen`
- **Permissions**: ✅ **PRIMARY for Nurses**
- **Capabilities**:
  - Search 26 NANDA nursing diagnoses
  - View diagnosis definitions
  - See related/risk factors
  - Defining characteristics
  - Evidence-based linkages
  - Auto-map from ICD-10 codes

**NANDA Domains** (13 total):
```
1. Health Promotion
2. Nutrition
3. Elimination and Exchange
4. Activity/Rest
5. Perception/Cognition
6. Self-Perception
7. Role Relationships
8. Sexuality
9. Coping/Stress Tolerance
10. Life Principles
11. Safety/Protection
12. Comfort
13. Growth/Development
```

#### 4. **Nursing Care Plans** 🔒 NURSE PRIORITY
- **Location**: `NursingNavigator` → `CarePlanBuilderScreen`, `CarePlanListScreen`
- **Permissions**: ✅ **PRIMARY for Nurses**
- **Capabilities**:
  - Build comprehensive care plans
  - Select NANDA diagnoses
  - Choose NIC interventions (Nursing Interventions Classification)
  - Set NOC outcomes (Nursing Outcomes Classification)
  - Auto-generate from ICD-10 encounter codes
  - Set goals with baseline/target scores (1-5 scale)
  - Track progress over time
  - Evaluation and documentation

**Care Plan Structure**:
```
NANDA Diagnosis → NIC Interventions → NOC Outcomes
     ↓                    ↓                  ↓
  Problem           Actions Taken        Expected Results
```

#### 5. **NIC Interventions** 🔒 NURSE PRIORITY
- **Permissions**: ✅ Full access
- **Capabilities**:
  - Browse 565+ standardized interventions
  - Evidence-based nursing activities
  - 7 NIC domains
  - Linked to NANDA diagnoses

**NIC Domains** (7 total):
```
1. Physiological: Basic
2. Physiological: Complex
3. Behavioral
4. Safety
5. Family
6. Health System
7. Community
```

#### 6. **NOC Outcomes** 🔒 NURSE PRIORITY
- **Permissions**: ✅ Full access
- **Capabilities**:
  - 490+ standardized outcomes
  - Measurable indicators
  - 1-5 Likert scales
  - Progress tracking

**NOC Domains** (7 total):
```
1. Functional Health
2. Physiologic Health
3. Psychosocial Health
4. Health Knowledge & Behavior
5. Perceived Health
6. Family Health
7. Community Health
```

#### 7. **SBAR Reports** 🔒 NURSE PRIORITY
- **Location**: `NursingNavigator` → `SbarGeneratorScreen`
- **Permissions**: ✅ **PRIMARY for Nurses**
- **Capabilities**:
  - Structured handoff communication
  - S - Situation: Patient condition
  - B - Background: Medical history
  - A - Assessment: Current status
  - R - Recommendation: Actions needed
  - Voice recording option
  - Template generation

**SBAR Report Types**:
```
1. Shift Handoff
2. Physician Call
3. Rapid Response
4. Transfer
5. Discharge
```

#### 8. **Nursing Assessments** 🔒 NURSE PRIORITY
- **Permissions**: ✅ Full access
- **Capabilities**:
  - Head-to-toe assessments
  - Vital signs documentation
  - Pain assessment (0-10 scale)
  - Fall risk scoring (Morse Scale)
  - Pressure ulcer risk (Braden Scale)
  - Wound assessments
  - IV site monitoring
  - Neuro checks (Glasgow Coma Scale)

**Assessment Types**:
```
- Admission Assessment
- Shift Assessment
- Focused Assessment
- Pain Assessment
- Fall Risk Assessment
- Skin Assessment
- Neurological Assessment
- Cardiac Assessment
- Respiratory Assessment
```

#### 9. **Patient Documentation**
- **Location**: `EncounterFormScreen` (nursing context)
- **Permissions**: ✅ Full access
- **Capabilities**:
  - Document care provided
  - Update patient status
  - Record interventions
  - Track outcomes
  - Note changes in condition

#### 10. **AI Assistant Chat** (Limited)
- **Location**: `AssistantScreen`
- **Permissions**: ✅ Access with nursing context
- **Difference from Doctors**:
  - Focus on symptom documentation
  - Nursing diagnosis suggestions
  - Care plan recommendations
  - No diagnostic AI analysis
  - SBAR report assistance

#### 11. **Visit Note Management**
- **Location**: `VisitNoteScreen`
- **Permissions**: ✅ Full access
- **Capabilities**:
  - Document nursing care
  - Record interventions
  - Patient education notes
  - Discharge planning

#### 12. **Favorites & Bookmarks**
- **Location**: `FavoritesNavigator`
- **Permissions**: ✅ Full access
- **Capabilities**:
  - Save frequent NANDA diagnoses
  - Favorite NIC interventions
  - Commonly used ICD-10 codes

### ❌ Restricted Features for Nurses

#### 1. **AI Clinical Diagnosis** 🔒
- **Reason**: Requires medical diagnostic authority
- **Alternative**: Can suggest codes for physician review

#### 2. **Medical Image Analysis** 🔒
- **Reason**: Clinical diagnosis from imaging
- **Alternative**: Can document wound images for physician review

#### 3. **Clinical Decision Tools** 🔒
- **Reason**: Treatment decisions beyond nursing scope
- **Alternative**: Access to nursing-specific calculators

---

## 🔄 ICD-10 ↔ NANDA Mapping

### **THE KEY INNOVATION** ⭐

The system includes **automatic mapping** between medical diagnoses (ICD-10) and nursing diagnoses (NANDA).

**Example Workflow**:
```
Doctor:
  Diagnoses patient with "I10 - Essential Hypertension" (ICD-10)
  
  ↓ (System Auto-Maps)
  
Nurse:
  Receives suggestions for NANDA diagnoses:
  - "00078: Ineffective Health Management"
  - "00179: Risk for Unstable Blood Glucose Level"
  - "00200: Risk for Decreased Cardiac Tissue Perfusion"
  
  ↓ (Nurse Selects & Builds Care Plan)
  
  NANDA: Ineffective Health Management
  NIC: Health Education, Medication Management
  NOC: Knowledge: Medication, Compliance Behavior
```

**Database Table**: `icd10_nanda_mappings`
- Links ICD-10 codes to relevant NANDA diagnoses
- Includes relevance level (primary/secondary/related)
- Rationale for mapping
- Evidence level (research/expert consensus)

---

## 📱 Dashboard Differences

### Doctor Dashboard Features
```
Quick Actions:
✅ ICD-10 Search
✅ AI Assistant
✅ Scan Document (Medical Images)
✅ Clinical Tools (Drug Interactions, Labs)
✅ Disease Modules
✅ Patient Management
✅ Current Visit Notes

Stats Cards:
📊 Total Patients
📊 This Week's Encounters
📊 Favorite Codes
📊 AI Suggestions Used
```

### Nurse Dashboard Features
```
Quick Actions:
✅ ICD-10 Search (Symptom Context)
✅ NANDA Diagnosis Search
✅ Care Plan Builder
✅ SBAR Generator
✅ Nursing Assessments
✅ Patient Care Documentation
✅ Care Plan History

Stats Cards:
📊 Active Care Plans
📊 Patients Under Care
📊 Assessments This Shift
📊 SBAR Reports Generated
```

---

## 🗂️ Navigation Structure

### Doctor Navigation Tabs
```
1. 🏠 Dashboard
2. 🔍 Search (ICD-10)
3. 💬 Assistant (AI Clinical)
4. 🧑‍⚕️ Patients
5. 👤 Profile
```

### Nurse Navigation Tabs
```
1. 🏠 Dashboard
2. 🔍 Search (ICD-10 + NANDA)
3. 📋 Care Plans
4. 🩺 Assessments
5. 💬 Nursing (Module Hub)
6. 👤 Profile
```

**Alternative Approach** (Recommended):
- Same tab structure for all roles
- Content adapts based on role
- "Clinical Tools" tab becomes context-aware:
  - Doctors → Clinical decision tools
  - Nurses → Nursing module hub

---

## 📊 Feature Comparison Matrix

| Feature | Doctor | Nurse | CHW | Student |
|---------|--------|-------|-----|---------|
| **ICD-10 Search** | ✅ Full | ✅ Full | ✅ Basic | ✅ Full |
| **Patient Management** | ✅ Full | ✅ Full | ✅ Basic | ❌ |
| **Encounter Creation** | ✅ Full | ✅ Full | ✅ Basic | ❌ |
| **AI Clinical Analysis** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Image Processing** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Clinical Tools** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **NANDA Diagnoses** | ⚠️ View | ✅ Full | ❌ No | ⚠️ View |
| **NIC Interventions** | ⚠️ View | ✅ Full | ❌ No | ⚠️ View |
| **NOC Outcomes** | ⚠️ View | ✅ Full | ❌ No | ⚠️ View |
| **Care Plan Builder** | ⚠️ View | ✅ Full | ❌ No | ❌ No |
| **SBAR Reports** | ⚠️ View | ✅ Full | ❌ No | ❌ No |
| **Nursing Assessments** | ⚠️ View | ✅ Full | ❌ No | ❌ No |
| **Disease Modules** | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Voice Input** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Favorites** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

**Legend**:
- ✅ Full: Complete access and creation capabilities
- ⚠️ View: Can view but primary use is by another role
- ❌ No: Not accessible

---

## 💾 Database Schema for Roles

### Current Tables (Role-Aware)

#### 1. **User Profiles**
```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('doctor', 'nurse', 'pharmacist', 'chw', 'student', 'other')),
  specialty TEXT,
  license_number TEXT,
  institution TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. **Nursing Care Plans**
```sql
CREATE TABLE public.nursing_care_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),  -- Nurse who created it
  patient_id UUID REFERENCES public.patients(id),
  encounter_id UUID REFERENCES public.encounters(id),
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'active', 'completed', 'discontinued')),
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  target_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. **NANDA Diagnoses**
```sql
CREATE TABLE public.nanda_diagnoses (
  id UUID PRIMARY KEY,
  code TEXT NOT NULL,              -- e.g., "00078"
  label TEXT NOT NULL,             -- e.g., "Ineffective Health Management"
  definition TEXT,
  domain TEXT,                     -- 13 NANDA domains
  class TEXT,
  diagnosis_type TEXT CHECK (diagnosis_type IN ('actual', 'risk', 'health_promotion', 'syndrome')),
  related_factors TEXT[],
  risk_factors TEXT[],
  defining_characteristics TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. **ICD-10 ↔ NANDA Mappings**
```sql
CREATE TABLE public.icd10_nanda_mappings (
  id UUID PRIMARY KEY,
  icd10_id UUID REFERENCES public.icd10_codes(id),
  nanda_id UUID REFERENCES public.nanda_diagnoses(id),
  relevance TEXT CHECK (relevance IN ('primary', 'secondary', 'related')),
  rationale TEXT,
  evidence_level TEXT CHECK (evidence_level IN ('research', 'expert_consensus', 'clinical_practice')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. **SBAR Reports**
```sql
CREATE TABLE public.sbar_reports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),  -- Nurse creating report
  patient_id UUID REFERENCES public.patients(id),
  situation TEXT NOT NULL,
  background TEXT NOT NULL,
  assessment TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  report_type TEXT CHECK (report_type IN ('shift_handoff', 'physician_call', 'rapid_response', 'transfer', 'discharge')),
  urgency TEXT CHECK (urgency IN ('routine', 'urgent', 'emergent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 Row-Level Security (RLS)

### Role-Based Access Policies

#### Nursing Care Plans
```sql
-- Nurses can create/edit their own care plans
CREATE POLICY "Nurses manage own care plans"
ON public.nursing_care_plans
FOR ALL
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'nurse'
  )
);

-- Doctors can view all care plans for their patients
CREATE POLICY "Doctors view care plans"
ON public.nursing_care_plans
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'doctor'
  )
  AND patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);
```

#### SBAR Reports
```sql
-- Only nurses can create SBAR reports
CREATE POLICY "Nurses create SBAR reports"
ON public.sbar_reports
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'nurse'
  )
);
```

---

## 🎨 UI/UX Recommendations

### 1. **Role-Specific Onboarding**

**Doctor Onboarding**:
```
Step 1: Welcome to ICD-10 Mobile Assistant
Step 2: AI-Powered Clinical Decision Support
Step 3: Patient & Encounter Management
Step 4: Image Analysis & Document Scanning
Step 5: Your specialty: [Select]
```

**Nurse Onboarding**:
```
Step 1: Welcome to ICD-10 Mobile Assistant
Step 2: NANDA-NIC-NOC Care Planning
Step 3: SBAR Communication Tools
Step 4: Patient Assessment & Documentation
Step 5: Your nursing specialty: [Select]
```

### 2. **Role Indicators**

Add role badges in UI:
```
Dr. John Smith 👨‍⚕️
[Doctor - Cardiology]

Jane Doe, RN 👩‍⚕️
[Nurse - Critical Care]
```

### 3. **Contextual Help**

**For Doctors**:
- "AI Analysis available for this encounter"
- "Upload medical images for analysis"

**For Nurses**:
- "Generate care plan from ICD-10 codes"
- "Create SBAR report for this patient"

### 4. **Feature Discovery**

**Dashboard Notifications**:
```
Doctor Dashboard:
💡 New Feature: AI can now analyze X-ray images

Nurse Dashboard:
💡 New Feature: Braden Scale auto-calculation added
```

---

## 📋 Implementation Checklist

### Phase 1: Role-Based Dashboard (Week 1)
- [ ] Create `DoctorDashboard` component
- [ ] Create `NurseDashboard` component
- [ ] Update `DashboardScreen` to render based on role
- [ ] Add role-specific quick actions
- [ ] Update stats cards per role
- [ ] Test navigation for each role

### Phase 2: Feature Restrictions (Week 2)
- [ ] Add role check middleware to navigation
- [ ] Disable AI Clinical Analysis for non-doctors
- [ ] Disable Image Processing for non-doctors
- [ ] Disable Clinical Tools for non-doctors
- [ ] Add "Upgrade to Doctor" prompts (if applicable)
- [ ] Update Profile screen to show role

### Phase 3: Nursing Module Visibility (Week 3)
- [ ] Add "Nursing" tab for nurses only
- [ ] Show NANDA search prominently for nurses
- [ ] Add Care Plan quick action to nurse dashboard
- [ ] Add SBAR quick action to nurse dashboard
- [ ] Hide nursing features from doctor dashboard (or show as view-only)

### Phase 4: Database & RLS (Week 4)
- [ ] Verify user_profiles table has role column
- [ ] Add RLS policies for nursing_care_plans
- [ ] Add RLS policies for sbar_reports
- [ ] Test role-based data access
- [ ] Ensure doctors can view nurse-created content

### Phase 5: UI Polish (Week 5)
- [ ] Add role badges to profile
- [ ] Update onboarding per role
- [ ] Add contextual help tooltips
- [ ] Feature discovery notifications
- [ ] Role-specific tutorial videos

### Phase 6: Testing (Week 6)
- [ ] Test doctor user journey
- [ ] Test nurse user journey
- [ ] Test role switching (if admin)
- [ ] Test RLS policies
- [ ] UAT with real nurses and doctors

---

## 🎯 Key Differentiators

### What Makes This Special

1. **ICD-10 ↔ NANDA Auto-Mapping**
   - Unique in the market
   - Bridges medical and nursing languages
   - Evidence-based connections

2. **Integrated Workflow**
   ```
   Doctor → Diagnoses (ICD-10)
   System → Suggests NANDA diagnoses
   Nurse → Builds care plan (NNN linkages)
   Nurse → Documents outcomes
   Doctor → Reviews progress
   ```

3. **Free for All Roles**
   - No tiered pricing
   - Equal access to core features
   - Role-appropriate tools

4. **Offline-First for Both**
   - Doctors can diagnose offline
   - Nurses can document offline
   - Syncs when connected

---

## 📈 Success Metrics

### Doctor Adoption
- % using AI clinical analysis
- Average codes per encounter
- Image processing usage
- Patient management engagement

### Nurse Adoption
- Care plans created per week
- NANDA diagnoses searched
- SBAR reports generated
- Assessment completion rate

### Cross-Role Collaboration
- ICD-10 → NANDA mapping usage
- Care plan reviews by doctors
- SBAR report response time
- Shared patient documentation

---

## 🚀 Next Steps

1. **Review this audit** with medical and nursing advisors
2. **Prioritize features** based on user feedback
3. **Implement role-based dashboard** (highest impact)
4. **Test with real nurses** (beta program)
5. **Iterate based on feedback**

---

## 📞 Questions to Answer

1. Should doctors see nursing care plans by default?
   - **Recommendation**: Yes, view-only access

2. Can nurses suggest ICD-10 codes to doctors?
   - **Recommendation**: Yes, with "pending review" status

3. Should there be a "team" feature for doctor-nurse collaboration?
   - **Recommendation**: Phase 2 feature

4. Can CHWs create simple care plans?
   - **Recommendation**: Yes, simplified version

5. Should students have access to nursing content?
   - **Recommendation**: View-only for learning

---

**End of Audit**

This document serves as the blueprint for implementing role-based features. All decisions should reference this audit to ensure consistency and proper separation of concerns while maintaining collaborative workflows.
