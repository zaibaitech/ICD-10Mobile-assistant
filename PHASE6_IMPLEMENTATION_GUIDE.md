# Phase 6 Implementation Guide
## Nurse-Specific Features Module

**Last Updated:** November 30, 2025

---

## 📋 Overview

This guide provides step-by-step instructions for implementing the Nurse-Specific Features Module (Phase 6) in your ICD-10 Mobile Assistant app. This module introduces the **ICD-10 ↔ NANDA bridge**, which is the unique differentiator that sets your app apart from all competitors.

### What Makes This Special

**No other mobile app** bridges medical diagnosis (ICD-10) with nursing diagnosis (NANDA-I). This module provides:

1. **NANDA-I Nursing Diagnoses** - Standardized nursing diagnosis database
2. **NIC Interventions** - Evidence-based nursing interventions
3. **NOC Outcomes** - Measurable nursing outcomes
4. **ICD-10 ↔ NANDA Mappings** - THE KEY DIFFERENTIATOR
5. **Care Plan Builder** - Auto-generate from medical diagnoses
6. **SBAR Reports** - Structured handoff communication
7. **Nursing Assessments** - Standardized documentation

---

## 🚀 Step 1: Database Setup

### 1.1 Run the Schema Migration

1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Copy contents from `database/nursing-schema.sql`
4. Execute the SQL

**What this creates:**
- `nanda_diagnoses` - NANDA-I nursing diagnoses
- `nic_interventions` - NIC nursing interventions
- `noc_outcomes` - NOC nursing outcomes
- `icd10_nanda_mappings` - **THE BRIDGE** between ICD-10 and NANDA
- `nanda_nic_noc_linkages` - Evidence-based NNN connections
- `nursing_care_plans` - Patient care plans
- `care_plan_items` - Individual nursing diagnoses in care plans
- `sbar_reports` - SBAR handoff reports
- `nursing_assessments` - Structured assessments

### 1.2 Load Sample Data

1. In Supabase SQL Editor
2. Copy contents from `database/seeds/nursing-sample-data.sql`
3. Execute the SQL

**What this loads:**
- 25 most common NANDA diagnoses
- 12 essential NIC interventions
- 9 essential NOC outcomes
- 13 ICD-10 → NANDA mappings
- 11 NNN linkages

### 1.3 Verify Tables

```sql
-- Check that tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'n%';

-- Check sample data counts
SELECT 
  (SELECT COUNT(*) FROM nanda_diagnoses) as nanda_count,
  (SELECT COUNT(*) FROM nic_interventions) as nic_count,
  (SELECT COUNT(*) FROM noc_outcomes) as noc_count,
  (SELECT COUNT(*) FROM icd10_nanda_mappings) as mapping_count;
```

Expected output:
- nanda_count: 25
- nic_count: 12
- noc_count: 9
- mapping_count: 13

---

## 🔧 Step 2: Install Dependencies

No additional dependencies needed! All services use existing Supabase client.

---

## 📝 Step 3: Test the Services

### 3.1 Test NANDA Service

Create a test file: `test-nursing-services.ts`

```typescript
import { searchNandaDiagnoses, getNandaById, getNnnLinkages } from './services/nanda';

async function testNandaService() {
  console.log('Testing NANDA service...\n');
  
  // Test 1: Search for "pain"
  const painDiagnoses = await searchNandaDiagnoses('pain');
  console.log('Pain-related diagnoses:', painDiagnoses.length);
  console.log('First result:', painDiagnoses[0]?.label);
  
  // Test 2: Get by code
  const acutePain = await getNandaByCode('00132');
  console.log('\nAcute Pain diagnosis:', acutePain?.label);
  
  // Test 3: Get NNN linkages
  if (acutePain) {
    const linkages = await getNnnLinkages(acutePain.id);
    console.log('\nNNN linkages for Acute Pain:', linkages.length);
    console.log('First intervention:', linkages[0]?.nic?.label);
    console.log('First outcome:', linkages[0]?.noc?.label);
  }
}

testNandaService();
```

