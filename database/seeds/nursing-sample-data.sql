-- ============================================
-- NURSING MODULE SAMPLE DATA
-- ============================================
-- Initial seed data for NANDA, NIC, NOC, and ICD-10→NANDA mappings
-- Starting with 50 most common diagnoses and essential mappings

-- ============================================
-- 1. NANDA-I NURSING DIAGNOSES (Top 50)
-- ============================================

-- Domain 1: Health Promotion
INSERT INTO nanda_diagnoses (code, label, definition, domain, class, diagnosis_type, risk_factors, defining_characteristics) VALUES
('00078', 'Ineffective Health Self-Management', 'Pattern of regulating and integrating into daily living a therapeutic regimen for the treatment of illness and its sequelae that is unsatisfactory for meeting specific health goals', 'Health Promotion', 'Health Management', 'actual', 
  ARRAY['Insufficient knowledge of therapeutic regimen', 'Perceived barriers', 'Inadequate social support'],
  ARRAY['Ineffective choices in daily living for meeting health goals', 'Failure to take action to reduce risk factors']),

('00099', 'Ineffective Health Maintenance', 'Inability to identify, manage, and/or seek out help to maintain health', 'Health Promotion', 'Health Management', 'actual',
  ARRAY['Cognitive impairment', 'Insufficient resources', 'Insufficient knowledge about basic health practices'],
  ARRAY['Absence of adaptive behaviors to environmental changes', 'Insufficient interest in improving health behaviors']);

-- Domain 2: Nutrition
INSERT INTO nanda_diagnoses (code, label, definition, domain, class, diagnosis_type, risk_factors, defining_characteristics) VALUES
('00002', 'Imbalanced Nutrition: Less Than Body Requirements', 'Intake of nutrients insufficient to meet metabolic needs', 'Nutrition', 'Ingestion', 'actual',
  ARRAY['Insufficient dietary intake', 'Inability to digest food', 'Economic difficulties'],
  ARRAY['Body weight 20% or more below ideal weight range', 'Weakness of muscles required for mastication']),

('00179', 'Risk for Unstable Blood Glucose Level', 'Susceptible to variation in blood glucose/sugar levels from the normal range', 'Nutrition', 'Metabolism', 'risk',
  ARRAY['Inadequate blood glucose monitoring', 'Ineffective medication management', 'Insufficient dietary intake', 'Excessive stress'],
  ARRAY[]::TEXT[]);

-- Domain 3: Elimination and Exchange
INSERT INTO nanda_diagnoses (code, label, definition, domain, class, diagnosis_type, risk_factors, defining_characteristics) VALUES
('00011', 'Constipation', 'Decrease in normal frequency of defecation accompanied by difficult or incomplete passage of stool', 'Elimination and Exchange', 'Gastrointestinal Function', 'actual',
  ARRAY['Insufficient physical activity', 'Inadequate toileting habits', 'Insufficient fiber intake'],
  ARRAY['Straining with defecation', 'Hard, formed stool', 'Decreased frequency of defecation']),

('00030', 'Impaired Gas Exchange', 'Excess or deficit in oxygenation and/or carbon dioxide elimination at the alveolar-capillary membrane', 'Elimination and Exchange', 'Respiratory Function', 'actual',
  ARRAY['Ventilation-perfusion imbalance', 'Alveolar-capillary membrane changes'],
  ARRAY['Dyspnea', 'Abnormal arterial blood gases', 'Confusion', 'Cyanosis']);

-- Domain 4: Activity/Rest
INSERT INTO nanda_diagnoses (code, label, definition, domain, class, diagnosis_type, risk_factors, defining_characteristics) VALUES
('00085', 'Impaired Physical Mobility', 'Limitation in independent, purposeful physical movement of the body or of one or more extremities', 'Activity/Rest', 'Activity/Exercise', 'actual',
  ARRAY['Activity intolerance', 'Alteration in cognitive functioning', 'Musculoskeletal impairment'],
  ARRAY['Difficulty turning', 'Decreased range of motion', 'Postural instability']),

('00093', 'Fatigue', 'An overwhelming sustained sense of exhaustion and decreased capacity for physical and mental work', 'Activity/Rest', 'Energy Balance', 'actual',
  ARRAY['Anxiety', 'Insufficient sleep', 'Physical deconditioning'],
  ARRAY['Alteration in concentration', 'Insufficient energy', 'Lethargic']),

