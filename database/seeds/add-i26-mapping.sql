-- Add mapping for I26.0 (Pulmonary embolism)
-- This is needed for the care plan generation test

-- First, ensure I26.0 exists in icd10_codes
-- (It should already exist from the ICD-10 database)

-- Add NANDA mapping for Pulmonary Embolism
INSERT INTO icd10_nanda_mappings (icd10_id, nanda_id, relevance, rationale, evidence_level) VALUES
((SELECT id FROM icd10_codes WHERE code = 'I26.0' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00030'),
 'primary',
 'Pulmonary embolism causes impaired gas exchange due to blocked pulmonary blood flow and ventilation-perfusion mismatch',
 'research')
ON CONFLICT (icd10_id, nanda_id) DO NOTHING;

INSERT INTO icd10_nanda_mappings (icd10_id, nanda_id, relevance, rationale, evidence_level) VALUES
((SELECT id FROM icd10_codes WHERE code = 'I26.0' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00032'),
 'secondary',
 'Pulmonary embolism often causes ineffective breathing pattern due to hypoxia and anxiety',
 'clinical_practice')
ON CONFLICT (icd10_id, nanda_id) DO NOTHING;

INSERT INTO icd10_nanda_mappings (icd10_id, nanda_id, relevance, rationale, evidence_level) VALUES
((SELECT id FROM icd10_codes WHERE code = 'I26.0' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00146'),
 'secondary',
 'Anxiety commonly occurs with pulmonary embolism due to dyspnea and fear of death',
 'clinical_practice')
ON CONFLICT (icd10_id, nanda_id) DO NOTHING;

INSERT INTO icd10_nanda_mappings (icd10_id, nanda_id, relevance, rationale, evidence_level) VALUES
((SELECT id FROM icd10_codes WHERE code = 'I26.0' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00132'),
 'related',
 'Acute pain may occur with pulmonary embolism, typically pleuritic chest pain',
 'clinical_practice')
ON CONFLICT (icd10_id, nanda_id) DO NOTHING;

-- Verify the mappings were created
SELECT 
  i.code as icd10_code,
  i.short_title as icd10_title,
  n.code as nanda_code,
  n.label as nanda_label,
  m.relevance
FROM icd10_nanda_mappings m
JOIN icd10_codes i ON i.id = m.icd10_id
JOIN nanda_diagnoses n ON n.id = m.nanda_id
WHERE i.code = 'I26.0'
ORDER BY 
  CASE m.relevance 
    WHEN 'primary' THEN 1
    WHEN 'secondary' THEN 2
    WHEN 'related' THEN 3
  END;