Run: `npx ts-node test-nursing-services.ts`

**Expected output:**
```
Testing NANDA service...

Pain-related diagnoses: 2
First result: Acute Pain

Acute Pain diagnosis: Acute Pain

NNN linkages for Acute Pain: 1
First intervention: Pain Management
First outcome: Pain Level
```

### 3.2 Test ICD-10 ↔ NANDA Bridge

```typescript
import { 
  getNandaForIcd10, 
  getCarePlanningSuggestions 
} from './services/icd10NandaBridge';

async function testBridge() {
  console.log('Testing ICD-10 ↔ NANDA Bridge...\n');
  
  // Find Hypertension (I10) in your database
  const { data: icd10 } = await supabase
    .from('icd10_codes')
    .select('id, code, description')
    .eq('code', 'I10')
    .single();
  
  console.log('Testing with:', icd10.description);
  
  // Get NANDA mappings
  const mappings = await getNandaForIcd10(icd10.id);
  console.log('\nNursing diagnoses for Hypertension:', mappings.length);
  
  mappings.forEach(m => {
    console.log(`  - ${m.nanda_diagnosis?.label} (${m.relevance})`);
  });
  
  // Get complete care planning suggestions
  const suggestions = await getCarePlanningSuggestions(icd10.id);
  console.log('\nComplete care plan suggestions:', suggestions.length);
  
  const first = suggestions[0];
  console.log('\nFirst suggestion:');
  console.log('  NANDA:', first.nanda.label);
  console.log('  NICs:', first.suggestedNics.map(n => n.label).join(', '));
  console.log('  NOCs:', first.suggestedNocs.map(n => n.label).join(', '));
}

testBridge();
```

**Expected output:**
```
Testing ICD-10 ↔ NANDA Bridge...

Testing with: Essential (primary) hypertension

Nursing diagnoses for Hypertension: 3
  - Risk for Decreased Cardiac Tissue Perfusion (primary)
  - Ineffective Health Self-Management (secondary)
  - Deficient Knowledge (related)

Complete care plan suggestions: 3

First suggestion:
  NANDA: Risk for Decreased Cardiac Tissue Perfusion
  NICs: Vital Signs Monitoring, Medication Administration
  NOCs: Vital Signs, Cardiac Pump Effectiveness
```

### 3.3 Test Care Plan Auto-Generation

```typescript
import { generateCarePlanFromIcd10 } from './services/carePlan';

async function testCarePlanGeneration() {
  console.log('Testing care plan auto-generation...\n');
  
  // Get ICD-10 codes for Hypertension and Diabetes
  const { data: icd10Codes } = await supabase
    .from('icd10_codes')
    .select('id, code, description')
    .in('code', ['I10', 'E11.9']);
  
  console.log('Generating care plan for:');
  icd10Codes.forEach(c => console.log(`  - ${c.code}: ${c.description}`));
  
  // You need a real patient ID - get from your database
  const { data: patient } = await supabase
    .from('patients')
    .select('id, display_label')
    .limit(1)
    .single();
  
  if (!patient) {
    console.log('\nNo patients found. Create a patient first.');
    return;
  }
  
  const carePlan = await generateCarePlanFromIcd10(
    patient.id,
    icd10Codes.map(c => c.id),
    { title: 'HTN + DM2 Care Plan' }
  );
  
  console.log('\n✅ Care plan generated!');
  console.log('Title:', carePlan.title);
  console.log('Items:', carePlan.items?.length);
  
  carePlan.items?.forEach((item, i) => {
    console.log(`\n${i + 1}. ${item.nanda?.label}`);
    console.log('   Related to:', item.icd10?.description);
    console.log('   Interventions:', item.nics?.length);
    console.log('   Outcomes:', item.nocs?.length);
  });
}

testCarePlanGeneration();
```

### 3.4 Test SBAR Generation

