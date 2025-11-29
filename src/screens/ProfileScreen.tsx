import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { saveLanguage } from '../i18n';

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const handleLanguageChange = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await saveLanguage(lang);
    setCurrentLanguage(lang);
  };

  const handleSignOut = () => {
    Alert.alert(t('profile.confirmLogout'), t('profile.confirmLogout'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile.title')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.label}>{t('auth.email')}</Text>
          <Text style={styles.value}>{user?.email || 'Not available'}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.valueSmall}>{user?.id || 'Not available'}</Text>
        </View>

        <View style={styles.divider} />

        {/* Language Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                currentLanguage === 'en' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  currentLanguage === 'en' && styles.languageButtonTextActive,
                ]}
              >
                🇺🇸 {t('profile.english')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                currentLanguage === 'fr' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange('fr')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  currentLanguage === 'fr' && styles.languageButtonTextActive,
                ]}
              >
                🇫🇷 {t('profile.french')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                currentLanguage === 'es' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange('es')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  currentLanguage === 'es' && styles.languageButtonTextActive,
                ]}
              >
                🇪🇸 Español
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.appInfo')}</Text>
          <View style={styles.appInfo}>
            <Text style={styles.appInfoTitle}>ICD-10 Mobile Assistant</Text>
            <Text style={styles.appInfoText}>{t('profile.version')} 1.0.0 (MVP)</Text>
            <Text style={styles.appInfoText}>
              A documentation tool for healthcare professionals
            </Text>
            <Text style={styles.disclaimer}>
              {'\n'}Disclaimer: This is a documentation tool, NOT a medical decision or diagnosis
              tool.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  valueSmall: {
    fontSize: 12,
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  languageButtons: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  languageButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  languageButtonActive: {
    backgroundColor: '#3498db',
  },
  languageButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  languageButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  appInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  disclaimer: {
    fontSize: 12,
    color: '#e74c3c',
    fontStyle: 'italic',
    marginTop: 8,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
