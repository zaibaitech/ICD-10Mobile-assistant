# Phase 6 Quick Reference
## Nursing Module API Usage Examples

**Last Updated:** November 30, 2025

---

## 🔍 NANDA Search & Browse

### Search by keyword

```typescript
import { searchNandaDiagnoses } from './services/nanda';

// Search for pain-related diagnoses
const results = await searchNandaDiagnoses('pain');

// Search with filters
const riskDiagnoses = await searchNandaDiagnoses('cardiac', {
  type: 'risk',
  limit: 20
});

// Search within a domain
const activityDiagnoses = await searchNandaDiagnoses('', {
  domain: 'Activity/Rest'
});
```

### Get by code

```typescript
import { getNandaByCode } from './services/nanda';

const acutePain = await getNandaByCode('00132');
console.log(acutePain.label); // "Acute Pain"
```

### Browse by domain

```typescript
import { getNandaDomains, getNandaByDomain } from './services/nanda';

// Get all available domains
const domains = await getNandaDomains();
// ['Health Promotion', 'Nutrition', 'Activity/Rest', ...]

// Get diagnoses in a domain
const safetyDiagnoses = await getNandaByDomain('Safety/Protection');
```

### Get popular diagnoses

```typescript
import { getPopularNandaDiagnoses } from './services/nanda';

// Get top 10 most used in care plans
const popular = await getPopularNandaDiagnoses(10);
```

---

## 🌉 ICD-10 ↔ NANDA Bridge (THE MAGIC)

### Get nursing diagnoses for a medical diagnosis

```typescript
import { getNandaForIcd10 } from './services/icd10NandaBridge';

// Patient has Hypertension (I10)
const icd10Id = 'uuid-of-i10-code';
const mappings = await getNandaForIcd10(icd10Id);

mappings.forEach(mapping => {
  console.log(`${mapping.nanda_diagnosis.label} (${mapping.relevance})`);
  console.log(`Rationale: ${mapping.rationale}`);
});

// Output:
// Risk for Decreased Cardiac Tissue Perfusion (primary)
// Rationale: Hypertension directly increases risk...
```

### Get medical diagnoses for a nursing diagnosis

```typescript
import { getIcd10ForNanda } from './services/icd10NandaBridge';

// Which medical conditions relate to Acute Pain?
const nandaId = 'uuid-of-acute-pain';
const mappings = await getIcd10ForNanda(nandaId);

mappings.forEach(mapping => {
  console.log(`${mapping.icd10_code.code} - ${mapping.icd10_code.description}`);
});
```

### Get complete care planning suggestions

```typescript
import { getCarePlanningSuggestions } from './services/icd10NandaBridge';

// Get NANDA + NIC + NOC for an ICD-10 code
const suggestions = await getCarePlanningSuggestions(icd10Id);

suggestions.forEach(s => {
  console.log('Medical:', s.icd10.description);
  console.log('Nursing:', s.nanda.label);
  console.log('Interventions:', s.suggestedNics.map(n => n.label));
  console.log('Outcomes:', s.suggestedNocs.map(n => n.label));
});
```

### Get suggestions for multiple diagnoses

```typescript
import { getCarePlanningSuggestionsForMultiple } from './services/icd10NandaBridge';

// Patient has HTN + DM2 + CHF
const icd10Ids = [htnId, dm2Id, chfId];
const allSuggestions = await getCarePlanningSuggestionsForMultiple(icd10Ids);

// Returns deduplicated list sorted by relevance
```

---

## 📋 Care Plan Management

### Create a care plan

```typescript
import { createCarePlan } from './services/carePlan';

const carePlan = await createCarePlan({
  patient_id: patientId,
  encounter_id: encounterId, // optional
  title: 'Post-Op Care Plan',
  priority: 'high',
  target_date: '2025-12-15'
});
```

### Add items to care plan

