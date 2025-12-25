import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { CarePlanItem } from '../../types/nursing';
import { NOC_SCORE_SCALES } from '../../types/nursing';

interface Props {
  item: CarePlanItem;
  onPress?: () => void;
}

export function CarePlanItemCard({ item, onPress }: Props) {
  const getScoreColor = (score: number | null) => {
    if (!score) return '#9ca3af';
    if (score >= 4) return '#10b981';
    if (score >= 3) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#3b82f6';
      case 'resolved':
        return '#10b981';
      case 'ongoing':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const progress = item.baseline_score && item.current_score && item.target_score
    ? ((item.current_score - item.baseline_score) / (item.target_score - item.baseline_score)) * 100
    : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {/* ICD-10 → NANDA Bridge Indicator */}
      {item.icd10 && (
        <View style={styles.bridgeContainer}>
          <View style={styles.icd10Badge}>
            <Text style={styles.icd10Code}>{item.icd10.code}</Text>
            <Text style={styles.icd10Description} numberOfLines={1}>
              {item.icd10.short_title}
            </Text>
          </View>
          <Text style={styles.arrow}>↓</Text>
        </View>
      )}

      {/* NANDA Diagnosis */}
      <View style={styles.nandaContainer}>
        {item.nanda && (
          <>
            <Text style={styles.nandaCode}>{item.nanda.code}</Text>
            <Text style={styles.nandaLabel}>{item.nanda.label}</Text>
          </>
        )}
        {item.custom_diagnosis && !item.nanda && (
          <Text style={styles.nandaLabel}>{item.custom_diagnosis}</Text>
        )}
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>

      {/* Interventions & Outcomes Count */}
      <View style={styles.countRow}>
        {item.nics && item.nics.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countIcon}>💊</Text>
            <Text style={styles.countText}>{item.nics.length} Interventions</Text>
          </View>
        )}
        {item.nocs && item.nocs.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countIcon}>🎯</Text>
            <Text style={styles.countText}>{item.nocs.length} Outcomes</Text>
          </View>
        )}
      </View>

      {/* Score Progress */}
      {item.baseline_score && item.target_score && (
        <View style={styles.scoreContainer}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Baseline</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(item.baseline_score) }]}>
                {item.baseline_score}/5
              </Text>
            </View>

            {item.current_score && (
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Current</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(item.current_score) }]}>
                  {item.current_score}/5
                </Text>
              </View>
            )}

            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Target</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(item.target_score) }]}>
                {item.target_score}/5
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          {progress > 0 && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
          )}
        </View>
      )}

      {/* Goal Statement */}
      {item.goal_statement && (
        <View style={styles.goalContainer}>
          <Text style={styles.goalLabel}>Goal:</Text>
          <Text style={styles.goalText}>{item.goal_statement}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bridgeContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  icd10Badge: {
    marginBottom: 4,
  },
  icd10Code: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  icd10Description: {
    fontSize: 13,
    color: '#374151',
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    textAlign: 'center',
    color: '#3b82f6',
    marginVertical: 4,
  },
  nandaContainer: {
    marginBottom: 12,
  },
  nandaCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  nandaLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  countRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  countIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  countText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  scoreContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  goalContainer: {
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    paddingLeft: 12,
  },
  goalLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  goalText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
});