```typescript
import { generateSbarTemplate, createSbarReport } from './services/sbar';

async function testSbar() {
  console.log('Testing SBAR template generation...\n');
  
  // Get a patient
  const { data: patient } = await supabase
    .from('patients')
    .select('id, display_label')
    .limit(1)
    .single();
  
  if (!patient) {
    console.log('No patients found.');
    return;
  }
  
  const template = await generateSbarTemplate(
    patient.id,
    'shift_handoff'
  );
  
  console.log('SBAR Template:');
  console.log('\nSituation:', template.situation);
  console.log('\nBackground:', template.background);
  console.log('\nAssessment:', template.assessment);
  console.log('\nRecommendation:', template.recommendation);
}

testSbar();
```

---

## 🎨 Step 4: Build UI Components

### 4.1 Create Directory Structure

```bash
mkdir -p screens/nursing
mkdir -p components/nursing
```

### 4.2 Example: NANDA Search Screen

Create `screens/nursing/NandaSearchScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import { searchNandaDiagnoses } from '../../services/nanda';
import type { NandaDiagnosis } from '../../types/nursing';

export function NandaSearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NandaDiagnosis[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    
    setLoading(true);
    try {
      const diagnoses = await searchNandaDiagnoses(query);
      setResults(diagnoses);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        placeholder="Search NANDA diagnoses..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      />
      
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>
              {item.code} - {item.label}
            </Text>
            <Text style={{ color: '#666', marginTop: 4 }}>
              {item.domain} • {item.diagnosis_type}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#999', marginTop: 32 }}>
            {loading ? 'Searching...' : 'No results'}
          </Text>
        }
      />
    </View>
  );
}
```

### 4.3 Example: Care Plan Builder

Create `screens/nursing/CarePlanBuilderScreen.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { getCarePlanningSuggestionsForMultiple } from '../../services/icd10NandaBridge';
import { generateCarePlanFromIcd10 } from '../../services/carePlan';
import type { CarePlanningSuggestion } from '../../types/nursing';

interface Props {
  patientId: string;
  icd10Ids: string[];
}

export function CarePlanBuilderScreen({ patientId, icd10Ids }: Props) {
  const [suggestions, setSuggestions] = useState<CarePlanningSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadSuggestions();
  }, []);
  
  const loadSuggestions = async () => {
    try {
      const data = await getCarePlanningSuggestionsForMultiple(icd10Ids);
      setSuggestions(data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerate = async () => {
    try {
      const carePlan = await generateCarePlanFromIcd10(patientId, icd10Ids);
      console.log('Care plan generated:', carePlan.id);
      // Navigate to care plan detail screen
    } catch (error) {
      console.error('Error generating care plan:', error);
    }
  };
  
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Suggested Nursing Diagnoses
      </Text>
      
      <FlatList
        data={suggestions}
        keyExtractor={item => item.nanda.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              backgroundColor: '#f9fafb',
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              {item.nanda.label}
            </Text>
            <Text style={{ color: '#666', marginTop: 4 }}>
              Related to: {item.icd10.description}
            </Text>
            <Text style={{ color: '#10b981', marginTop: 4 }}>
              {item.suggestedNics.length} interventions • {item.suggestedNocs.length} outcomes
            </Text>
          </View>
        )}
      />
      
      <Button
        title="Generate Care Plan"
        onPress={handleGenerate}
        disabled={suggestions.length === 0}
      />
    </View>
  );
}
```

---

## 🧪 Step 5: Testing Checklist

### Database Tests
- [ ] All tables created successfully
- [ ] Sample data loaded
- [ ] Indexes created
- [ ] RLS policies active
- [ ] Foreign key constraints working

### Service Tests
- [ ] NANDA search returns results
- [ ] NNN linkages retrieved correctly
- [ ] ICD-10 → NANDA mappings work
- [ ] Care plan auto-generation works
- [ ] SBAR template generation works

### Integration Tests
- [ ] Create patient
- [ ] Create encounter with ICD-10 codes
- [ ] Generate care plan from encounter
- [ ] View care plan with all linked data
- [ ] Update care plan item scores
- [ ] Create SBAR report
- [ ] Export SBAR for sharing

