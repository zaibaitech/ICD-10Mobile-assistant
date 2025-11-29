import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useVisitContext } from '../context/VisitContext';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';
import { saveLanguage } from '../i18n';
import { useBottomSpacing } from '../hooks/useBottomSpacing';
import { ScreenContainer } from '../components/ScreenContainer';
import { SurfaceCard } from '../components/SurfaceCard';
import { OfflineIndicator } from '../components/OfflineIndicator';

const { width } = Dimensions.get('window');

interface QuickActionProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, title, subtitle, onPress, color }) => (
  <TouchableOpacity
    style={styles.actionCardWrapper}
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={`${title}. ${subtitle}`}
  >
    <SurfaceCard style={styles.actionCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
    </SurfaceCard>
  </TouchableOpacity>
);

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => (
  <SurfaceCard
    style={styles.statCard}
    accessible
    accessibilityRole="text"
    accessibilityLabel={`${label}: ${value}`}
  >
    <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </SurfaceCard>
);

export const DashboardScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { visitCodes } = useVisitContext();
  const navigation = useNavigation();
  const [todayDate, setTodayDate] = useState('');
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const bottomPadding = useBottomSpacing();

  const handleLanguageChange = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await saveLanguage(lang);
    setLanguageMenuVisible(false);
  };

  const getLanguageFlag = () => {
    switch (i18n.language) {
      case 'fr': return '🇫🇷';
      case 'es': return '🇪🇸';
      default: return '🇺🇸';
    }
  };

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setTodayDate(today.toLocaleDateString(undefined, options));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 18) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };

  const quickActions = [
    {
      icon: 'search',
      title: t('dashboard.searchCodes'),
      subtitle: t('dashboard.searchCodesDesc'),
      onPress: () => navigation.navigate('Search' as never),
      color: Colors.primary,
    },
    {
      icon: 'camera',
      title: 'Scan Document',
      subtitle: 'Extract ICD-10 codes from images',
      onPress: () => navigation.navigate('DocumentScanner' as never),
      color: '#16a085',
    },
    {
      icon: 'flask',
      title: 'Clinical Tools',
      subtitle: 'Drug interactions & lab interpreter',
      onPress: () => navigation.navigate('ClinicalTools' as never),
      color: '#9b59b6',
    },
    {
      icon: 'chatbubbles',
      title: t('dashboard.aiAssistant'),
      subtitle: t('dashboard.aiAssistantDesc'),
      onPress: () => navigation.navigate('Assistant' as never),
      color: Colors.accent,
    },
    {
      icon: 'medical',
      title: 'Disease Modules',
      subtitle: 'WHO guidelines for malaria, TB, dengue',
      onPress: () => navigation.navigate('Modules' as never),
      color: '#e74c3c',
    },
    {
      icon: 'document-text',
      title: t('dashboard.currentVisit'),
      subtitle: `${visitCodes.length} ${t('dashboard.codesAdded')}`,
      onPress: () => navigation.navigate('Visit' as never),
      color: Colors.danger,
    },
  ];

  return (
    <ScreenContainer
      scrollable
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomPadding }]}
    >
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>Dr. {user?.email?.split('@')[0] || 'User'}</Text>
          <Text style={styles.date}>{todayDate}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.languageButton}
            onPress={() => setLanguageMenuVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={t('profile.language')}
          >
            <Text style={styles.languageFlag}>{getLanguageFlag()}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}
            accessibilityRole="button"
            accessibilityLabel={t('profile.title', { defaultValue: 'Profile' })}
          >
            <Ionicons name="person-circle" size={48} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={languageMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageMenuVisible(false)}
        >
          <View style={styles.languageMenu}>
            <Text style={styles.languageMenuTitle}>{t('profile.language')}</Text>
            
            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'en' && styles.languageOptionActive
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={styles.languageOptionFlag}>🇺🇸</Text>
              <Text style={[
                styles.languageOptionText,
                i18n.language === 'en' && styles.languageOptionTextActive
              ]}>
                English
              </Text>
              {i18n.language === 'en' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'fr' && styles.languageOptionActive
              ]}
              onPress={() => handleLanguageChange('fr')}
            >
              <Text style={styles.languageOptionFlag}>🇫🇷</Text>
              <Text style={[
                styles.languageOptionText,
                i18n.language === 'fr' && styles.languageOptionTextActive
              ]}>
                Français
              </Text>
              {i18n.language === 'fr' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'es' && styles.languageOptionActive
              ]}
              onPress={() => handleLanguageChange('es')}
            >
              <Text style={styles.languageOptionFlag}>🇪🇸</Text>
              <Text style={[
                styles.languageOptionText,
                i18n.language === 'es' && styles.languageOptionTextActive
              ]}>
                Español
              </Text>
              {i18n.language === 'es' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>{t('dashboard.todayOverview')}</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="document-text"
            value={visitCodes.length}
            label={t('dashboard.activeCodes')}
            color={Colors.primary}
          />
          <StatCard
            icon="calendar"
            value="0"
            label={t('dashboard.encounters')}
            color={Colors.secondary}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            icon="heart"
            value="0"
            label={t('dashboard.favorites')}
            color={Colors.danger}
          />
          <StatCard
            icon="people"
            value="0"
            label={t('dashboard.patients')}
            color={Colors.accent}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        <FlatList
          data={quickActions}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <QuickAction
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              onPress={item.onPress}
              color={item.color}
            />
          )}
          scrollEnabled={false}
        />
      </View>

      {/* Current Visit Summary */}
      {visitCodes.length > 0 && (
        <View style={styles.visitSection}>
          <View style={styles.visitHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard.currentVisitSummary')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Visit' as never)}>
              <Text style={styles.viewAllText}>{t('dashboard.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <SurfaceCard style={styles.visitCard}>
            <Ionicons name="document-text" size={24} color={Colors.primary} />
            <View style={styles.visitInfo}>
              <Text style={styles.visitCount}>
                {visitCodes.length} {t('dashboard.diagnosisCodes')}
              </Text>
              <Text style={styles.visitSubtext}>{t('dashboard.readyToDocument')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </SurfaceCard>
        </View>
      )}

      {/* Info Card */}
        <SurfaceCard elevated={false} style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={Colors.primary} />
        <Text style={styles.infoText}>{t('dashboard.tipMessage')}</Text>
        </SurfaceCard>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 0,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...Shadows.medium,
  },
  greeting: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  languageButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  languageFlag: {
    fontSize: 28,
  },
  profileButton: {
    marginTop: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  languageMenu: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.large,
  },
  languageMenuTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  languageOptionActive: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  languageOptionFlag: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  languageOptionText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: Typography.fontWeight.medium,
  },
  languageOptionTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  statsSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    width: (width - 52) / 2,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  actionCardWrapper: {
    marginBottom: Spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  visitSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  visitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  visitInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  visitCount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  visitSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  infoCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryTransparent,
    borderWidth: 0,
  },
  infoText: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryDark,
    lineHeight: 20,
  },
});
