import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PatientCard } from '../components/PatientCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { getPatients, createPatient } from '../services/patients';
import { Patient, PatientInput, PatientsStackParamList, Sex } from '../types';
import { useBottomSpacing } from '../hooks/useBottomSpacing';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<PatientsStackParamList, 'PatientsList'>;

export const PatientsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newPatient, setNewPatient] = useState<PatientInput>({
    display_label: '',
    sex: 'unknown',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const bottomPadding = useBottomSpacing();

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return patients;
    }

    return patients.filter((patient) => {
      const label = patient.display_label?.toLowerCase() || '';
      const notes = patient.notes?.toLowerCase() || '';
      return label.includes(query) || notes.includes(query);
    });
  }, [patients, searchQuery]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
      setErrorMessage('Unable to load patients. Pull to refresh or tap retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatient.display_label.trim()) {
      Alert.alert('Error', 'Please enter a patient label');
      return;
    }

    try {
      const patient = await createPatient(newPatient);
      setPatients([patient, ...patients]);
      setModalVisible(false);
      setNewPatient({ display_label: '', sex: 'unknown' });
      navigation.navigate('PatientDetail', { patientId: patient.id });
    } catch (error) {
      console.error('Error creating patient:', error);
      Alert.alert('Error', 'Failed to create patient');
    }
  };

  const renderPatient = ({ item }: { item: Patient }) => (
    <PatientCard
      patient={item}
      onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
    />
  );

  if (loading) {
    return <LoadingState message="Loading patients..." />;
  }

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Add new patient"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search patients..."
          placeholderTextColor="#999"
          clearButtonMode="while-editing"
          accessibilityLabel="Search patients"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {errorMessage ? (
        <EmptyState
          icon="warning"
          title="Unable to load patients"
          message={errorMessage}
          actionLabel="Retry"
          onActionPress={loadPatients}
          iconColor={Colors.warning}
        />
      ) : patients.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No patients yet"
          message="Get started by adding your first patient"
          actionLabel="Add Patient"
          onActionPress={() => setModalVisible(true)}
          iconColor={Colors.primary}
        />
      ) : (
        <FlatList
          data={filteredPatients}
          renderItem={renderPatient}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadPatients}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={() => (
            <EmptyState
              icon="search"
              title="No matches found"
              message="Try a different search term or clear the search"
              iconColor={Colors.textTertiary}
            />
          )}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Patient</Text>

            <Text style={styles.label}>Patient Label *</Text>
            <TextInput
              style={styles.input}
              value={newPatient.display_label}
              onChangeText={(text) =>
                setNewPatient({ ...newPatient, display_label: text })
              }
              placeholder="e.g., Patient A, Case 001"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Year of Birth</Text>
            <TextInput
              style={styles.input}
              value={newPatient.year_of_birth?.toString() || ''}
              onChangeText={(text) =>
                setNewPatient({
                  ...newPatient,
                  year_of_birth: text ? parseInt(text) : undefined,
                })
              }
              placeholder="e.g., 1980"
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Sex</Text>
            <View style={styles.sexButtons}>
              {(['male', 'female', 'other', 'unknown'] as Sex[]).map((sex) => (
                <TouchableOpacity
                  key={sex}
                  style={[
                    styles.sexButton,
                    newPatient.sex === sex && styles.sexButtonActive,
                  ]}
                  onPress={() => setNewPatient({ ...newPatient, sex })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: newPatient.sex === sex }}
                  accessibilityLabel={`Sex ${sex}`}
                >
                  <Text
                    style={[
                      styles.sexButtonText,
                      newPatient.sex === sex && styles.sexButtonTextActive,
                    ]}
                  >
                    {sex.charAt(0).toUpperCase() + sex.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewPatient({ display_label: '', sex: 'unknown' });
                }}
                accessibilityRole="button"
                accessibilityLabel="Cancel new patient"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreatePatient}
                accessibilityRole="button"
                accessibilityLabel="Create patient"
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.small,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  list: {
    paddingVertical: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    ...Shadows.small,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    width: '90%',
    maxWidth: 400,
    ...Shadows.large,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xl,
    color: Colors.textPrimary,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    backgroundColor: Colors.background,
    color: Colors.textPrimary,
  },
  sexButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sexButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  sexButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sexButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  sexButtonTextActive: {
    color: Colors.textOnPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xxl,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  createButton: {
    backgroundColor: Colors.primary,
    ...Shadows.medium,
  },
  createButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnPrimary,
  },
});
