-- ============================================
-- PHASE 6: NURSING MODULE DATABASE SCHEMA
-- ============================================
-- This schema implements the NANDA-I, NIC, NOC framework
-- and creates the unique ICD-10 ↔ NANDA bridge

-- ============================================
-- 1. NANDA-I NURSING DIAGNOSES
-- ============================================

CREATE TABLE IF NOT EXISTS nanda_diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,                      -- e.g., "00200"
  label TEXT NOT NULL,                             -- e.g., "Risk for Decreased Cardiac Tissue Perfusion"
  definition TEXT,
  domain TEXT NOT NULL,                            -- 13 NANDA domains
  class TEXT NOT NULL,                             -- 48 NANDA classes
  diagnosis_type TEXT CHECK (diagnosis_type IN ('actual', 'risk', 'health_promotion', 'syndrome')) NOT NULL,
  related_factors TEXT[],                          -- For actual diagnoses
  risk_factors TEXT[],                             -- For risk diagnoses
  defining_characteristics TEXT[],                 -- Signs/symptoms
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_nanda_code ON nanda_diagnoses(code);
CREATE INDEX IF NOT EXISTS idx_nanda_domain ON nanda_diagnoses(domain);
CREATE INDEX IF NOT EXISTS idx_nanda_type ON nanda_diagnoses(diagnosis_type);
CREATE INDEX IF NOT EXISTS idx_nanda_label_search ON nanda_diagnoses USING gin(to_tsvector('english', label));
CREATE INDEX IF NOT EXISTS idx_nanda_definition_search ON nanda_diagnoses USING gin(to_tsvector('english', definition));

-- ============================================
-- 2. NIC NURSING INTERVENTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS nic_interventions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,                      -- e.g., "6680"
  label TEXT NOT NULL,                             -- e.g., "Vital Signs Monitoring"
  definition TEXT,
  domain TEXT NOT NULL,                            -- 7 NIC domains
  class TEXT NOT NULL,                             -- 30 NIC classes
  activities TEXT[],                               -- Specific nursing activities
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nic_code ON nic_interventions(code);
CREATE INDEX IF NOT EXISTS idx_nic_domain ON nic_interventions(domain);
CREATE INDEX IF NOT EXISTS idx_nic_label_search ON nic_interventions USING gin(to_tsvector('english', label));

-- ============================================
-- 3. NOC NURSING OUTCOMES
-- ============================================

CREATE TABLE IF NOT EXISTS noc_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,                      -- e.g., "0802"
  label TEXT NOT NULL,                             -- e.g., "Vital Signs"
  definition TEXT,
  domain TEXT NOT NULL,                            -- 7 NOC domains
  class TEXT NOT NULL,                             -- 32 NOC classes
  indicators TEXT[],                               -- Measurable indicators
  measurement_scale TEXT,                          -- e.g., "1-5 Likert scale"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_noc_code ON noc_outcomes(code);
CREATE INDEX IF NOT EXISTS idx_noc_domain ON noc_outcomes(domain);
CREATE INDEX IF NOT EXISTS idx_noc_label_search ON noc_outcomes USING gin(to_tsvector('english', label));

-- ============================================
-- 4. ICD-10 ↔ NANDA MAPPINGS
-- ⭐ THE KEY DIFFERENTIATOR ⭐
-- ============================================

CREATE TABLE IF NOT EXISTS icd10_nanda_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icd10_id UUID REFERENCES icd10_codes(id) ON DELETE CASCADE,
  nanda_id UUID REFERENCES nanda_diagnoses(id) ON DELETE CASCADE,
  relevance TEXT CHECK (relevance IN ('primary', 'secondary', 'related')) NOT NULL,
  rationale TEXT,
  evidence_level TEXT CHECK (evidence_level IN ('research', 'expert_consensus', 'clinical_practice')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(icd10_id, nanda_id)
);

-- Indexes for the bridge
CREATE INDEX IF NOT EXISTS idx_mapping_icd10 ON icd10_nanda_mappings(icd10_id);
CREATE INDEX IF NOT EXISTS idx_mapping_nanda ON icd10_nanda_mappings(nanda_id);
CREATE INDEX IF NOT EXISTS idx_mapping_relevance ON icd10_nanda_mappings(relevance);

-- ============================================
-- 5. NANDA-NIC-NOC LINKAGES
-- Evidence-based connections between diagnoses, interventions, outcomes
-- ============================================

