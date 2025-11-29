// ============================================
// LOGGING SERVICE
// ============================================
// Handles audit trails for both assistant interactions and clinical analysis

import { supabase } from './supabase';
import type {
  AssistantLogEntry,
  SuggestedCode,
  Patient,
  Encounter,
  ClinicalAnalysisResult,
} from '../types';

/**
 * Log assistant interaction to Supabase for audit trail
 */
export const logAssistantInteraction = async (params: {
  userId: string;
  inputText: string;
  assistantResponse: string;
  suggestedCodes: SuggestedCode[];
  acceptedCodes?: string[];
}): Promise<void> => {
  try {
    const { error } = await supabase
      .from('assistant_logs')
      .insert({
        user_id: params.userId,
        input_text: params.inputText,
        assistant_response: params.assistantResponse,
        suggested_codes: params.suggestedCodes,
        accepted_codes: params.acceptedCodes || [],
      });

    if (error) {
      console.error('Error logging assistant interaction:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to log interaction:', error);
    // Don't throw - logging failures shouldn't break the app
  }
};

/**
 * Get user's recent interaction history
 */
export const getInteractionHistory = async (
  userId: string,
  limit: number = 20
): Promise<AssistantLogEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('assistant_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching interaction history:', error);
    return [];
  }
};

/**
 * Delete interaction history (privacy/cleanup)
 */
export const deleteInteractionHistory = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('assistant_logs')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting history:', error);
    throw error;
  }
};

/**
 * Get analytics on accepted vs suggested codes (for improvement)
 */
export const getAcceptanceStats = async (userId: string): Promise<{
  totalSuggestions: number;
  totalAccepted: number;
  acceptanceRate: number;
}> => {
  try {
    const history = await getInteractionHistory(userId, 100);
    
    let totalSuggestions = 0;
    let totalAccepted = 0;
    
    history.forEach(entry => {
      const suggestedCount = Array.isArray(entry.suggested_codes) ? entry.suggested_codes.length : 0;
      const acceptedCount = Array.isArray(entry.accepted_codes) ? entry.accepted_codes.length : 0;
      
      totalSuggestions += suggestedCount;
      totalAccepted += acceptedCount;
    });
    
    const acceptanceRate = totalSuggestions > 0 
      ? (totalAccepted / totalSuggestions) * 100 
      : 0;
    
    return {
      totalSuggestions,
      totalAccepted,
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return { totalSuggestions: 0, totalAccepted: 0, acceptanceRate: 0 };
  }
};

// ============================================
// CLINICAL ANALYSIS LOGGING (PHASE 3)
// ============================================

interface LogAnalysisParams {
  userId: string;
  patient: Patient;
  encounter: Encounter;
  result: ClinicalAnalysisResult;
}

/**
 * Log clinical analysis to Supabase for audit trail
 * Stores de-identified snapshots of input and output
 */
export async function logClinicalAnalysis({
  userId,
  patient,
  encounter,
  result,
}: LogAnalysisParams): Promise<void> {
  const inputSnapshot = {
    patient: {
      id: patient.id,
      sex: patient.sex,
      year_of_birth: patient.year_of_birth,
      // Note: display_label omitted for privacy
    },
    encounter: {
      id: encounter.id,
      chief_complaint: encounter.chief_complaint,
      structured_data: encounter.structured_data,
    },
  };

  const { error } = await supabase.from('clinical_analysis_logs').insert({
    user_id: userId,
    patient_id: patient.id,
    encounter_id: encounter.id,
    input_snapshot: inputSnapshot,
    result_snapshot: result,
  });

  if (error) {
    console.error('Failed to log clinical analysis:', error);
    // Non-blocking - don't throw, just log
  }
}

/**
 * Save detailed AI result to encounter_ai_results table
 * NOTE: This is optional - the ai_result is already stored in encounters.ai_result
 */
export async function saveAiResult({
  userId,
  encounterId,
  analysis,
}: {
  userId: string;
  encounterId: string;
  analysis: ClinicalAnalysisResult;
}): Promise<void> {
  // Skip saving to separate table - already saved in encounters.ai_result
  // This function is kept for backwards compatibility
  console.log('AI result saved in encounters.ai_result column');
}

/**
 * Update encounter with AI summary and risk level
 */
export async function updateEncounterWithAi(
  encounterId: string,
  result: ClinicalAnalysisResult
): Promise<void> {
  const summary = generateSummary(result);

  const { error } = await supabase
    .from('encounters')
    .update({
      ai_summary: summary,
      ai_risk_level: result.risk_level,
      updated_at: new Date().toISOString(),
    })
    .eq('id', encounterId);

  if (error) {
    console.error('Failed to update encounter with AI:', error);
    throw error;
  }
}

/**
 * Generate plain-text summary from analysis result
 */
function generateSummary(result: ClinicalAnalysisResult): string {
  const parts: string[] = [];

  parts.push(`Risk Level: ${result.risk_level.toUpperCase()}`);

  if (result.red_flags.length > 0) {
    parts.push(`Red Flags: ${result.red_flags.length} identified`);
  }

  if (result.possible_conditions.length > 0) {
    const conditions = result.possible_conditions
      .map((c) => c.name)
      .join(', ');
    parts.push(`Possible Conditions: ${conditions}`);
  }

  return parts.join(' | ');
}
