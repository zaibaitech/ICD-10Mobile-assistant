import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NursingStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<NursingStackParamList>;

interface FeatureCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  color: string;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  color,
  onPress,
}) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon} size={32} color="white" />
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#666" />
  </TouchableOpacity>
);

export default function NursingHomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nursing Care Tools</Text>
          <Text style={styles.headerSubtitle}>
            Evidence-based nursing diagnosis, interventions, and outcomes
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          {/* NANDA Diagnoses */}
          <FeatureCard
            icon="medical"
            title="NANDA-I Diagnoses"
            description="Search 26 nursing diagnoses with NIC/NOC linkages"
            color="#3498db"
            onPress={() => navigation.navigate('NandaSearch')}
          />

          {/* Care Plan Builder */}
          <FeatureCard
            icon="create"
            title="Care Plan Builder"
            description="Create care plans with ICD-10 auto-generation"
            color="#2ecc71"
            onPress={() => navigation.navigate('CarePlanBuilder')}
          />

          {/* Care Plan List */}
          <FeatureCard
            icon="list"
            title="Care Plan History"
            description="View and manage patient care plans"
            color="#9b59b6"
            onPress={() => navigation.navigate('CarePlanList')}
          />

          {/* SBAR Generator */}
          <FeatureCard
            icon="clipboard"
            title="SBAR Report"
            description="Generate professional handoff reports"
            color="#e67e22"
            onPress={() => navigation.navigate('SbarGenerator')}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#3498db" />
            <Text style={styles.infoTitle}>NNN Linkages</Text>
            <Text style={styles.infoText}>
              All diagnoses include evidence-based NANDA-NIC-NOC linkages for
              comprehensive care planning
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="link" size={24} color="#2ecc71" />
            <Text style={styles.infoTitle}>ICD-10 Bridge</Text>
            <Text style={styles.infoText}>
              16 ICD-10 to NANDA mappings help you identify nursing diagnoses
              from medical diagnoses
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="trending-up" size={24} color="#9b59b6" />
            <Text style={styles.infoTitle}>Evidence Levels</Text>
            <Text style={styles.infoText}>
              Research-based, clinical practice, and expert consensus evidence
              supports all recommendations
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>26</Text>
            <Text style={styles.statLabel}>NANDA Diagnoses</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>NIC Interventions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>9</Text>
            <Text style={styles.statLabel}>NOC Outcomes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>16</Text>
            <Text style={styles.statLabel}>ICD-10 Mappings</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 18,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});
