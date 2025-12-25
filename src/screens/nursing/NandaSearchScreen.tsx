import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NandaDiagnosis } from '../../types/nursing';
import { searchNandaDiagnoses, getPopularNandaDiagnoses } from '../../services/nanda';
import { NandaCard } from '../../components/nursing/NandaCard';

export function NandaSearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<NandaDiagnosis[]>([]);
  const [popular, setPopular] = useState<NandaDiagnosis[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'actual' | 'risk' | 'health_promotion' | 'syndrome' | null>(null);

  useEffect(() => {
    loadPopular();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchQuery, selectedDomain, selectedType]);

  const loadPopular = async () => {
    try {
      const data = await getPopularNandaDiagnoses(10);
      setPopular(data);
    } catch (error) {
      console.error('Failed to load popular diagnoses:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const data = await searchNandaDiagnoses({
        query: searchQuery,
        domain: selectedDomain || undefined,
        diagnosisType: selectedType || undefined,
        limit: 50,
      });
      setResults(data);
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search NANDA diagnoses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNandaPress = (nanda: NandaDiagnosis) => {
    navigation.navigate('NandaDetail', { nandaId: nanda.id });
  };

  const domains = [
    'Health Promotion',
    'Nutrition',
    'Elimination and Exchange',
    'Activity/Rest',
    'Perception/Cognition',
    'Self-Perception',
    'Role Relationships',
    'Sexuality',
    'Coping/Stress Tolerance',
    'Life Principles',
    'Safety/Protection',
    'Comfort',
    'Growth/Development',
  ];

  const types: Array<'actual' | 'risk' | 'health_promotion' | 'syndrome'> = [
    'actual',
    'risk',
    'health_promotion',
    'syndrome',
  ];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search NANDA diagnoses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {loading && <ActivityIndicator style={styles.searchSpinner} />}
      </View>

      {/* Filter Pills */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Type:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={types}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterPill,
                selectedType === item && styles.filterPillActive,
              ]}
              onPress={() => setSelectedType(selectedType === item ? null : item)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedType === item && styles.filterPillTextActive,
                ]}
              >
                {item.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results or Popular */}
      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NandaCard
              nanda={item}
              onPress={() => handleNandaPress(item)}
              showDetails
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : searchQuery.length >= 2 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No diagnoses found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <View style={styles.popularContainer}>
          <Text style={styles.popularTitle}>🔥 Popular Diagnoses</Text>
          <FlatList
            data={popular}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NandaCard
                nanda={item}
                onPress={() => handleNandaPress(item)}
                showDetails
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchSpinner: {
    marginLeft: 12,
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  filterPill: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#3b82f6',
  },
  filterPillText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  popularContainer: {
    flex: 1,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    padding: 16,
    paddingBottom: 8,
  },
});
