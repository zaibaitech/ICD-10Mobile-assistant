import { supabase } from './supabase';
import { Icd10Code } from '../types';

/**
 * Search ICD-10 codes by query string and optional chapter filter
 */
export const searchIcd10 = async (
  query: string,
  chapter?: string,
  limit: number = 20,
  offset: number = 0
): Promise<Icd10Code[]> => {
  try {
    let queryBuilder = supabase
      .from('icd10_codes')
      .select('*')
      .range(offset, offset + limit - 1);

    // If query is provided, search in code and short_title
    if (query && query.trim()) {
      queryBuilder = queryBuilder.or(
        `code.ilike.%${query}%,short_title.ilike.%${query}%`
      );
    }

    // Filter by chapter if provided
    if (chapter && chapter !== 'All') {
      queryBuilder = queryBuilder.eq('chapter', chapter);
    }

    const { data, error } = await queryBuilder.order('code', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching ICD-10 codes:', error);
    return [];
  }
};

/**
 * Get a single ICD-10 code by ID
 */
export const getIcd10ById = async (id: string): Promise<Icd10Code | null> => {
  try {
    const { data, error } = await supabase
      .from('icd10_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching ICD-10 code:', error);
    return null;
  }
};

/**
 * Get all distinct chapters from ICD-10 codes
 */
export const getChapters = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('icd10_codes')
      .select('chapter')
      .order('chapter', { ascending: true });

    if (error) throw error;

    // Get unique chapters
    const uniqueChapters = [...new Set(data?.map((item) => item.chapter) || [])];
    return ['All', ...uniqueChapters];
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return ['All'];
  }
};
