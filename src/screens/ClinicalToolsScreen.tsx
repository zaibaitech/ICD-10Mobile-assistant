/**
 * Clinical Tools Screen
 * Access drug interactions checker and lab results interpreter
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { SurfaceCard } from '../components/SurfaceCard';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { useBottomSpacing } from '../hooks/useBottomSpacing';
import {
  checkDrugInteractions,
  checkContraindications,
  getDrugSafetySummary,
  Drug,
  DrugInteraction,
  DrugContraindication,
} from '../services/drugInteractions';
import {
  interpretLabResult,
  interpretLabPanel,
  LabResult,
  LabInterpretation,
} from '../services/labResults';

type ToolMode = 'drug' | 'lab';

export function ClinicalToolsScreen() {
  const bottomPadding = useBottomSpacing();
  const [mode, setMode] = useState<ToolMode>('drug');
  
  // Drug checker state
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [newDrug, setNewDrug] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [drugResults, setDrugResults] = useState<ReturnType<typeof getDrugSafetySummary> | null>(null);
  
  // Lab interpreter state
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [newLabTest, setNewLabTest] = useState('');
  const [newLabValue, setNewLabValue] = useState('');
  const [newLabUnit, setNewLabUnit] = useState('');
  const [labInterpretations, setLabInterpretations] = useState<ReturnType<typeof interpretLabPanel> | null>(null);

  // Drug checker functions
  const addDrug = () => {
    if (!newDrug.trim()) return;
    setDrugs([...drugs, { name: newDrug.trim() }]);
    setNewDrug('');
  };

  const removeDrug = (index: number) => {
    setDrugs(drugs.filter((_, i) => i !== index));
  };

  const addCondition = () => {
    if (!newCondition.trim()) return;
    setConditions([...conditions, newCondition.trim()]);
    setNewCondition('');
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const checkInteractions = () => {
    if (drugs.length < 2) {
      Alert.alert('Info', 'Add at least 2 medications to check for interactions');
      return;
    }
    const results = getDrugSafetySummary(drugs, conditions);
    setDrugResults(results);
  };

  // Lab interpreter functions
  const addLabResult = () => {
    if (!newLabTest.trim() || !newLabValue.trim()) {
      Alert.alert('Error', 'Please enter test name and value');
      return;
    }
    
    const value = parseFloat(newLabValue);
    if (isNaN(value)) {
      Alert.alert('Error', 'Invalid numeric value');
      return;
    }

    setLabResults([
      ...labResults,
      {
        test: newLabTest.trim(),
        value,
        unit: newLabUnit.trim() || '',
      },
    ]);
    setNewLabTest('');
    setNewLabValue('');
    setNewLabUnit('');
  };

  const removeLabResult = (index: number) => {
    setLabResults(labResults.filter((_, i) => i !== index));
  };

  const interpretLabs = () => {
    if (labResults.length === 0) {
      Alert.alert('Info', 'Add at least one lab result to interpret');
      return;
    }
    const results = interpretLabPanel(labResults);
    setLabInterpretations(results);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'major':
      case 'absolute':
      case 'critical-high':
      case 'critical-low':
        return Colors.danger;
      case 'moderate':
      case 'relative':
      case 'high':
      case 'low':
        return Colors.warning;
      default:
        return Colors.success;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical-high':
      case 'critical-low':
        return 'alert-circle';
      case 'high':
      case 'low':
        return 'warning';
      default:
        return 'checkmark-circle';
    }
  };

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Clinical Tools</Text>
        <Text style={styles.subtitle}>
          Drug interactions checker and lab results interpreter
        </Text>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'drug' && styles.modeButtonActive]}
          onPress={() => setMode('drug')}
        >
          <Ionicons
            name="medkit"
            size={20}
            color={mode === 'drug' ? '#fff' : Colors.primary}
          />
          <Text style={[styles.modeButtonText, mode === 'drug' && styles.modeButtonTextActive]}>
            Drug Checker
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, mode === 'lab' && styles.modeButtonActive]}
          onPress={() => setMode('lab')}
        >
          <Ionicons
            name="flask"
            size={20}
            color={mode === 'lab' ? '#fff' : Colors.primary}
          />
          <Text style={[styles.modeButtonText, mode === 'lab' && styles.modeButtonTextActive]}>
            Lab Interpreter
          </Text>
        </TouchableOpacity>
      </View>

      {/* Drug Interaction Checker */}
      {mode === 'drug' && (
        <View style={styles.toolContainer}>
          {/* Add Medications */}
          <SurfaceCard style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Medications</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Enter medication name"
                value={newDrug}
                onChangeText={setNewDrug}
                onSubmitEditing={addDrug}
              />
              <TouchableOpacity style={styles.addButton} onPress={addDrug}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Medications List */}
            {drugs.map((drug, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{drug.name}</Text>
                <TouchableOpacity onPress={() => removeDrug(index)}>
                  <Ionicons name="close-circle" size={20} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </SurfaceCard>

          {/* Add Conditions */}
          <SurfaceCard style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Patient Conditions (Optional)</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Enter condition (e.g., pregnancy, renal failure)"
                value={newCondition}
                onChangeText={setNewCondition}
                onSubmitEditing={addCondition}
              />
              <TouchableOpacity style={styles.addButton} onPress={addCondition}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Conditions List */}
            {conditions.map((condition, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{condition}</Text>
                <TouchableOpacity onPress={() => removeCondition(index)}>
                  <Ionicons name="close-circle" size={20} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </SurfaceCard>

          {/* Check Button */}
          <TouchableOpacity style={styles.checkButton} onPress={checkInteractions}>
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.checkButtonText}>Check Interactions</Text>
          </TouchableOpacity>

          {/* Results */}
          {drugResults && (
            <View style={styles.results}>
              {/* Safety Score */}
              <SurfaceCard style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                  <Ionicons
                    name={drugResults.status === 'safe' ? 'shield-checkmark' : drugResults.status === 'caution' ? 'warning' : 'alert-circle'}
                    size={32}
                    color={drugResults.status === 'safe' ? Colors.success : drugResults.status === 'caution' ? Colors.warning : Colors.danger}
                  />
                  <View style={styles.scoreInfo}>
                    <Text style={styles.scoreValue}>{drugResults.safetyScore}/100</Text>
                    <Text style={styles.scoreLabel}>Safety Score</Text>
                  </View>
                </View>
                <Text style={styles.scoreSummary}>
                  {drugResults.totalInteractions} interactions, {drugResults.totalContraindications} contraindications
                </Text>
              </SurfaceCard>

              {/* Interactions */}
              {drugResults.interactions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Drug Interactions ({drugResults.interactions.length})</Text>
                  {drugResults.interactions.map((interaction, index) => (
                    <SurfaceCard key={index} style={styles.resultCard}>
                      <View style={styles.resultHeader}>
                        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(interaction.severity) }]}>
                          <Text style={styles.severityText}>{interaction.severity.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={styles.resultTitle}>
                        {interaction.drug1} + {interaction.drug2}
                      </Text>
                      <Text style={styles.resultDescription}>{interaction.description}</Text>
                      <View style={styles.recommendationBox}>
                        <Ionicons name="information-circle" size={16} color={Colors.primary} />
                        <Text style={styles.recommendationText}>{interaction.recommendation}</Text>
                      </View>
                    </SurfaceCard>
                  ))}
                </View>
              )}

              {/* Contraindications */}
              {drugResults.contraindications.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Contraindications ({drugResults.contraindications.length})</Text>
                  {drugResults.contraindications.map((contraindication, index) => (
                    <SurfaceCard key={index} style={styles.resultCard}>
                      <View style={styles.resultHeader}>
                        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(contraindication.severity) }]}>
                          <Text style={styles.severityText}>{contraindication.severity.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={styles.resultTitle}>
                        {contraindication.drug} + {contraindication.condition}
                      </Text>
                      <Text style={styles.resultDescription}>{contraindication.description}</Text>
                    </SurfaceCard>
                  ))}
                </View>
              )}

              {/* No Issues Found */}
              {drugResults.interactions.length === 0 && drugResults.contraindications.length === 0 && (
                <SurfaceCard style={styles.noIssuesCard}>
                  <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
                  <Text style={styles.noIssuesText}>No known interactions or contraindications found</Text>
                  <Text style={styles.noIssuesSubtext}>
                    Always consult current drug references and consider individual patient factors
                  </Text>
                </SurfaceCard>
              )}
            </View>
          )}
        </View>
      )}

      {/* Lab Results Interpreter */}
      {mode === 'lab' && (
        <View style={styles.toolContainer}>
          {/* Add Lab Results */}
          <SurfaceCard style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Lab Results</Text>
            <TextInput
              style={styles.input}
              placeholder="Test name (e.g., Hemoglobin, Glucose)"
              value={newLabTest}
              onChangeText={setNewLabTest}
            />
            <View style={styles.labInputRow}>
              <TextInput
                style={[styles.input, styles.labValueInput]}
                placeholder="Value"
                value={newLabValue}
                onChangeText={setNewLabValue}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.labUnitInput]}
                placeholder="Unit"
                value={newLabUnit}
                onChangeText={setNewLabUnit}
              />
              <TouchableOpacity style={styles.addButton} onPress={addLabResult}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Lab Results List */}
            {labResults.map((result, index) => (
              <View key={index} style={styles.labChip}>
                <View>
                  <Text style={styles.chipText}>{result.test}</Text>
                  <Text style={styles.labChipValue}>
                    {result.value} {result.unit}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeLabResult(index)}>
                  <Ionicons name="close-circle" size={20} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </SurfaceCard>

          {/* Interpret Button */}
          <TouchableOpacity style={styles.checkButton} onPress={interpretLabs}>
            <Ionicons name="analytics" size={20} color="#fff" />
            <Text style={styles.checkButtonText}>Interpret Results</Text>
          </TouchableOpacity>

          {/* Lab Interpretations */}
          {labInterpretations && (
            <View style={styles.results}>
              {/* Summary */}
              <SurfaceCard style={styles.labSummaryCard}>
                <Text style={styles.labSummaryTitle}>Results Summary</Text>
                <View style={styles.labSummaryRow}>
                  <View style={styles.labSummaryItem}>
                    <Text style={styles.labSummaryValue}>{labInterpretations.summary.critical}</Text>
                    <Text style={styles.labSummaryLabel}>Critical</Text>
                  </View>
                  <View style={styles.labSummaryItem}>
                    <Text style={styles.labSummaryValue}>{labInterpretations.summary.abnormal}</Text>
                    <Text style={styles.labSummaryLabel}>Abnormal</Text>
                  </View>
                  <View style={styles.labSummaryItem}>
                    <Text style={styles.labSummaryValue}>{labInterpretations.summary.normal}</Text>
                    <Text style={styles.labSummaryLabel}>Normal</Text>
                  </View>
                </View>
              </SurfaceCard>

              {/* Individual Interpretations */}
              {labInterpretations.interpretations.map((interp, index) => (
                <SurfaceCard key={index} style={styles.labResultCard}>
                  <View style={styles.labResultHeader}>
                    <Ionicons
                      name={getStatusIcon(interp.status)}
                      size={24}
                      color={getSeverityColor(interp.status)}
                    />
                    <Text style={styles.labResultTitle}>{interp.test}</Text>
                  </View>
                  <View style={styles.labResultValue}>
                    <Text style={[styles.labValue, { color: getSeverityColor(interp.status) }]}>
                      {interp.value} {interp.unit}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getSeverityColor(interp.status) }]}>
                      <Text style={styles.statusText}>{interp.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.labInterpretation}>{interp.interpretation}</Text>
                  <Text style={styles.labSignificance}>{interp.clinicalSignificance}</Text>
                  {interp.recommendations.length > 0 && (
                    <View style={styles.recommendationsBox}>
                      <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                      {interp.recommendations.map((rec, i) => (
                        <Text key={i} style={styles.recommendationItem}>• {rec}</Text>
                      ))}
                    </View>
                  )}
                </SurfaceCard>
              ))}
            </View>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  toolContainer: {
    gap: Spacing.lg,
  },
  inputCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.fontSize.md,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  labInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  labValueInput: {
    flex: 2,
  },
  labUnitInput: {
    flex: 1,
  },
  labChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  labChipValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  checkButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: '#fff',
  },
  results: {
    gap: Spacing.lg,
  },
  scoreCard: {
    padding: Spacing.lg,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreValue: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scoreLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  scoreSummary: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  section: {
    gap: Spacing.md,
  },
  resultCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  severityBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  severityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: '#fff',
  },
  resultTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  resultDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  recommendationBox: {
    flexDirection: 'row',
    gap: Spacing.xs,
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  recommendationText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  noIssuesCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  noIssuesText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  noIssuesSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  labSummaryCard: {
    padding: Spacing.lg,
  },
  labSummaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  labSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  labSummaryItem: {
    alignItems: 'center',
  },
  labSummaryValue: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  labSummaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  labResultCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  labResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  labResultTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  labResultValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: '#fff',
  },
  labInterpretation: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  labSignificance: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  recommendationsBox: {
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  recommendationsTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  recommendationItem: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
});
