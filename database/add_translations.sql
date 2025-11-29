-- Add multilingual support to ICD-10 codes
-- Run this in Supabase SQL Editor

-- Add translations column (JSONB to store multiple languages)
ALTER TABLE icd10_codes 
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

-- Update existing codes with French and Spanish translations
-- Note: These are example translations. Full WHO dataset would have all 71,703 codes

-- Common conditions with translations
UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Infection des voies respiratoires supérieures", "long_description": "Infection aiguë des voies respiratoires supérieures, sans précision"},
  "es": {"short_title": "Infección respiratoria superior", "long_description": "Infección respiratoria aguda superior, no especificada"}
}'::jsonb WHERE code = 'J06.9';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Pneumonie", "long_description": "Pneumonie, organisme non précisé"},
  "es": {"short_title": "Neumonía", "long_description": "Neumonía, organismo no especificado"}
}'::jsonb WHERE code = 'J18.9';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Hypertension essentielle", "long_description": "Hypertension essentielle (primaire)"},
  "es": {"short_title": "Hipertensión esencial", "long_description": "Hipertensión esencial (primaria)"}
}'::jsonb WHERE code = 'I10';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Maladie coronarienne", "long_description": "Cardiopathie ischémique athéroscléreuse de l''artère coronaire native sans angine de poitrine"},
  "es": {"short_title": "Enfermedad coronaria", "long_description": "Enfermedad cardíaca aterosclerótica de arteria coronaria nativa sin angina de pecho"}
}'::jsonb WHERE code = 'I25.10';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Diabète de type 2", "long_description": "Diabète sucré de type 2 sans complications"},
  "es": {"short_title": "Diabetes tipo 2", "long_description": "Diabetes mellitus tipo 2 sin complicaciones"}
}'::jsonb WHERE code = 'E11.9';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Diabète de type 2 avec hyperglycémie", "long_description": "Diabète sucré de type 2 avec hyperglycémie"},
  "es": {"short_title": "Diabetes tipo 2 con hiperglucemia", "long_description": "Diabetes mellitus tipo 2 con hiperglucemia"}
}'::jsonb WHERE code = 'E11.65';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Lombalgie", "long_description": "Lombalgie"},
  "es": {"short_title": "Dolor lumbar", "long_description": "Dolor lumbar"}
}'::jsonb WHERE code = 'M54.5';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Migraine", "long_description": "Migraine, sans précision, non réfractaire, sans état de mal migraineux"},
  "es": {"short_title": "Migraña", "long_description": "Migraña, no especificada, no intratable, sin estado migrañoso"}
}'::jsonb WHERE code = 'G43.909';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Anxiété généralisée", "long_description": "Trouble anxieux généralisé"},
  "es": {"short_title": "Ansiedad generalizada", "long_description": "Trastorno de ansiedad generalizada"}
}'::jsonb WHERE code = 'F41.1';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Dépression", "long_description": "Trouble dépressif majeur, épisode unique, sans précision"},
  "es": {"short_title": "Depresión", "long_description": "Trastorno depresivo mayor, episodio único, no especificado"}
}'::jsonb WHERE code = 'F32.9';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "RGO avec œsophagite", "long_description": "Reflux gastro-œsophagien avec œsophagite"},
  "es": {"short_title": "ERGE con esofagitis", "long_description": "Enfermedad por reflujo gastroesofágico con esofagitis"}
}'::jsonb WHERE code = 'K21.0';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Infection urinaire", "long_description": "Infection des voies urinaires, siège non précisé"},
  "es": {"short_title": "Infección urinaria", "long_description": "Infección del tracto urinario, sitio no especificado"}
}'::jsonb WHERE code = 'N39.0';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Dermatite", "long_description": "Dermatite, sans précision"},
  "es": {"short_title": "Dermatitis", "long_description": "Dermatitis, no especificada"}
}'::jsonb WHERE code = 'L30.9';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Toux", "long_description": "Toux, sans précision"},
  "es": {"short_title": "Tos", "long_description": "Tos, no especificada"}
}'::jsonb WHERE code = 'R05.9';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Examen général", "long_description": "Examen médical général adulte sans anomalie"},
  "es": {"short_title": "Examen general", "long_description": "Encuentro para examen médico general de adulto sin hallazgos anormales"}
}'::jsonb WHERE code = 'Z00.00';

