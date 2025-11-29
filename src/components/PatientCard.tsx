import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Patient } from '../types';
import { calculateAge } from '../services/patients';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { SurfaceCard } from './SurfaceCard';

interface Props {
  patient: Patient;
  onPress: () => void;
}

export const PatientCard: React.FC<Props> = ({ patient, onPress }) => {
  const age = calculateAge(patient.year_of_birth);
  const accessibilityLabelParts = [patient.display_label];
  if (age) accessibilityLabelParts.push(`${age} years old`);
  if (patient.sex !== 'unknown') accessibilityLabelParts.push(patient.sex);

  return (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabelParts.join(', ')}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <SurfaceCard padding={Spacing.md} style={styles.cardSurface}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="person" size={24} color={Colors.primary} />
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
          <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
        </View>
      </SurfaceCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  cardSurface: {
    borderRadius: BorderRadius.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  details: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});
