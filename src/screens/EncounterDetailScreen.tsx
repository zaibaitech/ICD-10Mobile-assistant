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
import { useRoute, RouteProp } from '@react-navigation/native';
import { getEncounterById, updateEncounter, addCodeToEncounter, getEncounterCodes } from '../services/encounters';
import { getPatientById, calculateAge } from '../services/patients';
import { analyzeEncounter, logAnalysis } from '../services/clinicalReasoner';
import { useAuth } from '../context/AuthContext';
import { searchIcd10 } from '../services/icd10';
import {
  Encounter,
  Patient,
  PatientsStackParamList,
  ClinicalAnalysisResult,
  PossibleCondition,
} from '../types';
import { ResearchModeBanner } from '../components/ResearchModeBanner';
import { RiskBadge } from '../components/RiskBadge';
import { RedFlagAlert } from '../components/RedFlagAlert';
import { PossibleConditionCard } from '../components/PossibleConditionCard';

type RouteParams = RouteProp<PatientsStackParamList, 'EncounterDetail'>;

export const EncounterDetailScreen: React.FC = () => {
  const route = useRoute<RouteParams>();
  const { encounterId } = route.params;
  const { user } = useAuth();

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounterCodes, setEncounterCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<ClinicalAnalysisResult | null>(null);

  useEffect(() => {
    loadEncounterData();
  }, [encounterId]);

  const loadEncounterData = async () => {
    try {
      setLoading(true);
      const encounterData = await getEncounterById(encounterId);
      if (!encounterData) {
        Alert.alert('Error', 'Encounter not found');
        return;
      }

      const [patientData, codes] = await Promise.all([
        getPatientById(encounterData.patient_id),
        getEncounterCodes(encounterId),
      ]);
      
      setEncounter(encounterData);
      setPatient(patientData);
      setEncounterCodes(codes);

      if (encounterData.ai_result) {
        setAiResult(encounterData.ai_result as ClinicalAnalysisResult);
      }
    } catch (error) {
      console.error('Error loading encounter:', error);
      Alert.alert('Error', 'Failed to load encounter data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!encounter || !patient || !user) return;

    try {
      setAnalyzing(true);
      const age = calculateAge(patient.year_of_birth);

      const result = await analyzeEncounter({
        patient: {
          age,
          sex: patient.sex,
        },
        encounter: {
          chief_complaint: encounter.chief_complaint,
          structured_data: encounter.structured_data,
        },
      });

      setAiResult(result);

      // Update encounter with AI results
      await updateEncounter(encounterId, {
        ai_result: result as any,
        ai_summary: result.summary,
        ai_risk_level: result.risk_level,
      });

      // Log the analysis
      await logAnalysis(user.id, patient.id, encounterId, {
        patient: { age, sex: patient.sex },
        encounter: {
          chief_complaint: encounter.chief_complaint,
          structured_data: encounter.structured_data,
        },
      }, result);

      Alert.alert('Analysis Complete', 'AI analysis has been generated');
    } catch (error) {
      console.error('Error running analysis:', error);
      Alert.alert('Error', 'Failed to run AI analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddConditionCode = async (condition: PossibleCondition) => {
    if (!condition.icd10_code) return;

    try {
      // Find ICD-10 code in database
      const codes = await searchIcd10(condition.icd10_code);
      const matchingCode = codes.find((c) => c.code === condition.icd10_code);

      if (matchingCode) {
        await addCodeToEncounter(encounterId, matchingCode.id, 'ai_suggested');
        Alert.alert('Success', 'Code added to encounter');
        loadEncounterData();
      }
    } catch (error) {
      console.error('Error adding code:', error);
      Alert.alert('Error', 'Failed to add code');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!encounter || !patient) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Encounter not found</Text>
      </View>
    );
  }

  const age = calculateAge(patient.year_of_birth);

  return (
    <ScrollView style={styles.container}>
      <ResearchModeBanner />

      <View style={styles.patientInfo}>
        <Text style={styles.patientLabel}>Patient: {patient.display_label}</Text>
        {age && <Text style={styles.patientDetail}>{age} years, {patient.sex}</Text>}
        <Text style={styles.encounterDate}>
          {new Date(encounter.encounter_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chief Complaint</Text>
        <Text style={styles.chiefComplaint}>{encounter.chief_complaint}</Text>
      </View>

      {encounter.structured_data && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Data</Text>
          {encounter.structured_data.duration && (
            <Text style={styles.dataItem}>
              Duration: {encounter.structured_data.duration}
            </Text>
          )}
          {encounter.structured_data.fever && (
            <Text style={styles.dataItem}>• Fever present</Text>
          )}
          {encounter.structured_data.cough && (
            <Text style={styles.dataItem}>• Cough present</Text>
          )}
          {encounter.structured_data.shortness_of_breath && (
            <Text style={styles.dataItem}>• Shortness of breath</Text>
          )}
          {encounter.structured_data.pain?.present && (
            <Text style={styles.dataItem}>
              • Pain: {encounter.structured_data.pain.location || 'unspecified'} (
              {encounter.structured_data.pain.severity}/10)
            </Text>
          )}
          {encounter.structured_data.vitals && (
            <View style={styles.vitalsBox}>
              <Text style={styles.vitalsTitle}>Vitals:</Text>
              {encounter.structured_data.vitals.temperature && (
                <Text style={styles.vitalItem}>
                  Temp: {encounter.structured_data.vitals.temperature}°C
                </Text>
              )}
              {encounter.structured_data.vitals.heart_rate && (
                <Text style={styles.vitalItem}>
                  HR: {encounter.structured_data.vitals.heart_rate} bpm
                </Text>
              )}
              {encounter.structured_data.vitals.blood_pressure_systolic && (
                <Text style={styles.vitalItem}>
                  BP: {encounter.structured_data.vitals.blood_pressure_systolic}/
                  {encounter.structured_data.vitals.blood_pressure_diastolic || '?'}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.analysisHeader}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          <TouchableOpacity
            style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
            onPress={handleRunAnalysis}
            disabled={analyzing}
          >
            <Ionicons name="bulb" size={18} color="#FFFFFF" />
            <Text style={styles.analyzeButtonText}>
              {analyzing ? 'Analyzing...' : aiResult ? 'Re-analyze' : 'Run Analysis'}
            </Text>
          </TouchableOpacity>
        </View>

        {aiResult ? (
          <View style={styles.aiResults}>
            <View style={styles.riskRow}>
              <Text style={styles.riskLabel}>Risk Level:</Text>
              <RiskBadge riskLevel={aiResult.risk_level} />
            </View>

            <Text style={styles.aiSummary}>{aiResult.summary}</Text>

            {aiResult.red_flags.length > 0 && (
              <RedFlagAlert redFlags={aiResult.red_flags} />
            )}

            {aiResult.possible_conditions.length > 0 && (
              <View style={styles.conditionsSection}>
                <Text style={styles.conditionsTitle}>Possible Conditions:</Text>
                {aiResult.possible_conditions.map((condition, index) => (
                  <PossibleConditionCard
                    key={index}
                    condition={condition}
                    onAddCode={() => handleAddConditionCode(condition)}
                  />
                ))}
              </View>
            )}

            {aiResult.recommended_questions.length > 0 && (
              <View style={styles.questionsBox}>
                <Text style={styles.questionsTitle}>Recommended Questions:</Text>
                {aiResult.recommended_questions.map((question, index) => (
                  <Text key={index} style={styles.questionItem}>
                    • {question}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.disclaimerBox}>
              <Ionicons name="information-circle" size={20} color="#FF9800" />
              <Text style={styles.disclaimerText}>{aiResult.caution_text}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noAnalysis}>
            <Ionicons name="bulb-outline" size={48} color="#CCC" />
            <Text style={styles.noAnalysisText}>No AI analysis yet</Text>
            <Text style={styles.noAnalysisSubtext}>
              Tap "Run Analysis" to generate AI-powered clinical suggestions
            </Text>
          </View>
        )}
      </View>

      {encounterCodes && encounterCodes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked ICD-10 Codes</Text>
          {encounterCodes.map((item) => (
            <View key={item.id} style={styles.codeItem}>
              <View style={styles.codeInfo}>
                <Text style={styles.codeCode}>{item.icd10_codes?.code}</Text>
                <Text style={styles.codeTitle}>{item.icd10_codes?.short_title}</Text>
              </View>
              <View
                style={[
                  styles.sourceBadge,
                  {
                    backgroundColor:
                      item.source === 'ai_suggested' ? '#FF9800' : '#4CAF50',
                  },
                ]}
              >
                <Text style={styles.sourceBadgeText}>
                  {item.source === 'ai_suggested' ? 'AI' : 'User'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
  patientInfo: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    marginBottom: 8,
  },
  patientLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  patientDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  encounterDate: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  chiefComplaint: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  dataItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  vitalsBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  vitalsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  vitalItem: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiResults: {
    gap: 12,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  riskLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  aiSummary: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  conditionsSection: {
    marginTop: 8,
  },
  conditionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  questionsBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
  },
  questionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  questionItem: {
    fontSize: 13,
    color: '#666',
    marginVertical: 3,
  },
  disclaimerBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  noAnalysis: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noAnalysisText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  noAnalysisSubtext: {
    fontSize: 13,
    color: '#BBB',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  codeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  codeInfo: {
    flex: 1,
  },
  codeCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007AFF',
  },
  codeTitle: {
    fontSize: 13,
    color: '#666',
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
