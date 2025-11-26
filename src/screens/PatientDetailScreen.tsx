import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getPatientById, calculateAge, deletePatient } from '../services/patients';
import { getEncountersByPatient } from '../services/encounters';
import { Patient, Encounter, PatientsStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<PatientsStackParamList, 'PatientDetail'>;
type RouteParams = RouteProp<PatientsStackParamList, 'PatientDetail'>;

export const PatientDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { patientId } = route.params;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="person" size={40} color="#007AFF" />
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
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>

      {patient.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{patient.notes}</Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Encounters ({encounters.length})</Text>
          <TouchableOpacity
            style={styles.newEncounterButton}
            onPress={handleNewEncounter}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.newEncounterText}>New Encounter</Text>
          </TouchableOpacity>
        </View>

        {encounters.length === 0 ? (
          <View style={styles.emptyEncounters}>
            <Ionicons name="document-text-outline" size={48} color="#CCC" />
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
              >
                <View style={styles.encounterHeader}>
                  <Text style={styles.encounterDate}>
                    {new Date(encounter.encounter_date).toLocaleDateString()}
                  </Text>
                  {encounter.ai_risk_level !== 'unknown' && (
                    <View
                      style={[
                        styles.riskIndicator,
                        {
                          backgroundColor:
                            encounter.ai_risk_level === 'high'
                              ? '#F44336'
                              : encounter.ai_risk_level === 'moderate'
                              ? '#FF9800'
                              : '#4CAF50',
                        },
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  patientName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  patientInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  newEncounterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  newEncounterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyEncounters: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#BBB',
    marginTop: 4,
    textAlign: 'center',
  },
  encountersList: {
    gap: 10,
  },
  encounterCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  encounterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  encounterDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  riskIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chiefComplaint: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  aiSummary: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
});
