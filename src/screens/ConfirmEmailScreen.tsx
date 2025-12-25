import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../services/supabase';

/**
 * Email Confirmation Screen
 * Handles email verification via deep link
 * 
 * Deep link format: icd10assistant://auth/confirm?token_hash=xxx&type=email
 */
export default function ConfirmEmailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    confirmEmail();
  }, []);

  const confirmEmail = async () => {
    try {
      // Extract token from URL parameters
      const params = route.params as any;
      const tokenHash = params?.token_hash;
      const type = params?.type;

      if (!tokenHash) {
        setStatus('error');
        setMessage('Invalid confirmation link');
        return;
      }

      console.log('🔐 Confirming email with token type:', type);

      // Verify the email using Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type || 'email',
      });

      if (error) {
        console.error('❌ Email confirmation failed:', error);
        setStatus('error');
        setMessage(error.message || 'Email confirmation failed');
        
        // Navigate back to login after 3 seconds
        setTimeout(() => {
          navigation.navigate('Auth' as never);
        }, 3000);
        return;
      }

      console.log('✅ Email confirmed successfully');
      setStatus('success');
      setMessage('Email confirmed! Redirecting...');

      // Wait a moment to show success message
      setTimeout(() => {
        // User is now authenticated, navigate to main app
        navigation.navigate('Main' as never);
      }, 1500);

    } catch (error: any) {
      console.error('❌ Confirmation error:', error);
      setStatus('error');
      setMessage(error.message || 'Something went wrong');
      
      setTimeout(() => {
        navigation.navigate('Auth' as never);
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.title}>{message}</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <Text style={styles.icon}>✅</Text>
            <Text style={styles.title}>Email Confirmed!</Text>
            <Text style={styles.subtitle}>{message}</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <Text style={styles.icon}>❌</Text>
            <Text style={styles.title}>Confirmation Failed</Text>
            <Text style={styles.subtitle}>{message}</Text>
            <Text style={styles.hint}>Redirecting to login...</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 16,
    textAlign: 'center',
  },
});
