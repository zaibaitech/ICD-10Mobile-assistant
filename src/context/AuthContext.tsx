import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { 
  signIn as signInService, 
  signUp as signUpService, 
  signUpLegacy,
  signOut as signOutService,
  getUserProfile,
  hasPermission as hasPermissionService,
} from '../services/auth';
import type { UserProfile, UserRole, SignUpData } from '../types/auth';
import { ROLE_FEATURES } from '../types/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signUpLegacy: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasPermission: (feature: string) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile when user changes
  useEffect(() => {
    if (user) {
      loadProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Load user profile from database
   */
  async function loadProfile(userId: string) {
    try {
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile(null);
    }
  }

  /**
   * Refresh current user's profile
   */
  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id);
    }
  }

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await signInService(email, password);
    return { error };
  };

  /**
   * Enhanced sign up with profile creation
   */
  const signUp = async (data: SignUpData) => {
    const result = await signUpService(data);
    return result;
  };

  /**
   * Legacy sign up (backward compatibility)
   */
  const signUpLegacyMethod = async (email: string, password: string) => {
    const { error } = await signUpLegacy(email, password);
    return { error };
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    await signOutService();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  /**
   * Check if current user has permission for a feature
   */
  function hasPermission(feature: string): boolean {
    if (!profile) return false;
    return hasPermissionService(profile.role, feature);
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user && !!profile,
    role: profile?.role ?? null,
    signIn,
    signUp,
    signUpLegacy: signUpLegacyMethod,
    signOut,
    hasPermission,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
