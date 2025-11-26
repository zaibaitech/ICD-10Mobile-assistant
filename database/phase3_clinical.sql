-- ============================================
-- PHASE 3: PATIENTS, ENCOUNTERS & AI ANALYSIS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: PATIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_label TEXT NOT NULL,
  year_of_birth INTEGER,
  sex TEXT CHECK (sex IN ('male', 'female', 'other', 'unknown')) DEFAULT 'unknown',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own patients" ON public.patients
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLE 2: ENCOUNTERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encounter_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  chief_complaint TEXT NOT NULL,
  structured_data JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  ai_risk_level TEXT CHECK (ai_risk_level IN ('low', 'moderate', 'high', 'unknown')) DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_encounters_patient_id ON public.encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_encounters_user_id ON public.encounters(user_id);
CREATE INDEX IF NOT EXISTS idx_encounters_date ON public.encounters(encounter_date DESC);

-- RLS
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own encounters" ON public.encounters
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLE 3: ENCOUNTER ↔ ICD-10 LINKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.encounter_icd10_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
  icd10_id UUID NOT NULL REFERENCES public.icd10_codes(id) ON DELETE CASCADE,
  source TEXT CHECK (source IN ('user_selected', 'ai_suggested')) DEFAULT 'user_selected',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint (one code per encounter per source)
CREATE UNIQUE INDEX IF NOT EXISTS idx_encounter_icd10_unique
  ON public.encounter_icd10_codes(encounter_id, icd10_id, source);

-- RLS
ALTER TABLE public.encounter_icd10_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage encounter codes" ON public.encounter_icd10_codes
  FOR ALL USING (
    encounter_id IN (SELECT id FROM public.encounters WHERE user_id = auth.uid())
  );

-- ============================================
-- TABLE 4: ENCOUNTER AI RESULTS (DETAILED)
-- ============================================
CREATE TABLE IF NOT EXISTS public.encounter_ai_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_encounter_ai_results_encounter
  ON public.encounter_ai_results(encounter_id);

-- RLS
ALTER TABLE public.encounter_ai_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own AI results" ON public.encounter_ai_results
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLE 5: CLINICAL ANALYSIS AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.clinical_analysis_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  encounter_id UUID REFERENCES public.encounters(id) ON DELETE SET NULL,
  input_snapshot JSONB NOT NULL,
  result_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinical_logs_user ON public.clinical_analysis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_clinical_logs_encounter ON public.clinical_analysis_logs(encounter_id);

-- RLS
ALTER TABLE public.clinical_analysis_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own analysis logs" ON public.clinical_analysis_logs
  FOR ALL USING (auth.uid() = user_id);
