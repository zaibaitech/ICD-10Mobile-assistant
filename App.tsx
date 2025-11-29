import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { VisitProvider } from './src/context/VisitContext';
import { OfflineProvider } from './src/context/OfflineContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import './src/i18n'; // Initialize i18n

export default function App() {
  // Suppress warnings on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // @ts-ignore
      import('./suppress-warnings.web');
    }
  }, []);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Just set ready - all services will use web fallbacks if needed
        console.log('[App] Initializing...');
        setIsReady(true);
      } catch (err) {
        console.error('[App] Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    console.warn('[App] Started with error:', error);
  }

  return (
    <SafeAreaProvider>
      <OfflineProvider>
        <AuthProvider>
          <VisitProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </VisitProvider>
        </AuthProvider>
      </OfflineProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
});

