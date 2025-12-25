// ============================================
// NURSING MODULE TYPES
// Phase 6: Nurse-Specific Features
// ============================================

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type NandaDiagnosisType = 'actual' | 'risk' | 'health_promotion' | 'syndrome';
export type MappingRelevance = 'primary' | 'secondary' | 'related';
export type EvidenceLevel = 'research' | 'expert_consensus' | 'clinical_practice';
export type CarePlanStatus = 'draft' | 'active' | 'completed' | 'discontinued';
export type CarePlanPriority = 'high' | 'medium' | 'low';
export type CarePlanItemStatus = 'active' | 'resolved' | 'ongoing';
export type SbarReportType = 'shift_handoff' | 'physician_call' | 'rapid_response' | 'transfer' | 'discharge';
export type SbarUrgency = 'routine' | 'urgent' | 'emergent';
export type AssessmentType = 
  | 'admission' 
  | 'shift' 
  | 'focused' 
  | 'head_to_toe' 
  | 'pain' 
  | 'fall_risk' 
  | 'skin' 
  | 'neuro'
  | 'cardiac'
  | 'respiratory';

// ============================================
// NANDA-I NURSING DIAGNOSIS
// ============================================

export interface NandaDiagnosis {
  id: string;
  code: string;                                    // e.g., "00200"
  label: string;                                   // e.g., "Risk for Decreased Cardiac Tissue Perfusion"
  definition: string | null;
  domain: string;                                  // 13 NANDA domains
  class: string;                                   // 48 NANDA classes
  diagnosis_type: NandaDiagnosisType;
  related_factors: string[];                       // For actual diagnoses
  risk_factors: string[];                          // For risk diagnoses
  defining_characteristics: string[];              // Signs/symptoms
  created_at: string;
  updated_at: string;
}

export interface NandaDiagnosisSearchFilters {
  query?: string;
  domain?: string;
  type?: NandaDiagnosisType;
  limit?: number;
}

// ============================================
// NIC NURSING INTERVENTIONS
// ============================================

export interface NicIntervention {
  id: string;
  code: string;                                    // e.g., "6680"
  label: string;                                   // e.g., "Vital Signs Monitoring"
  definition: string | null;
  domain: string;                                  // 7 NIC domains
  class: string;                                   // 30 NIC classes
  activities: string[];                            // Specific nursing activities
  created_at: string;
  updated_at: string;
}

// ============================================
// NOC NURSING OUTCOMES
// ============================================

export interface NocOutcome {
  id: string;
  code: string;                                    // e.g., "0802"
  label: string;                                   // e.g., "Vital Signs"
  definition: string | null;
  domain: string;                                  // 7 NOC domains
  class: string;                                   // 32 NOC classes
  indicators: string[];                            // Measurable indicators
  measurement_scale: string | null;                // e.g., "1-5 Likert scale"
  created_at: string;
  updated_at: string;
}

// ============================================
// ICD-10 ↔ NANDA MAPPING
// ⭐ THE KEY DIFFERENTIATOR ⭐
// ============================================

export interface Icd10NandaMapping {
  id: string;
  icd10_id: string;
  nanda_id: string;
  relevance: MappingRelevance;
  rationale: string | null;
  evidence_level: EvidenceLevel | null;
  created_at: string;
  updated_at: string;
  // Joined data (optional)
  icd10_code?: {
    id: string;
    code: string;
    description: string;
  };
  nanda_diagnosis?: NandaDiagnosis;
}

// ============================================
// NNN LINKAGE
// Evidence-based connections between NANDA, NIC, NOC
// ============================================

export interface NnnLinkage {
  id: string;
  nanda_id: string;
  nic_id: string;
  noc_id: string;
  priority: number;                                // 1 = high priority, 5 = low priority
  evidence_level: EvidenceLevel | null;
  created_at: string;
  updated_at: string;
  // Joined data (optional)
  nanda?: NandaDiagnosis;
  nic?: NicIntervention;
  noc?: NocOutcome;
}

// ============================================
// NURSING CARE PLAN
// ============================================

