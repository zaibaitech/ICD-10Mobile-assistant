import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Icd10Code } from '../types';

interface Props {
  code: Icd10Code;
  onPress: () => void;
  showChapter?: boolean;
  rightAction?: React.ReactNode;
}

export const Icd10ListItem: React.FC<Props> = ({ code, onPress, showChapter = true, rightAction }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <Text style={styles.code}>{code.code}</Text>
          <Text style={styles.title}>{code.short_title}</Text>
          {showChapter && <Text style={styles.chapter}>{code.chapter}</Text>}
        </View>
        <View style={styles.rightContent}>
          {rightAction || <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    marginLeft: 12,
  },
  code: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  chapter: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});
