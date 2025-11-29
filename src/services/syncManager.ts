/**
 * Offline Sync Manager
 * Orchestrates syncing queued operations when online
 */

import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';
import {
  getQueue,
  markSynced,
  markFailed,
  clearSynced,
  getPendingCount,
} from './syncQueue';
import type { SyncQueueItem } from '../types/offline';

let isSyncing = false;
let syncInterval: NodeJS.Timeout | null = null;

/**
 * Start listening to network changes and auto-sync
 */
export function startSyncManager(): () => void {
  console.log('[Sync Manager] Starting...');

  // Listen to network state
  const unsubscribe = NetInfo.addEventListener((state) => {
    console.log('[Sync Manager] Network state:', state.isConnected);
    
    if (state.isConnected && !isSyncing) {
      syncPendingOperations();
    }
  });

  // Periodic sync every 5 minutes when online
  syncInterval = setInterval(() => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected && !isSyncing) {
        syncPendingOperations();
      }
    });
  }, 5 * 60 * 1000);

  return () => {
    console.log('[Sync Manager] Stopping...');
    unsubscribe();
    if (syncInterval) {
      clearInterval(syncInterval);
    }
  };
}

/**
 * Manually trigger sync
 */
export async function syncNow(): Promise<{ success: number; failed: number }> {
  const state = await NetInfo.fetch();
  
  if (!state.isConnected) {
    throw new Error('Cannot sync while offline');
  }

  return syncPendingOperations();
}

/**
 * Sync all pending operations
 */
async function syncPendingOperations(): Promise<{ success: number; failed: number }> {
  if (isSyncing) {
    console.log('[Sync Manager] Already syncing, skipping...');
    return { success: 0, failed: 0 };
  }

  isSyncing = true;
  const queue = await getQueue();
  const pending = queue.filter((item) => !item.synced && item.retries < 3);

  if (pending.length === 0) {
    isSyncing = false;
    return { success: 0, failed: 0 };
  }

  console.log(`[Sync Manager] Syncing ${pending.length} operations...`);

  let successCount = 0;
  let failedCount = 0;

  for (const item of pending) {
    try {
      await syncItem(item);
      await markSynced(item.id);
      successCount++;
      console.log(`[Sync Manager] ✓ Synced ${item.action} on ${item.table}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await markFailed(item.id, errorMsg);
      failedCount++;
      console.error(`[Sync Manager] ✗ Failed ${item.action} on ${item.table}:`, errorMsg);
    }
  }

  // Clean up synced items
  await clearSynced();

  isSyncing = false;
  console.log(`[Sync Manager] Sync complete: ${successCount} success, ${failedCount} failed`);

  return { success: successCount, failed: failedCount };
}

/**
 * Sync a single queue item
 */
async function syncItem(item: SyncQueueItem): Promise<void> {
  const { action, table, data } = item;

  switch (action) {
    case 'create':
      await syncCreate(table, data);
      break;
    case 'update':
      await syncUpdate(table, data);
      break;
    case 'delete':
      await syncDelete(table, data);
      break;
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

/**
 * Sync a create operation
 */
async function syncCreate(table: string, data: any): Promise<void> {
  const { error } = await supabase.from(table).insert(data);
  
  if (error) {
    throw new Error(`Create failed: ${error.message}`);
  }
}

/**
 * Sync an update operation
 */
async function syncUpdate(table: string, data: any): Promise<void> {
  const { id, ...updates } = data;
  
  if (!id) {
    throw new Error('Update requires an id');
  }

  const { error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id);
  
  if (error) {
    throw new Error(`Update failed: ${error.message}`);
  }
}

/**
 * Sync a delete operation
 */
async function syncDelete(table: string, data: any): Promise<void> {
  const { id } = data;
  
  if (!id) {
    throw new Error('Delete requires an id');
  }

  const { error } = await supabase.from(table).delete().eq('id', id);
  
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get current sync status
 */
export async function getSyncStatus(): Promise<{
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}> {
  const state = await NetInfo.fetch();
  const pendingCount = await getPendingCount();

  return {
    isOnline: state.isConnected || false,
    isSyncing,
    pendingCount,
  };
}