export interface NursingCarePlan {
  id: string;
  user_id: string;
  patient_id: string;
  encounter_id: string | null;
  organization_id: string | null;
  title: string;
  status: CarePlanStatus;
  priority: CarePlanPriority;
  start_date: string;                              // ISO date string
  target_date: string | null;                      // ISO date string
  completed_date: string | null;                   // ISO date string
  discontinued_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined data (optional)
  items?: CarePlanItem[];
  patient?: {
    id: string;
    display_label: string;
    mrn: string | null;
  };
}

export interface NursingCarePlanInput {
  patient_id: string;
  encounter_id?: string;
  title: string;
  priority?: CarePlanPriority;
  target_date?: string;
}

export interface NursingCarePlanUpdate {
  title?: string;
  status?: CarePlanStatus;
  priority?: CarePlanPriority;
  target_date?: string;
  completed_date?: string;
  discontinued_reason?: string;
}

// ============================================
// CARE PLAN ITEM
// Individual nursing diagnosis within a care plan
// ============================================

export interface CarePlanItem {
  id: string;
  care_plan_id: string;
  nanda_id: string | null;
  custom_diagnosis: string | null;
  icd10_id: string | null;                         // THE BRIDGE
  related_factors: string[];
  evidenced_by: string[];                          // Defining characteristics
  noc_ids: string[];                               // Array of NOC outcome IDs
  goal_statement: string | null;
  baseline_score: number | null;                   // 1-5 scale
  target_score: number | null;                     // 1-5 scale
  nic_ids: string[];                               // Array of NIC intervention IDs
  custom_interventions: string[];
  current_score: number | null;                    // 1-5 scale
  evaluation_notes: string | null;
  evaluation_date: string | null;                  // ISO date string
  status: CarePlanItemStatus;
  created_at: string;
  updated_at: string;
  // Joined data (optional)
  nanda?: NandaDiagnosis;
  icd10?: {
    id: string;
    code: string;
    description: string;
  };
  nocs?: NocOutcome[];
  nics?: NicIntervention[];
}

export interface CarePlanItemInput {
  nanda_id?: string;
  custom_diagnosis?: string;
  icd10_id?: string;
  related_factors?: string[];
  evidenced_by?: string[];
  noc_ids?: string[];
  goal_statement?: string;
  baseline_score?: number;
  target_score?: number;
  nic_ids?: string[];
  custom_interventions?: string[];
}

export interface CarePlanItemUpdate {
  current_score?: number;
  evaluation_notes?: string;
  evaluation_date?: string;
  status?: CarePlanItemStatus;
  goal_statement?: string;
  related_factors?: string[];
  evidenced_by?: string[];
}

// ============================================
// CARE PLANNING SUGGESTIONS
// Auto-generated from ICD-10
// ============================================

export interface CarePlanningSuggestion {
  icd10: {
    id: string;
    code: string;
    short_title: string;
    long_description: string;
  };
  nanda: NandaDiagnosis;
  relevance: MappingRelevance;
  rationale: string | null;
  suggestedNics: NicIntervention[];
  suggestedNocs: NocOutcome[];
}

// ============================================
// SBAR REPORT
// Structured handoff communication
// ============================================

export interface VitalSigns {
  temperature?: number;                            // Celsius
  temperature_fahrenheit?: number;                 // Fahrenheit
  heart_rate?: number;                             // bpm
  respiratory_rate?: number;                       // breaths/min
  blood_pressure_systolic?: number;                // mmHg
  blood_pressure_diastolic?: number;               // mmHg
  oxygen_saturation?: number;                      // %
  pain_score?: number;                             // 0-10 scale
  recorded_at?: string;                            // ISO timestamp
}

export interface SbarReport {
  id: string;
  user_id: string;
  patient_id: string;
  organization_id: string | null;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  report_type: SbarReportType;
  recipient_role: string | null;
  urgency: SbarUrgency;
  vital_signs: VitalSigns | null;
  linked_icd10_ids: string[];
  linked_nanda_ids: string[];
  audio_url: string | null;
  transcription: string | null;
  created_at: string;
  updated_at: string;
  // Joined data (optional)
  patient?: {
    id: string;
    display_label: string;
    mrn: string | null;
  };
}

