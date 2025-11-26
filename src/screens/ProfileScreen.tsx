import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || 'Not available'}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.valueSmall}>{user?.id || 'Not available'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>ICD-10 Mobile Assistant</Text>
          <Text style={styles.appInfoText}>Version 1.0.0 (MVP)</Text>
          <Text style={styles.appInfoText}>
            A documentation tool for healthcare professionals
          </Text>
          <Text style={styles.disclaimer}>
            {'\n'}Disclaimer: This is a documentation tool, NOT a medical decision or diagnosis
            tool.
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  valueSmall: {
    fontSize: 12,
    color: '#2c3e50',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  appInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  disclaimer: {
    fontSize: 12,
    color: '#e74c3c',
    fontStyle: 'italic',
    marginTop: 8,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