```typescript
import { addCarePlanItem } from './services/carePlan';

const item = await addCarePlanItem(carePlanId, {
  nanda_id: nandaId,
  icd10_id: icd10Id,
  related_factors: ['Surgery', 'Tissue trauma'],
  evidenced_by: ['Patient reports pain 7/10', 'Guarding behavior'],
  noc_ids: [painLevelId],
  goal_statement: 'Pain level will decrease from 7/10 to 3/10 within 24 hours',
  baseline_score: 2, // Severe pain
  target_score: 4,   // Mild pain
  nic_ids: [painManagementId, medicationAdminId],
  custom_interventions: ['Offer ice packs q2h']
});
```

### Auto-generate care plan from ICD-10

```typescript
import { generateCarePlanFromIcd10 } from './services/carePlan';

// THE MAGIC: Auto-generate complete care plan
const carePlan = await generateCarePlanFromIcd10(
  patientId,
  [htnId, dm2Id], // ICD-10 IDs
  {
    title: 'HTN + DM2 Management',
    priority: 'medium'
  }
);

// Returns complete care plan with:
// - NANDA diagnoses for each ICD-10
// - Recommended NIC interventions
// - Recommended NOC outcomes
// - Default baseline/target scores
```

### Generate from encounter

```typescript
import { generateCarePlanFromEncounter } from './services/carePlan';

// Auto-use encounter's ICD-10 codes
const carePlan = await generateCarePlanFromEncounter(encounterId);
```

### Update care plan item (evaluation)

```typescript
import { updateCarePlanItem } from './services/carePlan';

const updated = await updateCarePlanItem(itemId, {
  current_score: 4, // Improved from 2 to 4
  evaluation_notes: 'Patient reports pain decreased to 3/10. Able to ambulate with minimal discomfort.',
  evaluation_date: '2025-12-01',
  status: 'ongoing'
});
```

### Get care plans for patient

```typescript
import { getCarePlansForPatient, getActiveCarePlan } from './services/carePlan';

// Get all care plans
const allPlans = await getCarePlansForPatient(patientId);

// Get currently active plan
const activePlan = await getActiveCarePlan(patientId);
```

### Update care plan status

```typescript
import { updateCarePlan } from './services/carePlan';

// Mark as completed
await updateCarePlan(carePlanId, {
  status: 'completed',
  completed_date: '2025-12-05'
});

// Discontinue
await updateCarePlan(carePlanId, {
  status: 'discontinued',
  discontinued_reason: 'Patient transferred to another facility'
});
```

---

## 📝 SBAR Reports

### Generate SBAR template

```typescript
import { generateSbarTemplate } from './services/sbar';

// Auto-fills Situation and Background from patient data
const template = await generateSbarTemplate(
  patientId,
  'shift_handoff'
);

console.log(template.situation);
// "Calling about John Doe, MRN: 12345. Providing shift handoff report."

console.log(template.background);
// "Admitted with chest pain. Diagnoses: Hypertension, Type 2 Diabetes."
```

### Create SBAR report

```typescript
import { createSbarReport } from './services/sbar';

const report = await createSbarReport({
  patient_id: patientId,
  report_type: 'physician_call',
  urgency: 'urgent',
  situation: 'Calling about increased shortness of breath',
  background: 'Patient with CHF, admitted 3 days ago',
  assessment: 'RR 28, SpO2 88% on 2L, crackles bilateral bases',
  recommendation: 'Please evaluate for possible diuretic adjustment',
  vital_signs: {
    respiratory_rate: 28,
    oxygen_saturation: 88,
    heart_rate: 105,
    blood_pressure_systolic: 145,
    blood_pressure_diastolic: 92
  },
  linked_icd10_ids: [chfId],
  linked_nanda_ids: [impairedGasExchangeId]
});
```

### Format for sharing

```typescript
import { formatSbarForSharing } from './services/sbar';

const formatted = formatSbarForSharing(report);

// Copy to clipboard
Clipboard.setString(formatted);

// Or share
Share.share({ message: formatted });
```

