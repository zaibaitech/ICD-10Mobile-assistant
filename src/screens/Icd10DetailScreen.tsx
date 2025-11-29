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
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { SearchStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { useVisit } from '../context/VisitContext';
import { addFavorite, removeFavorite, isFavorite } from '../services/favorites';
import { useBottomSpacing } from '../hooks/useBottomSpacing';

type Icd10DetailScreenRouteProp = RouteProp<SearchStackParamList, 'Icd10Detail'>;

interface Props {
  route: Icd10DetailScreenRouteProp;
}

export const Icd10DetailScreen: React.FC<Props> = ({ route }) => {
  const { code } = route.params;
  const { user } = useAuth();
  const { addCodeToVisit, isCodeInVisit } = useVisit();
  const [favorited, setFavorited] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(true);
  const inVisit = isCodeInVisit(code.code);
  const bottomPadding = useBottomSpacing(40);

  useEffect(() => {
    checkFavoriteStatus();
  }, []);

  const checkFavoriteStatus = async () => {
    if (user) {
      const status = await isFavorite(user.id, code.code);
      setFavorited(status);
    }
    setLoadingFavorite(false);
  };

  const toggleFavorite = async () => {
    if (!user) return;

    setLoadingFavorite(true);
    try {
      if (favorited) {
        await removeFavorite(user.id, code.code);
        setFavorited(false);
      } else {
        await addFavorite(user.id, code);
        setFavorited(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite');
    }
    setLoadingFavorite(false);
  };

  const handleAddToVisit = () => {
    addCodeToVisit(code);
    Alert.alert('Added', `${code.code} added to current visit`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: bottomPadding }}
    >
      <View style={styles.header}>
        <View style={styles.codeHeader}>
          <Text style={styles.code}>{code.code}</Text>
          <TouchableOpacity
            onPress={toggleFavorite}
            disabled={loadingFavorite}
            style={styles.favoriteButton}
          >
            {loadingFavorite ? (
              <ActivityIndicator size="small" color="#3498db" />
            ) : (
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={28}
                color={favorited ? '#e74c3c' : '#7f8c8d'}
              />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.shortTitle}>{code.short_title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Chapter</Text>
        <Text style={styles.sectionValue}>{code.chapter}</Text>
      </View>

      {code.long_description && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Full Description</Text>
          <Text style={styles.sectionValue}>{code.long_description}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, inVisit && styles.actionButtonDisabled]}
          onPress={handleAddToVisit}
          disabled={inVisit}
        >
          <Ionicons
            name={inVisit ? 'checkmark-circle' : 'add-circle-outline'}
            size={24}
            color="#fff"
            style={styles.actionIcon}
          />
          <Text style={styles.actionButtonText}>
            {inVisit ? 'Already in Visit' : 'Add to Visit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* TODO: Phase 2 - Add related codes suggestions */}
      {/* TODO: Phase 3 - Add AI-assisted documentation */}
    </ScrollView>
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
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  code: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
  },
  favoriteButton: {
    padding: 8,
  },
  shortTitle: {
    fontSize: 20,
    color: '#2c3e50',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  sectionValue: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  actions: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
