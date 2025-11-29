/**
 * Offline Sync Queue Manager
 * Handles queuing operations when offline and syncing when online
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SyncQueueItem, SyncAction, SyncTable } from '../types/offline';

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const QUEUE_KEY = '@sync_queue';
const MAX_RETRIES = 3;

/**
 * Add an operation to the sync queue
 */
export async function queueOperation(
  action: SyncAction,
  table: SyncTable,
  data: any
): Promise<string> {
  const item: SyncQueueItem = {
    id: generateId(),
    action,
    table,
    data,
    timestamp: Date.now(),
    synced: false,
    retries: 0,
  };

  const queue = await getQueue();
  queue.push(item);
  await saveQueue(queue);

  console.log(`[Sync Queue] Added ${action} on ${table}`, item.id);
  return item.id;
}

/**
 * Get all pending items in the queue
 */
export async function getQueue(): Promise<SyncQueueItem[]> {
  try {
    const json = await AsyncStorage.getItem(QUEUE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('[Sync Queue] Error reading queue:', error);
    return [];
  }
}

/**
 * Save the queue to storage
 */
async function saveQueue(queue: SyncQueueItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[Sync Queue] Error saving queue:', error);
  }
}

/**
 * Mark an item as synced
 */
export async function markSynced(itemId: string): Promise<void> {
  const queue = await getQueue();
  const updated = queue.map((item) =>
    item.id === itemId ? { ...item, synced: true } : item
  );
  await saveQueue(updated);
}

/**
 * Mark an item as failed
 */
export async function markFailed(itemId: string, error: string): Promise<void> {
  const queue = await getQueue();
  const updated = queue.map((item) =>
    item.id === itemId
      ? { ...item, retries: item.retries + 1, error }
      : item
  );
  await saveQueue(updated);
}

/**
 * Remove synced items from queue
 */
export async function clearSynced(): Promise<void> {
  const queue = await getQueue();
  const pending = queue.filter((item) => !item.synced);
  await saveQueue(pending);
}

/**
 * Get count of pending items
 */
export async function getPendingCount(): Promise<number> {
  const queue = await getQueue();
  return queue.filter((item) => !item.synced).length;
}

/**
 * Clear all items (use with caution)
 */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
  console.log('[Sync Queue] Queue cleared');
}

/**
 * Get failed items (exceeded max retries)
 */
export async function getFailedItems(): Promise<SyncQueueItem[]> {
  const queue = await getQueue();
  return queue.filter((item) => !item.synced && item.retries >= MAX_RETRIES);
}

/**
 * Retry a failed item
 */
export async function retryItem(itemId: string): Promise<void> {
  const queue = await getQueue();
  const updated = queue.map((item) =>
    item.id === itemId ? { ...item, retries: 0, error: undefined } : item
  );
  await saveQueue(updated);
}
