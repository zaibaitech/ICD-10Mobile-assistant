import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { VitalSigns, SbarReport } from '../../types/nursing';
import type { Patient } from '../../types';
import { generateSbarTemplate, createSbarReport, formatSbarForSharing } from '../../services/sbar';
import { getPatientById } from '../../services/patients';
import { PatientSelector } from '../../components/nursing/PatientSelector';

interface Props {
  route?: {
    params?: {
      patientId?: string;
      encounterId?: string;
      reportType?: 'shift_handoff' | 'urgent_situation' | 'transfer' | 'discharge';
    };
  };
}

export function SbarGeneratorScreen({ route }: Props) {
  const { patientId: routePatientId, encounterId, reportType = 'shift_handoff' } = route?.params || {};

  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientId, setPatientId] = useState<string | undefined>(routePatientId);
  const [situation, setSituation] = useState('');
  const [background, setBackground] = useState('');
  const [assessment, setAssessment] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [recipientRole, setRecipientRole] = useState('');
  const [urgency, setUrgency] = useState<'routine' | 'urgent' | 'emergent'>('routine');
  const [vitalSigns, setVitalSigns] = useState<Partial<VitalSigns>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [patientId]);

  // Handle patient selection
  const handleSelectPatient = (selectedPatient: Patient) => {
    setPatient(selectedPatient);
    setPatientId(selectedPatient.id);
  };

  // Load patient data
  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      const data = await getPatientById(patientId!);
      setPatient(data);
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  };

  const loadTemplate = async () => {
    setLoading(true);
    try {
      if (!patientId) {
        // For demo mode without patient, provide empty template
        setLoading(false);
        return;
      }

      console.log('Loading SBAR template for patientId:', patientId, 'type:', typeof patientId);
      
      const template = await generateSbarTemplate(patientId, reportType);

      setSituation(template.situation);
      setBackground(template.background);
      setAssessment(template.assessment);
      setRecommendation(template.recommendation);
      setRecipientRole(template.recipient_role || '');
      setUrgency(template.urgency);
      if (template.vital_signs) {
        setVitalSigns(template.vital_signs);
      }
    } catch (error) {
      console.error('generateSbarTemplate error:', error);
      Alert.alert('Error', 'Failed to load SBAR template. You can still create a report manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!situation.trim() || !assessment.trim() || !recommendation.trim()) {
      Alert.alert('Missing Fields', 'Please fill in Situation, Assessment, and Recommendation');
      return;
    }

    if (!patientId) {
      Alert.alert(
        'No Patient Selected',
        'Please select a patient from the Patients tab to save SBAR reports.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSaving(true);
    try {
      const report = await createSbarReport({
        patient_id: patientId,
        encounter_id: encounterId,
        report_type: reportType,
        situation: situation.trim(),
        background: background.trim(),
        assessment: assessment.trim(),
        recommendation: recommendation.trim(),
        recipient_role: recipientRole.trim() || undefined,
        urgency,
        vital_signs: Object.keys(vitalSigns).length > 0 ? vitalSigns as VitalSigns : undefined,
      });

      Alert.alert(
        '✅ SBAR Report Saved',
        'Your report has been saved successfully',
        [
          {
            text: 'Share',
            onPress: () => handleShare(report),
          },
          { text: 'Done', style: 'cancel' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save SBAR report');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async (report: SbarReport) => {
    const formatted = formatSbarForSharing(report);
    // TODO: Implement sharing using React Native Share API
    console.log('Share SBAR:', formatted);
    Alert.alert('Share', formatted);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Generating SBAR template...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📋 SBAR Report</Text>
        <Text style={styles.subtitle}>
          {reportType.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      {/* Patient Selector */}
      <PatientSelector
        selectedPatient={patient}
        onSelectPatient={handleSelectPatient}
      />

      {/* Urgency Selector */}
      <View style={styles.section}>
        <Text style={styles.label}>Urgency Level</Text>
        <View style={styles.urgencyRow}>
          {(['routine', 'urgent', 'emergent'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.urgencyButton,
                urgency === level && styles.urgencyButtonActive,
                level === 'routine' && urgency === level && styles.urgencyRoutine,
                level === 'urgent' && urgency === level && styles.urgencyUrgent,
                level === 'emergent' && urgency === level && styles.urgencyEmergent,
              ]}
              onPress={() => setUrgency(level)}
            >
              <Text
                style={[
                  styles.urgencyText,
                  urgency === level && styles.urgencyTextActive,
                ]}
              >
                {level.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recipient */}
      <View style={styles.section}>
        <Text style={styles.label}>To (Recipient Role)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Attending Physician, Night Shift RN"
          value={recipientRole}
          onChangeText={setRecipientRole}
        />
      </View>

      {/* SITUATION */}
      <View style={styles.section}>
        <View style={styles.sbarHeader}>
          <Text style={styles.sbarIcon}>📋</Text>
          <Text style={styles.sbarTitle}>SITUATION</Text>
        </View>
        <Text style={styles.helperText}>What is happening right now?</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Current patient situation..."
          value={situation}
          onChangeText={setSituation}
        />
      </View>

      {/* BACKGROUND */}
      <View style={styles.section}>
        <View style={styles.sbarHeader}>
          <Text style={styles.sbarIcon}>📚</Text>
          <Text style={styles.sbarTitle}>BACKGROUND</Text>
        </View>
        <Text style={styles.helperText}>What is the clinical context?</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Medical history, diagnoses, treatments..."
          value={background}
          onChangeText={setBackground}
        />
      </View>

      {/* Vital Signs */}
      <View style={styles.section}>
        <Text style={styles.label}>📊 Vital Signs (Optional)</Text>
        <View style={styles.vitalsGrid}>
          <View style={styles.vitalInput}>
            <Text style={styles.vitalLabel}>Temp (°F)</Text>
            <TextInput
              style={styles.vitalField}
              placeholder="98.6"
              keyboardType="decimal-pad"
              value={vitalSigns.temperature_f?.toString() || ''}
              onChangeText={(v) =>
                setVitalSigns({ ...vitalSigns, temperature_f: parseFloat(v) || undefined })
              }
            />
          </View>
          <View style={styles.vitalInput}>
            <Text style={styles.vitalLabel}>HR (bpm)</Text>
            <TextInput
              style={styles.vitalField}
              placeholder="72"
              keyboardType="number-pad"
              value={vitalSigns.heart_rate?.toString() || ''}
              onChangeText={(v) =>
                setVitalSigns({ ...vitalSigns, heart_rate: parseInt(v) || undefined })
              }
            />
          </View>
          <View style={styles.vitalInput}>
            <Text style={styles.vitalLabel}>BP (mmHg)</Text>
            <TextInput
              style={styles.vitalField}
              placeholder="120/80"
              value={vitalSigns.blood_pressure || ''}
              onChangeText={(v) => setVitalSigns({ ...vitalSigns, blood_pressure: v })}
            />
          </View>
          <View style={styles.vitalInput}>
            <Text style={styles.vitalLabel}>RR (bpm)</Text>
            <TextInput
              style={styles.vitalField}
              placeholder="16"
              keyboardType="number-pad"
              value={vitalSigns.respiratory_rate?.toString() || ''}
              onChangeText={(v) =>
                setVitalSigns({ ...vitalSigns, respiratory_rate: parseInt(v) || undefined })
              }
            />
          </View>
          <View style={styles.vitalInput}>
            <Text style={styles.vitalLabel}>SpO2 (%)</Text>
            <TextInput
              style={styles.vitalField}
              placeholder="98"
              keyboardType="number-pad"
              value={vitalSigns.oxygen_saturation?.toString() || ''}
              onChangeText={(v) =>
                setVitalSigns({ ...vitalSigns, oxygen_saturation: parseInt(v) || undefined })
              }
            />
          </View>
        </View>
      </View>

      {/* ASSESSMENT */}
      <View style={styles.section}>
        <View style={styles.sbarHeader}>
          <Text style={styles.sbarIcon}>🔍</Text>
          <Text style={styles.sbarTitle}>ASSESSMENT</Text>
        </View>
        <Text style={styles.helperText}>What do you think the problem is?</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Your professional assessment..."
          value={assessment}
          onChangeText={setAssessment}
        />
      </View>

      {/* RECOMMENDATION */}
      <View style={styles.section}>
        <View style={styles.sbarHeader}>
          <Text style={styles.sbarIcon}>💡</Text>
          <Text style={styles.sbarTitle}>RECOMMENDATION</Text>
        </View>
        <Text style={styles.helperText}>What actions do you recommend?</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Suggested interventions or next steps..."
          value={recommendation}
          onChangeText={setRecommendation}
        />
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>💾 Save SBAR Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
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
  urgencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  urgencyButtonActive: {
    borderWidth: 2,
  },
  urgencyRoutine: {
    backgroundColor: '#dcfce7',
    borderColor: '#10b981',
  },
  urgencyUrgent: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  urgencyEmergent: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  urgencyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  urgencyTextActive: {
    fontWeight: '700',
  },
  sbarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sbarIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sbarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.5,
  },
  helperText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalInput: {
    width: '30%',
  },
  vitalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  vitalField: {
    height: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  footer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#10b981',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
});
