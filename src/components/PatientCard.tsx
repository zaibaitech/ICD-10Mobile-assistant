import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Patient } from '../types';
import { calculateAge } from '../services/patients';

interface Props {
  patient: Patient;
  onPress: () => void;
}

export const PatientCard: React.FC<Props> = ({ patient, onPress }) => {
  const age = calculateAge(patient.year_of_birth);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="person" size={24} color="#007AFF" />
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>{patient.display_label}</Text>
          <View style={styles.details}>
            {age && <Text style={styles.detailText}>{age} years</Text>}
            {patient.sex !== 'unknown' && (
              <Text style={styles.detailText}>• {patient.sex}</Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
});
