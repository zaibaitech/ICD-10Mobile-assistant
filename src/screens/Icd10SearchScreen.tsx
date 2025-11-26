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
import { searchIcd10, getChapters } from '../services/icd10';
import { Icd10Code } from '../types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, SearchStackParamList } from '../types';

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
  const [chapters, setChapters] = useState<string[]>(['All']);
  const [results, setResults] = useState<Icd10Code[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadChapters();
    performSearch(); // Load initial results
  }, []);

  useEffect(() => {
    // Auto-search when chapter changes
    if (hasSearched) {
      performSearch();
    }
  }, [selectedChapter]);

  const loadChapters = async () => {
    const chaptersData = await getChapters();
    setChapters(chaptersData);
  };

  const performSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    const chapter = selectedChapter === 'All' ? undefined : selectedChapter;
    const data = await searchIcd10(searchQuery, chapter, 50);
    setResults(data);
    setLoading(false);
  };

  const handleCodePress = (code: Icd10Code) => {
    navigation.navigate('Icd10Detail', { code });
  };

  return (
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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});
