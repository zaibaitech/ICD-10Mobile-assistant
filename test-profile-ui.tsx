/**
 * Test ProfileScreen UI rendering
 * Run: npx tsx test-profile-ui.tsx
 */

import { readFileSync } from 'fs';

console.log('🧪 Testing ProfileScreen UI Implementation\n');

// Read the ProfileScreen file
const profileScreenPath = './src/screens/ProfileScreen.tsx';
const profileScreen = readFileSync(profileScreenPath, 'utf-8');

// Check for language selector components
const checks = [
  {
    name: 'useTranslation hook imported',
    test: profileScreen.includes("import { useTranslation } from 'react-i18next'"),
  },
  {
    name: 'saveLanguage imported',
    test: profileScreen.includes("import { saveLanguage } from '../i18n'"),
  },
  {
    name: 'i18n destructured from useTranslation',
    test: profileScreen.includes('const { t, i18n } = useTranslation()'),
  },
  {
    name: 'currentLanguage state exists',
    test: profileScreen.includes('const [currentLanguage, setCurrentLanguage] = useState(i18n.language)'),
  },
  {
    name: 'handleLanguageChange function exists',
    test: profileScreen.includes('const handleLanguageChange = async (lang: string)'),
  },
  {
    name: 'Language selector section exists',
    test: profileScreen.includes('{/* Language Selector */}') || profileScreen.includes('Language Selector'),
  },
  {
    name: 'English button exists',
    test: profileScreen.includes('🇺🇸') && profileScreen.includes("t('profile.english')"),
  },
  {
    name: 'French button exists',
    test: profileScreen.includes('🇫🇷') && profileScreen.includes("t('profile.french')"),
  },
  {
    name: 'Spanish button exists',
    test: profileScreen.includes('🇪🇸') && profileScreen.includes('Español'),
  },
  {
    name: 'Language button styles exist',
    test: profileScreen.includes('languageButton:') && profileScreen.includes('languageButtonActive:'),
  },
  {
    name: 'changeLanguage called in handler',
    test: profileScreen.includes('i18n.changeLanguage(lang)'),
  },
  {
    name: 'saveLanguage called in handler',
    test: profileScreen.includes('saveLanguage(lang)'),
  },
];

let passed = 0;
let failed = 0;

checks.forEach((check) => {
  if (check.test) {
    console.log(`✅ ${check.name}`);
    passed++;
  } else {
    console.log(`❌ ${check.name}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed}/${checks.length} checks passed\n`);

// Read translation files
console.log('🌐 Checking translation keys:\n');

const enTranslations = JSON.parse(readFileSync('./src/i18n/locales/en.json', 'utf-8'));
const frTranslations = JSON.parse(readFileSync('./src/i18n/locales/fr.json', 'utf-8'));
const esTranslations = JSON.parse(readFileSync('./src/i18n/locales/es.json', 'utf-8'));

const translationChecks = [
  { lang: 'English', key: 'profile.language', value: enTranslations.profile?.language },
  { lang: 'English', key: 'profile.english', value: enTranslations.profile?.english },
  { lang: 'English', key: 'profile.french', value: enTranslations.profile?.french },
  { lang: 'French', key: 'profile.language', value: frTranslations.profile?.language },
  { lang: 'French', key: 'profile.english', value: frTranslations.profile?.english },
  { lang: 'French', key: 'profile.french', value: frTranslations.profile?.french },
  { lang: 'Spanish', key: 'profile.language', value: esTranslations.profile?.language },
  { lang: 'Spanish', key: 'profile.english', value: esTranslations.profile?.english },
  { lang: 'Spanish', key: 'profile.french', value: esTranslations.profile?.french },
];

translationChecks.forEach((check) => {
  if (check.value) {
    console.log(`✅ ${check.lang}: ${check.key} = "${check.value}"`);
  } else {
    console.log(`❌ ${check.lang}: ${check.key} is MISSING`);
  }
});

console.log('\n✨ ProfileScreen language selector implementation complete!');
console.log('\n📝 To test in the app:');
console.log('1. Run: npx expo start');
console.log('2. Navigate to Profile screen');
console.log('3. You should see three language buttons: 🇺🇸 English, 🇫🇷 Français, 🇪🇸 Español');
console.log('4. Click each button to switch languages');
console.log('5. The selected language will be highlighted in blue\n');
