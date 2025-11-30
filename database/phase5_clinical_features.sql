-- Phase 5: Advanced Clinical Features
-- Drug Interactions and Lab Results Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- DRUG INTERACTIONS TABLES
-- ============================================

-- Table: medications
-- Store comprehensive medication information
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  generic_name TEXT,
  drug_class TEXT,
  common_dosages TEXT[],
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for medication search
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);
CREATE INDEX IF NOT EXISTS idx_medications_generic ON medications(generic_name);
CREATE INDEX IF NOT EXISTS idx_medications_class ON medications(drug_class);
CREATE INDEX IF NOT EXISTS idx_medications_search ON medications USING gin(to_tsvector('english', name || ' ' || COALESCE(generic_name, '') || ' ' || COALESCE(drug_class, '')));

-- Table: drug_interactions
-- Store known drug-drug interactions
CREATE TABLE IF NOT EXISTS drug_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drug1_name TEXT NOT NULL,
  drug2_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('major', 'moderate', 'minor')),
  description TEXT NOT NULL,
  mechanism TEXT,
  recommendation TEXT NOT NULL,
  reference_sources TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for interaction lookups
CREATE INDEX IF NOT EXISTS idx_drug_interactions_drug1 ON drug_interactions(drug1_name);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_drug2 ON drug_interactions(drug2_name);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_severity ON drug_interactions(severity);

-- Table: drug_contraindications
-- Store drug-condition contraindications
CREATE TABLE IF NOT EXISTS drug_contraindications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drug_name TEXT NOT NULL,
  condition TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('absolute', 'relative')),
  description TEXT NOT NULL,
  mechanism TEXT,
  alternatives TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for contraindication lookups
CREATE INDEX IF NOT EXISTS idx_drug_contraindications_drug ON drug_contraindications(drug_name);
CREATE INDEX IF NOT EXISTS idx_drug_contraindications_condition ON drug_contraindications(condition);

-- Table: patient_medications
-- Track medications prescribed to patients
CREATE TABLE IF NOT EXISTS patient_medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,
  medication_name TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT,
  frequency TEXT,
  route TEXT,
  start_date DATE,
  end_date DATE,
  prescribed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for patient medication lookups
CREATE INDEX IF NOT EXISTS idx_patient_medications_patient ON patient_medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medications_active ON patient_medications(active);
CREATE INDEX IF NOT EXISTS idx_patient_medications_dates ON patient_medications(start_date, end_date);

-- Enable RLS
ALTER TABLE patient_medications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own patient medications
DROP POLICY IF EXISTS "Users manage own patient medications" ON patient_medications;
CREATE POLICY "Users manage own patient medications" ON patient_medications
  FOR ALL USING (auth.uid() = prescribed_by);

-- ============================================
-- LAB RESULTS TABLES
-- ============================================

-- Table: lab_tests
-- Master list of available lab tests with reference ranges
CREATE TABLE IF NOT EXISTS lab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_name TEXT NOT NULL UNIQUE,
  common_abbreviations TEXT[],
  category TEXT,
  unit TEXT NOT NULL,
  normal_min NUMERIC,
  normal_max NUMERIC,
  critical_low NUMERIC,
  critical_high NUMERIC,
  interpretation_low TEXT,
  interpretation_high TEXT,
  interpretation_critical_low TEXT,
  interpretation_critical_high TEXT,
  clinical_significance TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lab test lookups
CREATE INDEX IF NOT EXISTS idx_lab_tests_name ON lab_tests(test_name);
CREATE INDEX IF NOT EXISTS idx_lab_tests_category ON lab_tests(category);
CREATE INDEX IF NOT EXISTS idx_lab_tests_search ON lab_tests USING gin(to_tsvector('english', test_name || ' ' || COALESCE(category, '')));

-- Table: patient_lab_results
-- Store lab results for patients
CREATE TABLE IF NOT EXISTS patient_lab_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,
  encounter_id UUID,
  test_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  status TEXT CHECK (status IN ('normal', 'high', 'low', 'critical-high', 'critical-low')),
  interpretation TEXT,
  clinical_significance TEXT,
  recommendations TEXT[],
  ordered_by UUID REFERENCES auth.users(id),
  result_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lab result lookups
