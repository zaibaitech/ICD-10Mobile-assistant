/**
 * Geographic Disease Modules
 * Downloadable clinical packs for region-specific conditions
 * 
 * Zero-cost implementation using WHO public data
 * 
 * Features:
 * - Offline-capable disease management protocols
 * - Region-specific ICD-10 code bundles
 * - Treatment guidelines from WHO
 * - Diagnostic algorithms
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface DiseaseModule {
  id: string;
  name: string;
  region: string[];
  version: string;
  lastUpdated: string;
  sizeKb: number;
  icdCodes: string[];
  protocols: Protocol[];
  redFlags: RedFlag[];
  differentials: Differential[];
}

export interface Protocol {
  name: string;
  steps: string[];
  medications?: Medication[];
  referralCriteria?: string[];
}

export interface Medication {
  name: string;
  dose: string;
  route: string;
  duration: string;
  contraindications?: string[];
}

export interface RedFlag {
  symptom: string;
  action: string;
  urgency: 'immediate' | 'urgent' | 'routine';
}

export interface Differential {
  condition: string;
  icdCode: string;
  keyFeatures: string[];
  distinguishingFactors: string[];
}

// ============================================================================
// MALARIA MODULE (Africa, Southeast Asia)
// ============================================================================
export const MALARIA_MODULE: DiseaseModule = {
  id: 'malaria_v1',
  name: 'Malaria Management',
  region: ['Africa', 'Southeast Asia', 'South America', 'South Asia'],
  version: '1.0.0',
  lastUpdated: '2024-11-01',
  sizeKb: 45,
  icdCodes: [
    'B50.0', 'B50.8', 'B50.9', // P. falciparum
    'B51.0', 'B51.8', 'B51.9', // P. vivax
    'B52.0', 'B52.9',          // P. malariae
    'B53.0', 'B53.1',          // P. ovale, P. knowlesi
    'B54',                      // Unspecified
  ],
  protocols: [
    {
      name: 'Uncomplicated Malaria (P. falciparum)',
      steps: [
        '1. Confirm diagnosis with RDT or microscopy',
        '2. Check for pregnancy (alter treatment if positive)',
        '3. Assess for danger signs (see Red Flags)',
        '4. Start ACT therapy',
        '5. Ensure adequate hydration',
        '6. Provide antipyretic for fever',
        '7. Schedule follow-up Day 3 and Day 7',
      ],
      medications: [
        {
          name: 'Artemether-Lumefantrine (Coartem)',
          dose: 'Weight-based: 5-14kg: 1 tab, 15-24kg: 2 tabs, 25-34kg: 3 tabs, ≥35kg: 4 tabs',
          route: 'Oral',
          duration: '3 days (doses at 0, 8, 24, 36, 48, 60 hours)',
          contraindications: ['First trimester pregnancy', 'Severe malaria'],
        },
        {
          name: 'Artesunate-Amodiaquine',
          dose: 'Weight-based tablets',
          route: 'Oral',
          duration: '3 days once daily',
        },
      ],
      referralCriteria: [
        'Unable to tolerate oral medications',
        'Severe malaria (see danger signs)',
        'Pregnancy',
        'Children under 5kg',
        'Treatment failure after 3 days',
      ],
    },
    {
      name: 'Severe Malaria (Emergency)',
      steps: [
        '1. REFER IMMEDIATELY to hospital',
        '2. If referral delayed >6h, give pre-referral treatment',
        '3. Pre-referral: Artesunate IM/IV or Artemether IM',
        '4. If not available: Artesunate suppository',
        '5. Keep patient in recovery position if unconscious',
        '6. Maintain airway, check blood glucose',
        '7. Start IV fluids if trained',
      ],
      medications: [
        {
          name: 'Artesunate (IV/IM)',
          dose: '2.4 mg/kg at 0, 12, 24 hours, then daily',
          route: 'IV preferred, IM if IV not possible',
          duration: 'Until patient can take oral',
        },
        {
          name: 'Artesunate suppository (pre-referral)',
          dose: '10 mg/kg single dose',
          route: 'Rectal',
          duration: 'Single dose before referral',
        },
      ],
    },
    {
      name: 'Malaria in Pregnancy',
      steps: [
        '1. First trimester: Quinine + Clindamycin',
        '2. Second/Third trimester: ACT is safe',
        '3. IPTp-SP for prevention in endemic areas',
        '4. Insecticide-treated bed nets',
        '5. Close monitoring throughout pregnancy',
      ],
      medications: [
        {
          name: 'Quinine',
          dose: '10 mg/kg every 8 hours',
          route: 'Oral',
          duration: '7 days',
          contraindications: ['Known hypersensitivity', 'G6PD deficiency'],
        },
        {
          name: 'Sulfadoxine-Pyrimethamine (IPTp)',
          dose: '3 tablets single dose',
          route: 'Oral',
          duration: 'Monthly from 2nd trimester',
        },
      ],
    },
  ],
  redFlags: [
    { symptom: 'Prostration/inability to sit', action: 'REFER IMMEDIATELY - Severe malaria', urgency: 'immediate' },
    { symptom: 'Altered consciousness/coma', action: 'REFER IMMEDIATELY - Cerebral malaria', urgency: 'immediate' },
    { symptom: 'Respiratory distress (acidotic breathing)', action: 'REFER IMMEDIATELY', urgency: 'immediate' },
    { symptom: 'Multiple convulsions (>2 in 24h)', action: 'REFER IMMEDIATELY', urgency: 'immediate' },
    { symptom: 'Unable to drink/breastfeed', action: 'REFER IMMEDIATELY', urgency: 'immediate' },
    { symptom: 'Persistent vomiting', action: 'REFER IMMEDIATELY - Cannot take oral meds', urgency: 'immediate' },
    { symptom: 'Severe pallor (Hb <5 g/dL)', action: 'REFER - Need blood transfusion', urgency: 'urgent' },
    { symptom: 'Jaundice', action: 'REFER - Severe malaria sign', urgency: 'urgent' },
    { symptom: 'Black urine', action: 'REFER - Hemoglobinuria', urgency: 'urgent' },
    { symptom: 'Bleeding', action: 'REFER - DIC possible', urgency: 'urgent' },
  ],
  differentials: [
    {
      condition: 'Typhoid Fever',
      icdCode: 'A01.0',
      keyFeatures: ['Gradual onset', 'Headache', 'Relative bradycardia', 'Rose spots'],
      distinguishingFactors: ['No rigors (unlike malaria)', 'Constipation common'],
    },
    {
      condition: 'Dengue Fever',
      icdCode: 'A90',
      keyFeatures: ['Severe headache', 'Retro-orbital pain', 'Rash', 'Thrombocytopenia'],
      distinguishingFactors: ['Tourniquet test positive', 'No hepatosplenomegaly'],
    },
    {
      condition: 'Meningitis',
      icdCode: 'G03.9',
      keyFeatures: ['Neck stiffness', 'Photophobia', 'Kernig/Brudzinski signs'],
      distinguishingFactors: ['CSF analysis confirms'],
    },
  ],
};

// ============================================================================
// TUBERCULOSIS MODULE (Global, especially Africa, Asia)
// ============================================================================
export const TB_MODULE: DiseaseModule = {
  id: 'tb_v1',
  name: 'Tuberculosis Management',
  region: ['Africa', 'Asia', 'Latin America', 'Eastern Europe'],
  version: '1.0.0',
  lastUpdated: '2024-11-01',
  sizeKb: 55,
  icdCodes: [
    'A15.0', 'A15.1', 'A15.2', 'A15.3', 'A15.9', // Respiratory TB confirmed
    'A16.0', 'A16.1', 'A16.2',                   // Respiratory TB not confirmed
    'A17.0', 'A17.1',                             // CNS TB
    'A18.0',                                       // Bone/joint TB
    'A19.0', 'A19.1', 'A19.9',                   // Miliary TB
  ],
  protocols: [
    {
      name: 'New Pulmonary TB (Drug-Susceptible)',
      steps: [
        '1. Confirm diagnosis: sputum smear, GeneXpert, culture',
        '2. Test for HIV (all TB patients)',
        '3. Baseline: LFTs, creatinine, visual acuity, pregnancy test',
        '4. Start intensive phase (2 months HRZE)',
        '5. DOT (Directly Observed Therapy) required',
        '6. Sputum monitoring at 2, 5, 6 months',
        '7. Continue phase (4 months HR)',
        '8. Complete 6-month treatment',
      ],
      medications: [
        {
          name: 'Isoniazid (H)',
          dose: '5 mg/kg (max 300mg) daily',
          route: 'Oral',
          duration: '6 months',
          contraindications: ['Active hepatitis', 'Peripheral neuropathy'],
        },
        {
          name: 'Rifampicin (R)',
          dose: '10 mg/kg (max 600mg) daily',
          route: 'Oral',
          duration: '6 months',
          contraindications: ['Severe liver disease', 'Jaundice'],
        },
        {
          name: 'Pyrazinamide (Z)',
          dose: '25 mg/kg daily',
          route: 'Oral',
          duration: '2 months (intensive phase)',
          contraindications: ['Severe gout', 'Liver disease'],
        },
        {
          name: 'Ethambutol (E)',
          dose: '15-20 mg/kg daily',
          route: 'Oral',
          duration: '2 months (intensive phase)',
          contraindications: ['Optic neuritis', 'Visual impairment'],
        },
        {
          name: 'Pyridoxine (Vitamin B6)',
          dose: '10-25 mg daily',
          route: 'Oral',
          duration: '6 months (prevent neuropathy)',
        },
      ],
      referralCriteria: [
        'Drug-resistant TB (MDR/XDR)',
        'TB meningitis',
        'TB in children under 5',
        'HIV co-infection with low CD4',
        'Severe adverse reactions',
        'Treatment failure',
      ],
    },
    {
      name: 'TB Prevention (Latent TB)',
      steps: [
        '1. Screen high-risk groups: HIV+, household contacts, immunocompromised',
        '2. Rule out active TB (chest X-ray, symptoms)',
        '3. TST or IGRA testing',
        '4. If positive and no active TB: preventive therapy',
        '5. Options: 6-9 months INH or 3 months INH+Rifapentine',
      ],
      medications: [
        {
          name: 'Isoniazid (preventive)',
          dose: '5 mg/kg (max 300mg) daily',
          route: 'Oral',
          duration: '6-9 months',
        },
      ],
    },
  ],
  redFlags: [
    { symptom: 'Hemoptysis (coughing blood)', action: 'Urgent evaluation, possible hemorrhage', urgency: 'urgent' },
    { symptom: 'Severe respiratory distress', action: 'Hospitalize immediately', urgency: 'immediate' },
    { symptom: 'Signs of meningitis', action: 'REFER - TB meningitis emergency', urgency: 'immediate' },
    { symptom: 'Jaundice during treatment', action: 'STOP treatment, check LFTs', urgency: 'urgent' },
    { symptom: 'Visual changes on Ethambutol', action: 'STOP Ethambutol, ophthalmology referral', urgency: 'urgent' },
    { symptom: 'Severe nausea/vomiting', action: 'Assess hepatotoxicity, adjust meds', urgency: 'urgent' },
    { symptom: 'Peripheral neuropathy', action: 'Increase Vitamin B6, consider stopping INH', urgency: 'routine' },
  ],
  differentials: [
    {
      condition: 'Pneumonia',
      icdCode: 'J18.9',
      keyFeatures: ['Acute onset', 'High fever', 'Productive cough'],
      distinguishingFactors: ['Responds to antibiotics', 'No weight loss history'],
    },
    {
      condition: 'Lung Cancer',
      icdCode: 'C34.90',
      keyFeatures: ['Weight loss', 'Hemoptysis', 'Older patient', 'Smoking history'],
      distinguishingFactors: ['CT scan shows mass', 'No response to TB treatment'],
    },
    {
      condition: 'HIV-related PCP',
      icdCode: 'B59',
      keyFeatures: ['Dry cough', 'Hypoxia', 'HIV positive'],
      distinguishingFactors: ['LDH elevated', 'Bilateral infiltrates'],
    },
  ],
};

// ============================================================================
// DENGUE MODULE (Tropical regions)
// ============================================================================
export const DENGUE_MODULE: DiseaseModule = {
  id: 'dengue_v1',
  name: 'Dengue Fever Management',
  region: ['Southeast Asia', 'South Asia', 'Latin America', 'Caribbean', 'Africa'],
  version: '1.0.0',
  lastUpdated: '2024-11-01',
  sizeKb: 35,
  icdCodes: [
    'A90',  // Dengue fever
    'A91',  // Dengue hemorrhagic fever
  ],
  protocols: [
    {
      name: 'Dengue Fever (No Warning Signs)',
      steps: [
        '1. Confirm probable dengue: fever + 2 of (headache, retro-orbital pain, myalgia, arthralgia, rash, leukopenia)',
        '2. Check tourniquet test',
        '3. CBC: check platelet count, hematocrit',
        '4. Home management if no warning signs',
        '5. Adequate oral fluids (ORS, juice, water)',
        '6. Paracetamol for fever (NO ASPIRIN/NSAIDs)',
        '7. Rest, mosquito net to prevent spread',
        '8. Daily review until afebrile for 48h',
      ],
      medications: [
        {
          name: 'Paracetamol',
          dose: '10-15 mg/kg every 4-6 hours (max 4g/day)',
          route: 'Oral',
          duration: 'Until fever resolves',
          contraindications: ['Liver disease'],
        },
        {
          name: 'ORS (Oral Rehydration Salt)',
          dose: 'Ad libitum, encourage frequent sips',
          route: 'Oral',
          duration: 'Throughout illness',
        },
      ],
    },
    {
      name: 'Dengue with Warning Signs (Hospitalize)',
      steps: [
        '1. Warning signs: abdominal pain, persistent vomiting, fluid accumulation, mucosal bleeding, lethargy, liver enlargement, rapid HCT rise',
        '2. ADMIT to hospital',
        '3. IV fluids: crystalloids (NS or RL)',
        '4. Monitor vital signs hourly',
        '5. Check HCT and platelets every 6-12h',
        '6. Watch for shock',
        '7. Avoid unnecessary invasive procedures',
        '8. Transfuse only if clinically significant bleeding',
      ],
      medications: [
        {
          name: 'Normal Saline or Ringer Lactate',
          dose: 'Start 5-7 ml/kg/hr, adjust based on response',
          route: 'IV',
          duration: 'Until stable',
        },
      ],
      referralCriteria: [
        'Shock (weak pulse, narrow pulse pressure)',
        'Severe bleeding',
        'Severe organ impairment',
        'Pregnant women',
        'Infants',
        'Elderly with comorbidities',
      ],
    },
    {
      name: 'Severe Dengue (Dengue Shock Syndrome)',
      steps: [
        '1. EMERGENCY - Immediate IV access',
        '2. Rapid fluid bolus: 20 ml/kg crystalloid over 15-30 min',
        '3. Reassess: if improving, reduce rate',
        '4. If still in shock: repeat bolus, consider colloids',
        '5. Blood transfusion if significant bleeding',
        '6. ICU admission',
        '7. Monitor for overload (once patient exits shock phase)',
      ],
    },
  ],
  redFlags: [
    { symptom: 'Severe abdominal pain', action: 'Warning sign - ADMIT', urgency: 'urgent' },
    { symptom: 'Persistent vomiting', action: 'Warning sign - ADMIT', urgency: 'urgent' },
    { symptom: 'Fluid accumulation (ascites, pleural effusion)', action: 'Warning sign - ADMIT', urgency: 'urgent' },
    { symptom: 'Mucosal bleeding (gums, nose)', action: 'Warning sign - ADMIT', urgency: 'urgent' },
    { symptom: 'Lethargy or restlessness', action: 'Warning sign - ADMIT', urgency: 'urgent' },
    { symptom: 'Liver >2cm below costal margin', action: 'Warning sign - ADMIT', urgency: 'urgent' },
    { symptom: 'Rapid HCT rise with platelet drop', action: 'Warning sign - ADMIT', urgency: 'urgent' },
    { symptom: 'Cold clammy skin, weak pulse', action: 'SHOCK - Emergency resuscitation', urgency: 'immediate' },
    { symptom: 'Narrow pulse pressure (<20 mmHg)', action: 'SHOCK - Emergency resuscitation', urgency: 'immediate' },
    { symptom: 'Undetectable pulse/BP', action: 'PROFOUND SHOCK - CPR if needed', urgency: 'immediate' },
  ],
  differentials: [
    {
      condition: 'Chikungunya',
      icdCode: 'A92.0',
      keyFeatures: ['Severe joint pain', 'Rash', 'Conjunctivitis'],
      distinguishingFactors: ['Joint pain more prominent', 'Less bleeding risk'],
    },
    {
      condition: 'Zika Virus',
      icdCode: 'A92.5',
      keyFeatures: ['Mild fever', 'Rash', 'Conjunctivitis'],
      distinguishingFactors: ['Usually milder', 'Pregnancy concern'],
    },
    {
      condition: 'Typhoid',
      icdCode: 'A01.0',
      keyFeatures: ['Gradual onset', 'Relative bradycardia'],
      distinguishingFactors: ['No rash pattern of dengue'],
    },
    {
      condition: 'Leptospirosis',
      icdCode: 'A27.9',
      keyFeatures: ['Muscle pain (calves)', 'Conjunctival suffusion'],
      distinguishingFactors: ['Water exposure history'],
    },
  ],
};

// ============================================================================
// Module Storage and Management
// ============================================================================

const MODULE_STORAGE_KEY = '@disease_modules_';

export class DiseaseModuleManager {
  /**
   * Get all available modules
   */
  static getAllModules(): DiseaseModule[] {
    return [MALARIA_MODULE, TB_MODULE, DENGUE_MODULE];
  }
  
  /**
   * Get modules by region
   */
  static getModulesForRegion(region: string): DiseaseModule[] {
    return this.getAllModules().filter(m => 
      m.region.some(r => r.toLowerCase() === region.toLowerCase())
    );
  }
  
  /**
   * Download module (save to local storage)
   */
  static async downloadModule(moduleId: string): Promise<boolean> {
    try {
      const module = this.getAllModules().find(m => m.id === moduleId);
      if (!module) return false;
      
      await AsyncStorage.setItem(
        MODULE_STORAGE_KEY + moduleId,
        JSON.stringify(module)
      );
      
      // Track downloaded modules
      const downloaded = await this.getDownloadedModuleIds();
      if (!downloaded.includes(moduleId)) {
        downloaded.push(moduleId);
        await AsyncStorage.setItem(
          MODULE_STORAGE_KEY + 'downloaded',
          JSON.stringify(downloaded)
        );
      }
      
      return true;
    } catch (error) {
      console.error('[DiseaseModules] Download error:', error);
      return false;
    }
  }
  
  /**
   * Get downloaded module IDs
   */
  static async getDownloadedModuleIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(MODULE_STORAGE_KEY + 'downloaded');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  
  /**
   * Get downloaded module by ID (from local storage)
   */
  static async getDownloadedModule(moduleId: string): Promise<DiseaseModule | null> {
    try {
      const data = await AsyncStorage.getItem(MODULE_STORAGE_KEY + moduleId);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  
  /**
   * Delete downloaded module
   */
  static async deleteModule(moduleId: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(MODULE_STORAGE_KEY + moduleId);
      
      const downloaded = await this.getDownloadedModuleIds();
      const updated = downloaded.filter(id => id !== moduleId);
      await AsyncStorage.setItem(
        MODULE_STORAGE_KEY + 'downloaded',
        JSON.stringify(updated)
      );
      
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get ICD codes for a module
   */
  static getModuleICDCodes(module: DiseaseModule): string[] {
    return module.icdCodes;
  }
  
  /**
   * Get red flags for a module
   */
  static getModuleRedFlags(module: DiseaseModule): RedFlag[] {
    return module.redFlags;
  }
  
  /**
   * Search across all downloaded modules
   */
  static async searchModules(query: string): Promise<{
    module: DiseaseModule;
    matches: string[];
  }[]> {
    const results: { module: DiseaseModule; matches: string[] }[] = [];
    const downloadedIds = await this.getDownloadedModuleIds();
    
    for (const moduleId of downloadedIds) {
      const module = await this.getDownloadedModule(moduleId);
      if (!module) continue;
      
      const matches: string[] = [];
      const lowerQuery = query.toLowerCase();
      
      // Search in ICD codes
      if (module.icdCodes.some(code => code.toLowerCase().includes(lowerQuery))) {
        matches.push('ICD codes');
      }
      
      // Search in protocols
      if (module.protocols.some(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.steps.some(s => s.toLowerCase().includes(lowerQuery))
      )) {
        matches.push('Protocols');
      }
      
      // Search in red flags
      if (module.redFlags.some(r => r.symptom.toLowerCase().includes(lowerQuery))) {
        matches.push('Red flags');
      }
      
      // Search in differentials
      if (module.differentials.some(d => 
        d.condition.toLowerCase().includes(lowerQuery) ||
        d.keyFeatures.some(f => f.toLowerCase().includes(lowerQuery))
      )) {
        matches.push('Differentials');
      }
      
      if (matches.length > 0) {
        results.push({ module, matches });
      }
    }
    
    return results;
  }
}

export default DiseaseModuleManager;
