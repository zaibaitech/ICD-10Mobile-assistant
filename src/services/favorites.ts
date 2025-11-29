import { supabase } from './supabase';
import { Icd10Code } from '../types';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { queueOperation } from './syncQueue';

const OFFLINE_FAVORITES_KEY = 'offline_favorites';

const mapRecordToIcd10 = (record: any): Icd10Code => ({
  id: record?.id || record?.code || 'unknown',
  code: record?.code || 'Unknown',
  short_title: record?.short_title || 'Untitled code',
  full_title: record?.long_description || record?.short_title || 'Untitled code',
  long_description: record?.long_description ?? null,
  chapter: record?.chapter || 'Other',
});

const getIcd10Id = async (code: Icd10Code | string): Promise<string | null> => {
  const codeValue = typeof code === 'string' ? code : code.code;

  const { data, error } = await supabase
    .from('icd10_codes')
    .select('id')
    .eq('code', codeValue)
    .maybeSingle();

  if (error) {
    console.error('Error fetching ICD-10 id:', error);
    return null;
  }

  if (data?.id) {
    return data.id;
  }

  if (typeof code === 'string') {
    return null; // cannot create record without metadata
  }

  const { data: created, error: insertError } = await supabase
    .from('icd10_codes')
    .insert({
      code: code.code,
      short_title: code.short_title || code.full_title,
      long_description: code.long_description || code.full_title || code.short_title,
      chapter: code.chapter || 'Other',
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Error inserting ICD-10 record:', insertError);
    return null;
  }

  return created.id;
};

/**
 * Add a code to user's favorites
 * Now stores code string + metadata instead of foreign key
 */
export const addFavorite = async (userId: string, code: Icd10Code): Promise<void> => {
  const netState = await NetInfo.fetch();

  try {
    // If offline, queue operation and update cache
    if (!netState.isConnected) {
      const favoriteData = {
        user_id: userId,
        icd10_code: code.code,
        code_metadata: code,
        created_at: new Date().toISOString(),
      };

      await queueOperation('create', 'user_favorites', favoriteData);

      // Update offline cache
      const cacheKey = `${OFFLINE_FAVORITES_KEY}_${userId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      const favorites: Icd10Code[] = cached ? JSON.parse(cached) : [];
      if (!favorites.some(f => f.code === code.code)) {
        favorites.unshift(code);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(favorites));
      }
      return;
    }

    // Online: add directly
    const icd10Id = await getIcd10Id(code);
    if (!icd10Id) {
      throw new Error('Unable to resolve ICD-10 identifier');
    }

    const { error } = await supabase
      .from('user_favorites')
      .insert({ 
        user_id: userId,
        icd10_id: icd10Id,
      });

    if (error && error.code !== '23505') { // ignore duplicate constraint
      throw error;
    }

    // Update cache
    const cacheKey = `${OFFLINE_FAVORITES_KEY}_${userId}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    const favorites: Icd10Code[] = cached ? JSON.parse(cached) : [];
    if (!favorites.some(f => f.code === code.code)) {
      favorites.unshift(code);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

/**
 * Remove a code from user's favorites
 */
export const removeFavorite = async (userId: string, codeString: string): Promise<void> => {
  const netState = await NetInfo.fetch();

  try {
    // If offline, queue operation and update cache
    if (!netState.isConnected) {
      await queueOperation('delete', 'user_favorites', {
        user_id: userId,
        icd10_code: codeString,
      });

      // Update offline cache
      const cacheKey = `${OFFLINE_FAVORITES_KEY}_${userId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      const favorites: Icd10Code[] = cached ? JSON.parse(cached) : [];
      const filtered = favorites.filter(f => f.code !== codeString);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(filtered));
      return;
    }

    // Online: delete directly
    const icd10Id = await getIcd10Id(codeString);
    if (!icd10Id) {
      return;
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('icd10_id', icd10Id);

    if (error) throw error;

    // Update cache
    const cacheKey = `${OFFLINE_FAVORITES_KEY}_${userId}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    const favorites: Icd10Code[] = cached ? JSON.parse(cached) : [];
    const filtered = favorites.filter(f => f.code !== codeString);
    await AsyncStorage.setItem(cacheKey, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

/**
 * Get user's favorites with code details
 * Fetches from API for latest data
 */
export const getUserFavorites = async (userId: string): Promise<Icd10Code[]> => {
  const netState = await NetInfo.fetch();
  const cacheKey = `${OFFLINE_FAVORITES_KEY}_${userId}`;

  // Try online first
  if (netState.isConnected) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id, created_at, icd10_codes (id, code, short_title, long_description, chapter)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const favorites = (
        data?.map((item: any) =>
          item.icd10_codes ? mapRecordToIcd10(item.icd10_codes) : null
        ).filter(Boolean) as Icd10Code[]
      );

      // Update cache
      await AsyncStorage.setItem(cacheKey, JSON.stringify(favorites));
      return favorites;
    } catch (error) {
      console.error('Error fetching favorites online:', error);
      // Fall through to offline cache
    }
  }

  // Use offline cache
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error reading favorites cache:', error);
    return [];
  }
};

/**
 * Check if a code is in user's favorites
 */
export const isFavorite = async (userId: string, codeString: string): Promise<boolean> => {
  try {
    const icd10Id = await getIcd10Id(codeString);
    if (!icd10Id) {
      return false;
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('icd10_id', icd10Id)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};
