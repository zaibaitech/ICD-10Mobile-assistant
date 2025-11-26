import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PossibleCondition } from '../types';

interface Props {
  condition: PossibleCondition;
  onAddCode?: () => void;
}

const LIKELIHOOD_COLORS = {
  low: '#9E9E9E',
  medium: '#FF9800',
  high: '#4CAF50',
};

export const PossibleConditionCard: React.FC<Props> = ({ condition, onAddCode }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{condition.name}</Text>
          <View
            style={[
              styles.likelihoodBadge,
              { backgroundColor: LIKELIHOOD_COLORS[condition.likelihood] },
            ]}
          >
            <Text style={styles.likelihoodText}>
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
        <TouchableOpacity style={styles.addButton} onPress={onAddCode}>
          <Ionicons name="add-circle" size={20} color="#007AFF" />
          <Text style={styles.addButtonText}>Add to Encounter</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  likelihoodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  likelihoodText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  code: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  explanation: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
});
