-- ICD-10 Mobile Assistant Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: icd10_codes
-- Stores ICD-10 diagnosis codes
CREATE TABLE IF NOT EXISTS icd10_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  short_title TEXT NOT NULL,
  long_description TEXT,
  chapter TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast search
CREATE INDEX IF NOT EXISTS idx_icd10_code ON icd10_codes(code);
CREATE INDEX IF NOT EXISTS idx_icd10_title ON icd10_codes USING gin(to_tsvector('english', short_title));
CREATE INDEX IF NOT EXISTS idx_icd10_chapter ON icd10_codes(chapter);

-- Table: user_favorites
-- Links users to their favorite ICD-10 codes
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  icd10_id UUID REFERENCES icd10_codes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, icd10_id)
);

-- Enable Row Level Security on user_favorites
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own favorites
DROP POLICY IF EXISTS "Users manage own favorites" ON user_favorites;
CREATE POLICY "Users manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Sample Seed Data
-- Insert common ICD-10 codes for testing
INSERT INTO icd10_codes (code, short_title, long_description, chapter) VALUES
('I10', 'Essential hypertension', 'Essential (primary) hypertension', 'Circulatory System'),
('I25.10', 'Coronary artery disease', 'Atherosclerotic heart disease of native coronary artery without angina pectoris', 'Circulatory System'),
('E11.9', 'Type 2 diabetes', 'Type 2 diabetes mellitus without complications', 'Endocrine/Metabolic'),
('E11.65', 'Type 2 diabetes with hyperglycemia', 'Type 2 diabetes mellitus with hyperglycemia', 'Endocrine/Metabolic'),
('J06.9', 'Upper respiratory infection', 'Acute upper respiratory infection, unspecified', 'Respiratory System'),
('J18.9', 'Pneumonia', 'Pneumonia, unspecified organism', 'Respiratory System'),
('M54.5', 'Low back pain', 'Low back pain', 'Musculoskeletal'),
('G43.909', 'Migraine', 'Migraine, unspecified, not intractable, without status migrainosus', 'Nervous System'),
('F41.1', 'Generalized anxiety', 'Generalized anxiety disorder', 'Mental/Behavioral'),
('F32.9', 'Depression', 'Major depressive disorder, single episode, unspecified', 'Mental/Behavioral'),
('K21.0', 'GERD with esophagitis', 'Gastro-esophageal reflux disease with esophagitis', 'Digestive System'),
('N39.0', 'UTI', 'Urinary tract infection, site not specified', 'Genitourinary'),
('L30.9', 'Dermatitis', 'Dermatitis, unspecified', 'Skin'),
('R05.9', 'Cough', 'Cough, unspecified', 'Symptoms/Signs'),
('Z00.00', 'General exam', 'Encounter for general adult medical examination without abnormal findings', 'Health Status')
ON CONFLICT DO NOTHING;
