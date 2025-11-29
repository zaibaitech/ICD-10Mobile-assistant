/**
 * Conflict Resolution Modal
 * Shows when offline sync encounters conflicting data
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

export interface ConflictData {
  id: string;
  table: string;
  field: string;
  localValue: any;
  serverValue: any;
  localTimestamp: string;
  serverTimestamp: string;
}

interface ConflictResolutionModalProps {
  visible: boolean;
  conflict: ConflictData | null;
  onKeepLocal: () => void;
  onKeepServer: () => void;
  onCancel: () => void;
}

export function ConflictResolutionModal({
  visible,
  conflict,
  onKeepLocal,
  onKeepServer,
  onCancel,
}: ConflictResolutionModalProps) {
  if (!conflict) return null;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '(empty)';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="warning" size={32} color={Colors.warning} />
            <Text style={styles.title}>Data Conflict Detected</Text>
            <Text style={styles.subtitle}>
              Changes were made offline and online. Choose which version to keep.
            </Text>
          </View>

          {/* Conflict Details */}
          <ScrollView style={styles.content}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Table:</Text>
              <Text style={styles.value}>{conflict.table}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Field:</Text>
              <Text style={styles.value}>{conflict.field}</Text>
            </View>

            {/* Local Version */}
            <View style={styles.versionContainer}>
              <View style={styles.versionHeader}>
                <Ionicons name="phone-portrait" size={20} color={Colors.primary} />
                <Text style={styles.versionTitle}>Your Device (Local)</Text>
              </View>
              <Text style={styles.timestamp}>
                Modified: {formatTimestamp(conflict.localTimestamp)}
              </Text>
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>{formatValue(conflict.localValue)}</Text>
              </View>
            </View>

            {/* Server Version */}
            <View style={styles.versionContainer}>
              <View style={styles.versionHeader}>
                <Ionicons name="cloud" size={20} color={Colors.accent} />
                <Text style={styles.versionTitle}>Server (Online)</Text>
              </View>
              <Text style={styles.timestamp}>
                Modified: {formatTimestamp(conflict.serverTimestamp)}
              </Text>
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>{formatValue(conflict.serverValue)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.localButton]}
              onPress={onKeepLocal}
              activeOpacity={0.7}
            >
              <Ionicons name="phone-portrait" size={18} color="#fff" />
              <Text style={styles.buttonText}>Keep Local</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.serverButton]}
              onPress={onKeepServer}
              activeOpacity={0.7}
            >
              <Ionicons name="cloud" size={18} color="#fff" />
              <Text style={styles.buttonText}>Keep Server</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: Colors.textPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  header: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 80,
  },
  value: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    flex: 1,
  },
  versionContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  versionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
  },
  timestamp: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  valueContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  valueText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  actions: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  localButton: {
    backgroundColor: Colors.primary,
  },
  serverButton: {
    backgroundColor: Colors.accent,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: '#fff',
  },
});