Output:
```
═══════════════════════════════════
SBAR REPORT - PHYSICIAN CALL
Date: 11/30/2025, 2:30 PM
Urgency: URGENT
═══════════════════════════════════

📋 SITUATION
Calling about increased shortness of breath

📚 BACKGROUND
Patient with CHF, admitted 3 days ago

🔍 ASSESSMENT
RR 28, SpO2 88% on 2L, crackles bilateral bases

📊 VITAL SIGNS
  • HR: 105 bpm
  • BP: 145/92 mmHg
  • RR: 28 breaths/min
  • SpO2: 88%

💡 RECOMMENDATION
Please evaluate for possible diuretic adjustment

═══════════════════════════════════
```

### Get patient's SBAR history

```typescript
import { getSbarReportsForPatient } from './services/sbar';

// Get last 10 reports
const reports = await getSbarReportsForPatient(patientId, 10);

// Group by type
const byType = reports.reduce((acc, report) => {
  acc[report.report_type] = acc[report.report_type] || [];
  acc[report.report_type].push(report);
  return acc;
}, {});
```

---

## 🔗 NNN Linkages

### Get interventions and outcomes for a diagnosis

```typescript
import { getNnnLinkages } from './services/nanda';

const linkages = await getNnnLinkages(nandaId);

// Extract interventions
const interventions = linkages.map(l => l.nic);

// Extract outcomes
const outcomes = linkages.map(l => l.noc);

// Sort by priority
const highPriority = linkages.filter(l => l.priority === 1);
```

### Get just interventions

```typescript
import { getRecommendedNics } from './services/nanda';

const nics = await getRecommendedNics(nandaId);
console.log('Recommended interventions:', nics.length);
```

### Get just outcomes

```typescript
import { getRecommendedNocs } from './services/nanda';

const nocs = await getRecommendedNocs(nandaId);
console.log('Expected outcomes:', nocs.length);
```

---

## 🎨 Utility Functions

### Format displays

```typescript
import { 
  formatNandaDisplay,
  formatNicDisplay,
  formatNocDisplay,
  getDiagnosisTypeLabel
} from './services/nanda';

const display = formatNandaDisplay(nanda);
// "00132 - Acute Pain"

const typeLabel = getDiagnosisTypeLabel('risk');
// "Risk Diagnosis"
```

### Relevance badges

```typescript
import { getRelevanceBadge } from './services/icd10NandaBridge';

const badge = getRelevanceBadge('primary');
// { label: 'Primary', color: '#065f46', backgroundColor: '#d1fae5' }

// Use in UI
<View style={{ 
  backgroundColor: badge.backgroundColor,
  padding: 4,
  borderRadius: 4 
}}>
  <Text style={{ color: badge.color }}>{badge.label}</Text>
</View>
```

### Care plan progress

```typescript
import { getCarePlanProgress } from './services/carePlan';

const progress = getCarePlanProgress(carePlan);
// 60 (60% of items resolved)

// Use in UI
<ProgressBar progress={progress / 100} />
```

### Export care plan

```typescript
import { formatCarePlanForExport } from './services/carePlan';

const text = formatCarePlanForExport(carePlan);

// Save as PDF or share
Share.share({ message: text });
```

---

## 🔢 NOC Scoring

### Score scale reference

```typescript
import { NOC_SCORE_SCALES } from '../types/nursing';

// Display scale to user
Object.values(NOC_SCORE_SCALES).forEach(scale => {
  console.log(`${scale.score}: ${scale.label} - ${scale.description}`);
});

// 1: Severely Compromised - Significant deviation from expected outcome
// 2: Substantially Compromised - Moderate deviation from expected outcome
// 3: Moderately Compromised - Some deviation from expected outcome
// 4: Mildly Compromised - Minimal deviation from expected outcome
// 5: Not Compromised - Expected outcome achieved
```

### Update scores

```typescript
// Set baseline when creating item
await addCarePlanItem(carePlanId, {
  nanda_id: nandaId,
  baseline_score: 2, // Substantially compromised
  target_score: 5,   // Goal: Not compromised
  // ...
});

// Update during evaluation
await updateCarePlanItem(itemId, {
  current_score: 4,  // Now mildly compromised
  evaluation_notes: 'Improving, continue interventions'
});

// Calculate progress
const progress = (currentScore - baselineScore) / (targetScore - baselineScore);
// 0.67 = 67% toward goal
```

