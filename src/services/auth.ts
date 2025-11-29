import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('📝 Attempting sign up for:', email);
    
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

    console.log('✅ Sign up successful. User:', data.user?.email, 'Confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
    
    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error: any) {
    console.error('❌ Sign up failed:', error);
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
