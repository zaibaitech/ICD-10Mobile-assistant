import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  redFlags: string[];
}

export const RedFlagAlert: React.FC<Props> = ({ redFlags }) => {
  if (redFlags.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="warning" size={24} color="#F44336" />
        <Text style={styles.title}>Red Flags Detected</Text>
      </View>
      <View style={styles.list}>
        {redFlags.map((flag, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>{flag}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.disclaimer}>
        This is NOT a diagnosis. Please urgently review the patient and follow 
        your local clinical guidelines.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
    marginLeft: 8,
  },
  list: {
    marginVertical: 8,
  },
  item: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  bullet: {
    fontSize: 16,
    color: '#F44336',
    marginRight: 8,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: '#C62828',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 16,
  },
});
