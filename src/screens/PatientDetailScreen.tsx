import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { SurfaceCard } from '../components/SurfaceCard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getPatientById, calculateAge, deletePatient } from '../services/patients';
import { getEncountersByPatient, getEncounterCodes } from '../services/encounters';
import { Patient, Encounter, PatientsStackParamList } from '../types';
import { useBottomSpacing } from '../hooks/useBottomSpacing';

type NavigationProp = NativeStackNavigationProp<PatientsStackParamList, 'PatientDetail'>;
type RouteParams = RouteProp<PatientsStackParamList, 'PatientDetail'>;

export const PatientDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { patientId } = route.params;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomPadding = useBottomSpacing();

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [patientData, encountersData] = await Promise.all([
        getPatientById(patientId),
        getEncountersByPatient(patientId),
      ]);
      setPatient(patientData);
      setEncounters(encountersData);
    } catch (error) {
      console.error('Error loading patient data:', error);
      Alert.alert('Error', 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = () => {
    Alert.alert(
      'Delete Patient',
      'Are you sure? This will delete all encounters for this patient.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePatient(patientId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete patient');
            }
          },
        },
      ]
    );
  };

  const handleNewEncounter = () => {
    navigation.navigate('EncounterForm', { patientId });
  };

  const handleCreateCarePlan = async () => {
    try {
      // Find the most recent encounter with ICD-10 codes
      let icd10Codes: string[] = [];
      let selectedEncounterId: string | undefined;

      if (encounters.length > 0) {
        // Try to find encounter with codes, starting from most recent
        for (const encounter of encounters) {
          const codes = await getEncounterCodes(encounter.id);
          if (codes.length > 0) {
            icd10Codes = codes.map(c => c.icd10_codes?.code || '').filter(Boolean);
            selectedEncounterId = encounter.id;
            break;
          }
        }
        
        // If no encounter has codes yet, use the most recent encounter
        if (!selectedEncounterId && encounters.length > 0) {
          selectedEncounterId = encounters[0].id;
        }
      }

      // Navigate to Nursing stack's Care Plan Builder with patient context
      (navigation as any).navigate('Nursing', {
        screen: 'CarePlanBuilder',
        params: { 
          patientId,
          encounterId: selectedEncounterId,
          icd10Codes: icd10Codes.length > 0 ? icd10Codes : undefined
        }
      });
    } catch (error) {
      console.error('Error preparing care plan data:', error);
      // Navigate anyway, even if we couldn't fetch codes
      (navigation as any).navigate('Nursing', {
        screen: 'CarePlanBuilder',
        params: { patientId }
      });
    }
  };

  const getRiskColor = (level: Encounter['ai_risk_level']) => {
    switch (level) {
      case 'high':
        return Colors.riskHigh;
      case 'moderate':
        return Colors.riskModerate;
      case 'low':
        return Colors.riskLow;
      default:
        return Colors.border;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Patient not found</Text>
      </View>
    );
  }

  const age = calculateAge(patient.year_of_birth);

  return (
    <ScreenContainer
      scrollable
      style={styles.container}
      contentContainerStyle={{ paddingBottom: bottomPadding }}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
        <Ionicons name="person" size={40} color={Colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.patientName}>{patient.display_label}</Text>
            <View style={styles.patientInfo}>
              {age && <Text style={styles.infoText}>{age} years old</Text>}
              {patient.sex !== 'unknown' && (
                <Text style={styles.infoText}>• {patient.sex}</Text>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePatient}
          accessibilityRole="button"
          accessibilityLabel="Delete patient"
        >
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      {patient.notes && (
        <SurfaceCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{patient.notes}</Text>
        </SurfaceCard>
      )}

      {/* Nursing Care Actions */}
      <SurfaceCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Nursing Care</Text>
        <TouchableOpacity
          style={styles.nursingButton}
          onPress={handleCreateCarePlan}
          accessibilityRole="button"
          accessibilityLabel="Create care plan"
        >
          <View style={styles.nursingButtonContent}>
            <Ionicons name="medical" size={24} color="#2ecc71" />
            <View style={styles.nursingButtonText}>
              <Text style={styles.nursingButtonTitle}>Create Care Plan</Text>
              <Text style={styles.nursingButtonSubtitle}>
                Generate NANDA diagnoses from patient conditions
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </SurfaceCard>

      <SurfaceCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Encounters ({encounters.length})</Text>
          <TouchableOpacity
            style={styles.newEncounterButton}
            onPress={handleNewEncounter}
            accessibilityRole="button"
            accessibilityLabel="Create new encounter"
          >
            <Ionicons name="add" size={20} color={Colors.surface} />
            <Text style={styles.newEncounterText}>New Encounter</Text>
          </TouchableOpacity>
        </View>

        {encounters.length === 0 ? (
          <View style={styles.emptyEncounters}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={Colors.textTertiary}
            />
            <Text style={styles.emptyText}>No encounters yet</Text>
            <Text style={styles.emptySubtext}>
              Create an encounter to document a clinical visit
            </Text>
          </View>
        ) : (
          <View style={styles.encountersList}>
            {encounters.map((encounter) => (
              <TouchableOpacity
                key={encounter.id}
                style={styles.encounterCard}
                onPress={() =>
                  navigation.navigate('EncounterDetail', { encounterId: encounter.id })
                }
                accessibilityRole="button"
                accessibilityLabel={`Encounter on ${new Date(
                  encounter.encounter_date
                ).toLocaleDateString()}`}
              >
                <View style={styles.encounterHeader}>
                  <Text style={styles.encounterDate}>
                    {new Date(encounter.encounter_date).toLocaleDateString()}
                  </Text>
                  {encounter.ai_risk_level !== 'unknown' && (
                    <View
                      style={[
                        styles.riskIndicator,
                        { backgroundColor: getRiskColor(encounter.ai_risk_level) },
                      ]}
                    />
                  )}
                </View>
                <Text style={styles.chiefComplaint} numberOfLines={2}>
                  {encounter.chief_complaint}
                </Text>
                {encounter.ai_summary && (
                  <Text style={styles.aiSummary} numberOfLines={2}>
                    {encounter.ai_summary}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </SurfaceCard>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  patientName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  patientInfo: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  sectionCard: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  notesText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  newEncounterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  newEncounterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.surface,
  },
  emptyEncounters: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  encountersList: {
    gap: Spacing.sm,
  },
  encounterCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  encounterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  encounterDate: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  riskIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chiefComplaint: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  aiSummary: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  nursingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  nursingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nursingButtonText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  nursingButtonTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  nursingButtonSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
