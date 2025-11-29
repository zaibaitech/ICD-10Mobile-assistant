import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RuleSuggestion, SuggestedCode } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { SurfaceCard } from './SurfaceCard';

interface Props {
  suggestion: RuleSuggestion;
  onAddCode?: (code: SuggestedCode) => void;
}

export const RuleSuggestionCard: React.FC<Props> = ({ suggestion, onAddCode }) => {
  const { t } = useTranslation();

  const priorityColor =
    suggestion.priority === 'warning' ? Colors.warning : Colors.primary;
  const priorityBackground =
    suggestion.priority === 'warning'
      ? 'rgba(243, 156, 18, 0.08)'
      : 'rgba(52, 152, 219, 0.08)';

  return (
    <SurfaceCard
      elevated={false}
      style={[styles.card, { borderLeftColor: priorityColor, backgroundColor: priorityBackground }]}
    >
      <View style={styles.header}>
        <Ionicons
          name={suggestion.priority === 'warning' ? 'warning' : 'information-circle'}
          size={20}
          color={priorityColor}
        />
        <Text style={styles.headerText}>
          {t(`rules.priority.${suggestion.priority}`)}
        </Text>
      </View>

      <Text style={styles.message}>{suggestion.message}</Text>

      {suggestion.relatedCodes && suggestion.relatedCodes.length > 0 && (
        <View style={styles.codesContainer}>
          <Text style={styles.codesTitle}>{t('rules.relatedCodes')}:</Text>
          {suggestion.relatedCodes.map((code, index) => (
            <View key={index} style={styles.codeRow}>
              <View style={styles.codeInfo}>
                <Text style={styles.codeCode}>{code.code}</Text>
                <Text style={styles.codeTitle}>{code.short_title}</Text>
              </View>
              {onAddCode && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => onAddCode(code)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add code ${code.code}`}
                >
                  <Ionicons name="add-circle" size={24} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderRadius: BorderRadius.lg,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.xs,
    color: Colors.textPrimary,
  },
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  codesContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  codesTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
    color: Colors.textPrimary,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  codeInfo: {
    flex: 1,
  },
  codeCode: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  codeTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  addButton: {
    padding: Spacing.xs,
  },
});