CREATE TABLE IF NOT EXISTS nanda_nic_noc_linkages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nanda_id UUID REFERENCES nanda_diagnoses(id) ON DELETE CASCADE,
  nic_id UUID REFERENCES nic_interventions(id) ON DELETE CASCADE,
  noc_id UUID REFERENCES noc_outcomes(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1,                     -- 1 = high priority linkage, 5 = low priority
  evidence_level TEXT CHECK (evidence_level IN ('research', 'expert_consensus', 'clinical_practice')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_linkage_nanda ON nanda_nic_noc_linkages(nanda_id);
CREATE INDEX IF NOT EXISTS idx_linkage_nic ON nanda_nic_noc_linkages(nic_id);
CREATE INDEX IF NOT EXISTS idx_linkage_noc ON nanda_nic_noc_linkages(noc_id);
CREATE INDEX IF NOT EXISTS idx_linkage_priority ON nanda_nic_noc_linkages(priority);

-- ============================================
-- 6. NURSING CARE PLANS
-- ============================================

CREATE TABLE IF NOT EXISTS nursing_care_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID,  -- Simple UUID, no foreign key constraint
  encounter_id UUID,  -- Simple UUID, no foreign key constraint
  organization_id UUID,  -- Simple UUID, no foreign key constraint
  
  -- Patient info (denormalized for standalone use)
  patient_name TEXT,
  patient_mrn TEXT,
  
  -- Plan details
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'active', 'completed', 'discontinued')) DEFAULT 'draft',
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  
  -- Timestamps
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  completed_date DATE,
  discontinued_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_care_plans_patient ON nursing_care_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_plans_encounter ON nursing_care_plans(encounter_id);
CREATE INDEX IF NOT EXISTS idx_care_plans_org ON nursing_care_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_care_plans_status ON nursing_care_plans(status);
CREATE INDEX IF NOT EXISTS idx_care_plans_user ON nursing_care_plans(user_id);

-- RLS Policies
ALTER TABLE nursing_care_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own care plans" ON nursing_care_plans
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 7. CARE PLAN ITEMS
-- Individual nursing diagnoses within a care plan
-- ============================================

CREATE TABLE IF NOT EXISTS care_plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  care_plan_id UUID REFERENCES nursing_care_plans(id) ON DELETE CASCADE,
  
  -- Nursing diagnosis
  nanda_id UUID REFERENCES nanda_diagnoses(id),
  custom_diagnosis TEXT,                          -- If not in NANDA database
  
  -- Related medical diagnosis (THE BRIDGE)
  icd10_id UUID REFERENCES icd10_codes(id),
  
  -- Related factors / Risk factors
  related_factors TEXT[],
  evidenced_by TEXT[],                            -- Defining characteristics
  
  -- Goals (from NOC)
  noc_ids UUID[],                                 -- Array of NOC outcome IDs
  goal_statement TEXT,
  baseline_score INTEGER CHECK (baseline_score >= 1 AND baseline_score <= 5),
  target_score INTEGER CHECK (target_score >= 1 AND target_score <= 5),
  
  -- Interventions (from NIC)
  nic_ids UUID[],                                 -- Array of NIC intervention IDs
  custom_interventions TEXT[],
  
  -- Evaluation
  current_score INTEGER CHECK (current_score >= 1 AND current_score <= 5),
  evaluation_notes TEXT,
  evaluation_date DATE,
  
  -- Status
  status TEXT CHECK (status IN ('active', 'resolved', 'ongoing')) DEFAULT 'active',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_care_plan_items_plan ON care_plan_items(care_plan_id);
CREATE INDEX IF NOT EXISTS idx_care_plan_items_nanda ON care_plan_items(nanda_id);
CREATE INDEX IF NOT EXISTS idx_care_plan_items_icd10 ON care_plan_items(icd10_id);
CREATE INDEX IF NOT EXISTS idx_care_plan_items_status ON care_plan_items(status);

-- ============================================
-- 8. SBAR REPORTS
-- Structured handoff communication
-- ============================================

CREATE TABLE IF NOT EXISTS sbar_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID,  -- Simple UUID, no foreign key constraint
  organization_id UUID,  -- Simple UUID, no foreign key constraint
  
  -- Patient info (denormalized)
  patient_name TEXT,
  patient_mrn TEXT,
  
  -- SBAR Content
  situation TEXT NOT NULL,                        -- Current issue/concern
  background TEXT NOT NULL,                       -- Relevant history
  assessment TEXT NOT NULL,                       -- Nurse's clinical assessment
  recommendation TEXT NOT NULL,                   -- What nurse recommends
  
  -- Context
  report_type TEXT CHECK (report_type IN ('shift_handoff', 'physician_call', 'rapid_response', 'transfer', 'discharge')) NOT NULL,
  recipient_role TEXT,                            -- Who this is for
  urgency TEXT CHECK (urgency IN ('routine', 'urgent', 'emergent')) DEFAULT 'routine',
  
  -- Linked data
  vital_signs JSONB,
  linked_icd10_ids UUID[],
  linked_nanda_ids UUID[],
  
  -- Voice recording (optional)
  audio_url TEXT,
  transcription TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sbar_patient ON sbar_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_sbar_org ON sbar_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_sbar_type ON sbar_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_sbar_urgency ON sbar_reports(urgency);
CREATE INDEX IF NOT EXISTS idx_sbar_user ON sbar_reports(user_id);

-- RLS Policies
ALTER TABLE sbar_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own SBAR reports" ON sbar_reports
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 9. NURSING ASSESSMENTS
-- Structured patient assessments
-- ============================================

