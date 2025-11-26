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
  year_of_birth?: number;
  sex?: Sex;
  notes?: string;
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

export interface StructuredEncounterData {
  duration?: DurationValue;
  pain?: PainData;
  fever?: boolean;
  cough?: boolean;
  shortness_of_breath?: boolean;
  red_flags?: RedFlagType[];
  vitals?: VitalsData;
  notes?: string;
}

export type DurationValue = 'hours' | 'days' | 'weeks' | 'months';

export interface PainData {
  present: boolean;
  location?: string;
  severity?: number; // 1-10
}

export interface VitalsData {
  temperature?: number;
  heart_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
}

export type RedFlagType =
  | 'chest_pain'
  | 'sudden_weakness'
  | 'severe_abdominal_pain'
  | 'altered_mental_status'
  | 'difficulty_breathing'
  | 'severe_headache'
  | 'signs_of_stroke';

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
export interface PossibleCondition {
  name: string;
  icd10_code?: string;
  icd10_id?: string;
  likelihood: 'low' | 'medium' | 'high';
  explanation?: string;
}

export interface ClinicalAnalysisResult {
  possible_conditions: PossibleCondition[];
  risk_level: RiskLevel;
  red_flags: string[];
  recommended_questions: string[];
  summary: string;
  caution_text: string;
}

export interface ClinicalAnalysisInput {
  patient: {
    age?: number;
    sex: Sex;
  };
  encounter: {
    chief_complaint: string;
    structured_data: StructuredEncounterData;
  };
  additional_notes?: string;
}

// Clinical Analysis Logging
export interface ClinicalAnalysisLog {
  id: string;
  user_id: string;
  patient_id: string | null;
  encounter_id: string | null;
  input_snapshot: ClinicalAnalysisInput;
  result_snapshot: ClinicalAnalysisResult;
  created_at: string;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Patients: undefined; // NEW in Phase 3
  Search: undefined;
  Assistant: undefined; // Phase 2
  Favorites: undefined;
  Visit: undefined;
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

