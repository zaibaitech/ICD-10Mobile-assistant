// ============================================
// ICD-10 ↔ NANDA BRIDGE SERVICE
// ⭐ THE KEY DIFFERENTIATOR ⭐
// Phase 6: Nurse-Specific Features
// ============================================
// This service bridges the gap between medical diagnosis (ICD-10)
// and nursing diagnosis (NANDA-I), enabling comprehensive care planning

import { supabase } from './supabase';
import { getNnnLinkages, getNicsByIds, getNocsByIds } from './nanda';
import type {
  Icd10NandaMapping,
  CarePlanningSuggestion,
  NandaDiagnosis,
  NicIntervention,
  NocOutcome,
  MappingRelevance,
} from '../types/nursing';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get ICD-10 UUID from code string
 * @param code - ICD-10 code string (e.g., "I10", "E11.9")
 * @returns UUID or null if not found
 */
async function getIcd10IdByCode(code: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('icd10_codes')
      .select('id')
      .eq('code', code.trim().toUpperCase())
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ICD-10 code not found:', code);
        return null;
      }
      throw error;
    }
    
    return data?.id || null;
  } catch (error) {
    console.error('Error looking up ICD-10 code:', code, error);
    return null;
  }
}

/**
 * Check if a string is a UUID
 */
function isUuid(str: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
}

// ============================================
// ICD-10 → NANDA MAPPINGS
// ============================================

/**
 * Get suggested NANDA nursing diagnoses for an ICD-10 medical diagnosis
 * THIS IS THE MAGIC - bridges medical and nursing worlds
 * 
 * @param icd10IdOrCode - The ICD-10 UUID or code string (e.g., "I10")
 * @returns Array of mappings with NANDA diagnoses, sorted by relevance
 */