---

## 📱 Common UI Patterns

### NANDA Diagnosis Card

```typescript
function NandaCard({ nanda }: { nanda: NandaDiagnosis }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.code}>{nanda.code}</Text>
        <Badge type={nanda.diagnosis_type} />
      </View>
      <Text style={styles.label}>{nanda.label}</Text>
      <Text style={styles.domain}>{nanda.domain}</Text>
    </View>
  );
}
```

### Care Plan Item with Bridge Indicator

```typescript
function CarePlanItemCard({ item }: { item: CarePlanItem }) {
  return (
    <View style={styles.card}>
      {/* Show the bridge: ICD-10 → NANDA */}
      {item.icd10 && (
        <View style={styles.bridge}>
          <Text style={styles.icd10}>
            {item.icd10.code} - {item.icd10.description}
          </Text>
          <Icon name="arrow-down" />
        </View>
      )}
      
      <Text style={styles.nanda}>{item.nanda?.label}</Text>
      
      {/* Show interventions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interventions (NIC)</Text>
        {item.nics?.map(nic => (
          <Text key={nic.id}>• {nic.label}</Text>
        ))}
      </View>
      
      {/* Show outcomes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Outcomes (NOC)</Text>
        {item.nocs?.map(noc => (
          <Text key={noc.id}>• {noc.label}</Text>
        ))}
      </View>
      
      {/* Show progress */}
      <ScoreTracker
        baseline={item.baseline_score}
        current={item.current_score}
        target={item.target_score}
      />
    </View>
  );
}
```

### SBAR Quick Actions

```typescript
function SbarQuickActions({ patientId }: { patientId: string }) {
  const createQuickReport = async (type: SbarReportType) => {
    const template = await generateSbarTemplate(patientId, type);
    // Navigate to SBAR form with pre-filled data
    navigation.navigate('SbarForm', { template });
  };
  
  return (
    <View style={styles.actions}>
      <Button title="Shift Handoff" onPress={() => createQuickReport('shift_handoff')} />
      <Button title="Call MD" onPress={() => createQuickReport('physician_call')} />
      <Button title="Transfer" onPress={() => createQuickReport('transfer')} />
    </View>
  );
}
```

---

## ⚡ Performance Tips

### Cache frequently used data

```typescript
// Cache NANDA domains on app start
let cachedDomains: string[] | null = null;

export async function getCachedDomains() {
  if (cachedDomains) return cachedDomains;
  
  cachedDomains = await getNandaDomains();
  return cachedDomains;
}
```

### Batch fetch related data

```typescript
// Instead of multiple queries
const nics = await Promise.all(item.nic_ids.map(id => getNicById(id)));

// Use batch fetch
const nics = await getNicsByIds(item.nic_ids);
```

### Pre-load mappings for common codes

```typescript
// On app start, load mappings for top 10 ICD-10 codes
const topCodes = ['I10', 'E11.9', 'J18.9', 'I50.9'];
const mappingsCache = new Map();

for (const code of topCodes) {
  const icd10 = await getIcd10ByCode(code);
  if (icd10) {
    const mappings = await getNandaForIcd10(icd10.id);
    mappingsCache.set(code, mappings);
  }
}
```

---

## 🎯 Best Practices

1. **Always show the bridge** - Make ICD-10 → NANDA connection visible
2. **Use auto-generation** - Let the app do the work
3. **Provide templates** - Pre-fill SBAR and care plans
4. **Show evidence** - Display rationales and evidence levels
5. **Track progress** - Use NOC scores to measure outcomes
6. **Enable offline** - Cache NANDA/NIC/NOC data locally
7. **Export & share** - Make it easy to communicate care plans

---

**Remember: The ICD-10 ↔ NANDA bridge is your competitive advantage. Make it prominent, fast, and valuable.**
