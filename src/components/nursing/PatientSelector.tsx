import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import type { Patient } from '../../types';
import { getPatients } from '../../services/patients';

interface Props {
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
}

export function PatientSelector({ selectedPatient, onSelectPatient }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error('Failed to load patients:', error);
      if (Platform.OS === 'web') {
        alert('Failed to load patients');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalVisible) {
      loadPatients();
    }
  }, [modalVisible]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = patients.filter(
        (p) => p.display_label.toLowerCase().includes(query)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View>
      {/* Selected Patient Display */}
      {selectedPatient ? (
        <View style={styles.selectedContainer}>
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedLabel}>Selected Patient</Text>
            <Text style={styles.selectedName}>{selectedPatient.display_label}</Text>
            {selectedPatient.year_of_birth && (
              <Text style={styles.selectedMRN}>
                Born: {selectedPatient.year_of_birth}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.selectIcon}>👤</Text>
          <Text style={styles.selectButtonText}>Select Patient</Text>
        </TouchableOpacity>
      )}

      {/* Patient Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Patient</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search by patient name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={Platform.OS !== 'web'}
            />

            {/* Patient List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading patients...</Text>
              </View>
            ) : filteredPatients.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No patients found' : 'No patients available'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create patients in the Patients tab'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredPatients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.patientItem,
                      selectedPatient?.id === item.id && styles.patientItemSelected,
                    ]}
                    onPress={() => handleSelectPatient(item)}
                  >
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{item.display_label}</Text>
                      {item.year_of_birth && (
                        <Text style={styles.patientAge}>
                          Born: {item.year_of_birth}
                        </Text>
                      )}
                    </View>
                    {selectedPatient?.id === item.id && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 4,
  },
  selectedName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  selectedMRN: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.9,
  },
  changeButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  selectIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    fontSize: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patientItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  patientMRN: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  patientAge: {
    fontSize: 12,
    color: '#9ca3af',
  },
  checkIcon: {
    fontSize: 24,
    color: '#3b82f6',
    marginLeft: 12,
  },
});
