import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, MainTabParamList, SearchStackParamList, FavoritesStackParamList, PatientsStackParamList } from '../types';

// Auth Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

// Main Tab Screens
import { Icd10SearchScreen } from '../screens/Icd10SearchScreen';
import { Icd10DetailScreen } from '../screens/Icd10DetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { AssistantScreen } from '../screens/AssistantScreen';
import { VisitNoteScreen } from '../screens/VisitNoteScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Patient Screens (Phase 3)
import { PatientsListScreen } from '../screens/PatientsListScreen';
import { PatientDetailScreen } from '../screens/PatientDetailScreen';
import { EncounterFormScreen } from '../screens/EncounterFormScreen';
import { EncounterDetailScreen } from '../screens/EncounterDetailScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const FavoritesStack = createNativeStackNavigator<FavoritesStackParamList>();
const PatientsStack = createNativeStackNavigator<PatientsStackParamList>();

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

// Main Tab Navigator (authenticated users)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Patients') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Assistant') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
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
        headerShown: false,
      })}
    >
      <Tab.Screen name="Patients" component={PatientsNavigator} />
      <Tab.Screen name="Search" component={SearchNavigator} />
      <Tab.Screen name="Assistant" component={AssistantScreen} />
      <Tab.Screen name="Favorites" component={FavoritesNavigator} />
      <Tab.Screen name="Visit" component={VisitNoteScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Root Navigator
export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // TODO: Add a proper loading screen
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main" component={MainTabNavigator} />
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
