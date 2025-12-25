import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NandaDiagnosis, NicIntervention, NocOutcome } from '../../types/nursing';
import { getNandaById, getRecommendedNics, getRecommendedNocs } from '../../services/nanda';

interface Props {
  route: {
    params: {
      nandaId: string;
    };
  };
}

export function NandaDetailScreen({ route }: Props) {
  const { nandaId } = route.params;
  const [nanda, setNanda] = useState<NandaDiagnosis | null>(null);
  const [nics, setNics] = useState<NicIntervention[]>([]);
  const [nocs, setNocs] = useState<NocOutcome[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [nandaId]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const [nandaData, nicsData, nocsData] = await Promise.all([
        getNandaById(nandaId),
        getRecommendedNics(nandaId),
        getRecommendedNocs(nandaId),
      ]);

      if (!nandaData) {
        Alert.alert('Error', 'NANDA diagnosis not found');
        return;
      }

      setNanda(nandaData);
      setNics(nicsData);
      setNocs(nocsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!nanda) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>NANDA diagnosis not found</Text>
      </View>
    );
  }

  const typeColors = {
    actual: '#ef4444',
    risk: '#f59e0b',
    health_promotion: '#10b981',
    syndrome: '#8b5cf6',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.codeContainer}>
          <Text style={styles.code}>{nanda.code}</Text>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: `${typeColors[nanda.diagnosis_type]}20` },
            ]}
          >
            <Text style={[styles.typeText, { color: typeColors[nanda.diagnosis_type] }]}>
              {nanda.diagnosis_type.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <Text style={styles.label}>{nanda.label}</Text>
        <Text style={styles.domain}>📋 {nanda.domain}</Text>
      </View>

      {/* Definition */}
      {nanda.definition && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Definition</Text>
          <Text style={styles.sectionText}>{nanda.definition}</Text>
        </View>
      )}

      {/* Defining Characteristics */}
      {nanda.defining_characteristics && nanda.defining_characteristics.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✓ Defining Characteristics</Text>
          {nanda.defining_characteristics.map((char, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listItemText}>{char}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Risk Factors */}
      {nanda.risk_factors && nanda.risk_factors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Risk Factors</Text>
          {nanda.risk_factors.map((factor, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listItemText}>{factor}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Related Factors */}
      {nanda.related_factors && nanda.related_factors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Related Factors</Text>
          {nanda.related_factors.map((factor, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listItemText}>{factor}</Text>
            </View>
          ))}
        </View>
      )}

      {/* NNN Linkages Banner */}
      <View style={styles.linkagesBanner}>
        <Text style={styles.linkagesTitle}>NNN Linkages</Text>
        <Text style={styles.linkagesSubtitle}>Evidence-based interventions & outcomes</Text>
      </View>

      {/* NIC Interventions */}
      {nics.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Recommended NIC Interventions</Text>
          {nics.map((nic) => (
            <View key={nic.id} style={styles.interventionCard}>
              <View style={styles.interventionHeader}>
                <Text style={styles.interventionCode}>{nic.code}</Text>
              </View>
              <Text style={styles.interventionLabel}>{nic.label}</Text>
              {nic.definition && (
                <Text style={styles.interventionDefinition}>{nic.definition}</Text>
              )}
              {nic.activities && nic.activities.length > 0 && (
                <View style={styles.activitiesContainer}>
                  <Text style={styles.activitiesTitle}>Activities:</Text>
                  {nic.activities.slice(0, 3).map((activity, index) => (
                    <Text key={index} style={styles.activityText}>
                      • {activity}
                    </Text>
                  ))}
                  {nic.activities.length > 3 && (
                    <Text style={styles.moreActivities}>
                      +{nic.activities.length - 3} more activities
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* NOC Outcomes */}
      {nocs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Recommended NOC Outcomes</Text>
          {nocs.map((noc) => (
            <View key={noc.id} style={styles.outcomeCard}>
              <View style={styles.outcomeHeader}>
                <Text style={styles.outcomeCode}>{noc.code}</Text>
              </View>
              <Text style={styles.outcomeLabel}>{noc.label}</Text>
              {noc.definition && (
                <Text style={styles.outcomeDefinition}>{noc.definition}</Text>
              )}
              {noc.indicators && noc.indicators.length > 0 && (
                <View style={styles.indicatorsContainer}>
                  <Text style={styles.indicatorsTitle}>Indicators:</Text>
                  {noc.indicators.slice(0, 3).map((indicator, index) => (
                    <Text key={index} style={styles.indicatorText}>
                      • {indicator}
                    </Text>
                  ))}
                  {noc.indicators.length > 3 && (
                    <Text style={styles.moreIndicators}>
                      +{noc.indicators.length - 3} more indicators
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  code: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'monospace',
    marginRight: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 28,
  },
  domain: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 15,
    color: '#6b7280',
    marginRight: 8,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  linkagesBanner: {
    backgroundColor: '#3b82f6',
    padding: 20,
    marginTop: 12,
  },
  linkagesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  linkagesSubtitle: {
    fontSize: 14,
    color: '#bfdbfe',
  },
  interventionCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  interventionHeader: {
    marginBottom: 8,
  },
  interventionCode: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    fontFamily: 'monospace',
  },
  interventionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 6,
  },
  interventionDefinition: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
    marginBottom: 8,
  },
  activitiesContainer: {
    marginTop: 8,
  },
  activitiesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  activityText: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
    marginLeft: 8,
  },
  moreActivities: {
    fontSize: 11,
    color: '#16a34a',
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 8,
  },
  outcomeCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  outcomeHeader: {
    marginBottom: 8,
  },
  outcomeCode: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350f',
    fontFamily: 'monospace',
  },
  outcomeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 6,
  },
  outcomeDefinition: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
    marginBottom: 8,
  },
  indicatorsContainer: {
    marginTop: 8,
  },
  indicatorsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350f',
    marginBottom: 4,
  },
  indicatorText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 18,
    marginLeft: 8,
  },
  moreIndicators: {
    fontSize: 11,
    color: '#a16207',
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 8,
  },
});
