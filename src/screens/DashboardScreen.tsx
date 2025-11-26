import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useVisitContext } from '../context/VisitContext';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

interface QuickActionProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, title, subtitle, onPress, color }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <View style={styles.actionContent}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
  </TouchableOpacity>
);

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { visitCodes } = useVisitContext();
  const navigation = useNavigation();
  const [todayDate, setTodayDate] = useState('');

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
      icon: 'chatbubbles',
      title: t('dashboard.aiAssistant'),
      subtitle: t('dashboard.aiAssistantDesc'),
      onPress: () => navigation.navigate('Assistant' as never),
      color: Colors.accent,
    },
    {
      icon: 'people',
      title: t('dashboard.patients'),
      subtitle: t('dashboard.patientsDesc'),
      onPress: () => navigation.navigate('Patients' as never),
      color: Colors.secondary,
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>Dr. {user?.email?.split('@')[0] || 'User'}</Text>
          <Text style={styles.date}>{todayDate}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile' as never)}
        >
          <Ionicons name="person-circle" size={48} color={Colors.primary} />
        </TouchableOpacity>
      </View>

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
        {quickActions.map((action, index) => (
          <QuickAction
            key={index}
            icon={action.icon}
            title={action.title}
            subtitle={action.subtitle}
            onPress={action.onPress}
            color={action.color}
          />
        ))}
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
          <View style={styles.visitCard}>
            <Ionicons name="document-text" size={24} color={Colors.primary} />
            <View style={styles.visitInfo}>
              <Text style={styles.visitCount}>
                {visitCodes.length} {t('dashboard.diagnosisCodes')}
              </Text>
              <Text style={styles.visitSubtext}>{t('dashboard.readyToDocument')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </View>
        </View>
      )}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={Colors.primary} />
        <Text style={styles.infoText}>{t('dashboard.tipMessage')}</Text>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  profileButton: {
    marginTop: Spacing.sm,
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
    marginBottom: Spacing.md,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: (width - 52) / 2,
    alignItems: 'center',
    ...Shadows.small,
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
  actionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.small,
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
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.small,
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
    backgroundColor: Colors.primaryTransparent,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryDark,
    lineHeight: 20,
  },
});
