import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, MainTabParamList, SearchStackParamList, FavoritesStackParamList, PatientsStackParamList, NursingStackParamList } from '../types';

// Auth Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

// Main Tab Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { Icd10SearchScreen } from '../screens/Icd10SearchScreen';
import { Icd10DetailScreen } from '../screens/Icd10DetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { AssistantScreen } from '../screens/AssistantScreen';
import { VisitNoteScreen } from '../screens/VisitNoteScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { DiseaseModulesScreen } from '../screens/DiseaseModulesScreen';

// Patient Screens (Phase 3)
import { PatientsListScreen } from '../screens/PatientsListScreen';
import { PatientDetailScreen } from '../screens/PatientDetailScreen';
import { EncounterFormScreen } from '../screens/EncounterFormScreen';
import { EncounterDetailScreen } from '../screens/EncounterDetailScreen';

// Document Scanner (Phase 4)
import { DocumentScannerScreen } from '../screens/DocumentScannerScreen';
import { ClinicalToolsScreen } from '../screens/ClinicalToolsScreen';

// Nursing Module Screens (Phase 6)
import { 
  NursingHomeScreen,
  NandaSearchScreen,
  NandaDetailScreen,
  CarePlanBuilderScreen,
  CarePlanListScreen,
  SbarGeneratorScreen
} from '../screens/nursing';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const FavoritesStack = createNativeStackNavigator<FavoritesStackParamList>();
const PatientsStack = createNativeStackNavigator<PatientsStackParamList>();
const NursingStack = createNativeStackNavigator<NursingStackParamList>();

// Search Stack Navigator
const SearchNavigator = () => {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen
        name="Icd10Search"
        component={Icd10SearchScreen}
        options={{ headerShown: false }}
      />
      <SearchStack.Screen
        name="Icd10Detail"
        component={Icd10DetailScreen}
        options={{ title: 'Code Details' }}
      />
    </SearchStack.Navigator>
  );
};

// Favorites Stack Navigator
const FavoritesNavigator = () => {
  return (
    <FavoritesStack.Navigator>
      <FavoritesStack.Screen
        name="FavoritesList"
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />
      <FavoritesStack.Screen
        name="Icd10Detail"
        component={Icd10DetailScreen}
        options={{ title: 'Code Details' }}
      />
    </FavoritesStack.Navigator>
  );
};

// Patients Stack Navigator (Phase 3)
const PatientsNavigator = () => {
  return (
    <PatientsStack.Navigator>
      <PatientsStack.Screen
        name="PatientsList"
        component={PatientsListScreen}
        options={{ headerShown: false }}
      />
      <PatientsStack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{ title: 'Patient Details' }}
      />
      <PatientsStack.Screen
        name="EncounterForm"
        component={EncounterFormScreen}
        options={{ title: 'New Encounter' }}
      />
      <PatientsStack.Screen
        name="EncounterDetail"
        component={EncounterDetailScreen}
        options={{ title: 'Encounter Details' }}
      />
    </PatientsStack.Navigator>
  );
};

// Nursing Stack Navigator (Phase 6)
const NursingNavigator = () => {
  return (
    <NursingStack.Navigator>
      <NursingStack.Screen
        name="NursingHome"
        component={NursingHomeScreen}
        options={{ title: 'Nursing Care', headerShown: false }}
      />
      <NursingStack.Screen
        name="NandaSearch"
        component={NandaSearchScreen}
        options={{ title: 'Search NANDA' }}
      />
      <NursingStack.Screen
        name="NandaDetail"
        component={NandaDetailScreen}
        options={{ title: 'NANDA Diagnosis' }}
      />
      <NursingStack.Screen
        name="CarePlanList"
        component={CarePlanListScreen}
        options={{ title: 'Care Plans' }}
      />
      <NursingStack.Screen
        name="CarePlanBuilder"
        component={CarePlanBuilderScreen}
        options={{ title: 'Build Care Plan' }}
      />
      <NursingStack.Screen
        name="SbarGenerator"
        component={SbarGeneratorScreen}
        options={{ title: 'SBAR Report' }}
      />
    </NursingStack.Navigator>
  );
};

// Main Tab Navigator (authenticated users)
type TabIconName =
  | 'grid'
  | 'grid-outline'
  | 'search'
  | 'search-outline'
  | 'chatbubbles'
  | 'chatbubbles-outline'
  | 'people'
  | 'people-outline'
  | 'medical'
  | 'medical-outline'
  | 'document-text'
  | 'document-text-outline'
  | 'clipboard'
  | 'clipboard-outline'
  | 'help-outline';

const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { profile, hasPermission } = useAuth();
  const baseHeight = 65;
  const safePadding = Math.max(insets.bottom, 12);
  
  // Determine which tabs to show based on user role
  const userRole = profile?.role || 'other';
  const showNursing = hasPermission('nursing_care_plans');
  const showPatients = hasPermission('patient_management');
  const showClinicalTools = userRole === 'doctor';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: TabIconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Assistant') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Patients') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Nursing') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Modules') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'Visit') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          height: baseHeight + safePadding,
          paddingBottom: safePadding,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          backgroundColor: '#FFFFFF',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 0,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      {/* Home - Always visible */}
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      
      {/* ICD-10 Search - Always visible */}
      <Tab.Screen 
        name="Search" 
        component={SearchNavigator}
        options={{ tabBarLabel: 'ICD-10' }}
      />
      
      {/* AI Assistant - Always visible */}
      <Tab.Screen 
        name="Assistant" 
        component={AssistantScreen}
        options={{ tabBarLabel: 'AI' }}
      />
      
      {/* Patients - For doctors, nurses, CHWs */}
      {showPatients && (
        <Tab.Screen 
          name="Patients" 
          component={PatientsNavigator}
          options={{ tabBarLabel: 'Patients' }}
        />
      )}
      
      {/* Nursing - Only for nurses and doctors */}
      {showNursing && (
        <Tab.Screen 
          name="Nursing" 
          component={NursingNavigator}
          options={{ tabBarLabel: 'Nursing' }}
        />
      )}
      
      {/* Disease Modules - Always visible */}
      <Tab.Screen 
        name="Modules" 
        component={DiseaseModulesScreen}
        options={{ tabBarLabel: 'Guides' }}
      />
      
      {/* Visit Notes - For doctors and nurses */}
      {(userRole === 'doctor' || userRole === 'nurse' || userRole === 'chw') && (
        <Tab.Screen 
          name="Visit" 
          component={VisitNoteScreen}
          options={{ tabBarLabel: 'Visit' }}
        />
      )}
      
      {/* Profile - Always visible */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Preparing your workspace…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <RootStack.Screen name="Main" component={MainTabNavigator} />
            <RootStack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ 
                headerShown: true,
                title: 'Profile',
                presentation: 'card'
              }}
            />
            <RootStack.Screen 
              name="DocumentScanner" 
              component={DocumentScannerScreen}
              options={{ 
                headerShown: true,
                title: 'Document Scanner',
                presentation: 'card'
              }}
            />
            <RootStack.Screen 
              name="ClinicalTools" 
              component={ClinicalToolsScreen}
              options={{ 
                headerShown: true,
                title: 'Clinical Tools',
                presentation: 'card'
              }}
            />
          </>
        ) : (
          <>
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#7f8c8d',
    fontSize: 14,
  },
});
