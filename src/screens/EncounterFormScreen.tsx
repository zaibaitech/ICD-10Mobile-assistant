import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createEncounter } from '../services/encounters';
import {
  PatientsStackParamList,
  StructuredEncounterData,
  DurationValue,
  RedFlagType,
} from '../types';

type NavigationProp = NativeStackNavigationProp<PatientsStackParamList, 'EncounterForm'>;
type RouteParams = RouteProp<PatientsStackParamList, 'EncounterForm'>;

const DURATION_OPTIONS: { value: DurationValue; label: string }[] = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
];

const RED_FLAG_OPTIONS: { value: RedFlagType; label: string }[] = [
  { value: 'chest_pain', label: 'Chest pain' },
  { value: 'sudden_weakness', label: 'Sudden weakness/paralysis' },
  { value: 'severe_abdominal_pain', label: 'Severe abdominal pain' },
  { value: 'altered_mental_status', label: 'Confusion/altered mental status' },
  { value: 'difficulty_breathing', label: 'Difficulty breathing' },
  { value: 'severe_headache', label: 'Severe/worst headache of life' },
  { value: 'signs_of_stroke', label: 'Signs of stroke (FAST)' },
];

export const EncounterFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { patientId } = route.params;

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [duration, setDuration] = useState<DurationValue>('days');
  const [fever, setFever] = useState(false);
  const [cough, setCough] = useState(false);
  const [shortnessOfBreath, setShortnessOfBreath] = useState(false);
  const [painPresent, setPainPresent] = useState(false);
  const [painLocation, setPainLocation] = useState('');
  const [painSeverity, setPainSeverity] = useState('5');
  const [redFlags, setRedFlags] = useState<RedFlagType[]>([]);
  const [notes, setNotes] = useState('');
  const [temperature, setTemperature] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleRedFlag = (flag: RedFlagType) => {
    if (redFlags.includes(flag)) {
      setRedFlags(redFlags.filter((f) => f !== flag));
    } else {
      setRedFlags([...redFlags, flag]);
    }
  };

  const handleSave = async () => {
    if (!chiefComplaint.trim()) {
      Alert.alert('Error', 'Please enter a chief complaint');
      return;
    }

    const structuredData: StructuredEncounterData = {
      duration,
      fever,
      cough,
      shortness_of_breath: shortnessOfBreath,
      pain: painPresent
        ? {
            present: true,
            location: painLocation,
            severity: parseInt(painSeverity) || 5,
          }
        : { present: false },
      red_flags: redFlags.length > 0 ? redFlags : undefined,
      vitals: {
        temperature: temperature ? parseFloat(temperature) : undefined,
        heart_rate: heartRate ? parseInt(heartRate) : undefined,
        blood_pressure_systolic: bpSystolic ? parseInt(bpSystolic) : undefined,
        blood_pressure_diastolic: bpDiastolic ? parseInt(bpDiastolic) : undefined,
      },
      notes: notes || undefined,
    };

    try {
      setSaving(true);
      const encounter = await createEncounter({
        patient_id: patientId,
        chief_complaint: chiefComplaint,
        structured_data: structuredData,
      });
      
      navigation.replace('EncounterDetail', { encounterId: encounter.id });
    } catch (error) {
      console.error('Error creating encounter:', error);
      Alert.alert('Error', 'Failed to create encounter');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chief Complaint *</Text>
        <TextInput
          style={styles.input}
          value={chiefComplaint}
          onChangeText={setChiefComplaint}
          placeholder="e.g., Chest pain, Headache, Fever"
          placeholderTextColor="#999"
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Duration</Text>
        <View style={styles.optionsRow}>
          {DURATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                duration === option.value && styles.optionButtonActive,
              ]}
              onPress={() => setDuration(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  duration === option.value && styles.optionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Symptoms</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Fever</Text>
          <Switch value={fever} onValueChange={setFever} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Cough</Text>
          <Switch value={cough} onValueChange={setCough} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Shortness of Breath</Text>
          <Switch value={shortnessOfBreath} onValueChange={setShortnessOfBreath} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Pain</Text>
          <Switch value={painPresent} onValueChange={setPainPresent} />
        </View>
        {painPresent && (
          <View style={styles.painDetails}>
            <TextInput
              style={styles.input}
              value={painLocation}
              onChangeText={setPainLocation}
              placeholder="Pain location"
              placeholderTextColor="#999"
            />
            <Text style={styles.label}>Severity: {painSeverity}/10</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Red Flags</Text>
        {RED_FLAG_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.checkboxRow}
            onPress={() => toggleRedFlag(option.value)}
          >
            <Ionicons
              name={redFlags.includes(option.value) ? 'checkbox' : 'square-outline'}
              size={24}
              color={redFlags.includes(option.value) ? '#F44336' : '#999'}
            />
            <Text style={styles.checkboxLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vitals (Optional)</Text>
        <View style={styles.vitalsGrid}>
          <View style={styles.vitalInput}>
            <Text style={styles.label}>Temperature (°C)</Text>
            <TextInput
              style={styles.input}
              value={temperature}
              onChangeText={setTemperature}
              placeholder="37.0"
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.vitalInput}>
            <Text style={styles.label}>Heart Rate (bpm)</Text>
            <TextInput
              style={styles.input}
              value={heartRate}
              onChangeText={setHeartRate}
              placeholder="80"
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.vitalInput}>
            <Text style={styles.label}>BP Systolic</Text>
            <TextInput
              style={styles.input}
              value={bpSystolic}
              onChangeText={setBpSystolic}
              placeholder="120"
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.vitalInput}>
            <Text style={styles.label}>BP Diastolic</Text>
            <TextInput
              style={styles.input}
              value={bpDiastolic}
              onChangeText={setBpDiastolic}
              placeholder="80"
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional clinical notes..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Creating...' : 'Create Encounter'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleLabel: {
    fontSize: 15,
    color: '#333',
  },
  painDetails: {
    marginTop: 12,
    gap: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalInput: {
    width: '48%',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