CREATE TABLE IF NOT EXISTS nursing_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID,  -- Simple UUID, no foreign key constraint
  encounter_id UUID,  -- Simple UUID, no foreign key constraint
  organization_id UUID,  -- Simple UUID, no foreign key constraint
  
  -- Patient info (denormalized)
  patient_name TEXT,
  patient_mrn TEXT,
  
  -- Assessment type
  assessment_type TEXT CHECK (assessment_type IN (
    'admission', 'shift', 'focused', 'head_to_toe', 'pain', 
    'fall_risk', 'skin', 'neuro', 'cardiac', 'respiratory'
  )) NOT NULL,
  
  -- Structured data (JSON for flexibility)
  assessment_data JSONB NOT NULL,
  
  -- Calculated scores
  fall_risk_score INTEGER,
  braden_score INTEGER,                           -- Pressure ulcer risk (6-23)
  pain_score INTEGER CHECK (pain_score >= 0 AND pain_score <= 10),
  morse_score INTEGER,                            -- Fall risk (0-125)
  glasgow_score INTEGER CHECK (glasgow_score >= 3 AND glasgow_score <= 15),
  
  -- Timestamps
  assessment_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assessments_patient ON nursing_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessments_encounter ON nursing_assessments(encounter_id);
CREATE INDEX IF NOT EXISTS idx_assessments_type ON nursing_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessments_time ON nursing_assessments(assessment_time);
CREATE INDEX IF NOT EXISTS idx_assessments_user ON nursing_assessments(user_id);

-- RLS Policies
ALTER TABLE nursing_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own assessments" ON nursing_assessments
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all nursing tables
CREATE TRIGGER update_nanda_diagnoses_updated_at BEFORE UPDATE ON nanda_diagnoses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nic_interventions_updated_at BEFORE UPDATE ON nic_interventions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_noc_outcomes_updated_at BEFORE UPDATE ON noc_outcomes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_icd10_nanda_mappings_updated_at BEFORE UPDATE ON icd10_nanda_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nanda_nic_noc_linkages_updated_at BEFORE UPDATE ON nanda_nic_noc_linkages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nursing_care_plans_updated_at BEFORE UPDATE ON nursing_care_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_care_plan_items_updated_at BEFORE UPDATE ON care_plan_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sbar_reports_updated_at BEFORE UPDATE ON sbar_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nursing_assessments_updated_at BEFORE UPDATE ON nursing_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View: Complete care plan with all linked data
CREATE OR REPLACE VIEW care_plans_complete AS
SELECT 
  cp.*,
  json_agg(
    json_build_object(
      'id', cpi.id,
      'nanda', nd.label,
      'nanda_code', nd.code,
      'icd10', ic.short_title,
      'icd10_code', ic.code,
      'status', cpi.status,
      'baseline_score', cpi.baseline_score,
      'current_score', cpi.current_score,
      'target_score', cpi.target_score
    )
  ) AS items
FROM nursing_care_plans cp
LEFT JOIN care_plan_items cpi ON cp.id = cpi.care_plan_id
LEFT JOIN nanda_diagnoses nd ON cpi.nanda_id = nd.id
LEFT JOIN icd10_codes ic ON cpi.icd10_id = ic.id
GROUP BY cp.id;

-- View: ICD-10 with linked NANDA diagnoses
CREATE OR REPLACE VIEW icd10_with_nanda AS
SELECT 
  ic.*,
  json_agg(
    json_build_object(
      'nanda_id', nd.id,
      'nanda_code', nd.code,
      'nanda_label', nd.label,
      'relevance', inm.relevance,
      'rationale', inm.rationale
    )
  ) AS nursing_diagnoses
FROM icd10_codes ic
LEFT JOIN icd10_nanda_mappings inm ON ic.id = inm.icd10_id
LEFT JOIN nanda_diagnoses nd ON inm.nanda_id = nd.id
GROUP BY ic.id;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE nanda_diagnoses IS 'NANDA-I standardized nursing diagnoses';
COMMENT ON TABLE nic_interventions IS 'NIC standardized nursing interventions';
COMMENT ON TABLE noc_outcomes IS 'NOC standardized nursing outcomes';
COMMENT ON TABLE icd10_nanda_mappings IS 'THE KEY DIFFERENTIATOR: Links medical (ICD-10) to nursing (NANDA) diagnoses';
COMMENT ON TABLE nanda_nic_noc_linkages IS 'Evidence-based linkages between NANDA, NIC, and NOC';
COMMENT ON TABLE nursing_care_plans IS 'Patient-specific nursing care plans';
COMMENT ON TABLE care_plan_items IS 'Individual nursing diagnoses within care plans';
COMMENT ON TABLE sbar_reports IS 'Structured SBAR handoff reports';
COMMENT ON TABLE nursing_assessments IS 'Structured nursing assessments';

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
-- Next steps:
-- 1. Run this schema in Supabase SQL Editor
-- 2. Load sample data from nursing-sample-data.sql
-- 3. Test queries and relationships
