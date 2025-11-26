import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Icd10Code } from '../types';

interface Props {
  code: Icd10Code;
  onRemove: () => void;
}

export const VisitCodeItem: React.FC<Props> = ({ code, onRemove }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.code}>{code.code}</Text>
        <Text style={styles.title}>{code.short_title}</Text>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <Ionicons name="close-circle" size={24} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  content: {
    flex: 1,
  },
  code: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    color: '#2c3e50',
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