CREATE INDEX IF NOT EXISTS idx_patient_lab_results_patient ON patient_lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_lab_results_encounter ON patient_lab_results(encounter_id);
CREATE INDEX IF NOT EXISTS idx_patient_lab_results_test ON patient_lab_results(test_name);
CREATE INDEX IF NOT EXISTS idx_patient_lab_results_date ON patient_lab_results(result_date DESC);
CREATE INDEX IF NOT EXISTS idx_patient_lab_results_status ON patient_lab_results(status);

-- Enable RLS
ALTER TABLE patient_lab_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access lab results they ordered
DROP POLICY IF EXISTS "Users manage own lab results" ON patient_lab_results;
CREATE POLICY "Users manage own lab results" ON patient_lab_results
  FOR ALL USING (auth.uid() = ordered_by);

-- ============================================
-- SEED DATA: MEDICATIONS
-- ============================================

INSERT INTO medications (name, generic_name, drug_class, common_dosages, description) VALUES
('Lisinopril', 'lisinopril', 'ACE Inhibitor', ARRAY['5mg', '10mg', '20mg', '40mg'], 'Angiotensin-converting enzyme inhibitor for hypertension and heart failure'),
('Metformin', 'metformin', 'Biguanide', ARRAY['500mg', '850mg', '1000mg'], 'First-line oral medication for type 2 diabetes'),
('Atorvastatin', 'atorvastatin', 'Statin', ARRAY['10mg', '20mg', '40mg', '80mg'], 'HMG-CoA reductase inhibitor for cholesterol management'),
('Aspirin', 'aspirin', 'Antiplatelet', ARRAY['81mg', '325mg'], 'Antiplatelet agent for cardiovascular protection'),
('Warfarin', 'warfarin', 'Anticoagulant', ARRAY['1mg', '2mg', '5mg'], 'Vitamin K antagonist for anticoagulation'),
('Ibuprofen', 'ibuprofen', 'NSAID', ARRAY['200mg', '400mg', '600mg', '800mg'], 'Non-steroidal anti-inflammatory drug'),
('Sertraline', 'sertraline', 'SSRI', ARRAY['25mg', '50mg', '100mg'], 'Selective serotonin reuptake inhibitor for depression/anxiety'),
('Metoprolol', 'metoprolol', 'Beta Blocker', ARRAY['25mg', '50mg', '100mg'], 'Beta-adrenergic blocker for hypertension and heart conditions'),
('Amlodipine', 'amlodipine', 'Calcium Channel Blocker', ARRAY['2.5mg', '5mg', '10mg'], 'Calcium channel blocker for hypertension'),
('Digoxin', 'digoxin', 'Cardiac Glycoside', ARRAY['0.125mg', '0.25mg'], 'Cardiac glycoside for heart failure and atrial fibrillation'),
('Amiodarone', 'amiodarone', 'Antiarrhythmic', ARRAY['200mg', '400mg'], 'Antiarrhythmic medication for cardiac rhythm disorders'),
('Azithromycin', 'azithromycin', 'Macrolide', ARRAY['250mg', '500mg'], 'Macrolide antibiotic'),
('Potassium Chloride', 'potassium chloride', 'Electrolyte', ARRAY['10mEq', '20mEq'], 'Potassium supplement'),
('Omeprazole', 'omeprazole', 'PPI', ARRAY['20mg', '40mg'], 'Proton pump inhibitor for acid reduction')
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: DRUG INTERACTIONS
-- ============================================

