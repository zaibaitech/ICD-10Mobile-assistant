// ============================================
// NANDA-I NURSING DIAGNOSIS SERVICE
// Phase 6: Nurse-Specific Features
// ============================================

import { supabase } from './supabase';
import type {
  NandaDiagnosis,
  NandaDiagnosisSearchFilters,
  NicIntervention,
  NocOutcome,
  NnnLinkage,
  NandaDiagnosisType,
} from '../types/nursing';

// ============================================
// NANDA DIAGNOSIS OPERATIONS
// ============================================

/**
 * Search NANDA-I nursing diagnoses
 * Supports full-text search on code and label
 */
export async function searchNandaDiagnoses(
  options: {
    query?: string;
    domain?: string;
    diagnosisType?: NandaDiagnosisType;
    limit?: number;
  } = {}
): Promise<NandaDiagnosis[]> {
  try {
    let queryBuilder = supabase
      .from('nanda_diagnoses')
      .select('*');
    
    // Search in code or label
    if (options.query) {
      queryBuilder = queryBuilder.or(`code.ilike.%${options.query}%,label.ilike.%${options.query}%`);
    }
    
    // Filter by domain
    if (options.domain) {
      queryBuilder = queryBuilder.eq('domain', options.domain);
    }
    
    // Filter by diagnosis type
    if (options.diagnosisType) {
      queryBuilder = queryBuilder.eq('diagnosis_type', options.diagnosisType);
    }
    
    // Order by code
    queryBuilder = queryBuilder.order('code');
    
    // Limit results
    const limit = options.limit || 50;
    queryBuilder = queryBuilder.limit(limit);
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Error searching NANDA diagnoses:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('searchNandaDiagnoses error:', error);
    throw error;
  }
}

/**
 * Get NANDA diagnosis by ID
 */
