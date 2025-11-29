/**
 * Offline Context
 * Provides network state and sync status to the entire app
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { startSyncManager, syncNow, getSyncStatus } from '../services/syncManager';

interface OfflineContextValue {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  triggerSync: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Update status from sync manager
  const refreshStatus = useCallback(async () => {
    try {
      const status = await getSyncStatus();
      setIsOnline(status.isOnline);
      setIsSyncing(status.isSyncing);
      setPendingCount(status.pendingCount);
    } catch (error) {
      console.error('[OfflineContext] Failed to refresh status:', error);
    }
  }, []);

  // Manually trigger sync
  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      console.warn('[OfflineContext] Cannot sync while offline');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncNow();
      console.log('[OfflineContext] Manual sync complete:', result);
      await refreshStatus();
    } catch (error) {
      console.error('[OfflineContext] Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, refreshStatus]);

  // Initialize sync manager and network listener
  useEffect(() => {
    console.log('[OfflineContext] Initializing...');

    // Start sync manager
    const stopSyncManager = startSyncManager();

    // Listen to network changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected || false;
      setIsOnline(online);
      
      if (online) {
        // When coming online, refresh status
        refreshStatus();
      }
    });

    // Initial status check
    refreshStatus();

    // Periodic status refresh (every 30 seconds)
    const interval = setInterval(refreshStatus, 30 * 1000);

    return () => {
      console.log('[OfflineContext] Cleaning up...');
      stopSyncManager();
      unsubscribe();
      clearInterval(interval);
    };
  }, [refreshStatus]);

  const value: OfflineContextValue = {
    isOnline,
    isSyncing,
    pendingCount,
    triggerSync,
    refreshStatus,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}