export interface SbarReportInput {
  patient_id: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  report_type: SbarReportType;
  recipient_role?: string;
  urgency?: SbarUrgency;
  vital_signs?: VitalSigns;
  linked_icd10_ids?: string[];
  linked_nanda_ids?: string[];
  audio_url?: string;
  transcription?: string;
}

export interface SbarTemplate {
  patient_id: string;
  report_type: SbarReportType;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
}

// ============================================
// NURSING ASSESSMENT
// Structured patient assessments
// ============================================

export interface WoundAssessment {
  location: string;
  type: string;                                    // e.g., "pressure ulcer", "surgical incision"
  size_cm?: string;                                // e.g., "2x3 cm"
  depth?: string;                                  // e.g., "superficial", "deep"
  drainage?: string;                               // e.g., "serous", "purulent"
  treatment?: string;                              // e.g., "hydrocolloid dressing"
  stage?: string;                                  // For pressure ulcers: I, II, III, IV
}

export interface IvSiteAssessment {
  location: string;                                // e.g., "right antecubital"
  type: 'peripheral' | 'central' | 'picc' | 'port';
  gauge?: string;                                  // e.g., "20G", "22G"
  condition: 'patent' | 'infiltrated' | 'occluded' | 'phlebitis';
  dressing_date?: string;                          // ISO date string
  insertion_date?: string;                         // ISO date string
}

export interface AssessmentData {
  // General
  level_of_consciousness?: 'alert' | 'drowsy' | 'lethargic' | 'obtunded' | 'comatose';
  orientation?: ('person' | 'place' | 'time' | 'situation')[];
  
  // Respiratory
  respiratory_pattern?: 'regular' | 'irregular' | 'labored' | 'dyspneic';
  breath_sounds?: string;                          // e.g., "clear bilaterally"
  oxygen_therapy?: string;                         // e.g., "2L NC"
  cough?: 'productive' | 'nonproductive' | 'absent';
  sputum?: string;                                 // e.g., "yellow, thick"
  
  // Cardiovascular
  heart_rhythm?: 'regular' | 'irregular';
  heart_sounds?: string;                           // e.g., "S1, S2 normal"
  peripheral_pulses?: 'strong' | 'weak' | 'absent';
  capillary_refill?: string;                       // e.g., "<2 seconds"
  edema?: 'none' | 'trace' | '1+' | '2+' | '3+' | '4+';
  edema_location?: string;
  
  // GI/Nutrition
  bowel_sounds?: 'present' | 'hypoactive' | 'hyperactive' | 'absent';
  abdomen?: string;                                // e.g., "soft, non-tender"
  last_bowel_movement?: string;                    // ISO date string
  diet?: string;                                   // e.g., "regular", "NPO"
  diet_tolerance?: string;
  nausea?: boolean;
  vomiting?: boolean;
  
  // GU
  urine_output?: number;                           // mL
  urine_output_timeframe?: string;                 // e.g., "past 8 hours"
  urine_characteristics?: string;                  // e.g., "clear yellow"
  foley_catheter?: boolean;
  
  // Skin
  skin_color?: string;                             // e.g., "pink", "pale", "jaundiced"
  skin_temperature?: 'warm' | 'cool' | 'hot';
  skin_turgor?: 'good' | 'fair' | 'poor';
  skin_moisture?: 'dry' | 'normal' | 'diaphoretic';
  wounds?: WoundAssessment[];
  
  // Pain
  pain_present?: boolean;
  pain_location?: string;
  pain_quality?: string;                           // e.g., "sharp", "dull", "burning"
  pain_intensity?: number;                         // 0-10 scale
  pain_onset?: string;
  pain_duration?: string;
  pain_aggravating_factors?: string;
  pain_relieving_factors?: string;
  pain_interventions?: string;
  
  // Mobility/Activity
  mobility_status?: 'ambulatory' | 'with_assistance' | 'wheelchair' | 'bedbound';
  gait?: string;                                   // e.g., "steady", "unsteady"
  assistive_devices?: string[];                    // e.g., ["walker", "cane"]
  fall_risk_factors?: string[];
  
  // Neurological
  pupils?: string;                                 // e.g., "PERRLA"
  motor_strength?: string;                         // e.g., "5/5 all extremities"
  sensory_function?: string;
  reflexes?: string;
  speech?: 'clear' | 'slurred' | 'aphasic';
  