-- Respiratory diseases (Chapter J00-J06)
UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Rhinopharyngite aiguë", "long_description": "Rhinopharyngite aiguë [rhume banal]"},
  "es": {"short_title": "Nasofaringitis aguda", "long_description": "Nasofaringitis aguda [resfriado común]"}
}'::jsonb WHERE code = 'J00';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Pharyngite streptococcique", "long_description": "Pharyngite streptococcique"},
  "es": {"short_title": "Faringitis estreptocócica", "long_description": "Faringitis estreptocócica"}
}'::jsonb WHERE code = 'J02.0';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Pharyngite aiguë SAI", "long_description": "Pharyngite aiguë, sans précision"},
  "es": {"short_title": "Faringitis aguda NOS", "long_description": "Faringitis aguda, no especificada"}
}'::jsonb WHERE code = 'J02.9';

UPDATE icd10_codes SET translations = '{
  "fr": {"short_title": "Amygdalite streptococcique", "long_description": "Amygdalite streptococcique"},
  "es": {"short_title": "Amigdalitis estreptocócica", "long_description": "Amigdalitis estreptocócica"}
}'::jsonb WHERE code = 'J03.0';

-- Create index for translations JSONB column for better search performance
CREATE INDEX IF NOT EXISTS idx_icd10_translations ON icd10_codes USING gin(translations);

-- Create a function to search ICD-10 codes in multiple languages
CREATE OR REPLACE FUNCTION search_icd10_multilingual(
  search_term TEXT,
  language_code TEXT DEFAULT 'en',
  search_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  code TEXT,
  short_title TEXT,
  long_description TEXT,
  chapter TEXT,
  translations JSONB
) AS $$
BEGIN
  IF language_code = 'en' THEN
    -- Search in English (default columns)
    RETURN QUERY
    SELECT 
      c.id, 
      c.code, 
      c.short_title, 
      c.long_description, 
      c.chapter, 
      c.translations
    FROM icd10_codes c
    WHERE 
      c.code ILIKE '%' || search_term || '%'
      OR c.short_title ILIKE '%' || search_term || '%'
      OR c.long_description ILIKE '%' || search_term || '%'
    ORDER BY
      CASE 
        WHEN c.code ILIKE search_term || '%' THEN 1
        WHEN c.short_title ILIKE search_term || '%' THEN 2
        ELSE 3
      END,
      c.code
    LIMIT search_limit;
  ELSE
    -- Search in translated fields
    RETURN QUERY
    SELECT 
      c.id, 
      c.code,
      COALESCE(c.translations->language_code->>'short_title', c.short_title) as short_title,
      COALESCE(c.translations->language_code->>'long_description', c.long_description) as long_description,
      c.chapter,
      c.translations
    FROM icd10_codes c
    WHERE 
      c.code ILIKE '%' || search_term || '%'
      OR c.short_title ILIKE '%' || search_term || '%'
      OR c.long_description ILIKE '%' || search_term || '%'
      OR c.translations->language_code->>'short_title' ILIKE '%' || search_term || '%'
      OR c.translations->language_code->>'long_description' ILIKE '%' || search_term || '%'
    ORDER BY
      CASE 
        WHEN c.code ILIKE search_term || '%' THEN 1
        WHEN c.translations->language_code->>'short_title' ILIKE search_term || '%' THEN 2
        WHEN c.short_title ILIKE search_term || '%' THEN 3
        ELSE 4
      END,
      c.code
    LIMIT search_limit;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_icd10_multilingual TO authenticated;

COMMENT ON FUNCTION search_icd10_multilingual IS 'Search ICD-10 codes with multilingual support (en, fr, es)';