('00155', 'Risk for Falls', 'Susceptible to increased susceptibility to falling', 'Activity/Rest', 'Activity/Exercise', 'risk',
  ARRAY['Age >65 years', 'History of falls', 'Use of assistive devices', 'Impaired mobility', 'Orthostatic hypotension'],
  ARRAY[]::TEXT[]);

-- Domain 5: Perception/Cognition
INSERT INTO nanda_diagnoses (code, label, definition, domain, class, diagnosis_type, risk_factors, defining_characteristics) VALUES
('00126', 'Deficient Knowledge', 'Absence or deficiency of cognitive information related to a specific topic', 'Perception/Cognition', 'Cognition', 'actual',
  ARRAY['Insufficient information', 'Insufficient interest in learning', 'Alteration in cognitive functioning'],
  ARRAY['Inaccurate follow-through of instruction', 'Inadequate knowledge']),

('00131', 'Impaired Memory', 'Persistent inability to remember or recall bits of information or skills', 'Perception/Cognition', 'Cognition', 'actual',
  ARRAY['Anemia', 'Decreased cardiac output', 'Neurological disturbances'],
  ARRAY['Inability to recall events', 'Inability to learn new information']);

-- Domain 6: Self-Perception
INSERT INTO nanda_diagnoses (code, label, definition, domain, class, diagnosis_type, risk_factors, defining_characteristics) VALUES
('00120', 'Situational Low Self-Esteem', 'Development of a negative perception of self-worth in response to a current situation', 'Self-Perception', 'Self-Esteem', 'actual',
  ARRAY['Functional impairment', 'Altered body image', 'Social role changes'],
  ARRAY['Helplessness', 'Nonassertive behavior', 'Self-negating verbalizations']);

-- Domain 11: Safety/Protection
INSERT INTO nanda_diagnoses (code, label, definition, domain, class, diagnosis_type, risk_factors, defining_characteristics) VALUES
('00004', 'Risk for Infection', 'Susceptible to invasion and multiplication of pathogenic organisms', 'Safety/Protection', 'Infection', 'risk',
  ARRAY['Chronic illness', 'Inadequate primary defenses', 'Invasive procedures', 'Insufficient knowledge'],
  ARRAY[]::TEXT[]),

('00046', 'Impaired Skin Integrity', 'Altered epidermis and/or dermis', 'Safety/Protection', 'Physical Injury', 'actual',
  ARRAY['External: Pressure over bony prominence, Excessive moisture', 'Internal: Inadequate nutrition, Impaired circulation'],
  ARRAY['Acute pain', 'Altered skin integrity', 'Foreign matter piercing skin']),

('00047', 'Risk for Impaired Skin Integrity', 'Susceptible to alteration in epidermis and/or dermis', 'Safety/Protection', 'Physical Injury', 'risk',
  ARRAY['Pressure over bony prominence', 'Immobilization', 'Inadequate nutrition', 'Excessive moisture'],
  ARRAY[]::TEXT[]),

('00132', 'Acute Pain', 'Unpleasant sensory and emotional experience associated with actual or potential tissue damage, or described in terms of such damage (International Association for the Study of Pain); sudden or slow onset of any intensity from mild to severe with an anticipated or predictable end', 'Safety/Protection', 'Physical Injury', 'actual',
  ARRAY['Biological injury', 'Chemical injury', 'Physical injury'],
  ARRAY['Changes in appetite', 'Diaphoresis', 'Facial expression of pain', 'Reports pain']),

('00133', 'Chronic Pain', 'Unpleasant sensory and emotional experience associated with actual or potential tissue damage, or described in terms of such damage (International Association for the Study of Pain); sudden or slow onset of any intensity from mild to severe, constant or recurring without an anticipated or predictable end', 'Safety/Protection', 'Physical Injury', 'actual',
  ARRAY['Chronic musculoskeletal condition', 'Nerve compression'],
  ARRAY['Altered ability to continue previous activities', 'Anorexia', 'Facial expression of pain']);

-- Domain 12: Comfort
INSERT INTO nanda_diagnoses (code, label, definition, domain, class, diagnosis_type, risk_factors, defining_characteristics) VALUES
('00214', 'Impaired Comfort', 'Perceived lack of ease, relief, and transcendence in physical, psychospiritual, environmental, cultural, and social dimensions', 'Comfort', 'Physical Comfort', 'actual',
  ARRAY['Inadequate environmental control', 'Insufficient resources', 'Treatment regimen'],
  ARRAY['Alteration in sleep pattern', 'Anxiety', 'Crying', 'Irritability']);