INSERT INTO drug_interactions (drug1_name, drug2_name, severity, description, mechanism, recommendation, reference_sources) VALUES
-- Major interactions
('Warfarin', 'Aspirin', 'major', 'Increased risk of bleeding when combining anticoagulants with antiplatelet agents.', 'Additive antiplatelet and anticoagulant effects', 'Monitor INR closely. Consider alternative antiplatelet if possible. Watch for signs of bleeding.', ARRAY['FDA Drug Safety Communication', 'UpToDate 2025']),
('Warfarin', 'Ibuprofen', 'major', 'NSAIDs can increase bleeding risk and reduce anticoagulant effectiveness.', 'Platelet inhibition and GI irritation', 'Avoid concurrent use. Use acetaminophen for pain if needed. If necessary, use lowest NSAID dose for shortest duration.', ARRAY['American College of Cardiology Guidelines']),
('Metformin', 'Contrast Dye', 'major', 'Risk of lactic acidosis when metformin is used with iodinated contrast.', 'Contrast-induced nephropathy can impair metformin clearance', 'Hold metformin 48 hours before and after contrast procedures. Check renal function before restarting.', ARRAY['ACR Contrast Media Guidelines']),
('Digoxin', 'Amiodarone', 'major', 'Amiodarone significantly increases digoxin levels, raising toxicity risk.', 'Amiodarone inhibits P-glycoprotein, reducing digoxin clearance', 'Reduce digoxin dose by 50% when starting amiodarone. Monitor digoxin levels closely. Watch for bradycardia, nausea, visual changes.', ARRAY['ACC/AHA Heart Failure Guidelines']),

-- Moderate interactions
('Lisinopril', 'Potassium Chloride', 'moderate', 'ACE inhibitors can cause hyperkalemia, especially with potassium supplements.', 'ACE inhibitors reduce aldosterone, decreasing potassium excretion', 'Monitor potassium levels. Avoid potassium-sparing diuretics. Check renal function regularly.', ARRAY['UpToDate 2025']),
('Sertraline', 'Ibuprofen', 'moderate', 'SSRIs combined with NSAIDs increase risk of GI bleeding.', 'SSRIs affect platelet function; NSAIDs irritate GI mucosa', 'Consider PPI for gastroprotection. Monitor for signs of GI bleeding. Use lowest effective NSAID dose.', ARRAY['FDA Drug Safety Communication']),
('Atorvastatin', 'Azithromycin', 'moderate', 'Macrolide antibiotics can increase statin levels, raising rhabdomyolysis risk.', 'Macrolides inhibit CYP3A4, increasing statin exposure', 'Consider statin dose reduction or temporary discontinuation during antibiotic course. Educate patient on muscle pain symptoms.', ARRAY['Lexicomp Drug Interactions']),
('Metoprolol', 'Amlodipine', 'moderate', 'Both drugs slow heart rate and can cause bradycardia or hypotension.', 'Additive negative chronotropic and inotropic effects', 'Monitor heart rate and blood pressure closely. Use with caution in elderly. Watch for dizziness, fatigue.', ARRAY['AHA Hypertension Guidelines']),

-- Minor interactions
('Metformin', 'Omeprazole', 'minor', 'PPIs may reduce vitamin B12 absorption, which metformin also affects.', 'Both medications can interfere with B12 absorption', 'Monitor B12 levels annually. Consider B12 supplementation if deficiency develops.', ARRAY['Clinical Pharmacology']),
('Lisinopril', 'Ibuprofen', 'moderate', 'NSAIDs can reduce the antihypertensive effect of ACE inhibitors.', 'NSAIDs cause sodium retention and reduce prostaglandin synthesis', 'Monitor blood pressure. Use alternative analgesics when possible (acetaminophen). Check renal function.', ARRAY['JNC 8 Guidelines'])
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: DRUG CONTRAINDICATIONS
-- ============================================

INSERT INTO drug_contraindications (drug_name, condition, severity, description, mechanism, alternatives) VALUES
-- Absolute contraindications
('Metformin', 'Renal Failure', 'absolute', 'Metformin is contraindicated in severe renal impairment (eGFR <30 mL/min/1.73m²).', 'Risk of lactic acidosis due to drug accumulation', ARRAY['Insulin', 'GLP-1 agonists', 'DPP-4 inhibitors']),
('Lisinopril', 'Pregnancy', 'absolute', 'ACE inhibitors are teratogenic and contraindicated in pregnancy.', 'Can cause fetal renal dysfunction, oligohydramnios, and skeletal malformations', ARRAY['Methyldopa', 'Labetalol', 'Nifedipine']),
('Warfarin', 'Active Bleeding', 'absolute', 'Anticoagulants are contraindicated in active major bleeding.', 'Will worsen ongoing hemorrhage', ARRAY['Address bleeding source', 'Vitamin K', 'Prothrombin complex concentrate']),

