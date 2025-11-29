import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getAllModules, getModulesBySearch, DiseaseModule } from '../data/disease-modules';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';
import { SurfaceCard } from '../components/SurfaceCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomSpacing } from '../hooks/useBottomSpacing';

interface ModuleCardProps {
  module: DiseaseModule;
  onPress: () => void;
}

const moduleColors: Record<string, string> = {
  malaria: Colors.danger,
  tuberculosis: Colors.secondary,
  dengue: Colors.warning,
};

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onPress }) => {
  const color = moduleColors[module.id] || Colors.primary;

  return (
    <TouchableOpacity
      style={styles.moduleCardWrapper}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${module.name}. ${module.icd10Codes.length} codes, ${module.size}`}
    >
      <SurfaceCard style={styles.moduleCard}>
        <View style={[styles.moduleIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name="medical" size={32} color={color} />
        </View>

        <View style={styles.moduleInfo}>
          <Text style={styles.moduleName}>{module.name}</Text>
          <Text style={styles.moduleStats}>
            {module.icd10Codes.length} ICD-10 codes • {module.size} • Offline ready
          </Text>
          <View style={styles.moduleTags}>
            <View style={styles.tag}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.tagText}>WHO Guidelines</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="cloud-offline" size={14} color={Colors.textSecondary} />
              <Text style={styles.tagText}>100% Offline</Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
      </SurfaceCard>
    </TouchableOpacity>
  );
};

interface ModuleDetailProps {
  module: DiseaseModule;
  visible: boolean;
  onClose: () => void;
}

const ModuleDetail: React.FC<ModuleDetailProps> = ({ module, visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'codes' | 'treatment' | 'prevention'>('overview');
  const insets = useSafeAreaInsets();
  const modalBottomPadding = Math.max(insets.bottom, 24);

  const renderOverview = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: modalBottomPadding }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnostic Criteria</Text>
        {module.diagnosticCriteria.map((criteria, index) => {
          const severityBg =
            criteria.severity === 'severe'
              ? Colors.dangerTransparent
              : criteria.severity === 'moderate'
              ? Colors.warning + '20'
              : Colors.success + '15';
          const severityColor =
            criteria.severity === 'severe'
              ? Colors.danger
              : criteria.severity === 'moderate'
              ? Colors.warning
              : Colors.success;

          return (
            <View key={index} style={styles.criteriaItem}>
              <View style={[styles.severityBadge, { backgroundColor: severityBg }]}>
                <Text style={[styles.severityText, { color: severityColor }]}>
                  {criteria.severity.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.symptomText}>{criteria.symptom}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚨 Red Flags</Text>
        {module.redFlags.map((flag, index) => (
          <View key={index} style={styles.redFlagItem}>
            <Ionicons name="warning" size={20} color={Colors.danger} />
            <Text style={styles.redFlagText}>{flag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Differential Diagnosis</Text>
        {module.differentialDiagnosis.map((diagnosis, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{diagnosis}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderCodes = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: modalBottomPadding }}>
      {module.icd10Codes.map((code, index) => (
        <View key={index} style={styles.codeItem}>
          <View style={styles.codeHeader}>
            <Text style={styles.codeCode}>{code.code}</Text>
          </View>
          <Text style={styles.codeTitle}>{code.title}</Text>
          <Text style={styles.codeDescription}>{code.description}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderTreatment = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: modalBottomPadding }}>
      <View style={styles.section}>
        <Text style={styles.treatmentLevel}>Mild Cases</Text>
        {module.treatmentGuidelines.mild.map((step, index) => (
          <View key={index} style={styles.treatmentStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.treatmentText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.treatmentLevel}>Moderate Cases</Text>
        {module.treatmentGuidelines.moderate.map((step, index) => (
          <View key={index} style={styles.treatmentStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.treatmentText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.treatmentLevel, { color: Colors.danger }]}>Severe Cases</Text>
        {module.treatmentGuidelines.severe.map((step, index) => (
          <View key={index} style={styles.treatmentStep}>
            <View style={[styles.stepNumber, { backgroundColor: Colors.danger }]}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.treatmentText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Follow-up Protocol</Text>
        {module.followUp.map((step, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderPrevention = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: modalBottomPadding }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prevention Strategies</Text>
        {module.prevention.map((strategy, index) => (
          <View key={index} style={styles.preventionItem}>
            <View style={styles.preventionIcon}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
            </View>
            <Text style={styles.preventionText}>{strategy}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.modalTitleContainer}>
            <Text style={styles.modalTitle}>{module.name}</Text>
            <Text style={styles.modalSubtitle}>
              WHO Guidelines • Updated {module.lastUpdated}
            </Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'codes' && styles.tabActive]}
            onPress={() => setActiveTab('codes')}
          >
            <Text style={[styles.tabText, activeTab === 'codes' && styles.tabTextActive]}>
              ICD-10
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'treatment' && styles.tabActive]}
            onPress={() => setActiveTab('treatment')}
          >
            <Text style={[styles.tabText, activeTab === 'treatment' && styles.tabTextActive]}>
              Treatment
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'prevention' && styles.tabActive]}
            onPress={() => setActiveTab('prevention')}
          >
            <Text style={[styles.tabText, activeTab === 'prevention' && styles.tabTextActive]}>
              Prevention
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'codes' && renderCodes()}
        {activeTab === 'treatment' && renderTreatment()}
        {activeTab === 'prevention' && renderPrevention()}
      </View>
    </Modal>
  );
};

export const DiseaseModulesScreen: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<DiseaseModule | null>(null);
  const listBottomPadding = useBottomSpacing();

  const modules = searchQuery
    ? getModulesBySearch(searchQuery)
    : getAllModules();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Disease Modules</Text>
        <Text style={styles.subtitle}>WHO Clinical Guidelines - Offline Ready</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search modules..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textTertiary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <SurfaceCard elevated={false} style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={Colors.primary} />
        <Text style={styles.infoText}>
          All modules work 100% offline. Based on WHO guidelines for resource-limited settings.
        </Text>
      </SurfaceCard>

      <FlatList
        data={modules}
        renderItem={({ item }) => (
          <ModuleCard module={item} onPress={() => setSelectedModule(item)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: listBottomPadding }]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No modules found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        }
      />

      {selectedModule && (
        <ModuleDetail
          module={selectedModule}
          visible={!!selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )}
    </View>
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
    paddingBottom: Spacing.xl,
    ...Shadows.medium,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primaryTransparent,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
  },
  infoText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryDark,
    lineHeight: 18,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  moduleCardWrapper: {
    marginBottom: Spacing.md,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  moduleIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  moduleStats: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  moduleTags: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  tagText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    backgroundColor: Colors.surface,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    ...Shadows.medium,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
  },
  modalTitleContainer: {
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  tabContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  severityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  severityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  symptomText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  redFlagItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.dangerTransparent,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  redFlagText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.danger,
    lineHeight: 20,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  bullet: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    marginRight: Spacing.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  listText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  codeItem: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  codeHeader: {
    marginBottom: Spacing.sm,
  },
  codeCode: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  codeTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  codeDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  treatmentLevel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  treatmentStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  stepNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.surface,
  },
  treatmentText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  preventionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  preventionIcon: {
    marginRight: Spacing.sm,
  },
  preventionText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
