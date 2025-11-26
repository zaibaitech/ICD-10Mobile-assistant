import { supabase } from './supabase';
import {
  ClinicalAnalysisInput,
  ClinicalAnalysisResult,
  PossibleCondition,
  RiskLevel,
  RedFlagType,
  StructuredEncounterData,
} from '../types';
import { AI_ANALYSIS_DISCLAIMER } from '../constants/disclaimers';

// Red flag warning messages
const RED_FLAG_RULES: Record<RedFlagType, string> = {
  chest_pain: 'Chest pain reported - cardiac evaluation may be indicated',
  sudden_weakness: 'Sudden weakness/paralysis - consider stroke protocol',
  severe_abdominal_pain: 'Severe abdominal pain - surgical abdomen possible',
  altered_mental_status: 'Altered mental status - urgent evaluation needed',
  difficulty_breathing: 'Respiratory distress - assess airway and oxygenation',
  severe_headache: 'Severe headache - consider intracranial pathology',
  signs_of_stroke: 'Possible stroke signs - time-sensitive intervention may be needed',
};

// Symptom-based condition rules
interface ConditionRule {
  triggers: {
    symptoms?: string[];
    chiefComplaint?: string[];
    exclude?: string[];
  };
  condition: PossibleCondition;
  riskLevel?: RiskLevel;
}

const SYMPTOM_CONDITION_MAP: ConditionRule[] = [
  {
    triggers: { symptoms: ['fever', 'cough', 'shortness_of_breath'] },
    condition: {
      name: 'Possible pneumonia',
      icd10_code: 'J18.9',
      likelihood: 'medium',
      explanation: 'Combination of fever, cough, and dyspnea suggests lower respiratory infection',
    },
  },
  {
    triggers: { symptoms: ['chest_pain', 'shortness_of_breath'] },
    condition: {
      name: 'Possible acute coronary syndrome',
      icd10_code: 'I21.9',
      likelihood: 'medium',
      explanation: 'Chest pain with dyspnea warrants cardiac workup',
    },
    riskLevel: 'high',
  },
  {
    triggers: { chiefComplaint: ['headache', 'migraine', 'head pain'] },
    condition: {
      name: 'Headache disorder',
      icd10_code: 'G43.909',
      likelihood: 'medium',
      explanation: 'Headache as primary complaint',
    },
  },
  {
    triggers: { symptoms: ['fever', 'cough'], exclude: ['shortness_of_breath'] },
    condition: {
      name: 'Possible upper respiratory infection',
      icd10_code: 'J06.9',
      likelihood: 'high',
      explanation: 'Fever and cough without dyspnea suggests URI',
    },
  },
  {
    triggers: { chiefComplaint: ['abdominal pain', 'stomach pain', 'belly pain'] },
    condition: {
      name: 'Abdominal pain, unspecified',
      icd10_code: 'R10.9',
      likelihood: 'high',
      explanation: 'Abdominal pain requires differential diagnosis',
    },
  },
  {
    triggers: { symptoms: ['fever'] },
    condition: {
      name: 'Fever, unspecified',
      icd10_code: 'R50.9',
      likelihood: 'high',
      explanation: 'Fever present without clear source',
    },
  },
  {
    triggers: { chiefComplaint: ['back pain', 'low back pain'] },
    condition: {
      name: 'Low back pain',
      icd10_code: 'M54.5',
      likelihood: 'high',
      explanation: 'Back pain as primary complaint',
    },
  },
  {
    triggers: { chiefComplaint: ['shortness of breath', 'dyspnea', 'difficulty breathing'] },
    condition: {
      name: 'Dyspnea, unspecified',
      icd10_code: 'R06.00',
      likelihood: 'high',
      explanation: 'Dyspnea requires evaluation of cardiac and pulmonary causes',
    },
    riskLevel: 'moderate',
  },
];

// Clarifying questions based on symptoms
const CLARIFYING_QUESTIONS: Record<string, string[]> = {
  chest_pain: [
    'Is the pain radiating to arm, jaw, or back?',
    'Is there associated sweating or nausea?',
    'Does the pain worsen with exertion?',
  ],
  shortness_of_breath: [
    'Is this acute or gradual onset?',
    'Any history of asthma, COPD, or heart failure?',
    'Is it worse when lying flat?',
  ],
  fever: [
    'How high is the temperature?',
    'Any recent travel or sick contacts?',
    'Any localizing symptoms (cough, dysuria, etc.)?',
  ],
  cough: [
    'Is the cough productive or dry?',
    'Any blood in sputum?',
    'How long has the cough been present?',
  ],
  abdominal_pain: [
    'Where exactly is the pain located?',
    'Is the pain constant or intermittent?',
    'Any associated nausea, vomiting, or changes in bowel movements?',
  ],
  headache: [
    'Is this the worst headache of your life?',
    'Any visual changes or neurological symptoms?',
    'Does light or noise make it worse?',
  ],
};

/**
 * Main clinical analysis function
 * TODO: Replace with real clinical AI API (Infermedica, custom model, etc.)
 */
