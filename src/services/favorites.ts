import { supabase } from './supabase';
import { Icd10Code } from '../types';

/**
 * Add a code to user's favorites
 */
export const addFavorite = async (userId: string, icd10Id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .insert({ user_id: userId, icd10_id: icd10Id });

    if (error) throw error;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

/**
 * Remove a code from user's favorites
 */
export const removeFavorite = async (userId: string, icd10Id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('icd10_id', icd10Id);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

/**
 * Get user's favorites with code details
 */
export const getUserFavorites = async (userId: string): Promise<Icd10Code[]> => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        icd10_codes (
          id,
          code,
          short_title,
          long_description,
          chapter
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map to Icd10Code array
    return data?.map((item: any) => item.icd10_codes).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

/**
 * Check if a code is in user's favorites
 */
export const isFavorite = async (userId: string, icd10Id: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('icd10_id', icd10Id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return !!data;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};
