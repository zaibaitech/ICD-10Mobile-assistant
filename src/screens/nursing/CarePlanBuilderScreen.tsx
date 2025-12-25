import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CarePlanningSuggestion } from '../../types/nursing';
import type { Patient } from '../../types';
import { getCarePlanningSuggestionsForMultiple } from '../../services/icd10NandaBridge';
import { createCarePlan, generateCarePlanFromIcd10 } from '../../services/carePlan';
import { getPatientById } from '../../services/patients';
import { PatientSelector } from '../../components/nursing/PatientSelector';

interface Props {
  route?: {
    params?: {
      patientId?: string;
      encounterId?: string;
      icd10Codes?: string[]; // Pre-selected ICD-10 codes
    };
  };
}

export function CarePlanBuilderScreen({ route }: Props) {
  const { patientId: routePatientId, encounterId, icd10Codes = [] } = route?.params || {};
  const navigation = useNavigation();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientId, setPatientId] = useState<string | undefined>(routePatientId);
  const [selectedCodes, setSelectedCodes] = useState<string[]>(icd10Codes);
  const [codeInput, setCodeInput] = useState('');
  const [suggestions, setSuggestions] = useState<CarePlanningSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [carePlanName, setCarePlanName] = useState('');

  // Load patient data if patientId provided
  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  // Handle patient selection
  const handleSelectPatient = (selectedPatient: Patient) => {
    setPatient(selectedPatient);
    setPatientId(selectedPatient.id);
  };

  const loadPatientData = async () => {
    try {
      const data = await getPatientById(patientId!);
      setPatient(data);
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  };

  useEffect(() => {
    if (selectedCodes.length > 0) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [selectedCodes]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await getCarePlanningSuggestionsForMultiple(selectedCodes);
      setSuggestions(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load care plan suggestions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCode = () => {
    const code = codeInput.trim().toUpperCase();
    if (code && !selectedCodes.includes(code)) {
      setSelectedCodes([...selectedCodes, code]);
      setCodeInput('');
    }
  };

  const handleRemoveCode = (code: string) => {
    setSelectedCodes(selectedCodes.filter((c) => c !== code));
  };

  const handleGenerateCarePlan = async () => {
    if (selectedCodes.length === 0) {
      Alert.alert('No Codes', 'Please add at least one ICD-10 code');
      return;
    }

    if (!carePlanName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for the care plan');
      return;
    }

    if (!patientId) {
      Alert.alert('No Patient Selected', 'Please select a patient first');
      return;
    }

    Alert.alert(
      '🚀 Auto-Generate Care Plan',
      `This will create a complete care plan with NANDA diagnoses, NIC interventions, and NOC outcomes based on ${selectedCodes.length} ICD-10 code(s). Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          style: 'default',
          onPress: async () => {
            setGenerating(true);
            try {
              const carePlan = await generateCarePlanFromIcd10({
                patientId,
                encounterId,
                icd10Codes: selectedCodes,
                name: carePlanName.trim(),
              });

              Alert.alert(
                '✅ Success',
                `Care plan created with ${carePlan.items?.length || 0} items`,
                [
                  {
                    text: 'View List',
                    onPress: () => {
                      navigation.navigate('CarePlanList', {
                        patientId: route.params?.patientId,
                        encounterId: route.params?.encounterId,
                      });
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to generate care plan');
              console.error(error);
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏥 Care Plan Builder</Text>
        <Text style={styles.subtitle}>
          Auto-generate from medical diagnoses using ICD-10 → NANDA bridge
        </Text>
      </View>

      {/* Patient Selector */}
      <PatientSelector
        selectedPatient={patient}
        onSelectPatient={handleSelectPatient}
      />

      {/* Patient Warning */}
      {!patientId && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>No Patient Selected</Text>
            <Text style={styles.warningText}>
              To save a care plan:{'\n'}
              1. Go to the Patients tab{'\n'}
              2. Select or create a patient{'\n'}
              3. Tap "Create Care Plan" button{'\n\n'}
              You can still preview suggestions here.
            </Text>
          </View>
        </View>
      )}

      {/* Care Plan Name Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Care Plan Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Post-Op Care, CHF Management"
          value={carePlanName}
          onChangeText={setCarePlanName}
        />
      </View>

      {/* ICD-10 Code Input */}
      <View style={styles.section}>
        <Text style={styles.label}>ICD-10 Codes</Text>
        <View style={styles.codeInputRow}>
          <TextInput
            style={styles.codeInput}
            placeholder="Enter ICD-10 code (e.g., I50.9)"
            value={codeInput}
            onChangeText={setCodeInput}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddCode}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Codes */}
        {selectedCodes.length > 0 && (
          <View style={styles.selectedCodesContainer}>
            {selectedCodes.map((code) => (
              <View key={code} style={styles.codePill}>
                <Text style={styles.codePillText}>{code}</Text>
                <TouchableOpacity onPress={() => handleRemoveCode(code)}>
                  <Text style={styles.removePillText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Suggestions Preview */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Analyzing ICD-10 codes...</Text>
        </View>
      ) : suggestions && suggestions.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.suggestionHeader}>
            <Text style={styles.suggestionTitle}>
              ✨ {suggestions.length} Care Plan Suggestions
            </Text>
            <Text style={styles.suggestionSubtitle}>
              Evidence-based NANDA diagnoses with linked NIC/NOC
            </Text>
          </View>

          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionCard}>
              {/* ICD-10 → NANDA Bridge */}
              <View style={styles.bridgeFlow}>
                <View style={styles.icd10Box}>
                  <Text style={styles.icd10Code}>{suggestion.icd10.code}</Text>
                  <Text style={styles.icd10Description} numberOfLines={1}>
                    {suggestion.icd10.short_title}
                  </Text>
                </View>
                <Text style={styles.arrow}>↓</Text>
                <View style={styles.nandaBox}>
                  <Text style={styles.nandaCode}>{suggestion.nanda.code}</Text>
                  <Text style={styles.nandaLabel}>{suggestion.nanda.label}</Text>
                </View>
              </View>

              {/* NIC/NOC Counts */}
              <View style={styles.nnnCounts}>
                <View style={styles.countBadge}>
                  <Text style={styles.countIcon}>💊</Text>
                  <Text style={styles.countText}>
                    {(suggestion.suggestedNics || []).length} NIC Interventions
                  </Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countIcon}>🎯</Text>
                  <Text style={styles.countText}>
                    {(suggestion.suggestedNocs || []).length} NOC Outcomes
                  </Text>
                </View>
              </View>

              {/* Top Interventions Preview */}
              {(suggestion.suggestedNics || []).slice(0, 2).map((nic) => (
                <View key={nic.id} style={styles.nicPreview}>
                  <Text style={styles.nicLabel}>💊 {nic.label}</Text>
                </View>
              ))}

              {/* Top Outcomes Preview */}
              {(suggestion.suggestedNocs || []).slice(0, 2).map((noc) => (
                <View key={noc.id} style={styles.nocPreview}>
                  <Text style={styles.nocLabel}>🎯 {noc.label}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : selectedCodes.length > 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No NANDA mappings found</Text>
          <Text style={styles.emptySubtext}>
            These ICD-10 codes don't have automated care plan suggestions yet
          </Text>
        </View>
      ) : null}

      {/* Generate Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.generateButton,
            (selectedCodes.length === 0 || !carePlanName.trim() || generating) &&
              styles.generateButtonDisabled,
          ]}
          onPress={handleGenerateCarePlan}
          disabled={selectedCodes.length === 0 || !carePlanName.trim() || generating}
        >
          {generating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={styles.generateButtonIcon}>🚀</Text>
              <Text style={styles.generateButtonText}>Auto-Generate Care Plan</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          This will create a complete care plan with all NANDA, NIC, and NOC items
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#dbeafe',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 44,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  codeInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedCodesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
  },
  codePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
    marginRight: 8,
  },
  removePillText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
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
  suggestionHeader: {
    marginBottom: 16,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  suggestionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bridgeFlow: {
    marginBottom: 12,
  },
  icd10Box: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  icd10Code: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350f',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  icd10Description: {
    fontSize: 13,
    color: '#92400e',
  },
  arrow: {
    fontSize: 24,
    textAlign: 'center',
    color: '#3b82f6',
    marginVertical: 4,
  },
  nandaBox: {
    backgroundColor: '#ede9fe',
    padding: 12,
    borderRadius: 8,
  },
  nandaCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5b21b6',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  nandaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b21a8',
  },
  nnnCounts: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  countIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  countText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  nicPreview: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  nicLabel: {
    fontSize: 13,
    color: '#166534',
  },
  nocPreview: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  nocLabel: {
    fontSize: 13,
    color: '#78350f',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
  },
  generateButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    marginBottom: 12,
  },
  generateButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  generateButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
  },
  patientInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  patientInfoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  patientInfoContent: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  patientMeta: {
    fontSize: 13,
    color: '#15803d',
  },
  patientCheckmark: {
    fontSize: 24,
    color: '#22c55e',
  },
});