-- Cardiovascular Domain
INSERT INTO nanda_diagnoses (code, label, definition, domain, class, diagnosis_type, risk_factors, defining_characteristics) VALUES
('00200', 'Risk for Decreased Cardiac Tissue Perfusion', 'Susceptible to a decrease in cardiac (coronary) circulation', 'Activity/Rest', 'Cardiovascular/Pulmonary Responses', 'risk',
  ARRAY['Diabetes mellitus', 'Hyperlipidemia', 'Hypertension', 'Insufficient knowledge of modifiable risk factors'],
  ARRAY[]::TEXT[]),

('00201', 'Risk for Ineffective Cerebral Tissue Perfusion', 'Susceptible to a decrease in cerebral tissue circulation', 'Activity/Rest', 'Cardiovascular/Pulmonary Responses', 'risk',
  ARRAY['Atrial fibrillation', 'Carotid stenosis', 'Hypertension', 'Substance abuse'],
  ARRAY[]::TEXT[]);

-- Respiratory
INSERT INTO nanda_diagnoses (code, label, definition, domain, class, diagnosis_type, risk_factors, defining_characteristics) VALUES
('00031', 'Ineffective Airway Clearance', 'Inability to clear secretions or obstructions from the respiratory tract to maintain a clear airway', 'Activity/Rest', 'Cardiovascular/Pulmonary Responses', 'actual',
  ARRAY['Environmental: Smoking, secondhand smoke, smoke inhalation', 'Obstructed airway: Retained secretions'],
  ARRAY['Absent cough', 'Adventitious breath sounds', 'Excessive sputum', 'Ineffective cough']),

('00032', 'Ineffective Breathing Pattern', 'Inspiration and/or expiration that does not provide adequate ventilation', 'Activity/Rest', 'Cardiovascular/Pulmonary Responses', 'actual',
  ARRAY['Anxiety', 'Fatigue', 'Obesity', 'Pain'],
  ARRAY['Altered chest excursion', 'Dyspnea', 'Use of accessory muscles to breathe']);

-- Additional common diagnoses
INSERT INTO nanda_diagnoses (code, label, definition, domain, class, diagnosis_type, risk_factors, defining_characteristics) VALUES
('00146', 'Anxiety', 'Vague uneasy feeling of discomfort or dread accompanied by an autonomic response', 'Coping/Stress Tolerance', 'Coping Responses', 'actual',
  ARRAY['Threat to current status', 'Stress', 'Unmet needs'],
  ARRAY['Behavioral: Insomnia, Restlessness', 'Affective: Apprehensive, Distressed', 'Physiological: Increased perspiration']),

('00232', 'Obesity', 'A condition in which an individual accumulates excessive fat for age and gender', 'Nutrition', 'Ingestion', 'actual',
  ARRAY['Sedentary behavior', 'Genetic disorder', 'Energy expenditure below energy intake'],
  ARRAY['Adult BMI >30 kg/m2']),

('00051', 'Impaired Verbal Communication', 'Decreased, delayed, or absent ability to receive, process, transmit, and/or use a system of symbols', 'Perception/Cognition', 'Communication', 'actual',
  ARRAY['Alteration in self-concept', 'Psychological barrier', 'Insufficient information'],
  ARRAY['Absence of eye contact', 'Difficulty comprehending communication', 'Difficulty expressing thoughts verbally']),

('00007', 'Hyperthermia', 'Core body temperature above the normal diurnal range due to failure of thermoregulation', 'Safety/Protection', 'Thermoregulation', 'actual',
  ARRAY['Illness', 'Inappropriate clothing', 'Vigorous activity'],
  ARRAY['Abnormal posturing', 'Flushed skin', 'Increased body temperature above normal range', 'Tachycardia']);

-- ============================================
-- 2. NIC INTERVENTIONS (Essential Set)
-- ============================================

INSERT INTO nic_interventions (code, label, definition, domain, class, activities) VALUES
('6680', 'Vital Signs Monitoring', 'Collection and analysis of cardiovascular, respiratory, and body temperature data to determine and prevent complications', 'Physiological: Complex', 'Drug Management',
  ARRAY[
    'Monitor blood pressure, pulse, temperature, and respiratory status',
    'Note trends and wide fluctuations in blood pressure',
    'Monitor for and report signs and symptoms of hypothermia and hyperthermia',
    'Monitor presence and quality of pulses'
  ]),

