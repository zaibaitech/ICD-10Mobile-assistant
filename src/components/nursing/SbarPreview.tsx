import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { SbarReport } from '../../types/nursing';
import { formatVitalSigns } from '../../services/sbar';

interface Props {
  report: SbarReport;
}

export function SbarPreview({ report }: Props) {
  const urgencyColors = {
    routine: '#10b981',
    urgent: '#f59e0b',
    emergent: '#ef4444',
  };

  const urgencyLabels = {
    routine: 'Routine',
    urgent: 'Urgent',
    emergent: 'EMERGENT',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SBAR Report</Text>
        <View
          style={[
            styles.urgencyBadge,
            { backgroundColor: `${urgencyColors[report.urgency]}20` },
          ]}
        >
          <Text style={[styles.urgencyText, { color: urgencyColors[report.urgency] }]}>
            {urgencyLabels[report.urgency]}
          </Text>
        </View>
      </View>

      <Text style={styles.reportType}>
        {report.report_type.replace('_', ' ').toUpperCase()}
      </Text>

      {/* SBAR Sections */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📋</Text>
          <Text style={styles.sectionTitle}>SITUATION</Text>
        </View>
        <Text style={styles.sectionContent}>{report.situation}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📚</Text>
          <Text style={styles.sectionTitle}>BACKGROUND</Text>
        </View>
        <Text style={styles.sectionContent}>{report.background}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🔍</Text>
          <Text style={styles.sectionTitle}>ASSESSMENT</Text>
        </View>
        <Text style={styles.sectionContent}>{report.assessment}</Text>
      </View>

      {/* Vital Signs */}
      {report.vital_signs && (
        <View style={styles.vitalSignsContainer}>
          <Text style={styles.vitalSignsTitle}>📊 Vital Signs</Text>
          <Text style={styles.vitalSignsText}>
            {formatVitalSigns(report.vital_signs)}
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>💡</Text>
          <Text style={styles.sectionTitle}>RECOMMENDATION</Text>
        </View>
        <Text style={styles.sectionContent}>{report.recommendation}</Text>
      </View>

      {/* Recipient */}
      {report.recipient_role && (
        <View style={styles.recipientContainer}>
          <Text style={styles.recipientLabel}>To:</Text>
          <Text style={styles.recipientText}>{report.recipient_role}</Text>
        </View>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>
        Created: {new Date(report.created_at).toLocaleString()}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reportType: {
    fontSize: 13,
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingTop: 12,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  sectionContent: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  vitalSignsContainer: {
    backgroundColor: '#eff6ff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  vitalSignsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  vitalSignsText: {
    fontSize: 14,
    color: '#1e3a8a',
    fontFamily: 'monospace',
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  recipientLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  recipientText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    padding: 16,
  },
});
