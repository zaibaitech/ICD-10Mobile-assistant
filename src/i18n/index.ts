import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';

const LANGUAGE_KEY = '@icd10_language';

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es'];

// Get stored language or device language
const getStoredLanguage = async (): Promise<string> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored) return stored;
    
    // Default to device language if supported
    const deviceLang = Localization.getLocales()[0]?.languageCode || 'en';
    return SUPPORTED_LANGUAGES.includes(deviceLang) ? deviceLang : 'en';
  } catch {
    return 'en';
  }
};

// Save language preference
export const saveLanguage = async (lang: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Initialize i18n
const initI18n = async () => {
  const language = await getStoredLanguage();

  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4',
      resources: {
        en: { translation: en },
        fr: { translation: fr },
        es: { translation: es },
      },
      lng: language,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;