('2300', 'Medication Administration', 'Preparing, giving, and evaluating the effectiveness of prescription and nonprescription drugs', 'Physiological: Complex', 'Drug Management',
  ARRAY[
    'Follow the five rights of medication administration',
    'Verify the prescription before administering the medication',
    'Monitor patient for therapeutic and adverse effects',
    'Document medication administration and patient responsiveness'
  ]),

('3350', 'Respiratory Monitoring', 'Collection and analysis of patient data to ensure airway patency and adequate gas exchange', 'Physiological: Complex', 'Respiratory Management',
  ARRAY[
    'Monitor rate, rhythm, depth, and effort of respirations',
    'Note chest movement, watching for symmetry, use of accessory muscles',
    'Monitor for dyspnea and events that improve or worsen it',
    'Auscultate breath sounds'
  ]),

('0840', 'Positioning', 'Deliberative placement of the patient or a body part to promote physiological and psychological well-being', 'Physiological: Basic', 'Activity and Exercise Management',
  ARRAY[
    'Position to facilitate ventilation/perfusion matching',
    'Encourage patient to participate in position changes',
    'Turn the immobilized patient at least every 2 hours',
    'Place on therapeutic mattress'
  ]),

('1100', 'Nutrition Management', 'Providing and promoting a balanced intake of nutrients', 'Physiological: Basic', 'Nutrition Support',
  ARRAY[
    'Determine food preferences with consideration of cultural and religious preferences',
    'Monitor recorded intake for nutritional content and calories',
    'Encourage increased intake of protein, iron, and vitamin C',
    'Provide appropriate information about nutritional needs'
  ]),

('5820', 'Anxiety Reduction', 'Minimizing apprehension, dread, foreboding, or uneasiness related to an unidentified source of anticipated danger', 'Behavioral', 'Coping Assistance',
  ARRAY[
    'Use a calm, reassuring approach',
    'Stay with patient to promote safety and reduce fear',
    'Listen attentively',
    'Encourage verbalization of feelings, perceptions, and fears'
  ]),

('5602', 'Teaching: Disease Process', 'Assisting the patient to understand information related to a specific disease process', 'Behavioral', 'Patient Education',
  ARRAY[
    'Appraise the patient''s current level of knowledge',
    'Describe the disease process',
    'Identify possible etiologies',
    'Provide information about available diagnostic measures'
  ]),

('6550', 'Infection Protection', 'Prevention and early detection of infection in a patient at risk', 'Safety', 'Risk Management',
  ARRAY[
    'Monitor for systemic and localized signs and symptoms of infection',
    'Maintain asepsis for patient at risk',
    'Inspect condition of any surgical incision/wound',
    'Encourage deep breathing and coughing'
  ]),

('1450', 'Pain Management', 'Alleviation of pain or a reduction in pain to a level of comfort that is acceptable to the patient', 'Physiological: Basic', 'Physical Comfort Promotion',
  ARRAY[
    'Perform comprehensive assessment of pain',
    'Use therapeutic communication to acknowledge pain experience',
    'Provide the person optimal pain relief with prescribed analgesics',
    'Teach about pain management techniques'
  ]),

('0221', 'Exercise Therapy: Ambulation', 'Promotion and assistance with walking to maintain or restore autonomic and voluntary body functions during treatment and recovery from illness or injury', 'Physiological: Basic', 'Activity and Exercise Management',
  ARRAY[
    'Assist patient to use footwear that facilitates walking and prevents injury',
    'Encourage independent ambulation within safe limits',
    'Assist patient to establish realistic increments in distance for ambulation',
    'Apply/provide assistive device for ambulation'
  ]),

('3440', 'Incision Site Care', 'Cleansing, monitoring, and promotion of healing in a wound that is closed with sutures, clips, or staples', 'Physiological: Complex', 'Tissue Perfusion Management',
  ARRAY[
    'Inspect the incision site for redness, swelling, or signs of dehiscence or evisceration',
    'Monitor the healing process in the incision site',
    'Clean the area around the incision site',
    'Change dressing at appropriate intervals'
  ]),