-- Relative contraindications
('Ibuprofen', 'Peptic Ulcer Disease', 'relative', 'NSAIDs can worsen peptic ulcer disease and cause GI bleeding.', 'Inhibition of prostaglandins reduces gastric mucosal protection', ARRAY['Acetaminophen', 'Topical NSAIDs', 'COX-2 selective inhibitors with PPI']),
('Metoprolol', 'Asthma', 'relative', 'Non-selective beta blockers can trigger bronchospasm in asthma.', 'Beta-2 receptor blockade causes bronchoconstriction', ARRAY['Calcium channel blockers', 'ACE inhibitors', 'Cardioselective beta blockers (with caution)']),
('Aspirin', 'Asthma', 'relative', 'Aspirin can cause bronchospasm in aspirin-sensitive asthma patients.', 'Shifts arachidonic acid metabolism toward leukotrienes', ARRAY['Clopidogrel', 'Aspirin desensitization (if necessary)']),
('Metformin', 'Liver Disease', 'relative', 'Metformin should be used cautiously in hepatic impairment.', 'Increased risk of lactic acidosis', ARRAY['Insulin', 'GLP-1 agonists', 'SGLT2 inhibitors']),
('Digoxin', 'Hypokalemia', 'relative', 'Low potassium increases digoxin toxicity risk.', 'Hypokalemia enhances digoxin binding to Na-K-ATPase', ARRAY['Correct potassium first', 'Alternative rate control agents'])
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: LAB TESTS REFERENCE RANGES
-- ============================================

INSERT INTO lab_tests (
  test_name, 
  common_abbreviations, 
  category, 
  unit, 
  normal_min, 
  normal_max, 
  critical_low, 
  critical_high,
  interpretation_low,
  interpretation_high,
  interpretation_critical_low,
  interpretation_critical_high,
  clinical_significance
) VALUES
-- Hematology
('Hemoglobin', ARRAY['Hgb', 'Hb'], 'Hematology', 'g/dL', 12.0, 16.0, 7.0, 20.0,
 'Anemia - reduced oxygen-carrying capacity',
 'Polycythemia - increased red blood cell mass',
 'Severe anemia - immediate transfusion may be needed',
 'Severe polycythemia - risk of thrombosis',
 'Hemoglobin carries oxygen in the blood. Low levels indicate anemia; high levels suggest polycythemia.'),

('White Blood Cell Count', ARRAY['WBC', 'Leukocytes'], 'Hematology', '10^9/L', 4.0, 11.0, 1.0, 30.0,
 'Leukopenia - increased infection risk',
 'Leukocytosis - possible infection, inflammation, or leukemia',
 'Severe leukopenia - neutropenic precautions needed',
 'Severe leukocytosis - possible leukemia or severe sepsis',
 'WBC count indicates immune system activity and helps diagnose infections and blood disorders.'),

('Platelet Count', ARRAY['PLT', 'Platelets'], 'Hematology', '10^9/L', 150, 400, 20, 1000,
 'Thrombocytopenia - increased bleeding risk',
 'Thrombocytosis - increased clotting risk',
 'Severe thrombocytopenia - spontaneous bleeding risk',
 'Extreme thrombocytosis - thrombosis risk',
 'Platelets are essential for blood clotting. Abnormal counts affect bleeding and clotting risk.'),

-- Chemistry
('Glucose', ARRAY['Glu', 'Blood Sugar'], 'Chemistry', 'mg/dL', 70, 100, 40, 400,
 'Hypoglycemia - may cause confusion, seizures, loss of consciousness',
 'Hyperglycemia - possible diabetes or poor glycemic control',
 'Severe hypoglycemia - immediate glucose needed to prevent brain damage',
 'Severe hyperglycemia - risk of DKA or HHS',
 'Blood glucose reflects carbohydrate metabolism and diabetes control.'),

('Creatinine', ARRAY['Cr', 'SCr'], 'Chemistry', 'mg/dL', 0.6, 1.2, NULL, 5.0,
 'Low muscle mass or increased GFR',
 'Renal impairment - reduced kidney function',
 NULL,
 'Severe renal failure - dialysis may be needed',
 'Creatinine is a waste product filtered by kidneys. Elevated levels indicate kidney dysfunction.'),