---

## 🚀 Step 6: Deployment

### 6.1 Environment Variables

No new environment variables needed.

### 6.2 Database Migration

Run migrations in Supabase Dashboard (already done in Step 1).

### 6.3 Verify Permissions

Test with different user roles:
- [ ] Nurse can create care plans
- [ ] Nurse can create SBAR reports
- [ ] Care plans filtered by organization
- [ ] SBAR reports filtered by organization

---

## 📊 Step 7: Monitor & Optimize

### Track Usage

```sql
-- Most used NANDA diagnoses
SELECT 
  nd.code,
  nd.label,
  COUNT(*) as usage_count
FROM care_plan_items cpi
JOIN nanda_diagnoses nd ON cpi.nanda_id = nd.id
GROUP BY nd.id, nd.code, nd.label
ORDER BY usage_count DESC
LIMIT 10;

-- Care plan generation rate
SELECT 
  DATE(created_at) as date,
  COUNT(*) as care_plans_created
FROM nursing_care_plans
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Performance Optimization

- Add indexes if searches are slow
- Cache popular NANDA/NIC/NOC data
- Pre-load mappings for common ICD-10 codes

---

## 🐛 Troubleshooting

### Issue: No NANDA mappings found

**Solution:** Ensure you've loaded sample data and ICD-10 codes exist in your database.

```sql
-- Check if ICD-10 codes exist
SELECT * FROM icd10_codes WHERE code IN ('I10', 'E11.9', 'J18.9');

-- Check mappings
SELECT * FROM icd10_nanda_mappings;
```

### Issue: Care plan generation fails

**Solution:** Check that patient exists and user is authenticated.

```typescript
// Verify patient exists
const { data: patient } = await supabase
  .from('patients')
  .select('*')
  .eq('id', patientId)
  .single();

if (!patient) {
  throw new Error('Patient not found');
}
```

### Issue: RLS blocking queries

**Solution:** Verify user has organization membership.

```sql
-- Check user's organization
SELECT * FROM organization_members WHERE user_id = auth.uid();

-- Test RLS policy
SELECT * FROM nursing_care_plans WHERE patient_id = 'some-id';
```

---

## ✅ Success Criteria

Phase 6 is complete when:

1. ✅ All database tables created and seeded
2. ✅ Service layer functions tested
3. ✅ ICD-10 → NANDA bridge working
4. ✅ Care plan auto-generation working
5. ✅ SBAR template generation working
6. ✅ UI screens built and tested
7. ✅ User can search NANDA diagnoses
8. ✅ User can generate care plan from medical diagnoses
9. ✅ User can create SBAR reports
10. ✅ All data syncs correctly with RLS

---

## 📚 Next Steps

After completing Phase 6:

1. **Add More Content**
   - Expand from 25 to 267 NANDA diagnoses
   - Add specialty-specific content (ICU, Peds, etc.)
   - Add more ICD-10 → NANDA mappings

2. **Enhance Features**
   - Voice-to-text for SBAR
   - PDF export for care plans
   - Offline support for NANDA database
   - Team collaboration on care plans

3. **Beta Testing**
   - Recruit 10-20 nurses
   - Gather feedback on workflows
   - Refine UI based on usage

4. **Marketing**
   - Highlight the ICD-10 ↔ NANDA bridge
   - Create demo videos
   - Submit to app stores

---

## 🎯 Remember

**The ICD-10 ↔ NANDA bridge is what makes your app unique.** Focus on making this feature:
- **Easy to discover** - Show suggestions prominently
- **Fast** - Optimize queries for instant results
- **Accurate** - Use evidence-based mappings
- **Valuable** - Save nurses 15-20 minutes per care plan

**No other app does this. This is your competitive advantage.**

---

**Questions or issues?** Check `PHASE6_QUICK_REFERENCE.md` for common patterns and examples.
