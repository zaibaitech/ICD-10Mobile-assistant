// ============================================
// CLINICAL REASONER SERVICE
// ============================================
// Rule-based mock analysis for research/prototype mode
// TODO: Replace with real clinical AI API (Infermedica, custom model, etc.)

import type {
  Patient,
  Encounter,
  ClinicalAnalysisResult,
  PossibleCondition,
  RiskLevel,
} from '../types';

// === Constants ===
const CAUTION_TEXT = `
This is an experimental AI-supported analysis for research and educational purposes only.
It does NOT provide a medical diagnosis or treatment plan.
The clinician remains fully responsible for all clinical decisions.
`.trim();

// === Helper Functions ===
function calculateAge(yearOfBirth: number | null): number | null {
  if (!yearOfBirth) return null;
  return new Date().getFullYear() - yearOfBirth;
}

function normalizeText(text: string): string {
  return (text || '').toLowerCase().trim();
}

function containsAny(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text);
  return keywords.some((keyword) => normalized.includes(keyword));
}

// === Main Analysis Function ===
export async function analyzeEncounter(
  encounter: Encounter,
  patient: Patient
): Promise<ClinicalAnalysisResult> {
  const result: ClinicalAnalysisResult = {
    possible_conditions: [],
    risk_level: 'unknown',
    red_flags: [],
    recommended_questions: [],
    caution_text: CAUTION_TEXT,
  };

  const age = calculateAge(patient.year_of_birth);
  const data = encounter.structured_data || {};
  const chief = normalizeText(encounter.chief_complaint);

  // === Symptom Detection ===
  const symptoms = {
    chestPain: data.chest_pain === true || containsAny(chief, ['chest pain', 'chest tightness']),
    shortnessOfBreath: data.shortness_of_breath === true || containsAny(chief, ['shortness of breath', 'dyspnea', 'breathless', 'difficulty breathing']),
    fever: data.fever === true || containsAny(chief, ['fever', 'pyrexia', 'high temperature']),
    cough: data.cough === true || containsAny(chief, ['cough', 'coughing']),
    abdominalPain: data.severe_abdominal_pain === true || containsAny(chief, ['abdominal pain', 'stomach pain', 'belly pain']),
    confusion: data.confusion === true || containsAny(chief, ['confusion', 'altered mental status', 'disoriented']),
  };

  // === Red Flag Detection ===
  if (symptoms.chestPain && symptoms.shortnessOfBreath) {
    result.red_flags.push(
      'Chest pain with shortness of breath - high-risk feature requiring urgent evaluation'
    );
  }

  if (symptoms.abdominalPain) {
    result.red_flags.push(
      'Severe abdominal pain - consider surgical causes'
    );
  }

  if (symptoms.confusion) {
    result.red_flags.push(
      'Altered mental status - urgent assessment needed'
    );
  }

  if (age && age > 65 && symptoms.chestPain) {
    result.red_flags.push(
      'Chest pain in patient over 65 - higher cardiac risk'
    );
  }

  // === Risk Level ===
  if (result.red_flags.length >= 2) {
    result.risk_level = 'high';
  } else if (result.red_flags.length === 1) {
    result.risk_level = 'moderate';
  } else if (symptoms.fever && symptoms.cough) {
    result.risk_level = 'moderate';
  } else {
    result.risk_level = 'low';
  }

  // === Possible Conditions ===
  if (symptoms.fever && symptoms.cough && symptoms.shortnessOfBreath) {
    result.possible_conditions.push({
      name: 'Possible lower respiratory tract infection (e.g., pneumonia)',
      icd10_code: 'J18.9',
      likelihood: 'medium',
      explanation: 'Fever, cough, and shortness of breath may indicate LRTI. Clinical examination and imaging required.',
    });
  }

  if (symptoms.chestPain && symptoms.shortnessOfBreath) {
    result.possible_conditions.push({
      name: 'Possible acute coronary syndrome',
      icd10_code: 'I21.9',
      likelihood: 'medium',
      explanation: 'Chest pain with dyspnea warrants urgent cardiac workup. ECG and troponins recommended.',
    });
  }

  if (symptoms.fever && symptoms.cough && !symptoms.shortnessOfBreath) {
    result.possible_conditions.push({
      name: 'Possible upper respiratory tract infection',
      icd10_code: 'J06.9',
      likelihood: 'high',
      explanation: 'Fever and cough without respiratory distress suggests viral URTI.',
    });
  }

  if (symptoms.fever && !symptoms.cough && !symptoms.shortnessOfBreath) {
    result.possible_conditions.push({
      name: 'Undifferentiated febrile illness',
      icd10_code: 'R50.9',
      likelihood: 'low',
      explanation: 'Fever without localizing symptoms. Further history and examination needed.',
    });
  }

  if (symptoms.abdominalPain) {
    result.possible_conditions.push({
      name: 'Acute abdominal pain - cause to be determined',
      icd10_code: 'R10.9',
      likelihood: 'medium',
      explanation: 'Severe abdominal pain requires assessment to rule out surgical causes.',
    });
  }

  // === Clarifying Questions ===
  if (symptoms.chestPain) {
    result.recommended_questions.push(
      'Is the chest pain central, left-sided, or elsewhere?',
      'Does the pain radiate to the arm, jaw, or back?',
      'Is the pain brought on by exertion or present at rest?',
      'Are there associated symptoms like sweating, nausea, or palpitations?'
    );
  }

  if (symptoms.cough || symptoms.shortnessOfBreath) {
    result.recommended_questions.push(
      'Is there sputum production? What color?',
      'Any wheezing or stridor?',
      'History of asthma, COPD, or smoking?'
    );
  }

  if (symptoms.abdominalPain) {
    result.recommended_questions.push(
      'Where exactly is the abdominal pain located?',
      'Is the pain constant or intermittent?',
      'Any vomiting, diarrhea, constipation, or blood in stool?'
    );
  }

  if (symptoms.fever) {
    result.recommended_questions.push(
      'How high is the temperature?',
      'Any recent travel or sick contacts?',
      'Any localizing symptoms (dysuria, sore throat, etc.)?'
    );
  }

  if (age && age > 65) {
    result.recommended_questions.push(
      'Any known comorbidities (hypertension, diabetes, heart disease)?'
    );
  }

  return result;
}


