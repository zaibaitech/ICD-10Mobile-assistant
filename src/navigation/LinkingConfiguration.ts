import * as Linking from 'expo-linking';

/**
 * Deep linking configuration for ICD-10 Assistant
 * 
 * Supported deep links:
 * - icd10assistant://auth/confirm - Email confirmation
 * - icd10assistant://auth/reset - Password reset
 * - icd10assistant://home - Direct to home screen
 */
const prefix = Linking.createURL('/');

export default {
  prefixes: [prefix, 'icd10assistant://'],
  config: {
    screens: {
      // Auth screens (when not logged in)
      Login: 'login',
      Register: 'register',
      
      // Main app (when logged in)
      Main: {
        screens: {
          Dashboard: 'home',
          Search: 'search',
          Assistant: 'ai',
          Patients: 'patients',
          Nursing: 'nursing',
          Modules: 'modules',
          Visit: 'visit',
        },
      },
      
      // Modal screens
      Profile: 'profile',
      DocumentScanner: 'scanner',
      ClinicalTools: 'tools',
    },
  },
};
