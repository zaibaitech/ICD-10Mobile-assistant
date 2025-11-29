import { supabase } from './supabase';
import { Icd10Code } from '../types';
import i18n from '../i18n';

/**
 * Get localized ICD-10 code fields based on current language
 */
const getLocalizedCode = (code: any): Icd10Code => {
  const currentLang = i18n.language;
  
  // If translations exist for current language, use them
  if (code.translations && code.translations[currentLang]) {
    return {
      ...code,
      short_title: code.translations[currentLang].short_title || code.short_title,
      long_description: code.translations[currentLang].long_description || code.long_description,
      full_title: code.translations[currentLang].short_title || code.short_title,
    };
  }
  
  // Fallback to English
  return {
    ...code,
    full_title: code.short_title,
    long_description: code.long_description
  };
};

/**
 * Search ICD-10 codes by query string and optional chapter filter
 * Now with multilingual support!
 */
export const searchIcd10 = async (
  query: string,
  chapter?: string,
  limit: number = 20,
  offset: number = 0
): Promise<Icd10Code[]> => {
  try {
    const currentLang = i18n.language || 'en';
    
    // Use the multilingual search function if available
    if (currentLang !== 'en') {
      const { data, error } = await supabase
        .rpc('search_icd10_multilingual', {
          search_term: query || '',
          language_code: currentLang,
          search_limit: limit
        });

      if (!error && data) {
        // Filter by chapter if needed (the RPC doesn't do this)
        let filteredData = data;
        if (chapter && chapter !== 'All') {
          filteredData = data.filter((item: any) => item.chapter === chapter);
        }
        
        return filteredData.slice(offset, offset + limit).map(getLocalizedCode);
      }
      
      // Fallback to regular query if RPC fails
      console.log('Multilingual search not available, falling back to English search');
    }
    
    // Default English search
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
    
    return data?.map(getLocalizedCode) || [];
  } catch (error) {
    console.error('Error searching ICD-10 codes:', error);
    return [];
  }
};

/**
 * Get a single ICD-10 code by ID (with multilingual support)
 */
export const getIcd10ById = async (id: string): Promise<Icd10Code | null> => {
  try {
    const { data, error } = await supabase
      .from('icd10_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return data ? getLocalizedCode(data) : null;
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