export async function getNandaForIcd10(icd10IdOrCode: string): Promise<Icd10NandaMapping[]> {
  // Convert code to ID if needed
  let icd10Id = icd10IdOrCode;
  if (!isUuid(icd10IdOrCode)) {
    const id = await getIcd10IdByCode(icd10IdOrCode);
    if (!id) {
      console.warn('ICD-10 code not found:', icd10IdOrCode);
      return [];
    }
    icd10Id = id;
  }
  try {
    const { data, error } = await supabase
      .from('icd10_nanda_mappings')
      .select(`
        *,
        icd10_code:icd10_codes(id, code, short_title, long_description),
        nanda_diagnosis:nanda_diagnoses(*)
      `)
      .eq('icd10_id', icd10Id)
      .order('relevance', { ascending: true }); // primary first
    
    if (error) {
      console.error('Error getting NANDA for ICD-10:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('getNandaForIcd10 error:', error);
    throw error;
  }
}

/**
 * Get ICD-10 medical diagnoses that map to a NANDA nursing diagnosis
 * Reverse lookup - useful for showing related medical conditions
 * 
 * @param nandaId - The NANDA diagnosis ID
 * @returns Array of mappings with ICD-10 codes
 */
export async function getIcd10ForNanda(nandaId: string): Promise<Icd10NandaMapping[]> {
  try {
    const { data, error } = await supabase
      .from('icd10_nanda_mappings')
      .select(`
        *,
        icd10_code:icd10_codes(id, code, short_title, long_description),
        nanda_diagnosis:nanda_diagnoses(*)
      `)
      .eq('nanda_id', nandaId)
      .order('relevance', { ascending: true });
    
    if (error) {
      console.error('Error getting ICD-10 for NANDA:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('getIcd10ForNanda error:', error);
    throw error;
  }
}

/**
 * Get complete care planning suggestions for an ICD-10 diagnosis
 * Returns: Medical Diagnosis → Nursing Diagnoses → Interventions → Outcomes
 * This is the complete NNN (NANDA-NIC-NOC) framework auto-populated from ICD-10
 * 
 * @param icd10IdOrCode - The ICD-10 UUID or code string (e.g., "I10")
 * @returns Array of suggestions with full NNN linkages
 */
export async function getCarePlanningSuggestions(
  icd10IdOrCode: string
): Promise<CarePlanningSuggestion[]> {
  try {
    // Convert code to ID if needed
    let icd10Id = icd10IdOrCode;
    if (!isUuid(icd10IdOrCode)) {
      const id = await getIcd10IdByCode(icd10IdOrCode);
      if (!id) {
        console.warn('ICD-10 code not found:', icd10IdOrCode);
        return [];
      }
      icd10Id = id;
    }
    
    // Step 1: Get NANDA mappings for this ICD-10 code
    const mappings = await getNandaForIcd10(icd10Id);
    
    if (mappings.length === 0) {
      console.log('No NANDA mappings found for ICD-10 ID:', icd10Id);
      return [];
    }
    
    const suggestions: CarePlanningSuggestion[] = [];
    
    // Step 2: For each NANDA diagnosis, get NIC/NOC linkages
    for (const mapping of mappings) {
      if (!mapping.nanda_diagnosis || !mapping.icd10_code) {
        continue;
      }
      
      // Get NNN linkages
      const linkages = await getNnnLinkages(mapping.nanda_id);
      
      // Extract unique NICs and NOCs
      const nicIds = [...new Set(linkages.map(l => l.nic_id))];
      const nocIds = [...new Set(linkages.map(l => l.noc_id))];
      
      // Fetch the full NIC and NOC objects
      const [nics, nocs] = await Promise.all([
        getNicsByIds(nicIds),
        getNocsByIds(nocIds),
      ]);
      
      suggestions.push({
        icd10: mapping.icd10_code,
        nanda: mapping.nanda_diagnosis,
        relevance: mapping.relevance,
        rationale: mapping.rationale,
        suggestedNics: nics,
        suggestedNocs: nocs,
      });
    }
    
    return suggestions;
  } catch (error) {
    console.error('getCarePlanningSuggestions error:', error);
    throw error;
  }
}

/**
 * Get care planning suggestions for multiple ICD-10 diagnoses
 * Useful when a patient has multiple medical conditions
 * 
 * @param icd10IdsOrCodes - Array of ICD-10 UUIDs or code strings (e.g., ["I10", "E11.9"])
 * @returns Combined array of unique suggestions
 */
export async function getCarePlanningSuggestionsForMultiple(
  icd10IdsOrCodes: string[]
): Promise<CarePlanningSuggestion[]> {
  try {
    if (icd10IdsOrCodes.length === 0) {
      return [];
    }
    
    // Convert all codes to IDs if needed
    const icd10Ids: string[] = [];
    for (const idOrCode of icd10IdsOrCodes) {
      if (isUuid(idOrCode)) {
        icd10Ids.push(idOrCode);
      } else {
        const id = await getIcd10IdByCode(idOrCode);
        if (id) {
          icd10Ids.push(id);
        } else {
          console.warn('Skipping unknown ICD-10 code:', idOrCode);
        }
      }
    }
    
    if (icd10Ids.length === 0) {
      console.warn('No valid ICD-10 codes found');
      return [];
    }
    
    // Get suggestions for each ICD-10 code
    const allSuggestions = await Promise.all(
      icd10Ids.map(id => getCarePlanningSuggestions(id))
    );
    
    // Flatten and deduplicate by NANDA ID
    const flattened = allSuggestions.flat();
    const uniqueSuggestions: CarePlanningSuggestion[] = [];
    const seenNandaIds = new Set<string>();
    
    for (const suggestion of flattened) {
      if (!seenNandaIds.has(suggestion.nanda.id)) {
        uniqueSuggestions.push(suggestion);
        seenNandaIds.add(suggestion.nanda.id);
      }
    }
    
    // Sort by relevance (primary first)
    const relevanceOrder: Record<MappingRelevance, number> = {
      primary: 1,
      secondary: 2,
      related: 3,
    };
    
    uniqueSuggestions.sort((a, b) => {
      return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
    });
    
    return uniqueSuggestions;
  } catch (error) {
    console.error('getCarePlanningSuggestionsForMultiple error:', error);
    throw error;
  }
}

/**
 * Check if a mapping exists between ICD-10 and NANDA
 */
export async function mappingExists(
  icd10Id: string,
  nandaId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('icd10_nanda_mappings')
      .select('id')
      .eq('icd10_id', icd10Id)
      .eq('nanda_id', nandaId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return false;
      }
      console.error('Error checking mapping existence:', error);
      throw error;
    }
    
    return data !== null;
  } catch (error) {
    console.error('mappingExists error:', error);
    return false;
  }
}

/**
 * Create a new ICD-10 ↔ NANDA mapping
 * For admin/advanced users to contribute mappings
 */
export async function createMapping(
  icd10Id: string,
  nandaId: string,
  relevance: MappingRelevance,
  rationale?: string
): Promise<Icd10NandaMapping> {
  try {
    const { data, error } = await supabase
      .from('icd10_nanda_mappings')
      .insert({
        icd10_id: icd10Id,
        nanda_id: nandaId,
        relevance,
        rationale,
        evidence_level: 'clinical_practice',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating mapping:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('createMapping error:', error);
    throw error;
  }
}

// ============================================
// STATISTICS & ANALYTICS
// ============================================

/**
 * Get statistics about ICD-10 ↔ NANDA mappings
 */
export async function getMappingStats(): Promise<{
  totalMappings: number;
  uniqueIcd10Codes: number;
  uniqueNandaDiagnoses: number;
  mappingsByRelevance: Record<MappingRelevance, number>;
}> {
  try {
    const { data, error } = await supabase
      .from('icd10_nanda_mappings')
      .select('*');
    
    if (error) {
      console.error('Error getting mapping stats:', error);
      throw error;
    }
    
    const mappings = data || [];
    const uniqueIcd10 = new Set(mappings.map(m => m.icd10_id));
    const uniqueNanda = new Set(mappings.map(m => m.nanda_id));
    
    const byRelevance: Record<MappingRelevance, number> = {
      primary: 0,
      secondary: 0,
      related: 0,
    };
    
    mappings.forEach(m => {
      byRelevance[m.relevance] = (byRelevance[m.relevance] || 0) + 1;
    });
    
    return {
      totalMappings: mappings.length,
      uniqueIcd10Codes: uniqueIcd10.size,
      uniqueNandaDiagnoses: uniqueNanda.size,
      mappingsByRelevance: byRelevance,
    };
  } catch (error) {
    console.error('getMappingStats error:', error);
    throw error;
  }
}

/**
 * Get most commonly mapped NANDA diagnoses
 * Useful for understanding which nursing diagnoses are most versatile
 */
export async function getMostMappedNanda(limit: number = 10): Promise<Array<{
  nanda: NandaDiagnosis;
  mappingCount: number;
}>> {
  try {
    const { data, error } = await supabase
      .from('icd10_nanda_mappings')
      .select(`
        nanda_id,
        nanda_diagnosis:nanda_diagnoses(*)
      `);
    
    if (error) {
      console.error('Error getting most mapped NANDA:', error);
      throw error;
    }
    
    // Count occurrences
    const counts: Record<string, { nanda: NandaDiagnosis; count: number }> = {};
    
    data?.forEach(mapping => {
      if (mapping.nanda_diagnosis) {
        const id = mapping.nanda_id;
        if (!counts[id]) {
          counts[id] = {
            nanda: mapping.nanda_diagnosis,
            count: 0,
          };
        }
        counts[id].count++;
      }
    });
    
    // Sort by count and return top N
    const sorted = Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => ({
        nanda: item.nanda,
        mappingCount: item.count,
      }));
    
    return sorted;
  } catch (error) {
    console.error('getMostMappedNanda error:', error);
    throw error;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get relevance label for display
 */
export function getRelevanceLabel(relevance: MappingRelevance): string {
  const labels: Record<MappingRelevance, string> = {
    primary: 'Primary',
    secondary: 'Secondary',
    related: 'Related',
  };
  return labels[relevance];
}

/**
 * Get relevance color for UI
 */
export function getRelevanceColor(relevance: MappingRelevance): string {
  const colors: Record<MappingRelevance, string> = {
    primary: '#10b981',    // green
    secondary: '#f59e0b',  // amber
    related: '#6b7280',    // gray
  };
  return colors[relevance];
}

/**
 * Get relevance badge style
 */
export function getRelevanceBadge(relevance: MappingRelevance): {
  label: string;
  color: string;
  backgroundColor: string;
} {
  const styles: Record<MappingRelevance, { label: string; color: string; backgroundColor: string }> = {
    primary: {
      label: 'Primary',
      color: '#065f46',
      backgroundColor: '#d1fae5',
    },
    secondary: {
      label: 'Secondary',
      color: '#92400e',
      backgroundColor: '#fef3c7',
    },
    related: {
      label: 'Related',
      color: '#374151',
      backgroundColor: '#f3f4f6',
    },
  };
  return styles[relevance];
}

/**
 * Format care planning suggestion for display
 */
export function formatCarePlanningSuggestion(suggestion: CarePlanningSuggestion): string {
  const lines = [
    `Medical Diagnosis: ${suggestion.icd10.code} - ${suggestion.icd10.short_title}`,
    `Nursing Diagnosis: ${suggestion.nanda.code} - ${suggestion.nanda.label} (${getRelevanceLabel(suggestion.relevance)})`,
  ];
  
  if (suggestion.rationale) {
    lines.push(`Rationale: ${suggestion.rationale}`);
  }
  
  if (suggestion.suggestedNics.length > 0) {
    lines.push(`\nSuggested Interventions (NIC):`);
    suggestion.suggestedNics.forEach(nic => {
      lines.push(`  • ${nic.code} - ${nic.label}`);
    });
  }
  
  if (suggestion.suggestedNocs.length > 0) {
    lines.push(`\nExpected Outcomes (NOC):`);
    suggestion.suggestedNocs.forEach(noc => {
      lines.push(`  • ${noc.code} - ${noc.label}`);
    });
  }
  
  return lines.join('\n');
}

/**
 * Generate a visual flow diagram text representation
 * ICD-10 → NANDA → NIC → NOC
 */
export function generateFlowDiagram(suggestion: CarePlanningSuggestion): string {
  const lines = [
    '┌─────────────────────────────────────┐',
    '│ MEDICAL DIAGNOSIS (ICD-10)          │',
    '└─────────────────────────────────────┘',
    `  ${suggestion.icd10.code} - ${suggestion.icd10.short_title}`,
    '                ↓',
    '┌─────────────────────────────────────┐',
    '│ NURSING DIAGNOSIS (NANDA-I)         │',
    '└─────────────────────────────────────┘',
    `  ${suggestion.nanda.code} - ${suggestion.nanda.label}`,
    '                ↓',
    '       ┌────────┴────────┐',
    '       ↓                 ↓',
    '┌─────────────┐   ┌─────────────┐',
    '│ INTERVEN-   │   │ OUTCOMES    │',
    '│ TIONS (NIC) │   │ (NOC)       │',
    '└─────────────┘   └─────────────┘',
  ];
  
  // Add top 3 interventions
  const nics = suggestion.suggestedNics.slice(0, 3);
  nics.forEach(nic => {
    lines.push(`  ${nic.code}        ${suggestion.suggestedNocs[0]?.code || ''}`);
  });
  
  return lines.join('\n');
}