('Potassium', ARRAY['K', 'K+'], 'Electrolytes', 'mmol/L', 3.5, 5.0, 2.5, 6.5,
 'Hypokalemia - cardiac arrhythmia risk, muscle weakness',
 'Hyperkalemia - cardiac arrest risk',
 'Severe hypokalemia - life-threatening arrhythmias',
 'Severe hyperkalemia - immediate treatment needed (EKG changes, arrest risk)',
 'Potassium is critical for cardiac and muscle function. Abnormal levels can cause fatal arrhythmias.'),

('Sodium', ARRAY['Na', 'Na+'], 'Electrolytes', 'mmol/L', 135, 145, 120, 160,
 'Hyponatremia - confusion, seizures possible',
 'Hypernatremia - dehydration, altered mental status',
 'Severe hyponatremia - seizure risk, brain swelling',
 'Severe hypernatremia - neurological damage risk',
 'Sodium regulates fluid balance and nerve function. Severe abnormalities affect brain function.'),

-- Liver Function
('Alanine Aminotransferase', ARRAY['ALT', 'SGPT'], 'Liver Function', 'U/L', 7, 56, NULL, 1000,
 NULL,
 'Elevated liver enzymes - hepatocellular injury',
 NULL,
 'Severe hepatitis - acute liver failure possible',
 'ALT is a liver enzyme. Elevation indicates liver cell damage from various causes.'),

('Aspartate Aminotransferase', ARRAY['AST', 'SGOT'], 'Liver Function', 'U/L', 10, 40, NULL, 1000,
 NULL,
 'Elevated AST - liver or cardiac injury',
 NULL,
 'Severe elevation - acute hepatic necrosis or myocardial infarction',
 'AST is found in liver and heart. Elevation indicates tissue damage.'),

-- Coagulation
('International Normalized Ratio', ARRAY['INR'], 'Coagulation', 'ratio', 0.8, 1.2, NULL, 5.0,
 NULL,
 'Prolonged INR - increased bleeding risk',
 NULL,
 'Severe coagulopathy - major bleeding risk',
 'INR measures blood clotting time. Used to monitor warfarin therapy. Therapeutic range for anticoagulation is typically 2.0-3.0.'),

-- Endocrine
('Hemoglobin A1C', ARRAY['HbA1c', 'A1C'], 'Endocrine', '%', 4.0, 5.6, NULL, 14.0,
 NULL,
 'Elevated HbA1c - poor glycemic control (>6.5% indicates diabetes)',
 NULL,
 'Severe hyperglycemia - very poor diabetes control',
 'HbA1c reflects average blood sugar over 2-3 months. Used for diabetes diagnosis and monitoring.'),

('Thyroid Stimulating Hormone', ARRAY['TSH'], 'Endocrine', 'mIU/L', 0.4, 4.0, 0.01, 20.0,
 'Low TSH - possible hyperthyroidism',
 'High TSH - possible hypothyroidism',
 'Severe hyperthyroidism - thyroid storm risk',
 'Severe hypothyroidism - myxedema coma risk',
 'TSH regulates thyroid hormone production. Abnormal levels indicate thyroid dysfunction.'),

-- Lipids
('Total Cholesterol', ARRAY['TC', 'Cholesterol'], 'Lipids', 'mg/dL', 0, 200, NULL, 400,
 NULL,
 'Hypercholesterolemia - increased cardiovascular risk',
 NULL,
 NULL,
 'Elevated cholesterol increases risk of heart disease and stroke.'),

('LDL Cholesterol', ARRAY['LDL', 'LDL-C'], 'Lipids', 'mg/dL', 0, 100, NULL, 190,
 NULL,
 'Elevated LDL - increased atherosclerosis risk',
 NULL,
 NULL,
 'LDL is "bad cholesterol" that contributes to plaque buildup in arteries.'),

('HDL Cholesterol', ARRAY['HDL', 'HDL-C'], 'Lipids', 'mg/dL', 40, 200, NULL, NULL,
 'Low HDL - increased cardiovascular risk',
 NULL,
 NULL,
 NULL,
 'HDL is "good cholesterol" that helps remove cholesterol from arteries. Higher is better.'),

