/**
 * Offline Indicator Component
 * Shows network status and pending sync count
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../hooks/useOffline';
import { Colors } from '../constants/theme';

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount, triggerSync } = useOffline();

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
    >
      <View style={styles.content}>
        {isSyncing ? (
          <ActivityIndicator size="small" color="#fff" style={styles.icon} />
        ) : (
          <Ionicons name={iconName} size={16} color="#fff" style={styles.icon} />
        )}
        
        <Text style={styles.text}>
          {isSyncing
            ? 'Syncing...'
            : isOnline
            ? `${pendingCount} pending sync`
            : 'Offline mode'}
        </Text>

        {isOnline && !isSyncing && pendingCount > 0 && (
          <Ionicons name="sync" size={14} color="#fff" style={styles.syncIcon} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  syncIcon: {
    marginLeft: 6,
  },
});