export const analyzeEncounter = async (
  input: ClinicalAnalysisInput
): Promise<ClinicalAnalysisResult> => {
  const { patient, encounter } = input;
  const structuredData = encounter.structured_data;
  
  // Extract symptoms present
  const symptomsPresent: string[] = [];
  if (structuredData.fever) symptomsPresent.push('fever');
  if (structuredData.cough) symptomsPresent.push('cough');
  if (structuredData.shortness_of_breath) symptomsPresent.push('shortness_of_breath');
  if (structuredData.pain?.present) symptomsPresent.push('chest_pain'); // simplified
  
  // Process red flags
  const redFlags: string[] = [];
  let calculatedRiskLevel: RiskLevel = 'low';
  
  if (structuredData.red_flags && structuredData.red_flags.length > 0) {
    structuredData.red_flags.forEach((flag) => {
      redFlags.push(RED_FLAG_RULES[flag]);
    });
    calculatedRiskLevel = 'high';
  }
  
  // Check vital signs for abnormalities
  if (structuredData.vitals) {
    const { temperature, heart_rate, blood_pressure_systolic, oxygen_saturation } = structuredData.vitals;
    
    if (temperature && temperature > 38.5) {
      redFlags.push('High fever detected (>38.5°C)');
      if (calculatedRiskLevel === 'low') calculatedRiskLevel = 'moderate';
    }
    
    if (heart_rate && (heart_rate > 120 || heart_rate < 50)) {
      redFlags.push('Abnormal heart rate detected');
      if (calculatedRiskLevel === 'low') calculatedRiskLevel = 'moderate';
    }
    
    if (blood_pressure_systolic && blood_pressure_systolic > 180) {
      redFlags.push('Severe hypertension detected');
      calculatedRiskLevel = 'high';
    }
    
    if (oxygen_saturation && oxygen_saturation < 90) {
      redFlags.push('Low oxygen saturation (<90%)');
      calculatedRiskLevel = 'high';
    }
  }
  
  // Match conditions based on symptoms and chief complaint
  const possibleConditions: PossibleCondition[] = [];
  const chiefComplaintLower = encounter.chief_complaint.toLowerCase();
  
  for (const rule of SYMPTOM_CONDITION_MAP) {
    let matches = false;
    
    // Check chief complaint
    if (rule.triggers.chiefComplaint) {
      matches = rule.triggers.chiefComplaint.some((keyword) =>
        chiefComplaintLower.includes(keyword.toLowerCase())
      );
    }
    
    // Check symptoms
    if (rule.triggers.symptoms && !matches) {
      const hasAllSymptoms = rule.triggers.symptoms.every((symptom) =>
        symptomsPresent.includes(symptom)
      );
      
      const hasExclusions = rule.triggers.exclude?.some((symptom) =>
        symptomsPresent.includes(symptom)
      );
      
      matches = hasAllSymptoms && !hasExclusions;
    }
    
    if (matches) {
      possibleConditions.push(rule.condition);
      
      // Update risk level if rule specifies higher risk
      if (rule.riskLevel === 'high') {
        calculatedRiskLevel = 'high';
      } else if (rule.riskLevel === 'moderate' && calculatedRiskLevel === 'low') {
        calculatedRiskLevel = 'moderate';
      }
    }
  }
  
  // Generate clarifying questions
  const recommendedQuestions: string[] = [];
  const questionKeys = Array.from(new Set([
    ...symptomsPresent,
    ...(chiefComplaintLower.includes('pain') ? ['abdominal_pain'] : []),
    ...(chiefComplaintLower.includes('headache') ? ['headache'] : []),
  ]));
  
  questionKeys.forEach((key) => {
    const questions = CLARIFYING_QUESTIONS[key];
    if (questions) {
      recommendedQuestions.push(...questions.slice(0, 2)); // Limit to 2 per symptom
    }
  });
  
  // Generate summary
  const age = patient.age ? `${patient.age}-year-old` : 'Adult';
  const summary = `${age} ${patient.sex} patient presenting with ${encounter.chief_complaint.toLowerCase()}. ${
    possibleConditions.length > 0
      ? `Possible conditions include: ${possibleConditions.map((c) => c.name).join(', ')}.`
      : 'Differential diagnosis to be determined.'
  } ${redFlags.length > 0 ? 'Red flag features present.' : ''}`;
  
  return {
    possible_conditions: possibleConditions.slice(0, 5), // Limit to top 5
    risk_level: calculatedRiskLevel,
    red_flags: redFlags,
    recommended_questions: recommendedQuestions.slice(0, 5), // Limit to 5
    summary,
    caution_text: AI_ANALYSIS_DISCLAIMER,
  };
};

/**
 * Log clinical analysis for audit trail
 */
export const logAnalysis = async (
  userId: string,
  patientId: string | null,
  encounterId: string | null,
  input: ClinicalAnalysisInput,
  result: ClinicalAnalysisResult
): Promise<void> => {
  const { error } = await supabase.from('clinical_analysis_logs').insert([
    {
      user_id: userId,
      patient_id: patientId,
      encounter_id: encounterId,
      input_snapshot: input,
      result_snapshot: result,
    },
  ]);

  if (error) {
    console.error('Error logging analysis:', error);
    // Don't throw - logging failure shouldn't break the flow
  }
};

/**
 * Calculate age from year of birth
 */
export const calculateAge = (yearOfBirth: number | null): number | undefined => {
  if (!yearOfBirth) return undefined;
  const currentYear = new Date().getFullYear();
  return currentYear - yearOfBirth;
};
