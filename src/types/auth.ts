/**
 * Enhanced Authentication Types
 * User roles, profiles, and authentication state
 */

import type { User, Session } from '@supabase/supabase-js';

// ============================================
// User Roles
// ============================================

export type UserRole = 
  | 'doctor' 
  | 'nurse' 
  | 'pharmacist' 
  | 'chw'           // Community Health Worker
  | 'student'       // Medical Student
  | 'other';

export type IcdVariant = 
  | 'who'           // WHO International
  | 'cm'            // Clinical Modification (US)
  | 'am';           // Australian Modification

// ============================================
// User Profile Interface
// ============================================

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  role: UserRole;
  specialty: string | null;
  license_number: string | null;
  institution: string | null;
  country_code: string | null;
  preferred_language: string;
  preferred_icd_variant: IcdVariant;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Sign Up Data
// ============================================

export interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  specialty?: string;
  institution?: string;
  country_code?: string;
  preferred_language?: string;
  preferred_icd_variant?: IcdVariant;
}

// ============================================
// Authentication State
// ============================================

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ============================================
// Role Display Labels
// ============================================

export const ROLE_LABELS: Record<UserRole, string> = {
  doctor: 'Doctor / Physician',
  nurse: 'Nurse',
  pharmacist: 'Pharmacist',
  chw: 'Community Health Worker',
  student: 'Medical Student',
  other: 'Other Healthcare Professional',
};

// ============================================
// Role Icons (for UI)
// ============================================

export const ROLE_ICONS: Record<UserRole, string> = {
  doctor: '👨‍⚕️',
  nurse: '👩‍⚕️',
  pharmacist: '💊',
  chw: '🏥',
  student: '📚',
  other: '➕',
};

// ============================================
// Role Descriptions
// ============================================

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  doctor: 'Full access to diagnosis coding, clinical documentation, and AI analysis',
  nurse: 'Access to patient documentation, care coordination, and symptom recording',
  pharmacist: 'Medication-related coding and drug interaction awareness',
  chw: 'Simplified symptom collection and referral coding',
  student: 'Learning mode with ICD-10 search and educational features',
  other: 'Basic ICD-10 search and assistant features',
};

// ============================================
// Role-Specific Features
// ============================================

export const ROLE_FEATURES: Record<UserRole, string[]> = {
  doctor: [
    'icd10_search',
    'patient_management',
    'encounter_management',
    'nursing_care_plans',
    'ai_clinical_analysis',
    'assistant_chat',
    'favorites',
    'voice_input',
    'image_processing',
  ],
  nurse: [
    'icd10_search',
    'patient_management',
    'encounter_management',
    'nursing_care_plans',
    'assistant_chat',
    'favorites',
    'voice_input',
  ],
  pharmacist: [
    'icd10_search',
    'assistant_chat',
    'favorites',
    'voice_input',
  ],
  chw: [
    'icd10_search',
    'patient_management',
    'encounter_management',
    'assistant_chat',
    'favorites',
    'voice_input',
  ],
  student: [
    'icd10_search',
    'assistant_chat',
    'favorites',
    'voice_input',
  ],
  other: [
    'icd10_search',
    'assistant_chat',
    'favorites',
    'voice_input',
  ],
};

// ============================================
// Feature Labels
// ============================================

export const FEATURE_LABELS: Record<string, string> = {
  icd10_search: 'ICD-10 Code Search',
  patient_management: 'Patient Management',
  encounter_management: 'Encounter Management',
  nursing_care_plans: 'Nursing Care Plans (NANDA-NIC-NOC)',
  ai_clinical_analysis: 'AI Clinical Analysis',
  assistant_chat: 'AI Assistant Chat',
  favorites: 'Favorites & Bookmarks',
  voice_input: 'Voice Input',
  image_processing: 'Medical Image Processing',
};

// ============================================
// Helper Functions
// ============================================

/**
 * Check if a role has access to a specific feature
 */
export function hasRoleAccess(role: UserRole, feature: string): boolean {
  const allowedFeatures = ROLE_FEATURES[role] || [];
  return allowedFeatures.includes(feature);
}

/**
 * Get all features available for a role
 */
export function getRoleFeatures(role: UserRole): string[] {
  return ROLE_FEATURES[role] || [];
}

/**
 * Get features not available for a role
 */
export function getUnavailableFeatures(role: UserRole): string[] {
  const allFeatures = Object.keys(FEATURE_LABELS);
  const roleFeatures = ROLE_FEATURES[role] || [];
  return allFeatures.filter(feature => !roleFeatures.includes(feature));
}

/**
 * Check if a role requires medical license verification
 */
export function requiresLicense(role: UserRole): boolean {
  return ['doctor', 'nurse', 'pharmacist'].includes(role);
}

/**
 * Get role category for grouping
 */
export function getRoleCategory(role: UserRole): 'clinical' | 'community' | 'learning' | 'other' {
  switch (role) {
    case 'doctor':
    case 'nurse':
    case 'pharmacist':
      return 'clinical';
    case 'chw':
      return 'community';
    case 'student':
      return 'learning';
    default:
      return 'other';
  }
}

// ============================================
// Type Guards
// ============================================

export function isUserProfile(obj: any): obj is UserProfile {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.role === 'string' &&
    ['doctor', 'nurse', 'pharmacist', 'chw', 'student', 'other'].includes(obj.role)
  );
}

export function isValidUserRole(role: string): role is UserRole {
  return ['doctor', 'nurse', 'pharmacist', 'chw', 'student', 'other'].includes(role);
}

export function isValidIcdVariant(variant: string): variant is IcdVariant {
  return ['who', 'cm', 'am'].includes(variant);
}

// ============================================
// Constants
// ============================================

export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_ICD_VARIANT: IcdVariant = 'who';
export const MIN_PASSWORD_LENGTH = 8;

// All available roles as array
export const ALL_ROLES: UserRole[] = ['doctor', 'nurse', 'pharmacist', 'chw', 'student', 'other'];
