/**
 * ProfileScreen - User Profile Management
 * Displays user profile information and allows editing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/auth';
import { ROLE_LABELS, ROLE_ICONS, FEATURE_LABELS, getRoleFeatures } from '../types/auth';

export default function ProfileScreen() {
  const { user, profile, role, signOut, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    specialty: profile?.specialty || '',
    institution: profile?.institution || '',
  });

  const handleSave = async () => {
    if (!user || !profile) return;

    setIsSaving(true);
    const result = await updateUserProfile(user.id, {
      first_name: formData.first_name,
      last_name: formData.last_name,
      specialty: formData.specialty || null,
      institution: formData.institution || null,
    } as any);

    setIsSaving(false);

    if (result.success) {
      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', result.error || 'Failed to update profile');
    }
  };

  const handleSignOut = async () => {
    console.log('handleSignOut called, Platform:', Platform.OS);
    
    if (Platform.OS === 'web') {
      // On web, use window.confirm instead of Alert.alert
      const confirmed = window.confirm('Are you sure you want to sign out?');
      console.log('Confirmation result:', confirmed);
      
      if (confirmed) {
        try {
          console.log('Signing out...');
          signOut();
          console.log('Sign out completed');
        } catch (error) {
          console.error('Sign out error:', error);
          alert('Failed to sign out. Please try again.');
        }
      }
    } else {
      // On native, use Alert.alert
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign Out', 
            style: 'destructive',
            onPress: () => signOut(),
          },
        ]
      );
    }
  };

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const roleFeatures = getRoleFeatures(profile.role);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.roleIcon}>{ROLE_ICONS[profile.role]}</Text>
        <Text style={styles.displayName}>{profile.display_name}</Text>
        <Text style={styles.roleLabel}>{ROLE_LABELS[profile.role]}</Text>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>First Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.first_name}
              onChangeText={(v) => setFormData({ ...formData, first_name: v })}
              placeholder="First name"
            />
          ) : (
            <Text style={styles.value}>{profile.first_name}</Text>
          )}
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Last Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.last_name}
              onChangeText={(v) => setFormData({ ...formData, last_name: v })}
              placeholder="Last name"
            />
          ) : (
            <Text style={styles.value}>{profile.last_name}</Text>
          )}
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Specialty</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.specialty}
              onChangeText={(v) => setFormData({ ...formData, specialty: v })}
              placeholder="e.g., Cardiology"
            />
          ) : (
            <Text style={styles.value}>{profile.specialty || 'Not specified'}</Text>
          )}
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Institution</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.institution}
              onChangeText={(v) => setFormData({ ...formData, institution: v })}
              placeholder="Hospital or clinic name"
            />
          ) : (
            <Text style={styles.value}>{profile.institution || 'Not specified'}</Text>
          )}
        </View>

        {isEditing && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => {
                setIsEditing(false);
                setFormData({
                  first_name: profile.first_name,
                  last_name: profile.last_name,
                  specialty: profile.specialty || '',
                  institution: profile.institution || '',
                });
              }}
            >
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonPrimaryText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Available Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Features</Text>
        <Text style={styles.sectionSubtitle}>
          Features accessible to {ROLE_LABELS[profile.role]} accounts
        </Text>
        <View style={styles.featureList}>
          {roleFeatures.map((feature) => (
            <View key={feature} style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureLabel}>
                {FEATURE_LABELS[feature] || feature}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity 
        style={styles.signOutButton} 
        onPress={() => {
          console.log('Sign Out button pressed!');
          handleSignOut();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Account Info */}
      <View style={styles.accountInfo}>
        <Text style={styles.accountInfoText}>
          Account created: {new Date(profile.created_at).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  roleIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  editButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  buttonPrimary: {
    flex: 2,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureLabel: {
    fontSize: 15,
    color: '#333',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  accountInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  accountInfoText: {
    fontSize: 12,
    color: '#999',
  },
});
