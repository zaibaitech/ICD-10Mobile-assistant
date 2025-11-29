import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PossibleCondition } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { SurfaceCard } from './SurfaceCard';

interface Props {
  condition: PossibleCondition;
  onAddCode?: () => void;
}

const LIKELIHOOD_COLORS = {
  low: Colors.riskLow,
  medium: Colors.riskModerate,
  high: Colors.riskHigh,
} as const;

const LIKELIHOOD_BACKGROUND = {
  low: 'rgba(46, 204, 113, 0.15)',
  medium: 'rgba(243, 156, 18, 0.18)',
  high: 'rgba(231, 76, 60, 0.15)',
} as const;

export const PossibleConditionCard: React.FC<Props> = ({ condition, onAddCode }) => {
  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{condition.name}</Text>
          <View
            style={[
              styles.likelihoodBadge,
              {
                backgroundColor: LIKELIHOOD_BACKGROUND[condition.likelihood],
                borderColor: LIKELIHOOD_COLORS[condition.likelihood],
              },
            ]}
          >
            <Text
              style={[
                styles.likelihoodText,
                { color: LIKELIHOOD_COLORS[condition.likelihood] },
              ]}
            >
              {condition.likelihood.toUpperCase()}
            </Text>
          </View>
        </View>
        {condition.icd10_code && (
          <Text style={styles.code}>ICD-10: {condition.icd10_code}</Text>
        )}
      </View>

      {condition.explanation && (
        <Text style={styles.explanation}>{condition.explanation}</Text>
      )}

      {onAddCode && condition.icd10_code && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddCode}
          accessibilityRole="button"
          accessibilityLabel={`Add ${condition.icd10_code} to encounter`}
        >
          <Ionicons name="add-circle" size={20} color={Colors.primary} />
          <Text style={styles.addButtonText}>Add to Encounter</Text>
        </TouchableOpacity>
      )}
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  name: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  likelihoodBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  likelihoodText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  code: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  explanation: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
});
