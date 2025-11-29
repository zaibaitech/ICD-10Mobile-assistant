/**
 * ICD-10 Service using NIH Clinical Tables API
 * FREE, no database setup needed, always up-to-date
 * Falls back to cached results for offline use
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icd10Code } from '../types';

const NIH_API_BASE = 'https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search';
const CACHE_KEY_PREFIX = 'icd10_cache_';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Search ICD-10 codes using NIH Clinical Tables API
 * Caches results for offline use
 */
export const searchIcd10Codes = async (
  query: string,
  chapter?: string,
  limit: number = 50
): Promise<Icd10Code[]> => {
  const cacheKey = `${CACHE_KEY_PREFIX}${query}_${chapter || 'all'}`;

  try {
    // Build API request
    const params = new URLSearchParams({
      sf: 'code,name', // Search fields
      terms: query,
      maxList: limit.toString(),
    });

    const response = await fetch(`${NIH_API_BASE}?${params}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    // Response format: [totalCount, codes[], extra, names[]]
    const [totalCount, codes, extra, names] = await response.json();

    const results: Icd10Code[] = codes.map((code: string, idx: number) => ({
      id: code,
      code: code,
      short_title: names[idx],
      full_title: names[idx],
      long_description: null,
      chapter: getChapterFromCode(code),
    }));

    // Filter by chapter if specified
    const filteredResults = chapter
      ? results.filter(r => r.chapter === chapter)
      : results;

    // Cache results
    await cacheResults(cacheKey, filteredResults);

    return filteredResults;
  } catch (error) {
    console.error('Error fetching from NIH API:', error);

    // Try to return cached results
    const cached = await getCachedResults(cacheKey);
    if (cached) {
      console.log('Using cached results (offline mode)');
      return cached;
    }

    // If no cache, return empty
    throw error;
  }
};

/**
 * Get details for a specific ICD-10 code
 */
export const getIcd10CodeDetails = async (code: string): Promise<Icd10Code | null> => {
  const cacheKey = `${CACHE_KEY_PREFIX}code_${code}`;

  try {
    const params = new URLSearchParams({
      sf: 'code,name',
      terms: code,
      maxList: '1',
    });

    const response = await fetch(`${NIH_API_BASE}?${params}`);
    const [, codes, , names] = await response.json();

    if (codes.length === 0) {
      return null;
    }

    const result: Icd10Code = {
      id: codes[0],
      code: codes[0],
      short_title: names[0],
      full_title: names[0],
      long_description: null,
      chapter: getChapterFromCode(codes[0]),
    };

    await cacheResults(cacheKey, [result]);
    return result;
  } catch (error) {
    console.error('Error fetching code details:', error);

    // Try cache
    const cached = await getCachedResults(cacheKey);
    return cached?.[0] || null;
  }
};

/**
 * Get popular/common ICD-10 codes
 */
export const getCommonCodes = async (): Promise<Icd10Code[]> => {
  const commonCodes = [
    'I10', 'E11.9', 'J06.9', 'J18.9', 'M54.5', 
    'G43.909', 'F41.1', 'F32.9', 'K21.0', 'N39.0',
    'I25.10', 'E11.65', 'L30.9', 'R05.9', 'Z00.00'
  ];

  const results = await Promise.all(
    commonCodes.map(code => getIcd10CodeDetails(code))
  );

  return results.filter(r => r !== null) as Icd10Code[];
};

/**
 * Determine chapter from code prefix
 */
function getChapterFromCode(code: string): string {
  const prefix = code.charAt(0).toUpperCase();

  const chapterMap: Record<string, string> = {
    'A': 'Infectious diseases',
    'B': 'Infectious diseases',
    'C': 'Neoplasms',
    'D': 'Blood/Immune/Endocrine',
    'E': 'Endocrine/Metabolic',
    'F': 'Mental/Behavioral',
    'G': 'Nervous System',
    'H': 'Eye/Ear',
    'I': 'Circulatory System',
    'J': 'Respiratory System',
    'K': 'Digestive System',
    'L': 'Skin',
    'M': 'Musculoskeletal',
    'N': 'Genitourinary',
    'O': 'Pregnancy/Childbirth',
    'P': 'Perinatal',
    'Q': 'Congenital',
    'R': 'Symptoms/Signs',
    'S': 'Injury/Poisoning',
    'T': 'Injury/Poisoning',
    'V': 'External causes',
    'W': 'External causes',
    'X': 'External causes',
    'Y': 'External causes',
    'Z': 'Health Status',
  };

  return chapterMap[prefix] || 'Other';
}

/**
 * Cache results to AsyncStorage
 */
async function cacheResults(key: string, results: Icd10Code[]): Promise<void> {
  try {
    const cacheData = {
      timestamp: Date.now(),
      data: results,
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    // Silent fail - caching is optional (won't work in Node.js/testing)
    // console.error('Error caching results:', error);
  }
}

/**
 * Get cached results if not expired
 */
async function getCachedResults(key: string): Promise<Icd10Code[] | null> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const { timestamp, data } = JSON.parse(cached);

    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_DURATION) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    // Silent fail - caching is optional
    return null;
  }
}

/**
 * Clear all cached ICD-10 data
 */
export async function clearIcd10Cache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const icd10Keys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(icd10Keys);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