('Triglycerides', ARRAY['TG', 'TRIG'], 'Lipids', 'mg/dL', 0, 150, NULL, 500,
 NULL,
 'Hypertriglyceridemia - increased cardiovascular and pancreatitis risk',
 NULL,
 'Severe hypertriglyceridemia - acute pancreatitis risk',
 'Elevated triglycerides increase cardiovascular risk and can cause pancreatitis.')

ON CONFLICT (test_name) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check for drug interactions
CREATE OR REPLACE FUNCTION check_drug_interactions(medication_names TEXT[])
RETURNS TABLE (
  drug1 TEXT,
  drug2 TEXT,
  severity TEXT,
  description TEXT,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    di.drug1_name,
    di.drug2_name,
    di.severity,
    di.description,
    di.recommendation
  FROM drug_interactions di
  WHERE 
    di.drug1_name = ANY(medication_names) AND
    di.drug2_name = ANY(medication_names)
  ORDER BY 
    CASE di.severity
      WHEN 'major' THEN 1
      WHEN 'moderate' THEN 2
      WHEN 'minor' THEN 3
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to interpret lab result
CREATE OR REPLACE FUNCTION interpret_lab_result(
  test_name_input TEXT,
  value_input NUMERIC
)
RETURNS TABLE (
  status TEXT,
  interpretation TEXT,
  clinical_significance TEXT
) AS $$
DECLARE
  test_info RECORD;
BEGIN
  SELECT * INTO test_info
  FROM lab_tests
  WHERE test_name = test_name_input
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      'unknown'::TEXT,
      'Reference range not available'::TEXT,
      'Consult laboratory reference ranges'::TEXT;
    RETURN;
  END IF;
  
  -- Check critical ranges
  IF test_info.critical_low IS NOT NULL AND value_input <= test_info.critical_low THEN
    RETURN QUERY SELECT 
      'critical-low'::TEXT,
      test_info.interpretation_critical_low,
      'CRITICAL - Immediate intervention may be required'::TEXT;
  ELSIF test_info.critical_high IS NOT NULL AND value_input >= test_info.critical_high THEN
    RETURN QUERY SELECT 
      'critical-high'::TEXT,
      test_info.interpretation_critical_high,
      'CRITICAL - Immediate intervention may be required'::TEXT;
  -- Check normal ranges
  ELSIF value_input < test_info.normal_min THEN
    RETURN QUERY SELECT 
      'low'::TEXT,
      test_info.interpretation_low,
      'Abnormal - clinical correlation recommended'::TEXT;
  ELSIF value_input > test_info.normal_max THEN
    RETURN QUERY SELECT 
      'high'::TEXT,
      test_info.interpretation_high,
      'Abnormal - clinical correlation recommended'::TEXT;
  ELSE
    RETURN QUERY SELECT 
      'normal'::TEXT,
      'Within normal limits'::TEXT,
      'Normal result'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE medications IS 'Comprehensive medication database with drug information';
COMMENT ON TABLE drug_interactions IS 'Known drug-drug interactions with severity ratings';
COMMENT ON TABLE drug_contraindications IS 'Drug-condition contraindications';
COMMENT ON TABLE patient_medications IS 'Patient-specific medication lists';
COMMENT ON TABLE lab_tests IS 'Master list of lab tests with reference ranges';
COMMENT ON TABLE patient_lab_results IS 'Patient lab results with interpretations';

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Phase 5 Clinical Features Database Setup Complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created Tables:';
  RAISE NOTICE '  - medications (14 common drugs)';
  RAISE NOTICE '  - drug_interactions (10 interactions)';
  RAISE NOTICE '  - drug_contraindications (8 contraindications)';
  RAISE NOTICE '  - patient_medications (with RLS)';
  RAISE NOTICE '  - lab_tests (16 common tests)';
  RAISE NOTICE '  - patient_lab_results (with RLS)';
  RAISE NOTICE '';
  RAISE NOTICE 'Created Functions:';
  RAISE NOTICE '  - check_drug_interactions()';
  RAISE NOTICE '  - interpret_lab_result()';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Update services to use database';
  RAISE NOTICE '  2. Test drug interaction checker';
  RAISE NOTICE '  3. Test lab results interpreter';
END $$;
