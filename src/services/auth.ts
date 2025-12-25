import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';
import type { SignUpData, UserProfile, UserRole } from '../types/auth';
import { ROLE_FEATURES } from '../types/auth';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

export interface ProfileResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

/**
 * Enhanced sign up with profile creation
 */
export const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
  const { 
    email, 
    password, 
    first_name, 
    last_name, 
    role, 
    specialty, 
    institution, 
    country_code,
    preferred_language,
    preferred_icd_variant 
  } = data;

  try {
    console.log('📝 Attempting sign up for:', email, 'as', role);
    
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('❌ Auth sign up error:', authError);
      return { success: false, error: authError?.message || 'Sign up failed' };
    }

    console.log('✅ Auth user created:', authData.user.id);

    // 2. Create user profile using secure function (bypasses RLS)
    const { data: profileData, error: profileError } = await supabase
      .rpc('create_user_profile_on_signup', {
        p_user_id: authData.user.id,
        p_first_name: first_name,
        p_last_name: last_name,
        p_role: role,
        p_specialty: specialty || null,
        p_institution: institution || null,
        p_country_code: country_code || null,
        p_preferred_language: preferred_language || 'en',
        p_preferred_icd_variant: preferred_icd_variant || 'who',
      });

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      // Note: In production, you might want to implement a rollback mechanism
      return { success: false, error: 'Failed to create user profile' };
    }

    console.log('✅ Sign up successful with profile for:', email);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Sign up failed:', error);
    return {
      success: false,
      error: error.message || 'Sign up failed',
    };
  }
};

/**
 * Legacy sign up (backward compatibility) - basic email/password only
 * @deprecated Use signUp with SignUpData instead
 */
export const signUpLegacy = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('📝 Attempting legacy sign up for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ Sign up error:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }

    console.log('✅ Legacy sign up successful. User:', data.user?.email);
    
    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error: any) {
    console.error('❌ Legacy sign up failed:', error);
    return {
      user: null,
      session: null,
      error: error as Error,
    };
  }
};

/**
 * Sign in an existing user with email and password
 */
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('🔐 Attempting sign in for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Sign in error:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }

    console.log('✅ Sign in successful for:', email);
    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error: any) {
    console.error('❌ Sign in failed:', error);
    return {
      user: null,
      session: null,
      error: error as Error,
    };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

/**
 * Get the current session
 */
export const getSession = async (): Promise<Session | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('📋 Fetching profile for user:', userId);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Failed to fetch profile:', error);
      return null;
    }

    console.log('✅ Profile loaded:', data.display_name, '(' + data.role + ')');
    return data;
  } catch (error) {
    console.error('❌ Error loading profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('💾 Updating profile for user:', userId);
    
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Profile update failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Profile updated successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error updating profile:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update profile' 
    };
  }
}

/**
 * Create user profile (for users who signed up before profile system)
 */
export async function createUserProfile(
  userId: string,
  profileData: Omit<UserProfile, 'id' | 'user_id' | 'display_name' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('➕ Creating profile for user:', userId);
    
    const { error } = await supabase.from('user_profiles').insert({
      user_id: userId,
      ...profileData,
    });

    if (error) {
      console.error('❌ Profile creation failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Profile created successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error creating profile:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create profile' 
    };
  }
}

/**
 * Check if user has permission for a feature
 */
export function hasPermission(role: UserRole, feature: string): boolean {
  const allowedFeatures = ROLE_FEATURES[role] || [];
  return allowedFeatures.includes(feature);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): string[] {
  return ROLE_FEATURES[role] || [];
}

/**
 * Check if profile is complete (has required fields)
 */
export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return !!(
    profile.first_name &&
    profile.last_name &&
    profile.role
  );
}

/**
 * Mark onboarding as completed
 */
export async function completeOnboarding(userId: string): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile(userId, { onboarding_completed: true });
}
