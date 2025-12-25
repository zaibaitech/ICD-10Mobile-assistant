import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NursingCarePlan } from '../../types/nursing';
import { getCarePlansForPatient, getAllCarePlansForCurrentUser } from '../../services/carePlan';

interface Props {
  route?: {
    params?: {
      patientId?: string;
    };
  };
}

export function CarePlanListScreen({ route }: Props) {
  const { patientId } = route?.params || {};
  const navigation = useNavigation();

  const [carePlans, setCarePlans] = useState<NursingCarePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCarePlans();
  }, []);

  const loadCarePlans = async () => {
    setLoading(true);
    try {
      const data = patientId 
        ? await getCarePlansForPatient(patientId)
        : await getAllCarePlansForCurrentUser();
      setCarePlans(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load care plans');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCarePlanPress = (carePlan: NursingCarePlan) => {
    // TODO: Create CarePlanDetail screen to view/edit individual care plan
    const message = `${carePlan.name}\n\nStatus: ${carePlan.status}\nItems: ${carePlan.items?.length || 0}`;
    
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert('Care Plan', message, [{ text: 'OK' }]);
    }
  };

  const handleCreateCarePlan = () => {
    if (patientId) {
      navigation.navigate('CarePlanBuilder', { patientId });
    } else {
      Alert.alert(
        'Select Patient',
        'Go to the Patients tab and select a patient to create a care plan.',
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (carePlans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No Care Plans</Text>
        <Text style={styles.emptyText}>
          {patientId 
            ? 'Create your first care plan for this patient using the ICD-10 → NANDA bridge'
            : 'No care plans created yet. Select a patient from the Patients tab to create care plans.'}
        </Text>
        {patientId && (
          <TouchableOpacity style={styles.createButton} onPress={handleCreateCarePlan}>
            <Text style={styles.createButtonText}>+ Create Care Plan</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Info */}
      {!patientId && (
        <View style={styles.infoHeader}>
          <Text style={styles.infoText}>
            📋 Showing all your care plans across all patients
          </Text>
        </View>
      )}
      
      <FlatList
        data={carePlans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.carePlanCard}
            onPress={() => handleCarePlanPress(item)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.carePlanName}>{item.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: item.status === 'active' ? '#dcfce7' : '#f3f4f6' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: item.status === 'active' ? '#166534' : '#6b7280' },
                  ]}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {item.items && item.items.length > 0 && (
              <View style={styles.itemsSummary}>
                <Text style={styles.itemsCount}>
                  {item.items.length} care plan items
                </Text>
                <Text style={styles.activeItems}>
                  {item.items.filter((i) => i.status === 'active').length} active
                </Text>
              </View>
            )}

            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Start:</Text>
              <Text style={styles.dateValue}>
                {new Date(item.start_date).toLocaleDateString()}
              </Text>
              {item.end_date && (
                <>
                  <Text style={styles.dateSeparator}>•</Text>
                  <Text style={styles.dateLabel}>End:</Text>
                  <Text style={styles.dateValue}>
                    {new Date(item.end_date).toLocaleDateString()}
                  </Text>
                </>
              )}
            </View>

            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addCarePlanButton}
            onPress={handleCreateCarePlan}
          >
            <Text style={styles.addCarePlanText}>+ Add Another Care Plan</Text>
          </TouchableOpacity>
        }
      />
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  carePlanCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carePlanName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemsCount: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 12,
  },
  activeItems: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 4,
  },
  dateValue: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  dateSeparator: {
    fontSize: 12,
    color: '#d1d5db',
    marginHorizontal: 8,
  },
  arrow: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'right',
  },
  addCarePlanButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addCarePlanText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600',
  },
  infoHeader: {
    backgroundColor: '#eff6ff',
    padding: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
  },
});
