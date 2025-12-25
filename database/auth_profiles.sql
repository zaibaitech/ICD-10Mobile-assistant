-- ============================================
-- ENHANCED AUTHENTICATION & ROLE-BASED ACCESS
-- User Profiles & Permissions Schema
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: user_profiles
-- Stores professional information for each user
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identity
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  
  -- Professional info
  role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse', 'pharmacist', 'chw', 'student', 'other')),
  specialty TEXT,                          -- e.g., "Cardiology", "Pediatrics"
  license_number TEXT,                     -- Optional, for verification later
  institution TEXT,                        -- Hospital/clinic name
  country_code TEXT,                       -- ISO country code
  
  -- Preferences
  preferred_language TEXT DEFAULT 'en',
  preferred_icd_variant TEXT DEFAULT 'who' CHECK (preferred_icd_variant IN ('who', 'cm', 'am')),
  
  -- Status
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON user_profiles(created_at);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users manage own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON user_profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow insert during signup - check that the user_id matches the authenticated user OR allow service role
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- Auto-update timestamp trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_profiles_updated ON user_profiles;

CREATE TRIGGER user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Table: role_permissions
-- Fine-grained feature access control
-- ============================================

CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse', 'pharmacist', 'chw', 'student', 'other')),
  feature TEXT NOT NULL,
  allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, feature)
);

-- Index for fast permission lookups
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_feature ON role_permissions(feature);

-- ============================================
-- Seed default permissions
-- ============================================

-- Clear existing permissions to avoid conflicts
TRUNCATE TABLE role_permissions;

-- Doctors - full access to all features
INSERT INTO role_permissions (role, feature, allowed) VALUES
('doctor', 'icd10_search', true),
('doctor', 'patient_management', true),
('doctor', 'encounter_management', true),
('doctor', 'ai_clinical_analysis', true),
('doctor', 'assistant_chat', true),
('doctor', 'favorites', true),
('doctor', 'voice_input', true),
('doctor', 'image_processing', true);

-- Nurses - documentation focus, limited AI
INSERT INTO role_permissions (role, feature, allowed) VALUES
('nurse', 'icd10_search', true),
('nurse', 'patient_management', true),
('nurse', 'encounter_management', true),
('nurse', 'ai_clinical_analysis', false),
('nurse', 'assistant_chat', true),
('nurse', 'favorites', true),
('nurse', 'voice_input', true),
('nurse', 'image_processing', false);

-- Pharmacists - medication focus only
INSERT INTO role_permissions (role, feature, allowed) VALUES
('pharmacist', 'icd10_search', true),
('pharmacist', 'patient_management', false),
('pharmacist', 'encounter_management', false),
('pharmacist', 'ai_clinical_analysis', false),
('pharmacist', 'assistant_chat', true),
('pharmacist', 'favorites', true),
('pharmacist', 'voice_input', true),
('pharmacist', 'image_processing', false);

-- Community Health Workers - simplified access
INSERT INTO role_permissions (role, feature, allowed) VALUES
('chw', 'icd10_search', true),
('chw', 'patient_management', true),
('chw', 'encounter_management', true),
('chw', 'ai_clinical_analysis', false),
('chw', 'assistant_chat', true),
('chw', 'favorites', true),
('chw', 'voice_input', true),
('chw', 'image_processing', false);

-- Medical Students - learning mode
INSERT INTO role_permissions (role, feature, allowed) VALUES
('student', 'icd10_search', true),
('student', 'patient_management', false),
('student', 'encounter_management', false),
('student', 'ai_clinical_analysis', false),
('student', 'assistant_chat', true),
('student', 'favorites', true),
('student', 'voice_input', true),
('student', 'image_processing', false);

-- Other healthcare professionals - basic access
INSERT INTO role_permissions (role, feature, allowed) VALUES
('other', 'icd10_search', true),
('other', 'patient_management', false),
('other', 'encounter_management', false),
('other', 'ai_clinical_analysis', false),
('other', 'assistant_chat', true),
('other', 'favorites', true),
('other', 'voice_input', true),
('other', 'image_processing', false);

-- ============================================
-- Helper function: Check permission
-- ============================================

CREATE OR REPLACE FUNCTION check_permission(
  user_role TEXT,
  feature_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  is_allowed BOOLEAN;
BEGIN
  SELECT allowed INTO is_allowed
  FROM role_permissions
  WHERE role = user_role AND feature = feature_name;
  
  -- Default to false if no permission record exists
  RETURN COALESCE(is_allowed, false);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Helper function: Get user profile by user_id
-- ============================================

CREATE OR REPLACE FUNCTION get_user_profile(uid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  role TEXT,
  specialty TEXT,
  license_number TEXT,
  institution TEXT,
  country_code TEXT,
  preferred_language TEXT,
  preferred_icd_variant TEXT,
  onboarding_completed BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.display_name,
    p.role,
    p.specialty,
    p.license_number,
    p.institution,
    p.country_code,
    p.preferred_language,
    p.preferred_icd_variant,
    p.onboarding_completed,
    p.created_at,
    p.updated_at
  FROM user_profiles p
  WHERE p.user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE user_profiles IS 'Stores professional information and preferences for authenticated users';
COMMENT ON TABLE role_permissions IS 'Defines feature access permissions for each user role';
COMMENT ON COLUMN user_profiles.role IS 'User professional role: doctor, nurse, pharmacist, chw, student, or other';
COMMENT ON COLUMN user_profiles.specialty IS 'Medical specialty (e.g., Cardiology, Pediatrics)';
COMMENT ON COLUMN user_profiles.preferred_icd_variant IS 'Preferred ICD-10 variant: who (WHO), cm (Clinical Modification), or am (Australian Modification)';
COMMENT ON FUNCTION check_permission IS 'Checks if a given role has permission for a specific feature';

-- ============================================
-- Grant permissions
-- ============================================

-- Allow authenticated users to read role_permissions
GRANT SELECT ON role_permissions TO authenticated;

-- Ensure service role can manage profiles
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON role_permissions TO service_role;
