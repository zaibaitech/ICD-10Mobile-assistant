import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RuleSuggestion, SuggestedCode } from '../types';

interface Props {
  suggestion: RuleSuggestion;
  onAddCode?: (code: SuggestedCode) => void;
}

export const RuleSuggestionCard: React.FC<Props> = ({ suggestion, onAddCode }) => {
  const { t } = useTranslation();

  return (
    <View style={[
      styles.container,
      suggestion.priority === 'warning' ? styles.warningContainer : styles.infoContainer
    ]}>
      <View style={styles.header}>
        <Ionicons
          name={suggestion.priority === 'warning' ? 'warning' : 'information-circle'}
          size={20}
          color={suggestion.priority === 'warning' ? '#FFC107' : '#007AFF'}
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
                >
                  <Ionicons name="add-circle" size={24} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    borderLeftWidth: 4,
  },
  warningContainer: {
    borderLeftColor: '#FFC107',
    backgroundColor: '#FFFBF0',
  },
  infoContainer: {
    borderLeftColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  codesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  codesTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  codeInfo: {
    flex: 1,
  },
  codeCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007AFF',
  },
  codeTitle: {
    fontSize: 13,
    color: '#555',
  },
  addButton: {
    padding: 4,
  },
});
