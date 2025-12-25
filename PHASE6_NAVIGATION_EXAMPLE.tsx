// Example Navigation Integration for Phase 6 Nursing Module
// Add this to your main navigation file (e.g., App.tsx or navigation/index.tsx)

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  NandaSearchScreen,
  NandaDetailScreen,
  CarePlanBuilderScreen,
  CarePlanListScreen,
  SbarGeneratorScreen,
} from './screens/nursing';

const Stack = createStackNavigator();

export function NursingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b82f6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Main nursing hub - could be a dashboard or menu */}
      <Stack.Screen 
        name="NandaSearch" 
        component={NandaSearchScreen}
        options={{ 
          title: '🔍 NANDA Diagnoses',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="NandaDetail" 
        component={NandaDetailScreen}
        options={{ 
          title: 'Diagnosis Details',
        }}
      />
      
      <Stack.Screen 
        name="CarePlanList" 
        component={CarePlanListScreen}
        options={{ 
          title: '📋 Care Plans',
        }}
      />
      
      <Stack.Screen 
        name="CarePlanBuilder" 
        component={CarePlanBuilderScreen}
        options={{ 
          title: '🚀 Create Care Plan',
        }}
      />
      
      <Stack.Screen 
        name="SbarGenerator" 
        component={SbarGeneratorScreen}
        options={{ 
          title: '📝 SBAR Report',
        }}
      />
    </Stack.Navigator>
  );
}

// ------------------------------------------------------------
// OPTION 1: Tab Navigator Integration
// Add nursing as a tab in your main tab navigator
// ------------------------------------------------------------

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // or your icon library

const Tab = createBottomTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Patients" 
        component={PatientsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="people" size={size} color={color} />
          ),
        }}
      />
      
      {/* Add Nursing Tab */}
      <Tab.Screen 
        name="Nursing" 
        component={NursingNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="medical" size={size} color={color} />
          ),
          tabBarLabel: 'Nursing',
          headerShown: false, // NursingNavigator handles its own headers
        }}
      />
    </Tab.Navigator>
  );
}

// ------------------------------------------------------------
// OPTION 2: Menu-Based Navigation
// Add nursing features to a patient detail screen menu
// ------------------------------------------------------------

import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function PatientDetailScreen({ route }) {
  const { patientId } = route.params;
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Patient Actions</Text>
      
      {/* Nursing Features Menu */}
      <View style={styles.nursingSection}>
        <Text style={styles.sectionTitle}>🩺 Nursing Features</Text>
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('CarePlanList', { patientId })}
        >
          <Text style={styles.buttonIcon}>📋</Text>
          <Text style={styles.buttonText}>Care Plans</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('CarePlanBuilder', { patientId })}
        >
          <Text style={styles.buttonIcon}>🚀</Text>
          <Text style={styles.buttonText}>Create Care Plan (Auto-Generate)</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('SbarGenerator', { patientId })}
        >
          <Text style={styles.buttonIcon}>📝</Text>
          <Text style={styles.buttonText}>SBAR Report</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('NandaSearch')}
        >
          <Text style={styles.buttonIcon}>🔍</Text>
          <Text style={styles.buttonText}>NANDA Search</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    padding: 20,
    backgroundColor: '#fff',
  },
  nursingSection: {
    marginTop: 12,
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  buttonArrow: {
    fontSize: 18,
    color: '#9ca3af',
  },
});

// ------------------------------------------------------------
// OPTION 3: Contextual Navigation
// Trigger care plan builder from encounter/diagnosis screens
// ------------------------------------------------------------

import { Alert } from 'react-native';

export function EncounterDetailScreen({ route }) {
  const { encounterId, patientId, diagnoses } = route.params;
  const navigation = useNavigation();

  const handleGenerateCarePlan = () => {
    // Extract ICD-10 codes from encounter diagnoses
    const icd10Codes = diagnoses.map(d => d.code);
    
    Alert.alert(
      '🚀 Generate Care Plan',
      `Create a nursing care plan from ${icd10Codes.length} diagnoses?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            navigation.navigate('CarePlanBuilder', {
              patientId,
              encounterId,
              icd10Codes, // Pre-populate with encounter diagnoses
            });
          },
        },
      ]
    );
  };

  return (
    <View>
      {/* Encounter details... */}
      
      {/* Smart Care Plan Button */}
      {diagnoses.length > 0 && (
        <TouchableOpacity 
          style={styles.smartButton}
          onPress={handleGenerateCarePlan}
        >
          <Text style={styles.smartButtonText}>
            🚀 Auto-Generate Care Plan from Diagnoses
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ------------------------------------------------------------
// Type Definitions for Navigation
// Add these to your navigation types file
// ------------------------------------------------------------

export type NursingStackParamList = {
  NandaSearch: undefined;
  NandaDetail: { nandaId: string };
  CarePlanList: { patientId: string };
  CarePlanBuilder: { 
    patientId: string; 
    encounterId?: string; 
    icd10Codes?: string[] 
  };
  SbarGenerator: { 
    patientId: string; 
    encounterId?: string; 
    reportType?: 'shift_handoff' | 'urgent_situation' | 'transfer' | 'discharge';
  };
};

// Usage in components:
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<NursingStackParamList, 'CarePlanBuilder'>;
  route: RouteProp<NursingStackParamList, 'CarePlanBuilder'>;
};
