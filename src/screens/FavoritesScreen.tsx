import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Icd10ListItem } from '../components/Icd10ListItem';
import { getUserFavorites } from '../services/favorites';
import { useAuth } from '../context/AuthContext';
import { Icd10Code, FavoritesStackParamList } from '../types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../types';

type FavoritesScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<FavoritesStackParamList, 'FavoritesList'>,
  BottomTabNavigationProp<MainTabParamList>
>;

interface Props {
  navigation: FavoritesScreenNavigationProp;
}

export const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Icd10Code[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [user])
  );

  const loadFavorites = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getUserFavorites(user.id);
    setFavorites(data);
    setLoading(false);
  };

  const handleCodePress = (code: Icd10Code) => {
    navigation.navigate('Icd10Detail', { code });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>{favorites.length} saved codes</Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on any ICD-10 code to save it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
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
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});
