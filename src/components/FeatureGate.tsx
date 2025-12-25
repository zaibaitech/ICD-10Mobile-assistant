/**
 * FeatureGate Component
 * Role-based access control for features
 * Conditionally renders children based on user permissions
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { FEATURE_LABELS } from '../types/auth';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showRestricted?: boolean; // Show a "restricted" message instead of hiding
}

/**
 * FeatureGate Component
 * 
 * Wraps features that should only be available to certain roles.
 * 
 * @example
 * ```tsx
 * <FeatureGate feature="ai_clinical_analysis">
 *   <Button title="Run AI Analysis" onPress={handleAnalysis} />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showRestricted = false,
}: FeatureGateProps) {
  const { hasPermission, role, profile } = useAuth();

  // Check permission
  const hasAccess = hasPermission(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Return custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show restricted message if requested
  if (showRestricted && profile) {
    const featureLabel = FEATURE_LABELS[feature] || feature;
    return (
      <View style={styles.restricted}>
        <Text style={styles.restrictedIcon}>🔒</Text>
        <Text style={styles.restrictedTitle}>Feature Not Available</Text>
        <Text style={styles.restrictedText}>
          {featureLabel} is not available for {role} accounts.
        </Text>
      </View>
    );
  }

  // Hide completely by default
  return null;
}

/**
 * Hook version for conditional logic in components
 * 
 * @example
 * ```tsx
 * const canRunAI = useFeatureAccess('ai_clinical_analysis');
 * 
 * return (
 *   <View>
 *     {canRunAI && <AiResultsPanel />}
 *   </View>
 * );
 * ```
 */
export function useFeatureAccess(feature: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(feature);
}

/**
 * Hook to get multiple feature permissions at once
 * 
 * @example
 * ```tsx
 * const permissions = useMultipleFeatureAccess([
 *   'ai_clinical_analysis',
 *   'patient_management',
 *   'voice_input'
 * ]);
 * 
 * // Returns: { ai_clinical_analysis: true, patient_management: true, voice_input: false }
 * ```
 */
export function useMultipleFeatureAccess(features: string[]): Record<string, boolean> {
  const { hasPermission } = useAuth();
  
  return features.reduce((acc, feature) => {
    acc[feature] = hasPermission(feature);
    return acc;
  }, {} as Record<string, boolean>);
}

/**
 * Component to show content only to specific roles
 * 
 * @example
 * ```tsx
 * <RoleGate roles={['doctor', 'nurse']}>
 *   <PatientManagementSection />
 * </RoleGate>
 * ```
 */
interface RoleGateProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ roles, children, fallback }: RoleGateProps) {
  const { role } = useAuth();

  if (role && roles.includes(role)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return null;
}

/**
 * Component to hide content from specific roles (inverse of RoleGate)
 * 
 * @example
 * ```tsx
 * <HideFromRoles roles={['student', 'other']}>
 *   <AdminPanel />
 * </HideFromRoles>
 * ```
 */
interface HideFromRolesProps {
  roles: string[];
  children: React.ReactNode;
}

export function HideFromRoles({ roles, children }: HideFromRolesProps) {
  const { role } = useAuth();

  if (!role || !roles.includes(role)) {
    return <>{children}</>;
  }

  return null;
}

const styles = StyleSheet.create({
  restricted: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  restrictedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  restrictedTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  restrictedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
