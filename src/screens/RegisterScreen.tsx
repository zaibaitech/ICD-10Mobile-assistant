/**
 * RegisterScreen - Enhanced Multi-Step Registration
 * Collects user profile data including role, name, and credentials
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
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import type { UserRole, SignUpData } from '../types/auth';
import { ROLE_LABELS, ROLE_ICONS, ROLE_DESCRIPTIONS } from '../types/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

interface RoleOption {
  value: UserRole;
  label: string;
  icon: string;
  description: string;
}

const ROLES: RoleOption[] = [
  { 
    value: 'doctor', 
    label: ROLE_LABELS.doctor, 
    icon: ROLE_ICONS.doctor,
    description: ROLE_DESCRIPTIONS.doctor,
  },
  { 
    value: 'nurse', 
    label: ROLE_LABELS.nurse, 
    icon: ROLE_ICONS.nurse,
    description: ROLE_DESCRIPTIONS.nurse,
  },
  { 
    value: 'pharmacist', 
    label: ROLE_LABELS.pharmacist, 
    icon: ROLE_ICONS.pharmacist,
    description: ROLE_DESCRIPTIONS.pharmacist,
  },
  { 
    value: 'chw', 
    label: ROLE_LABELS.chw, 
    icon: ROLE_ICONS.chw,
    description: ROLE_DESCRIPTIONS.chw,
  },
  { 
    value: 'student', 
    label: ROLE_LABELS.student, 
    icon: ROLE_ICONS.student,
    description: ROLE_DESCRIPTIONS.student,
  },
  { 
    value: 'other', 
    label: ROLE_LABELS.other, 
    icon: ROLE_ICONS.other,
    description: ROLE_DESCRIPTIONS.other,
  },
];

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'doctor',
    specialty: '',
    institution: '',
  });

  const updateField = <K extends keyof SignUpData>(field: K, value: SignUpData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep1 = (): string | null => {
    if (!formData.first_name.trim()) return 'First name is required';
    if (!formData.last_name.trim()) return 'Last name is required';
    if (!formData.role) return 'Please select your role';
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Invalid email format';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    return null;
  };

  const handleNextStep = () => {
    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }
    setStep(2);
  };

  const handleSignUp = async () => {
    const validationError = validateStep2();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signUp(formData);

      if (result.success) {
        // Navigate to login with success message
        Alert.alert(
          'Account Created!',
          '✅ Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        setError(result.error || 'Sign up failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.value === formData.role);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? 'Tell us about yourself' : 'Set up your credentials'}
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={[styles.progressLine, step === 2 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step === 2 && styles.progressDotActive]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, step === 1 && styles.progressLabelActive]}>
              Profile
            </Text>
            <Text style={[styles.progressLabel, step === 2 && styles.progressLabelActive]}>
              Credentials
            </Text>
          </View>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Step 1: Personal Info + Role */}
        {step === 1 ? (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(v) => updateField('first_name', v)}
                placeholder="Enter your first name"
                autoCapitalize="words"
                autoComplete="name-given"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.last_name}
                onChangeText={(v) => updateField('last_name', v)}
                placeholder="Enter your last name"
                autoCapitalize="words"
                autoComplete="name-family"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>I am a... *</Text>
              <View style={styles.roleGrid}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.roleCard,
                      formData.role === role.value && styles.roleCardSelected,
                    ]}
                    onPress={() => updateField('role', role.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.roleIcon}>{role.icon}</Text>
                    <Text style={[
                      styles.roleLabel,
                      formData.role === role.value && styles.roleLabelSelected,
                    ]}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Show description for selected role */}
            {selectedRole && (
              <View style={styles.roleDescription}>
                <Text style={styles.roleDescriptionText}>
                  {selectedRole.description}
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specialty (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.specialty}
                onChangeText={(v) => updateField('specialty', v)}
                placeholder="e.g., Cardiology, Pediatrics"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Institution (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.institution}
                onChangeText={(v) => updateField('institution', v)}
                placeholder="Hospital or clinic name"
                autoCapitalize="words"
              />
            </View>

            <TouchableOpacity 
              style={styles.buttonPrimary} 
              onPress={handleNextStep}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonPrimaryText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Step 2: Credentials */
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(v) => updateField('email', v.trim())}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(v) => updateField('password', v)}
                placeholder="Minimum 8 characters"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <Text style={styles.hint}>
                Use a strong password with letters, numbers, and symbols
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => setStep(1)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonSecondaryText}>← Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.buttonPrimary, styles.buttonPrimaryWide]}
                onPress={handleSignUp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.footerLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#007AFF',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressLabel: {
    fontSize: 12,
    color: '#999',
  },
  progressLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    color: '#D32F2F',
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleCard: {
    width: '30%',
    minWidth: 100,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  roleCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    fontWeight: '500',
  },
  roleLabelSelected: {
    color: '#007AFF',
    fontWeight: '700',
  },
  roleDescription: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  roleDescriptionText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPrimaryWide: {
    flex: 2,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonSecondaryText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
