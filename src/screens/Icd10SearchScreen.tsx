import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SearchBar } from '../components/SearchBar';
import { ChapterFilter } from '../components/ChapterFilter';
import { Icd10ListItem } from '../components/Icd10ListItem';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { searchIcd10Codes, getCommonCodes } from '../services/icd10-api';
import { Icd10Code } from '../types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, SearchStackParamList } from '../types';
import { useBottomSpacing } from '../hooks/useBottomSpacing';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';

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
        <LoadingState message="Searching ICD-10 codes..." />
      ) : errorMessage ? (
        <EmptyState
          icon="cloud-offline"
          title="Search failed"
          message={errorMessage}
          actionLabel="Try Again"
          onActionPress={performSearch}
          iconColor={Colors.danger}
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={hasSearched ? 'search' : 'document-text'}
          title={hasSearched ? 'No codes found' : 'Ready to search'}
          message={hasSearched ? 'Try adjusting your search terms or filter' : 'Enter a search term to find ICD-10 codes'}
          iconColor={Colors.primary}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Icd10ListItem code={item} onPress={() => handleCodePress(item)} />
          )}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={hasSearched ? performSearch : loadInitialCodes}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.small,
  },
  title: {
    fontSize: Typography.fontSize.heading,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    marginBottom: 0,
  },
  list: {
    flex: 1,
  },
});
