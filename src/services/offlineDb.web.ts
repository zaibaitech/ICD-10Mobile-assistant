/**
 * Offline Database Service - Web Implementation
 * Uses IndexedDB for web platform (since SQLite doesn't work in browsers)
 */

import { supabase } from './supabase';

interface ICD10Code {
  code: string;
  long_description: string;
  short_description: string;
  chapter_number: number;
  chapter_title: string;
  is_billable: boolean;
  is_header: boolean;
  parent_code?: string;
}

interface Patient {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  phone_number?: string;
  synced: boolean;
  updated_at: string;
}

class OfflineDatabaseWeb {
  private db: IDBDatabase | null = null;
  private isOnline: boolean = navigator.onLine;

  async initialize(): Promise<void> {
    console.log('[OfflineDB-Web] Initializing IndexedDB...');

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('icd10_offline', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineDB-Web] IndexedDB initialized');
        
        // Set up online/offline listeners
        window.addEventListener('online', () => {
          this.isOnline = true;
          console.log('[OfflineDB-Web] Online');
        });
        window.addEventListener('offline', () => {
          this.isOnline = false;
          console.log('[OfflineDB-Web] Offline');
        });

        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('icd10_codes')) {
          const store = db.createObjectStore('icd10_codes', { keyPath: 'code' });
          store.createIndex('description', ['long_description', 'short_description'], { unique: false });
        }

        if (!db.objectStoreNames.contains('patients')) {
          const store = db.createObjectStore('patients', { keyPath: 'id' });
          store.createIndex('user_id', 'user_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
      };
    });
  }

  async searchICD10(query: string, limit: number = 20): Promise<ICD10Code[]> {
    // For web, fetch from Supabase directly (IndexedDB doesn't have FTS)
    try {
      const { data, error } = await supabase
        .from('icd10_codes')
        .select('*')
        .or(`code.ilike.%${query}%,short_title.ilike.%${query}%,long_description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return (data || []).map(item => ({
        code: item.code,
        long_description: item.long_description || item.short_title,
        short_description: item.short_title,
        chapter_number: 0,
        chapter_title: item.chapter || 'Unknown',
        is_billable: true,
        is_header: false,
      }));
    } catch (error) {
      console.error('[OfflineDB-Web] Search error:', error);
      return [];
    }
  }

  async getICD10ByCode(code: string): Promise<ICD10Code | null> {
    try {
      const { data, error } = await supabase
        .from('icd10_codes')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !data) return null;

      return {
        code: data.code,
        long_description: data.long_description || data.short_title,
        short_description: data.short_title,
        chapter_number: 0,
        chapter_title: data.chapter || 'Unknown',
        is_billable: true,
        is_header: false,
      };
    } catch (error) {
      console.error('[OfflineDB-Web] Get code error:', error);
      return null;
    }
  }

  async createPatient(patient: Omit<Patient, 'id' | 'synced' | 'updated_at'>): Promise<Patient> {
    const id = `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newPatient: Patient = {
      id,
      ...patient,
      synced: false,
      updated_at: now,
    };

    // Save to Supabase directly on web
    try {
      const { error } = await supabase.from('patients').insert([newPatient]);
      if (error) throw error;
      newPatient.synced = true;
    } catch (error) {
      console.error('[OfflineDB-Web] Create patient error:', error);
    }

    return newPatient;
  }

  async getPatients(userId: string): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(p => ({
        ...p,
        synced: true,
      }));
    } catch (error) {
      console.error('[OfflineDB-Web] Get patients error:', error);
      return [];
    }
  }

  async getSyncStatus() {
    return {
      pending: 0,
      failed: 0,
      lastSync: new Date().toISOString(),
    };
  }

  async forceSyncNow() {
    console.log('[OfflineDB-Web] Sync not needed on web (uses direct Supabase)');
  }

  stopBackgroundSync() {
    // No-op on web
  }
}

export const offlineDb = new OfflineDatabaseWeb();

export const initializeOfflineDb = async () => {
  await offlineDb.initialize();
};
