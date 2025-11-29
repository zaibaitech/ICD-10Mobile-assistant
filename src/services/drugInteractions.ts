/**
 * Drug Interactions Service
 * Check for potential drug-drug interactions and contraindications
 */

export interface Drug {
  name: string;
  genericName?: string;
  class?: string;
  dosage?: string;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'major' | 'moderate' | 'minor';
  description: string;
  recommendation: string;
}

export interface DrugContraindication {
  drug: string;
  condition: string;
  severity: 'absolute' | 'relative';
  description: string;
}

// Common drug interaction database (simplified version)
const KNOWN_INTERACTIONS: DrugInteraction[] = [
  {
    drug1: 'warfarin',
    drug2: 'aspirin',
    severity: 'major',
    description: 'Increased risk of bleeding when combining anticoagulants with antiplatelet agents.',
    recommendation: 'Monitor INR closely. Consider alternative antiplatelet if possible.',
  },
  {
    drug1: 'warfarin',
    drug2: 'nsaid',
    severity: 'major',
    description: 'NSAIDs can increase bleeding risk and reduce anticoagulant effectiveness.',
    recommendation: 'Avoid concurrent use. Use acetaminophen for pain if needed.',
  },
  {
    drug1: 'metformin',
    drug2: 'contrast dye',
    severity: 'major',
    description: 'Risk of lactic acidosis when metformin is used with iodinated contrast.',
    recommendation: 'Hold metformin 48 hours before and after contrast procedures.',
  },
  {
    drug1: 'ace inhibitor',
    drug2: 'potassium',
    severity: 'moderate',
    description: 'ACE inhibitors can cause hyperkalemia, especially with potassium supplements.',
    recommendation: 'Monitor potassium levels. Avoid potassium-sparing diuretics.',
  },
  {
    drug1: 'ssri',
    drug2: 'nsaid',
    severity: 'moderate',
    description: 'SSRIs combined with NSAIDs increase risk of GI bleeding.',
    recommendation: 'Consider PPI for gastroprotection. Monitor for signs of bleeding.',
  },
  {
    drug1: 'statins',
    drug2: 'macrolides',
    severity: 'moderate',
    description: 'Macrolide antibiotics can increase statin levels, raising rhabdomyolysis risk.',
    recommendation: 'Consider statin dose reduction or temporary discontinuation.',
  },
  {
    drug1: 'beta blocker',
    drug2: 'calcium channel blocker',
    severity: 'moderate',
    description: 'Both drugs slow heart rate and can cause bradycardia or heart block.',
    recommendation: 'Monitor heart rate and blood pressure. Use with caution.',
  },
  {
    drug1: 'digoxin',
    drug2: 'amiodarone',
    severity: 'major',
    description: 'Amiodarone significantly increases digoxin levels.',
    recommendation: 'Reduce digoxin dose by 50% when starting amiodarone. Monitor levels.',
  },
];

// Common contraindications
const CONTRAINDICATIONS: DrugContraindication[] = [
  {
    drug: 'metformin',
    condition: 'renal failure',
    severity: 'absolute',
    description: 'Metformin is contraindicated in severe renal impairment (eGFR <30).',
  },
  {
    drug: 'nsaid',
    condition: 'peptic ulcer',
    severity: 'relative',
    description: 'NSAIDs can worsen peptic ulcer disease and cause GI bleeding.',
  },
  {
    drug: 'beta blocker',
    condition: 'asthma',
    severity: 'relative',
    description: 'Non-selective beta blockers can trigger bronchospasm in asthma.',
  },
  {
    drug: 'ace inhibitor',
    condition: 'pregnancy',
    severity: 'absolute',
    description: 'ACE inhibitors are teratogenic and contraindicated in pregnancy.',
  },
];

/**
 * Normalize drug name for matching
 */
function normalizeDrugName(name: string): string {
  return name.toLowerCase().trim()
    .replace(/[®™]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Check if two drug names match (considering generic vs brand names)
 */
function drugsMatch(drug1: string, drug2: string): boolean {
  const normalized1 = normalizeDrugName(drug1);
  const normalized2 = normalizeDrugName(drug2);
  
  // Exact match
  if (normalized1 === normalized2) return true;
  
  // Partial match (one contains the other)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return true;
  
  // Class-based matching
  const classKeywords = ['nsaid', 'ssri', 'ace inhibitor', 'beta blocker', 'statins', 'macrolides', 'calcium channel blocker'];
  for (const keyword of classKeywords) {
    if ((normalized1.includes(keyword) || normalized2.includes(keyword)) &&
        (normalized1.includes(keyword.split(' ')[0]) || normalized2.includes(keyword.split(' ')[0]))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check for drug-drug interactions
 */
export function checkDrugInteractions(drugs: Drug[]): DrugInteraction[] {
  const interactions: DrugInteraction[] = [];
  
  // Check each pair of drugs
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const drug1 = drugs[i];
      const drug2 = drugs[j];
      
      // Check against known interactions
      for (const interaction of KNOWN_INTERACTIONS) {
        const match1 = drugsMatch(drug1.name, interaction.drug1) && drugsMatch(drug2.name, interaction.drug2);
        const match2 = drugsMatch(drug1.name, interaction.drug2) && drugsMatch(drug2.name, interaction.drug1);
        
        if (match1 || match2) {
          interactions.push({
            ...interaction,
            drug1: drug1.name,
            drug2: drug2.name,
          });
        }
      }
    }
  }
  
  return interactions;
}

/**
 * Check for drug contraindications based on patient conditions
 */
export function checkContraindications(
  drugs: Drug[],
  conditions: string[]
): DrugContraindication[] {
  const contraindications: DrugContraindication[] = [];
  
  for (const drug of drugs) {
    for (const condition of conditions) {
      for (const contraindication of CONTRAINDICATIONS) {
        if (drugsMatch(drug.name, contraindication.drug) &&
            normalizeDrugName(condition).includes(normalizeDrugName(contraindication.condition))) {
          contraindications.push({
            ...contraindication,
            drug: drug.name,
            condition,
          });
        }
      }
    }
  }
  
  return contraindications;
}

/**
 * Get drug safety summary
 */
export function getDrugSafetySummary(drugs: Drug[], conditions: string[]) {
  const interactions = checkDrugInteractions(drugs);
  const contraindications = checkContraindications(drugs, conditions);
  
  const majorInteractions = interactions.filter(i => i.severity === 'major');
  const absoluteContraindications = contraindications.filter(c => c.severity === 'absolute');
  
  const safetyScore = calculateSafetyScore(interactions, contraindications);
  
  return {
    safetyScore,
    totalInteractions: interactions.length,
    majorInteractions: majorInteractions.length,
    totalContraindications: contraindications.length,
    absoluteContraindications: absoluteContraindications.length,
    interactions,
    contraindications,
    status: safetyScore >= 80 ? 'safe' : safetyScore >= 50 ? 'caution' : 'warning',
  };
}

/**
 * Calculate safety score (0-100)
 */
function calculateSafetyScore(
  interactions: DrugInteraction[],
  contraindications: DrugContraindication[]
): number {
  let score = 100;
  
  // Deduct for interactions
  for (const interaction of interactions) {
    if (interaction.severity === 'major') score -= 25;
    else if (interaction.severity === 'moderate') score -= 10;
    else score -= 5;
  }
  
  // Deduct for contraindications
  for (const contraindication of contraindications) {
    if (contraindication.severity === 'absolute') score -= 30;
    else score -= 15;
  }
  
  return Math.max(0, score);
}