  // IV Access
  iv_sites?: IvSiteAssessment[];
  
  // Psychosocial
  mood?: string;                                   // e.g., "appropriate", "anxious"
  affect?: string;                                 // e.g., "appropriate", "flat"
  behavior?: string;
  
  // Safety
  restraints?: boolean;
  restraint_type?: string;
  fall_precautions?: boolean;
  isolation_precautions?: string;                  // e.g., "contact", "droplet"
  
  // Additional
  additional_notes?: string;
}

export interface NursingAssessment {
  id: string;
  user_id: string;
  patient_id: string;
  encounter_id: string | null;
  organization_id: string | null;
  assessment_type: AssessmentType;
  assessment_data: AssessmentData;
  fall_risk_score: number | null;
  braden_score: number | null;                     // Pressure ulcer risk (6-23)
  pain_score: number | null;                       // 0-10
  morse_score: number | null;                      // Fall risk (0-125)
  glasgow_score: number | null;                    // 3-15
  assessment_time: string;
  created_at: string;
  updated_at: string;
  // Joined data (optional)
  patient?: {
    id: string;
    display_label: string;
    mrn: string | null;
  };
}

export interface NursingAssessmentInput {
  patient_id: string;
  encounter_id?: string;
  assessment_type: AssessmentType;
  assessment_data: AssessmentData;
  fall_risk_score?: number;
  braden_score?: number;
  pain_score?: number;
  morse_score?: number;
  glasgow_score?: number;
  assessment_time?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface NocScoreScale {
  score: number;
  label: string;
  description: string;
}

export const NOC_SCORE_SCALES: Record<number, NocScoreScale> = {
  1: { score: 1, label: 'Severely Compromised', description: 'Significant deviation from expected outcome' },
  2: { score: 2, label: 'Substantially Compromised', description: 'Moderate deviation from expected outcome' },
  3: { score: 3, label: 'Moderately Compromised', description: 'Some deviation from expected outcome' },
  4: { score: 4, label: 'Mildly Compromised', description: 'Minimal deviation from expected outcome' },
  5: { score: 5, label: 'Not Compromised', description: 'Expected outcome achieved' },
};

export interface PainScale {
  score: number;
  label: string;
  description: string;
}

export const PAIN_SCALES: Record<number, PainScale> = {
  0: { score: 0, label: 'No Pain', description: 'No pain present' },
  1: { score: 1, label: 'Mild', description: 'Very mild, barely noticeable' },
  2: { score: 2, label: 'Mild', description: 'Minor annoyance' },
  3: { score: 3, label: 'Moderate', description: 'Noticeable pain' },
  4: { score: 4, label: 'Moderate', description: 'Distracting pain' },
  5: { score: 5, label: 'Moderate', description: 'Interrupts some activities' },
  6: { score: 6, label: 'Severe', description: 'Hard to ignore' },
  7: { score: 7, label: 'Severe', description: 'Focus is on pain' },
  8: { score: 8, label: 'Very Severe', description: 'Physical activity limited' },
  9: { score: 9, label: 'Very Severe', description: 'Unable to function' },
  10: { score: 10, label: 'Worst Possible', description: 'Unbearable pain' },
};

// ============================================
// DOMAIN CONSTANTS
// ============================================

export const NANDA_DOMAINS = [
  'Health Promotion',
  'Nutrition',
  'Elimination and Exchange',
  'Activity/Rest',
  'Perception/Cognition',
  'Self-Perception',
  'Role Relationships',
  'Sexuality',
  'Coping/Stress Tolerance',
  'Life Principles',
  'Safety/Protection',
  'Comfort',
  'Growth/Development',
] as const;

export const NIC_DOMAINS = [
  'Physiological: Basic',
  'Physiological: Complex',
  'Behavioral',
  'Safety',
  'Family',
  'Health System',
  'Community',
] as const;

export const NOC_DOMAINS = [
  'Functional Health',
  'Physiologic Health',
  'Psychosocial Health',
  'Health Knowledge & Behavior',
  'Perceived Health',
  'Family Health',
  'Community Health',
] as const;
