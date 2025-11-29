/**
 * Sync History Screen
 * Shows sync queue status, history, and failed operations
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SurfaceCard } from '../components/SurfaceCard';
import { useOffline } from '../hooks/useOffline';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import {
  getQueue,
  getPendingCount,
  getFailedItems,
  retryItem,
  clearSynced,
} from '../services/syncQueue';
import type { SyncQueueItem } from '../types/offline';

export function SyncHistoryScreen() {
  const navigation = useNavigation();
  const { isOnline, isSyncing, triggerSync } = useOffline();
  
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedItems, setFailedItems] = useState<SyncQueueItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadQueueData = useCallback(async () => {
    try {
      const [queueData, pending, failed] = await Promise.all([
        getQueue(),
        getPendingCount(),
        getFailedItems(),
      ]);
      
      setQueue(queueData);
      setPendingCount(pending);
      setFailedItems(failed);
    } catch (error) {
      console.error('Error loading queue data:', error);
    }
  }, []);

  useEffect(() => {
    loadQueueData();
  }, [loadQueueData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQueueData();
    setRefreshing(false);
  };

  const handleRetry = async (itemId: string) => {
    try {
      await retryItem(itemId);
      Alert.alert('Success', 'Item queued for retry');
      await loadQueueData();
    } catch (error) {
      Alert.alert('Error', 'Failed to retry item');
    }
  };

  const handleClearSynced = async () => {
    Alert.alert(
      'Clear Synced Items',
      'Remove all successfully synced items from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearSynced();
            await loadQueueData();
          },
        },
      ]
    );
  };

  const handleSyncNow = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline');
      return;
    }
    await triggerSync();
    await loadQueueData();
  };

  const renderQueueItem = ({ item }: { item: SyncQueueItem }) => {
    const getActionIcon = (action: string) => {
      switch (action) {
        case 'create': return 'add-circle';
        case 'update': return 'create';
        case 'delete': return 'trash';
        default: return 'help-circle';
      }
    };

    const getActionColor = (action: string) => {
      switch (action) {
        case 'create': return Colors.success;
        case 'update': return Colors.warning;
        case 'delete': return Colors.danger;
        default: return Colors.textSecondary;
      }
    };

    const getStatusIcon = () => {
      if (item.synced) return 'checkmark-circle';
      if (item.retries >= 3) return 'close-circle';
      return 'time';
    };

    const getStatusColor = () => {
      if (item.synced) return Colors.success;
      if (item.retries >= 3) return Colors.danger;
      return Colors.warning;
    };

    return (
      <SurfaceCard style={styles.queueItem}>
        <View style={styles.itemHeader}>
          <View style={styles.itemTitle}>
            <Ionicons
              name={getActionIcon(item.action)}
              size={20}
              color={getActionColor(item.action)}
            />
            <Text style={styles.itemAction}>{item.action.toUpperCase()}</Text>
            <Text style={styles.itemTable}>{item.table}</Text>
          </View>
          
          <Ionicons
            name={getStatusIcon()}
            size={24}
            color={getStatusColor()}
          />
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemTimestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
          
          {item.retries > 0 && (
            <Text style={styles.itemRetries}>
              Retries: {item.retries}/3
            </Text>
          )}
          
          {item.error && (
            <Text style={styles.itemError} numberOfLines={2}>
              Error: {item.error}
            </Text>
          )}
        </View>

        {item.retries >= 3 && !item.synced && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleRetry(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={16} color={Colors.primary} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </SurfaceCard>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Sync History</Text>
          <TouchableOpacity
            onPress={handleClearSynced}
            style={styles.clearButton}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <SurfaceCard style={styles.statCard}>
            <Ionicons name="cloud-upload" size={32} color={Colors.primary} />
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </SurfaceCard>

          <SurfaceCard style={styles.statCard}>
            <Ionicons name="close-circle" size={32} color={Colors.danger} />
            <Text style={styles.statValue}>{failedItems.length}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </SurfaceCard>

          <SurfaceCard style={styles.statCard}>
            <Ionicons
              name={isOnline ? 'cloud-done' : 'cloud-offline'}
              size={32}
              color={isOnline ? Colors.success : Colors.textTertiary}
            />
            <Text style={styles.statLabel}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </SurfaceCard>
        </View>

        {/* Sync Button */}
        {pendingCount > 0 && isOnline && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSyncNow}
            disabled={isSyncing}
            activeOpacity={0.7}
          >
            <Ionicons name="sync" size={20} color="#fff" />
            <Text style={styles.syncButtonText}>
              {isSyncing ? 'Syncing...' : `Sync ${pendingCount} Items`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Queue List */}
        <FlatList
          data={queue}
          keyExtractor={(item) => item.id}
          renderItem={renderQueueItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
              <Text style={styles.emptyText}>All synced!</Text>
              <Text style={styles.emptySubtext}>No pending operations</Text>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginLeft: Spacing.md,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },
  list: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  queueItem: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  itemTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  itemAction: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemTable: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  itemDetails: {
    gap: Spacing.xs,
  },
  itemTimestamp: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
  itemRetries: {
    fontSize: Typography.fontSize.xs,
    color: Colors.warning,
    fontWeight: '600',
  },
  itemError: {
    fontSize: Typography.fontSize.xs,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
