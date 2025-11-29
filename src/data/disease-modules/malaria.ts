/**
 * Malaria Disease Module
 * 
 * Based on WHO Malaria Treatment Guidelines (FREE, Public Domain)
 * Source: https://www.who.int/publications/i/item/guidelines-for-malaria
 * 
 * Downloadable: 15KB
 * Offline-ready: 100% functional offline
 */

export interface DiseaseModule {
  id: string;
  name: string;
  version: string;
  size: string;
  lastUpdated: string;
  icd10Codes: Array<{
    code: string;
    title: string;
    description: string;
  }>;
  diagnosticCriteria: Array<{
    symptom: string;
    severity: 'mild' | 'moderate' | 'severe';
    diagnostic: boolean;
  }>;
  differentialDiagnosis: string[];
  treatmentGuidelines: {
    mild: string[];
    moderate: string[];
    severe: string[];
  };
  redFlags: string[];
  followUp: string[];
  prevention: string[];
}

export const malariaModule: DiseaseModule = {
  id: 'malaria',
  name: 'Malaria Management',
  version: '1.0.0',
  size: '15KB',
  lastUpdated: '2025-11-27',
  
  icd10Codes: [
    {
      code: 'B50.0',
      title: 'Plasmodium falciparum malaria with cerebral complications',
      description: 'Most severe form, requires immediate treatment',
    },
    {
      code: 'B50.8',
      title: 'Other severe and complicated P. falciparum malaria',
      description: 'Includes severe anemia, respiratory distress, renal failure',
    },
    {
      code: 'B50.9',
      title: 'Plasmodium falciparum malaria, unspecified',
      description: 'Uncomplicated P. falciparum malaria',
    },
    {
      code: 'B51.0',
      title: 'Plasmodium vivax malaria with rupture of spleen',
      description: 'P. vivax with splenic complications',
    },
    {
      code: 'B51.9',
      title: 'Plasmodium vivax malaria without complication',
      description: 'Uncomplicated P. vivax malaria',
    },
    {
      code: 'B52.0',
      title: 'Plasmodium malariae malaria with nephropathy',
      description: 'P. malariae with kidney complications',
    },
    {
      code: 'B52.9',
      title: 'Plasmodium malariae malaria without complication',
      description: 'Uncomplicated P. malariae malaria',
    },
    {
      code: 'B53.0',
      title: 'Plasmodium ovale malaria',
      description: 'P. ovale infection',
    },
    {
      code: 'B54',
      title: 'Unspecified malaria',
      description: 'Malaria when species not identified',
    },
  ],

  diagnosticCriteria: [
    { symptom: 'Fever (>37.5°C)', severity: 'moderate', diagnostic: true },
    { symptom: 'Chills and rigors', severity: 'moderate', diagnostic: true },
    { symptom: 'Sweating', severity: 'mild', diagnostic: false },
    { symptom: 'Headache', severity: 'mild', diagnostic: false },
    { symptom: 'Nausea/vomiting', severity: 'mild', diagnostic: false },
    { symptom: 'Muscle/joint pain', severity: 'mild', diagnostic: false },
    { symptom: 'Fatigue', severity: 'mild', diagnostic: false },
    { symptom: 'Positive rapid diagnostic test (RDT)', severity: 'severe', diagnostic: true },
    { symptom: 'Positive blood smear', severity: 'severe', diagnostic: true },
  ],

  differentialDiagnosis: [
    'Typhoid fever (A01.0)',
    'Dengue fever (A90)',
    'Viral hepatitis (B15-B19)',
    'Influenza (J10-J11)',
    'Bacterial sepsis (A41)',
    'Urinary tract infection (N39.0)',
    'Pneumonia (J18)',
  ],

  treatmentGuidelines: {
    mild: [
      '1. Artemisinin-based combination therapy (ACT):',
      '   - Artemether-lumefantrine (Coartem): Weight-based dosing',
      '   - OR Artesunate-amodiaquine: Weight-based dosing',
      '   - OR Dihydroartemisinin-piperaquine: Weight-based dosing',
      '2. Complete full course (3 days typically)',
      '3. Take with food/milk to improve absorption',
      '4. Monitor for 28 days for recurrence',
      '5. Treat fever: Paracetamol 15mg/kg every 6 hours',
      '6. Maintain hydration: Oral fluids',
    ],
    moderate: [
      '1. Oral ACT if patient can swallow and retain',
      '2. Pre-referral rectal artesunate if unable to take oral',
      '3. Monitor vitals every 4 hours',
      '4. Check hemoglobin/hematocrit',
      '5. Treat dehydration: ORS or IV fluids',
      '6. Antipyretics for fever',
      '7. Consider admission for 24h observation',
      '8. Prepare for transfer if deteriorates',
    ],
    severe: [
      '⚠️ IMMEDIATE TRANSFER TO HOSPITAL',
      '1. IV/IM Artesunate 2.4mg/kg STAT',
      '   - Repeat at 12h and 24h, then daily',
      '2. OR Artemether IM 3.2mg/kg STAT, then 1.6mg/kg daily',
      '3. OR Quinine IV 20mg/kg loading, then 10mg/kg every 8h',
      '4. Treat complications:',
      '   - Severe anemia: Blood transfusion',
      '   - Hypoglycemia: IV dextrose 50% 50ml',
      '   - Seizures: IV diazepam 0.15mg/kg',
      '   - Shock: IV fluids, consider antibiotics',
      '5. Monitor glucose, renal function, fluids',
      '6. ICU care if cerebral malaria',
    ],
  },

  redFlags: [
    '🚨 Altered consciousness/confusion (cerebral malaria)',
    '🚨 Seizures',
    '🚨 Severe anemia (Hb <5g/dL or Hct <15%)',
    '🚨 Jaundice with organ dysfunction',
    '🚨 Respiratory distress/pulmonary edema',
    '🚨 Hypoglycemia (<2.2 mmol/L or <40mg/dL)',
    '🚨 Shock (systolic BP <70mmHg)',
    '🚨 Acute kidney injury (oliguria, creatinine >265μmol/L)',
    '🚨 Bleeding/DIC',
    '🚨 Hemoglobinuria (blackwater fever)',
    '🚨 Parasitemia >5% in non-immune',
    '🚨 Pregnant women with any severity',
    '🚨 Children <5 years with complications',
  ],

  followUp: [
    'Day 3: Check for fever clearance, clinical improvement',
    'Day 7: Repeat RDT/smear if still symptomatic',
    'Day 14: Check for late treatment failure',
    'Day 28: Final assessment for recurrence',
    'If fever recurs: Re-test immediately',
    'If severe anemia: Follow Hb weekly until normal',
    'Counsel on prevention (bed nets, prophylaxis)',
  ],

  prevention: [
    '✓ Sleep under insecticide-treated nets (ITNs)',
    '✓ Indoor residual spraying (IRS) in endemic areas',
    '✓ Chemoprophylaxis for travelers/pregnant women',
    '✓ Eliminate standing water (breeding sites)',
    '✓ Wear protective clothing (long sleeves/pants)',
    '✓ Use insect repellent (DEET 20-50%)',
    '✓ Intermittent preventive treatment in pregnancy (IPTp)',
    '✓ Seasonal malaria chemoprevention for children (SMC)',
  ],
};

export default malariaModule;
