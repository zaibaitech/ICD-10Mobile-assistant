// TypeScript types for ICD-10 Mobile Assistant

// ===== Phase 1 Types =====
export interface Icd10Code {
  id: string;
  code: string;
  short_title: string;
  full_title: string;
  long_description?: string | null;
  chapter: string;
  block?: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  icd10_id: string;
  icd10_codes?: Icd10Code; // joined
}

// ===== Phase 2 Types =====

// Chat & Assistant Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestedCodes?: SuggestedCode[];
  clarifyingQuestions?: string[];
  imageUrl?: string; // Added for image attachments
  timestamp: Date;
}

export interface SuggestedCode {
  id: string;
  code: string;
  short_title: string;
  confidence?: 'high' | 'medium' | 'low';
  reasoning?: string; // AI-generated clinical reasoning
}

export interface AssistantContext {
  currentVisitCodes: Icd10Code[];
  recentMessages?: ChatMessage[];
  imageUrl?: string; // For vision analysis
}

export interface AssistantResponse {
  text: string;
  suggestedCodes: SuggestedCode[];
  clarifyingQuestions?: string[];
}

// Attachment Types
export interface VisitAttachment {
  id: string;
  uri: string;
  type: 'image';
  tags: AttachmentTag[];
  createdAt: Date;
}

export type AttachmentTag = 
  | 'skin' 
  | 'wound' 
  | 'swelling' 
  | 'bruising' 
  | 'rash'
  | 'other';

// Rule Engine Types
export interface RuleSuggestion {
  id: string;
  message: string;
  relatedCodes?: SuggestedCode[];
  priority: 'info' | 'warning';
}

export interface Rule {
  id: string;
  trigger: {
    codePrefix?: string;
    keyword?: string;
    codeIds?: string[];
  };
  suggestion: {
    message: string;
    relatedCodes?: SuggestedCode[];
    priority?: 'info' | 'warning';
  };
}

// Logging Types
export interface AssistantLogEntry {
  id: string;
  user_id: string;
  input_text: string;
  assistant_response: string;
  suggested_codes: SuggestedCode[];
  accepted_codes: string[]; // code IDs
  created_at: string;
}

// Extended Visit Note Type
export interface VisitNote {
  codes: Icd10Code[];
  attachments: VisitAttachment[];
  createdAt: Date;
}

// ===== Phase 3 Types =====

// Patient Types
export type Sex = 'male' | 'female' | 'other' | 'unknown';

export interface Patient {
  id: string;
  user_id: string;
  display_label: string;
  year_of_birth: number | null;
  sex: Sex;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientInput {
  display_label: string;
  year_of_birth?: number | null;
  sex?: Sex;
  notes?: string | null;
}

// Encounter Types
export type RiskLevel = 'low' | 'moderate' | 'high' | 'unknown';
export type CodeSource = 'user_selected' | 'ai_suggested';

export interface Encounter {
  id: string;
  patient_id: string;
  user_id: string;
  encounter_date: string;
  chief_complaint: string;
  structured_data: StructuredEncounterData;
  ai_summary: string | null;
  ai_risk_level: RiskLevel;
  ai_result: ClinicalAnalysisResult | null;
  created_at: string;
  updated_at: string;
}

export type DurationValue = 'hours' | 'days' | 'weeks' | 'months';

export type RedFlagType =
  | 'chest_pain'
  | 'sudden_weakness'
  | 'severe_abdominal_pain'
  | 'altered_mental_status'
  | 'difficulty_breathing'
  | 'severe_headache'
  | 'signs_of_stroke';

export interface StructuredEncounterData {
  // Symptoms
  fever?: boolean;
  cough?: boolean;
  shortness_of_breath?: boolean;
  chest_pain?: boolean;
  severe_abdominal_pain?: boolean;
  confusion?: boolean;
  
  // Duration
  duration?: DurationValue;
  
  // Pain details
  pain?: {
    present: boolean;
    location?: string;
    severity?: number; // 1-10
    radiating?: boolean;
  };
  
  // Vitals
  vitals?: {
    temperature?: number;
    heart_rate?: number;
    bp_systolic?: number;
    bp_diastolic?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
  };
  
  // Red flags (checklist)
  red_flags?: RedFlagType[];
  
  // Free text
  notes?: string;
}

export interface EncounterInput {
  patient_id: string;
  encounter_date?: string;
  chief_complaint: string;
  structured_data?: StructuredEncounterData;
}

// Encounter ICD-10 Link
export interface EncounterIcd10 {
  id: string;
  encounter_id: string;
  icd10_id: string;
  source: CodeSource;
  icd10_codes?: Icd10Code; // joined
  created_at: string;
}

// Clinical Analysis Types
export type Likelihood = 'low' | 'medium' | 'high';

export interface PossibleCondition {
  name: string;
  icd10_code?: string;
  likelihood: Likelihood;
  explanation?: string;
}

export interface ClinicalAnalysisResult {
  possible_conditions: PossibleCondition[];
  risk_level: RiskLevel;
  red_flags: string[];
  recommended_questions: string[];
  caution_text: string;
}

// Clinical Analysis Logging
export interface ClinicalAnalysisLogInput {
  user_id: string;
  patient_id?: string | null;
  encounter_id?: string | null;
  input_snapshot: {
    patient: { id: string; sex: Sex; year_of_birth: number | null };
    encounter: {
      id: string;
      chief_complaint: string;
      structured_data: StructuredEncounterData;
    };
  };
  result_snapshot: ClinicalAnalysisResult;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Profile: undefined;
  DocumentScanner: undefined;
  ClinicalTools: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined; // Home screen
  Search: undefined; // ICD-10 search
  Assistant: undefined; // AI Assistant
  Patients: undefined; // Patient management
  Modules: undefined; // Disease modules
  Visit: undefined; // Visit notes
  Profile: undefined;
};

export type PatientsStackParamList = {
  PatientsList: undefined;
  PatientDetail: { patientId: string };
  EncounterDetail: { encounterId: string };
  EncounterForm: { patientId: string; encounterId?: string };
};

export type SearchStackParamList = {
  Icd10Search: undefined;
  Icd10Detail: { code: Icd10Code };
};

export type FavoritesStackParamList = {
  FavoritesList: undefined;
  Icd10Detail: { code: Icd10Code };
};

