import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PatientCard } from '../components/PatientCard';
import { getPatients, createPatient } from '../services/patients';
import { Patient, PatientInput, PatientsStackParamList, Sex } from '../types';

type NavigationProp = NativeStackNavigationProp<PatientsStackParamList, 'PatientsList'>;

export const PatientsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPatient, setNewPatient] = useState<PatientInput>({
    display_label: '',
    sex: 'unknown',
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
      Alert.alert('Error', 'Failed to load patients');
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
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {patients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No patients yet</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first patient</Text>
        </View>
      ) : (
        <FlatList
          data={patients}
          renderItem={renderPatient}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadPatients}
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
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreatePatient}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  sexButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  sexButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
  },
  sexButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sexButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  sexButtonTextActive: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