export async function getNandaById(id: string): Promise<NandaDiagnosis | null> {
  try {
    const { data, error } = await supabase
      .from('nanda_diagnoses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error getting NANDA by ID:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('getNandaById error:', error);
    throw error;
  }
}

/**
 * Get NANDA diagnosis by code
 */
export async function getNandaByCode(code: string): Promise<NandaDiagnosis | null> {
  try {
    const { data, error } = await supabase
      .from('nanda_diagnoses')
      .select('*')
      .eq('code', code)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error getting NANDA by code:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('getNandaByCode error:', error);
    throw error;
  }
}

/**
 * Get all NANDA diagnoses for a specific domain
 */
export async function getNandaByDomain(domain: string): Promise<NandaDiagnosis[]> {
  try {
    const { data, error } = await supabase
      .from('nanda_diagnoses')
      .select('*')
      .eq('domain', domain)
      .order('label');
    
    if (error) {
      console.error('Error getting NANDA by domain:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('getNandaByDomain error:', error);
    throw error;
  }
}

/**
 * Get all unique NANDA domains for filtering
 */
export async function getNandaDomains(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('nanda_diagnoses')
      .select('domain')
      .order('domain');
    
    if (error) {
      console.error('Error getting NANDA domains:', error);
      throw error;
    }
    
    // Extract unique domains
    const domains = data?.map(d => d.domain) || [];
    const unique = [...new Set(domains)];
    return unique;
  } catch (error) {
    console.error('getNandaDomains error:', error);
    throw error;
  }
}

/**
 * Get recent/popular NANDA diagnoses
 * Based on usage in care plans
 */
export async function getPopularNandaDiagnoses(limit: number = 10): Promise<NandaDiagnosis[]> {
  try {
    // Get most used NANDA diagnoses from care_plan_items
    const { data: usageData, error: usageError } = await supabase
      .from('care_plan_items')
      .select('nanda_id')
      .not('nanda_id', 'is', null);
    
    if (usageError) {
      console.error('Error getting NANDA usage:', usageError);
      // Fall back to just returning first N diagnoses
      return getFallbackPopularDiagnoses(limit);
    }
    
    // Count occurrences
    const counts: Record<string, number> = {};
    usageData?.forEach(item => {
      if (item.nanda_id) {
        counts[item.nanda_id] = (counts[item.nanda_id] || 0) + 1;
      }
    });
    
    // Sort by count and get top IDs
    const topIds = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
    
    // If no usage data yet, fall back to common diagnoses
    if (topIds.length === 0) {
      return getFallbackPopularDiagnoses(limit);
    }
    
    // Fetch the actual NANDA diagnoses
    const { data, error } = await supabase
      .from('nanda_diagnoses')
      .select('*')
      .in('id', topIds);
    
    if (error) {
      console.error('Error getting popular NANDA diagnoses:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('getPopularNandaDiagnoses error:', error);
    return getFallbackPopularDiagnoses(limit);
  }
}

/**
 * Get fallback popular diagnoses when no usage data exists
 * Returns common diagnoses ordered by code
 */
async function getFallbackPopularDiagnoses(limit: number = 10): Promise<NandaDiagnosis[]> {
  try {
    const { data, error } = await supabase
      .from('nanda_diagnoses')
      .select('*')
      .order('code')
      .limit(limit);
    
    if (error) {
      console.error('Error getting fallback diagnoses:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('getFallbackPopularDiagnoses error:', error);
    return [];
  }
}

// ============================================
// NNN LINKAGES
// ============================================

/**
 * Get NIC/NOC linkages for a NANDA diagnosis
 * Returns evidence-based interventions and outcomes
 */
export async function getNnnLinkages(nandaId: string): Promise<NnnLinkage[]> {
  try {
    const { data, error } = await supabase
      .from('nanda_nic_noc_linkages')
      .select(`
        *,
        nanda:nanda_diagnoses(*),
        nic:nic_interventions(*),
        noc:noc_outcomes(*)
      `)
      .eq('nanda_id', nandaId)
      .order('priority');
    
    if (error) {
      console.error('Error getting NNN linkages:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('getNnnLinkages error:', error);
    throw error;
  }
}

/**
 * Get recommended NIC interventions for a NANDA diagnosis
 */
export async function getRecommendedNics(nandaId: string): Promise<NicIntervention[]> {
  try {
    const linkages = await getNnnLinkages(nandaId);
    
    // Extract unique NIC interventions
    const nics = linkages
      .filter(l => l.nic)
      .map(l => l.nic!);
    
    // Remove duplicates based on ID
    const uniqueNics = nics.filter((nic, index, self) =>
      index === self.findIndex(n => n.id === nic.id)
    );
    
    return uniqueNics;
  } catch (error) {
    console.error('getRecommendedNics error:', error);
    throw error;
  }
}

/**
 * Get recommended NOC outcomes for a NANDA diagnosis
 */
export async function getRecommendedNocs(nandaId: string): Promise<NocOutcome[]> {
  try {
    const linkages = await getNnnLinkages(nandaId);
    
    // Extract unique NOC outcomes
    const nocs = linkages
      .filter(l => l.noc)
      .map(l => l.noc!);
    
    // Remove duplicates based on ID
    const uniqueNocs = nocs.filter((noc, index, self) =>
      index === self.findIndex(n => n.id === noc.id)
    );
    
    return uniqueNocs;
  } catch (error) {
    console.error('getRecommendedNocs error:', error);
    throw error;
  }
}

// ============================================
// NIC INTERVENTION OPERATIONS
// ============================================

/**
 * Search NIC interventions
 */
export async function searchNicInterventions(query: string, limit: number = 50): Promise<NicIntervention[]> {
  try {
    const { data, error } = await supabase
      .from('nic_interventions')
      .select('*')
      .or(`code.ilike.%${query}%,label.ilike.%${query}%`)
      .order('code')
      .limit(limit);
    
    if (error) {
      console.error('Error searching NIC interventions:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('searchNicInterventions error:', error);
    throw error;
  }
}

/**
 * Get NIC intervention by ID
 */
export async function getNicById(id: string): Promise<NicIntervention | null> {
  try {
    const { data, error } = await supabase
      .from('nic_interventions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error getting NIC by ID:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('getNicById error:', error);
    throw error;
  }
}

/**
 * Get multiple NIC interventions by IDs
 */
export async function getNicsByIds(ids: string[]): Promise<NicIntervention[]> {
  try {
    if (ids.length === 0) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('nic_interventions')
      .select('*')
      .in('id', ids);
    
    if (error) {
      console.error('Error getting NICs by IDs:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('getNicsByIds error:', error);
    throw error;
  }
}

// ============================================
// NOC OUTCOME OPERATIONS
// ============================================

/**
 * Search NOC outcomes
 */
export async function searchNocOutcomes(query: string, limit: number = 50): Promise<NocOutcome[]> {
  try {
    const { data, error } = await supabase
      .from('noc_outcomes')
      .select('*')
      .or(`code.ilike.%${query}%,label.ilike.%${query}%`)
      .order('code')
      .limit(limit);
    
    if (error) {
      console.error('Error searching NOC outcomes:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('searchNocOutcomes error:', error);
    throw error;
  }
}

/**
 * Get NOC outcome by ID
 */
export async function getNocById(id: string): Promise<NocOutcome | null> {
  try {
    const { data, error } = await supabase
      .from('noc_outcomes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error getting NOC by ID:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('getNocById error:', error);
    throw error;
  }
}

/**
 * Get multiple NOC outcomes by IDs
 */
export async function getNocsByIds(ids: string[]): Promise<NocOutcome[]> {
  try {
    if (ids.length === 0) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('noc_outcomes')
      .select('*')
      .in('id', ids);
    
    if (error) {
      console.error('Error getting NOCs by IDs:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('getNocsByIds error:', error);
    throw error;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format NANDA diagnosis for display
 */
export function formatNandaDisplay(nanda: NandaDiagnosis): string {
  return `${nanda.code} - ${nanda.label}`;
}

/**
 * Format NIC intervention for display
 */
export function formatNicDisplay(nic: NicIntervention): string {
  return `${nic.code} - ${nic.label}`;
}

/**
 * Format NOC outcome for display
 */
export function formatNocDisplay(noc: NocOutcome): string {
  return `${noc.code} - ${noc.label}`;
}

/**
 * Get diagnosis type label
 */
export function getDiagnosisTypeLabel(type: NandaDiagnosisType): string {
  const labels: Record<NandaDiagnosisType, string> = {
    actual: 'Actual Diagnosis',
    risk: 'Risk Diagnosis',
    health_promotion: 'Health Promotion Diagnosis',
    syndrome: 'Syndrome Diagnosis',
  };
  return labels[type] || type;
}
