import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SearchBar } from '../components/SearchBar';
import { ChapterFilter } from '../components/ChapterFilter';
import { Icd10ListItem } from '../components/Icd10ListItem';
import { searchIcd10Codes, getCommonCodes } from '../services/icd10-api';
import { Icd10Code } from '../types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, SearchStackParamList } from '../types';
import { useBottomSpacing } from '../hooks/useBottomSpacing';
import { ScreenContainer } from '../components/ScreenContainer';

type Icd10SearchScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SearchStackParamList, 'Icd10Search'>,
  BottomTabNavigationProp<MainTabParamList>
>;

interface Props {
  navigation: Icd10SearchScreenNavigationProp;
}

export const Icd10SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('All');
  const [chapters] = useState<string[]>([
    'All',
    'Infectious diseases',
    'Neoplasms',
    'Blood/Immune/Endocrine',
    'Endocrine/Metabolic',
    'Mental/Behavioral',
    'Nervous System',
    'Eye/Ear',
    'Circulatory System',
    'Respiratory System',
    'Digestive System',
    'Skin',
    'Musculoskeletal',
    'Genitourinary',
    'Pregnancy/Childbirth',
    'Perinatal',
    'Congenital',
    'Symptoms/Signs',
    'Injury/Poisoning',
    'External causes',
    'Health Status',
  ]);
  const [results, setResults] = useState<Icd10Code[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const bottomPadding = useBottomSpacing();

  useEffect(() => {
    loadInitialCodes(); // Load common codes on start
  }, []);

  useEffect(() => {
    // Auto-search when chapter changes
    if (hasSearched) {
      performSearch();
    }
  }, [selectedChapter]);

  const loadInitialCodes = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const commonCodes = await getCommonCodes();
      setResults(commonCodes);
    } catch (error) {
      console.error('Error loading initial codes:', error);
      setErrorMessage('Unable to reach the ICD-10 catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      loadInitialCodes();
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      setErrorMessage(null);
      const chapter = selectedChapter === 'All' ? undefined : selectedChapter;
      const data = await searchIcd10Codes(searchQuery.trim(), chapter, 50);
      setResults(data);
    } catch (error) {
      console.error('Error searching codes:', error);
      setResults([]);
      setErrorMessage('Search failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodePress = (code: Icd10Code) => {
    navigation.navigate('Icd10Detail', { code });
  };

  return (
    <ScreenContainer style={styles.safeArea}>
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search ICD-10 Codes</Text>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSearch={performSearch}
          />
        </View>
      </View>

      <ChapterFilter
        chapters={chapters}
        selectedChapter={selectedChapter}
        onSelectChapter={setSelectedChapter}
      />

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : errorMessage ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={performSearch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>
            {hasSearched ? 'No codes found' : 'Enter a search term or browse all codes'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Icd10ListItem code={item} onPress={() => handleCodePress(item)} />
          )}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
        />
      )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
    marginBottom: 15,
  },
  searchContainer: {
    marginBottom: 0,
  },
  list: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
