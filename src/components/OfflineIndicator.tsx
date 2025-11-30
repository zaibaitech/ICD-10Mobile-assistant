/**
 * Offline Indicator Component
 * Shows network status, pending sync count, and last sync time
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../hooks/useOffline';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SYNC_KEY = '@last_sync_time';

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount, triggerSync } = useOffline();
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    loadLastSyncTime();
  }, []);

  useEffect(() => {
    if (!isSyncing && isOnline && pendingCount === 0) {
      updateLastSyncTime();
    }
  }, [isSyncing, isOnline, pendingCount]);

  const loadLastSyncTime = async () => {
    try {
      const time = await AsyncStorage.getItem(LAST_SYNC_KEY);
      if (time) {
        setLastSyncTime(formatLastSync(new Date(time)));
      }
    } catch (error) {
      console.error('Error loading last sync time:', error);
    }
  };

  const updateLastSyncTime = async () => {
    try {
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now);
      setLastSyncTime(formatLastSync(new Date(now)));
    } catch (error) {
      console.error('Error updating last sync time:', error);
    }
  };

  const formatLastSync = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Don't show anything if online and nothing pending
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  const backgroundColor = isOnline ? Colors.warning : Colors.danger;
  const iconName = isOnline ? 'cloud-upload-outline' : 'cloud-offline-outline';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={triggerSync}
      disabled={!isOnline || isSyncing}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={isSyncing ? 'Syncing' : isOnline ? `${pendingCount} items pending sync, tap to sync now` : 'Offline mode'}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" style={styles.icon} />
          ) : (
            <Ionicons name={iconName} size={18} color="#fff" style={styles.icon} />
          )}
          
          <View style={styles.textContainer}>
            <Text style={styles.text}>
              {isSyncing
                ? 'Syncing...'
                : isOnline
                ? `${pendingCount} pending sync`
                : 'Offline mode'}
            </Text>
            {lastSyncTime && isOnline && (
              <Text style={styles.subtext}>Last sync: {lastSyncTime}</Text>
            )}
          </View>
        </View>

        {isOnline && !isSyncing && pendingCount > 0 && (
          <View style={styles.syncBadge}>
            <Ionicons name="sync" size={16} color="#fff" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  syncBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
