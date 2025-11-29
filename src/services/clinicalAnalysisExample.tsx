// ============================================
// CLINICAL ANALYSIS USAGE EXAMPLE
// ============================================
// Example of how to use the clinical reasoner and logging services
// in your encounter screens

import { useState } from 'react';
import { analyzeEncounter } from '../services/clinicalReasoner';
import {
  logClinicalAnalysis,
  saveAiResult,
  updateEncounterWithAi,
} from '../services/logging';
import type { ClinicalAnalysisResult, Encounter, Patient } from '../types';

/**
 * Example: Analyze an encounter
 * 
 * This function should be called from your EncounterDetailScreen
 * when the user clicks "Run AI Analysis" button
 */
export async function runClinicalAnalysis(
  encounter: Encounter,
  patient: Patient,
  userId: string
): Promise<ClinicalAnalysisResult> {
  try {
    // 1. Run the analysis
    const result = await analyzeEncounter(encounter, patient);

    // 2. Log for audit trail
    await logClinicalAnalysis({
      userId,
      patient,
      encounter,
      result,
    });

    // 3. Save detailed result
    await saveAiResult({
      userId,
      encounterId: encounter.id,
      analysis: result,
    });

    // 4. Update encounter with summary
    await updateEncounterWithAi(encounter.id, result);

    return result;
  } catch (error) {
    console.error('Clinical analysis failed:', error);
    throw error;
  }
}

/**
 * Example React Component Integration
 */
export function EncounterAnalysisButton({
  encounter,
  patient,
  userId,
  onAnalysisComplete,
}: {
  encounter: Encounter;
  patient: Patient;
  userId: string;
  onAnalysisComplete: (result: ClinicalAnalysisResult) => void;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await runClinicalAnalysis(encounter, patient, userId);
      onAnalysisComplete(result);
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <>
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        style={{
          padding: '12px 24px',
          backgroundColor: isAnalyzing ? '#ccc' : '#007AFF',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isAnalyzing ? 'not-allowed' : 'pointer',
        }}
      >
        {isAnalyzing ? 'Analyzing...' : '🔬 Run AI Analysis (Research Only)'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </>
  );
}

/**
 * Example: Display Analysis Results
 */
export function AnalysisResultsPanel({ result }: { result: ClinicalAnalysisResult }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
      {/* Research Mode Disclaimer */}
      <div
        style={{
          backgroundColor: '#FFF3CD',
          border: '1px solid #FFEAA7',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>🔬 Research Mode</p>
        <p style={{ margin: '4px 0 0', fontSize: '12px' }}>{result.caution_text}</p>
      </div>

      {/* Risk Level */}
      <div style={{ marginBottom: '16px' }}>
        <h3>Risk Level</h3>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '4px',
            fontWeight: 'bold',
            backgroundColor:
              result.risk_level === 'high'
                ? '#FFEBEE'
                : result.risk_level === 'moderate'
                ? '#FFF3E0'
                : '#E8F5E9',
            color:
              result.risk_level === 'high'
                ? '#C62828'
                : result.risk_level === 'moderate'
                ? '#E65100'
                : '#2E7D32',
          }}
        >
          {result.risk_level.toUpperCase()}
        </span>
      </div>

      {/* Red Flags */}
      {result.red_flags.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h3>⚠️ Red Flags</h3>
          <ul>
            {result.red_flags.map((flag, index) => (
              <li key={index} style={{ color: '#C62828' }}>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Possible Conditions */}
      {result.possible_conditions.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h3>Possible Conditions</h3>
          {result.possible_conditions.map((condition, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '12px',
                marginBottom: '8px',
              }}
            >
              <p style={{ margin: 0, fontWeight: 'bold' }}>
                {condition.name}
                {condition.icd10_code && (
                  <span style={{ color: '#666', marginLeft: '8px' }}>({condition.icd10_code})</span>
                )}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                Likelihood: {condition.likelihood}
              </p>
              {condition.explanation && (
                <p style={{ margin: '4px 0 0', fontSize: '14px' }}>{condition.explanation}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recommended Questions */}
      {result.recommended_questions.length > 0 && (
        <div>
          <h3>💡 Recommended Questions</h3>
          <ul>
            {result.recommended_questions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Create structured encounter data from form
 */
export function buildStructuredData(formValues: any) {
  return {
    // Symptoms
    fever: formValues.fever || false,
    cough: formValues.cough || false,
    shortness_of_breath: formValues.shortnessOfBreath || false,
    chest_pain: formValues.chestPain || false,
    severe_abdominal_pain: formValues.abdominalPain || false,
    confusion: formValues.confusion || false,

    // Duration
    duration: formValues.duration || undefined,

    // Pain details
    pain: formValues.painPresent
      ? {
          present: true,
          location: formValues.painLocation || undefined,
          severity: formValues.painSeverity || undefined,
          radiating: formValues.painRadiating || false,
        }
      : undefined,

    // Vitals
    vitals: {
      temperature: formValues.temperature || undefined,
      heart_rate: formValues.heartRate || undefined,
      bp_systolic: formValues.bpSystolic || undefined,
      bp_diastolic: formValues.bpDiastolic || undefined,
      respiratory_rate: formValues.respiratoryRate || undefined,
      oxygen_saturation: formValues.oxygenSaturation || undefined,
    },

    // Red flags
    red_flags: formValues.redFlags || [],

    // Notes
    notes: formValues.notes || undefined,
  };
}