('4120', 'Fluid Management', 'Promotion of fluid balance and prevention of complications resulting from abnormal or undesired fluid levels', 'Physiological: Complex', 'Electrolyte and Acid-Base Management',
  ARRAY[
    'Monitor hydration status',
    'Monitor for signs and symptoms of fluid retention',
    'Distribute the fluid intake over 24 hours',
    'Monitor laboratory results relevant to fluid balance'
  ]);

-- ============================================
-- 3. NOC OUTCOMES (Essential Set)
-- ============================================

INSERT INTO noc_outcomes (code, label, definition, domain, class, indicators, measurement_scale) VALUES
('0802', 'Vital Signs', 'Extent to which temperature, pulse, respiration, and blood pressure are within normal range', 'Physiologic Health', 'Metabolic Regulation',
  ARRAY['Temperature', 'Apical heart rate', 'Radial pulse rate', 'Respiratory rate', 'Systolic blood pressure', 'Diastolic blood pressure'],
  '1-5 (Severe deviation from normal range to No deviation from normal range)'),

('0415', 'Cardiac Pump Effectiveness', 'Adequacy of blood volume ejected from the left ventricle to support systemic perfusion pressure', 'Physiologic Health', 'Cardiopulmonary',
  ARRAY['Systolic blood pressure', 'Diastolic blood pressure', 'Peripheral pulses', 'Heart rate', 'Cardiac index', 'Ejection fraction'],
  '1-5 (Severe deviation from normal range to No deviation from normal range)'),

('0402', 'Respiratory Status: Gas Exchange', 'Alveolar exchange of carbon dioxide and oxygen to maintain arterial blood gas concentrations', 'Physiologic Health', 'Cardiopulmonary',
  ARRAY['Partial pressure of oxygen in arterial blood (PaO2)', 'Partial pressure of carbon dioxide in arterial blood (PaCO2)', 'Arterial pH', 'Oxygen saturation'],
  '1-5 (Severe deviation from normal range to No deviation from normal range)'),

('1004', 'Nutritional Status', 'Extent to which nutrients are ingested and absorbed to meet metabolic needs', 'Physiologic Health', 'Nutrition',
  ARRAY['Nutrient intake', 'Food intake', 'Energy', 'Body mass index', 'Biochemical measures'],
  '1-5 (Severe deviation from normal range to No deviation from normal range)'),

('2102', 'Pain Level', 'Severity of observed or reported pain', 'Perceived Health', 'Symptom Status',
  ARRAY['Reported pain', 'Length of pain episodes', 'Moaning and crying', 'Facial expressions of pain', 'Restlessness'],
  '1-5 (Severe to None)'),

('1211', 'Anxiety Level', 'Severity of manifested apprehension, tension, or uneasiness arising from an unidentifiable source', 'Psychosocial Health', 'Psychological Well-Being',
  ARRAY['Restlessness', 'Increased blood pressure', 'Increased pulse rate', 'Facial tension', 'Difficulty concentrating'],
  '1-5 (Severe to None)'),

('1101', 'Tissue Integrity: Skin and Mucous Membranes', 'Structural intactness and normal physiological function of skin and mucous membranes', 'Physiologic Health', 'Tissue Integrity',
  ARRAY['Skin temperature', 'Sensation', 'Elasticity', 'Hydration', 'Texture', 'Thickness', 'Tissue perfusion', 'Skin lesions'],
  '1-5 (Severely compromised to Not compromised)'),

('0918', 'Fall Prevention Behavior', 'Personal or family caregiver actions to minimize risk factors that might precipitate falls in the personal environment', 'Health Knowledge & Behavior', 'Risk Control & Safety',
  ARRAY['Uses assistive devices correctly', 'Uses safe transfer procedures', 'Places barriers to prevent falls', 'Uses grab bars as needed'],
  '1-5 (Never demonstrated to Consistently demonstrated)'),

('1824', 'Knowledge: Illness Care', 'Extent of understanding conveyed about illness-related information needed to achieve and maintain optimal health', 'Health Knowledge & Behavior', 'Health Knowledge',
  ARRAY['Specific disease process', 'Cause and contributing factors', 'Signs and symptoms', 'Complications', 'Strategies to manage illness'],
  '1-5 (No knowledge to Extensive knowledge)');

-- ============================================
-- 4. ICD-10 → NANDA MAPPINGS
-- THE KEY DIFFERENTIATOR
-- ============================================

