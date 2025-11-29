/**
 * Offline Sync Queue Types
 */

export type SyncAction = 'create' | 'update' | 'delete';

export type SyncTable = 
  | 'patients' 
  | 'encounters' 
  | 'encounter_icd10_codes'
  | 'user_favorites';

export interface SyncQueueItem {
  id: string;
  action: SyncAction;
  table: SyncTable;
  data: any;
  timestamp: number;
  synced: boolean;
  retries: number;
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  syncErrors: string[];
}

export interface OfflineData {
  patients: any[];
  encounters: any[];
  favorites: any[];
  icd10Codes: any[];
  lastDownload: number | null;
}
