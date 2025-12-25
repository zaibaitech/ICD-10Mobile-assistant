import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NandaDiagnosis } from '../../types/nursing';

interface Props {
  nanda: NandaDiagnosis;
  onPress?: () => void;
  showDetails?: boolean;
}

export function NandaCard({ nanda, onPress, showDetails = false }: Props) {
  const typeColors = {
    actual: '#ef4444',
    risk: '#f59e0b',
    health_promotion: '#10b981',
    syndrome: '#8b5cf6',
  };

  const typeLabels = {
    actual: 'Actual',
    risk: 'Risk',
    health_promotion: 'Health Promotion',
    syndrome: 'Syndrome',
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.code}>{nanda.code}</Text>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: `${typeColors[nanda.diagnosis_type]}20` },
          ]}
        >
          <Text
            style={[styles.typeText, { color: typeColors[nanda.diagnosis_type] }]}
          >
            {typeLabels[nanda.diagnosis_type]}
          </Text>
        </View>
      </View>

      {/* Label */}
      <Text style={styles.label}>{nanda.label}</Text>

      {/* Domain */}
      <Text style={styles.domain}>📋 {nanda.domain}</Text>

      {/* Details */}
      {showDetails && nanda.definition && (
        <Text style={styles.definition} numberOfLines={2}>
          {nanda.definition}
        </Text>
      )}

      {/* Factors/Characteristics Count */}
      {showDetails && (
        <View style={styles.metaRow}>
          {nanda.risk_factors.length > 0 && (
            <Text style={styles.metaText}>
              ⚠️ {nanda.risk_factors.length} risk factors
            </Text>
          )}
          {nanda.defining_characteristics.length > 0 && (
            <Text style={styles.metaText}>
              ✓ {nanda.defining_characteristics.length} characteristics
            </Text>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  code: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 22,
  },
  domain: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  definition: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
