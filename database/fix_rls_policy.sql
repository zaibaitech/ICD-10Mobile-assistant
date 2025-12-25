-- Fix for Profile Creation RLS Issue
-- Run this in Supabase SQL Editor

-- Solution: Create a secure function to handle profile creation during signup
-- This function runs with elevated privileges and bypasses RLS

CREATE OR REPLACE FUNCTION create_user_profile_on_signup(
  p_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_role TEXT,
  p_specialty TEXT DEFAULT NULL,
  p_institution TEXT DEFAULT NULL,
  p_country_code TEXT DEFAULT NULL,
  p_preferred_language TEXT DEFAULT 'en',
  p_preferred_icd_variant TEXT DEFAULT 'who'
)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges
SET search_path = public
AS $$
DECLARE
  v_profile user_profiles;
BEGIN
  -- Insert the profile
  INSERT INTO user_profiles (
    user_id,
    first_name,
    last_name,
    role,
    specialty,
    institution,
    country_code,
    preferred_language,
    preferred_icd_variant
  ) VALUES (
    p_user_id,
    p_first_name,
    p_last_name,
    p_role,
    p_specialty,
    p_institution,
    p_country_code,
    p_preferred_language,
    p_preferred_icd_variant
  )
  RETURNING * INTO v_profile;
  
  RETURN v_profile;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile_on_signup TO authenticated;

-- Also grant to anon for signup flows
GRANT EXECUTE ON FUNCTION create_user_profile_on_signup TO anon;