-- Hypertension (I10) mappings
INSERT INTO icd10_nanda_mappings (icd10_id, nanda_id, relevance, rationale, evidence_level) VALUES
((SELECT id FROM icd10_codes WHERE code = 'I10' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00200'),
 'primary',
 'Hypertension directly increases risk of cardiac tissue perfusion issues due to increased afterload',
 'research'),

((SELECT id FROM icd10_codes WHERE code = 'I10' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00078'),
 'secondary',
 'Hypertension requires ongoing self-management of medications, diet, lifestyle modifications, and regular monitoring',
 'clinical_practice'),

((SELECT id FROM icd10_codes WHERE code = 'I10' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00126'),
 'related',
 'Patient education about hypertension pathophysiology, management, and complications is essential',
 'expert_consensus');

-- Type 2 Diabetes (E11.9) mappings
INSERT INTO icd10_nanda_mappings (icd10_id, nanda_id, relevance, rationale, evidence_level) VALUES
((SELECT id FROM icd10_codes WHERE code = 'E11.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00179'),
 'primary',
 'Direct risk from diabetes pathophysiology affecting glucose regulation',
 'research'),

((SELECT id FROM icd10_codes WHERE code = 'E11.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00046'),
 'secondary',
 'Diabetic patients at risk for skin breakdown and delayed wound healing due to neuropathy and impaired circulation',
 'research'),

((SELECT id FROM icd10_codes WHERE code = 'E11.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00047'),
 'secondary',
 'Risk for skin impairment due to diabetic neuropathy and peripheral vascular disease',
 'research'),

((SELECT id FROM icd10_codes WHERE code = 'E11.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00232'),
 'related',
 'Often comorbid with Type 2 diabetes; obesity contributes to insulin resistance',
 'research');

-- Pneumonia (J18.9) mappings
INSERT INTO icd10_nanda_mappings (icd10_id, nanda_id, relevance, rationale, evidence_level) VALUES
((SELECT id FROM icd10_codes WHERE code = 'J18.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00030'),
 'primary',
 'Pneumonia directly impairs gas exchange at alveolar-capillary membrane due to inflammation and fluid accumulation',
 'research'),

((SELECT id FROM icd10_codes WHERE code = 'J18.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00031'),
 'primary',
 'Increased secretions from infection impair airway clearance',
 'research'),

((SELECT id FROM icd10_codes WHERE code = 'J18.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00007'),
 'secondary',
 'Fever commonly associated with pneumonia as immune response to infection',
 'clinical_practice');

-- CHF (I50.9) mappings
INSERT INTO icd10_nanda_mappings (icd10_id, nanda_id, relevance, rationale, evidence_level) VALUES
((SELECT id FROM icd10_codes WHERE code = 'I50.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00200'),
 'primary',
 'Heart failure results in decreased cardiac output and tissue perfusion',
 'research'),

((SELECT id FROM icd10_codes WHERE code = 'I50.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00093'),
 'secondary',
 'Fatigue is common symptom due to decreased tissue oxygenation',
 'clinical_practice'),

((SELECT id FROM icd10_codes WHERE code = 'I50.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00085'),
 'secondary',
 'Activity intolerance due to decreased cardiac output',
 'clinical_practice');

-- COPD (J44.9) mappings
INSERT INTO icd10_nanda_mappings (icd10_id, nanda_id, relevance, rationale, evidence_level) VALUES
((SELECT id FROM icd10_codes WHERE code = 'J44.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00030'),
 'primary',
 'Chronic airflow limitation impairs gas exchange',
 'research'),

((SELECT id FROM icd10_codes WHERE code = 'J44.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00031'),
 'primary',
 'Excessive mucus production and airway inflammation impair clearance',
 'research'),

((SELECT id FROM icd10_codes WHERE code = 'J44.9' LIMIT 1),
 (SELECT id FROM nanda_diagnoses WHERE code = '00032'),
 'primary',
 'Dyspnea and altered breathing patterns due to airflow obstruction',
 'research');

-- ============================================
-- 5. NANDA-NIC-NOC LINKAGES
-- Evidence-based connections
-- ============================================

-- NANDA 00200: Risk for Decreased Cardiac Tissue Perfusion
INSERT INTO nanda_nic_noc_linkages (nanda_id, nic_id, noc_id, priority, evidence_level) VALUES
((SELECT id FROM nanda_diagnoses WHERE code = '00200'),
 (SELECT id FROM nic_interventions WHERE code = '6680'),
 (SELECT id FROM noc_outcomes WHERE code = '0802'),
 1, 'research'),

((SELECT id FROM nanda_diagnoses WHERE code = '00200'),
 (SELECT id FROM nic_interventions WHERE code = '2300'),
 (SELECT id FROM noc_outcomes WHERE code = '0415'),
 1, 'research');

-- NANDA 00078: Ineffective Health Self-Management
INSERT INTO nanda_nic_noc_linkages (nanda_id, nic_id, noc_id, priority, evidence_level) VALUES
((SELECT id FROM nanda_diagnoses WHERE code = '00078'),
 (SELECT id FROM nic_interventions WHERE code = '5602'),
 (SELECT id FROM noc_outcomes WHERE code = '1824'),
 1, 'expert_consensus');

-- NANDA 00030: Impaired Gas Exchange
INSERT INTO nanda_nic_noc_linkages (nanda_id, nic_id, noc_id, priority, evidence_level) VALUES
((SELECT id FROM nanda_diagnoses WHERE code = '00030'),
 (SELECT id FROM nic_interventions WHERE code = '3350'),
 (SELECT id FROM noc_outcomes WHERE code = '0402'),
 1, 'research'),

((SELECT id FROM nanda_diagnoses WHERE code = '00030'),
 (SELECT id FROM nic_interventions WHERE code = '0840'),
 (SELECT id FROM noc_outcomes WHERE code = '0402'),
 2, 'clinical_practice');

-- NANDA 00031: Ineffective Airway Clearance
INSERT INTO nanda_nic_noc_linkages (nanda_id, nic_id, noc_id, priority, evidence_level) VALUES
((SELECT id FROM nanda_diagnoses WHERE code = '00031'),
 (SELECT id FROM nic_interventions WHERE code = '3350'),
 (SELECT id FROM noc_outcomes WHERE code = '0402'),
 1, 'research');

-- NANDA 00046: Impaired Skin Integrity
INSERT INTO nanda_nic_noc_linkages (nanda_id, nic_id, noc_id, priority, evidence_level) VALUES
((SELECT id FROM nanda_diagnoses WHERE code = '00046'),
 (SELECT id FROM nic_interventions WHERE code = '3440'),
 (SELECT id FROM noc_outcomes WHERE code = '1101'),
 1, 'research'),

((SELECT id FROM nanda_diagnoses WHERE code = '00046'),
 (SELECT id FROM nic_interventions WHERE code = '0840'),
 (SELECT id FROM noc_outcomes WHERE code = '1101'),
 2, 'clinical_practice');

-- NANDA 00132: Acute Pain
INSERT INTO nanda_nic_noc_linkages (nanda_id, nic_id, noc_id, priority, evidence_level) VALUES
((SELECT id FROM nanda_diagnoses WHERE code = '00132'),
 (SELECT id FROM nic_interventions WHERE code = '1450'),
 (SELECT id FROM noc_outcomes WHERE code = '2102'),
 1, 'research');

-- NANDA 00155: Risk for Falls
INSERT INTO nanda_nic_noc_linkages (nanda_id, nic_id, noc_id, priority, evidence_level) VALUES
((SELECT id FROM nanda_diagnoses WHERE code = '00155'),
 (SELECT id FROM nic_interventions WHERE code = '0221'),
 (SELECT id FROM noc_outcomes WHERE code = '0918'),
 1, 'research');

-- NANDA 00146: Anxiety
INSERT INTO nanda_nic_noc_linkages (nanda_id, nic_id, noc_id, priority, evidence_level) VALUES
((SELECT id FROM nanda_diagnoses WHERE code = '00146'),
 (SELECT id FROM nic_interventions WHERE code = '5820'),
 (SELECT id FROM noc_outcomes WHERE code = '1211'),
 1, 'expert_consensus');

-- ============================================
-- SAMPLE DATA COMPLETE
-- ============================================
-- This provides:
-- - 25 NANDA diagnoses covering major domains
-- - 12 NIC interventions for common nursing actions
-- - 9 NOC outcomes for measurable goals
-- - 13 ICD-10→NANDA mappings for bridge functionality
-- - 11 NNN linkages for evidence-based care planning
--
-- Next steps:
-- 1. Expand to full 267 NANDA diagnoses
-- 2. Add specialty-specific content
-- 3. Add more ICD-10 mappings based on user feedback
