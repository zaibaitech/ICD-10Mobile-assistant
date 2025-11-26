import { supabase } from './supabase';
import { AssistantLogEntry, SuggestedCode } from '../types';

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
