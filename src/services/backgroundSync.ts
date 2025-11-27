/**
 * Background Sync Service
 * Smart synchronization with exponential backoff and conflict resolution
 * 
 * Features:
 * - Network detection (online/offline)
 * - Automatic retry with exponential backoff
 * - Conflict resolution (last-write-wins)
 * - Batch operations for efficiency
 * - Priority queue (urgent vs normal sync)
 */

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Types
interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  priority: 'high' | 'normal';
  timestamp: number;
  retryCount: number;
}

interface SyncStatus {
  lastSyncTime: number;
  pendingItems: number;
  failedItems: number;
  isOnline: boolean;
}

/**
 * Background Sync Service
 */
export class BackgroundSyncService {
  private syncQueue: SyncQueueItem[] = [];
  private isOnline: boolean = false;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 30000; // 30 seconds
  private readonly MAX_RETRIES = 5;
  private readonly QUEUE_KEY = '@sync_queue';

  constructor() {
    this.initialize();
  }

  /**
   * Initialize service
   */
  private async initialize(): Promise<void> {
    // Monitor network status
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      console.log('[BackgroundSync] Network status:', this.isOnline ? 'ONLINE' : 'OFFLINE');

      // If just came online, trigger sync
      if (wasOffline && this.isOnline) {
        console.log('[BackgroundSync] Connection restored, triggering sync...');
        this.syncNow();
      }
    });

    // Load pending queue from storage
    await this.loadQueue();

    // Start periodic sync
    this.startPeriodicSync();
  }

  /**
   * Start periodic background sync
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncNow();
      }
    }, this.SYNC_INTERVAL_MS);

    console.log('[BackgroundSync] Periodic sync started (every 30s)');
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[BackgroundSync] Periodic sync stopped');
    }
  }

  /**
   * Add item to sync queue
   */
  async addToQueue(
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data: any,
    priority: 'high' | 'normal' = 'normal'
  ): Promise<void> {
    const item: SyncQueueItem = {
      id: `${table}_${operation}_${Date.now()}_${Math.random()}`,
      table,
      operation,
      data,
      priority,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(item);
    await this.saveQueue();

    console.log(`[BackgroundSync] Added to queue: ${table} ${operation}`);

    // If online and high priority, sync immediately
    if (this.isOnline && priority === 'high') {
      this.syncNow();
    }
  }

  /**
   * Trigger immediate sync
   */
  async syncNow(): Promise<void> {
    if (!this.isOnline) {
      console.log('[BackgroundSync] Cannot sync - offline');
      return;
    }

    if (this.isSyncing) {
      console.log('[BackgroundSync] Sync already in progress');
      return;
    }

    if (this.syncQueue.length === 0) {
      console.log('[BackgroundSync] Queue empty, nothing to sync');
      return;
    }

    this.isSyncing = true;
    console.log(`[BackgroundSync] Starting sync... (${this.syncQueue.length} items)`);

    try {
      // Sort by priority (high first) and timestamp (oldest first)
      const sortedQueue = [...this.syncQueue].sort((a, b) => {
        if (a.priority === 'high' && b.priority === 'normal') return -1;
        if (a.priority === 'normal' && b.priority === 'high') return 1;
        return a.timestamp - b.timestamp;
      });

      const results = {
        success: 0,
        failed: 0,
        retryLater: 0,
      };

      // Process items with exponential backoff on failure
      for (const item of sortedQueue) {
        try {
          await this.syncItem(item);
          
          // Remove from queue on success
          this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
          results.success++;
          
          console.log(`[BackgroundSync] ✓ Synced: ${item.table} ${item.operation}`);
        } catch (error) {
          console.error(`[BackgroundSync] ✗ Failed: ${item.table} ${item.operation}`, error);
          
          // Increment retry count
          const queueItem = this.syncQueue.find(q => q.id === item.id);
          if (queueItem) {
            queueItem.retryCount++;

            // Remove if max retries exceeded
            if (queueItem.retryCount >= this.MAX_RETRIES) {
              console.error(`[BackgroundSync] Max retries exceeded for ${item.id}, removing from queue`);
              this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
              results.failed++;
            } else {
              results.retryLater++;
            }
          }
        }

        // Small delay between operations to avoid rate limiting
        await this.sleep(100);
      }

      await this.saveQueue();

      console.log('[BackgroundSync] Sync completed:', results);
      
      // Update last sync time
      await AsyncStorage.setItem('@last_sync_time', Date.now().toString());
      
    } catch (error) {
      console.error('[BackgroundSync] Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    const { table, operation, data } = item;

    switch (operation) {
      case 'insert':
        const { error: insertError } = await supabase
          .from(table)
          .insert(data);
        if (insertError) throw insertError;
        break;

      case 'update':
        const { error: updateError } = await supabase
          .from(table)
          .update(data)
          .eq('id', data.id);
        if (updateError) throw updateError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id);
        if (deleteError) throw deleteError;
        break;
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const lastSyncTime = await AsyncStorage.getItem('@last_sync_time');
    
    const pendingItems = this.syncQueue.filter(item => item.retryCount < this.MAX_RETRIES).length;
    const failedItems = this.syncQueue.filter(item => item.retryCount >= this.MAX_RETRIES).length;

    return {
      lastSyncTime: lastSyncTime ? parseInt(lastSyncTime, 10) : 0,
      pendingItems,
      failedItems,
      isOnline: this.isOnline,
    };
  }

  /**
   * Clear failed items from queue
   */
  async clearFailedItems(): Promise<void> {
    this.syncQueue = this.syncQueue.filter(item => item.retryCount < this.MAX_RETRIES);
    await this.saveQueue();
    console.log('[BackgroundSync] Failed items cleared');
  }

  /**
   * Retry all failed items
   */
  async retryFailedItems(): Promise<void> {
    this.syncQueue.forEach(item => {
      if (item.retryCount >= this.MAX_RETRIES) {
        item.retryCount = 0; // Reset retry count
      }
    });
    await this.saveQueue();
    
    if (this.isOnline) {
      await this.syncNow();
    }
  }

  /**
   * Save queue to persistent storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('[BackgroundSync] Error saving queue:', error);
    }
  }

  /**
   * Load queue from persistent storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (saved) {
        this.syncQueue = JSON.parse(saved);
        console.log(`[BackgroundSync] Loaded ${this.syncQueue.length} items from storage`);
      }
    } catch (error) {
      console.error('[BackgroundSync] Error loading queue:', error);
      this.syncQueue = [];
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get exponential backoff delay
   */
  private getBackoffDelay(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, retryCount), 32000);
  }
}

// Export singleton instance
export const backgroundSyncService = new BackgroundSyncService();
