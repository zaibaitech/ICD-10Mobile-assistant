/**
 * Drug Interactions Service
 * Check for potential drug-drug interactions and contraindications using Supabase database
 */

import { supabase } from './supabase';

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
  mechanism?: string;
  recommendation: string;
  references?: string[];
}

export interface DrugContraindication {
  drug: string;
  condition: string;
  severity: 'absolute' | 'relative';
  description: string;
  mechanism?: string;
  alternatives?: string[];
}

// Database-backed interactions (no mock data needed)

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
 * Check for drug-drug interactions using Supabase database
 */
export async function checkDrugInteractions(drugs: Drug[]): Promise<DrugInteraction[]> {
  if (drugs.length < 2) return [];

  try {
    // Use original drug names (preserve capitalization for database matching)
    const medicationNames = drugs.map(d => d.name.trim());

    // Call Supabase function to check interactions
    const { data, error } = await supabase
      .rpc('check_drug_interactions', { medication_names: medicationNames });

    if (error) {
      console.error('Error checking drug interactions:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Map database results to DrugInteraction interface
    return data.map((row: any) => ({
      drug1: row.drug1 || '',
      drug2: row.drug2 || '',
      severity: row.severity as 'major' | 'moderate' | 'minor',
      description: row.description || '',
      mechanism: row.mechanism,
      recommendation: row.recommendation || '',
      references: row.references || [],
    }));
  } catch (error) {
    console.error('Error in checkDrugInteractions:', error);
    return [];
  }
}

/**
 * Check for drug contraindications based on patient conditions using Supabase database
 */
export async function checkContraindications(
  drugs: Drug[],
  conditions: string[]
): Promise<DrugContraindication[]> {
  if (drugs.length === 0 || conditions.length === 0) return [];

  try {
    const contraindications: DrugContraindication[] = [];

    // Query database for each drug-condition pair (case-insensitive)
    for (const drug of drugs) {
      for (const condition of conditions) {
        const { data, error } = await supabase
          .from('drug_contraindications')
          .select('*')
          .ilike('drug_name', drug.name.trim())
          .ilike('condition', `%${condition.trim()}%`);

        if (error) {
          console.error('Error checking contraindications:', error);
          continue;
        }

        if (data && data.length > 0) {
          contraindications.push(
            ...data.map((row: any) => ({
              drug: drug.name,
              condition,
              severity: row.severity as 'absolute' | 'relative',
              description: row.description || '',
              mechanism: row.mechanism,
              alternatives: row.alternatives || [],
            }))
          );
        }
      }
    }

    return contraindications;
  } catch (error) {
    console.error('Error in checkContraindications:', error);
    return [];
  }
}

/**
 * Get drug safety summary with database data
 */
export async function getDrugSafetySummary(drugs: Drug[], conditions: string[]) {
  const [interactions, contraindications] = await Promise.all([
    checkDrugInteractions(drugs),
    checkContraindications(drugs, conditions),
  ]);

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
