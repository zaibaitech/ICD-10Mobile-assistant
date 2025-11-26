import { supabase } from './supabase';
import { Encounter, EncounterInput, EncounterIcd10, CodeSource, StructuredEncounterData } from '../types';

/**
 * Get all encounters for a specific patient
 */
export const getEncountersByPatient = async (patientId: string): Promise<Encounter[]> => {
  const { data, error } = await supabase
    .from('encounters')
    .select('*')
    .eq('patient_id', patientId)
    .order('encounter_date', { ascending: false });

  if (error) {
    console.error('Error fetching encounters:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get a single encounter by ID with linked codes
 */
export const getEncounterById = async (
  id: string
): Promise<(Encounter & { codes: EncounterIcd10[] }) | null> => {
  const { data: encounter, error: encounterError } = await supabase
    .from('encounters')
    .select('*')
    .eq('id', id)
    .single();

  if (encounterError) {
    console.error('Error fetching encounter:', encounterError);
    throw encounterError;
  }

  if (!encounter) return null;

  // Get linked codes
  const codes = await getEncounterCodes(id);

  return {
    ...encounter,
    codes,
  };
};

/**
 * Create a new encounter
 */
export const createEncounter = async (input: EncounterInput): Promise<Encounter> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('encounters')
    .insert([
      {
        patient_id: input.patient_id,
        user_id: user.id,
        encounter_date: input.encounter_date || new Date().toISOString().split('T')[0],
        chief_complaint: input.chief_complaint,
        structured_data: input.structured_data || {},
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating encounter:', error);
    throw error;
  }

  return data;
};

/**
 * Update an existing encounter
 */
export const updateEncounter = async (
  id: string,
  input: Partial<Encounter>
): Promise<Encounter> => {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.chief_complaint !== undefined) updateData.chief_complaint = input.chief_complaint;
  if (input.encounter_date !== undefined) updateData.encounter_date = input.encounter_date;
  if (input.structured_data !== undefined) updateData.structured_data = input.structured_data;
  if (input.ai_summary !== undefined) updateData.ai_summary = input.ai_summary;
  if (input.ai_risk_level !== undefined) updateData.ai_risk_level = input.ai_risk_level;
  if (input.ai_result !== undefined) updateData.ai_result = input.ai_result;

  const { data, error } = await supabase
    .from('encounters')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating encounter:', error);
    throw error;
  }

  return data;
};

/**
 * Delete an encounter
 */
export const deleteEncounter = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('encounters')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting encounter:', error);
    throw error;
  }
};

/**
 * Add an ICD-10 code to an encounter
 */
export const addCodeToEncounter = async (
  encounterId: string,
  icd10Id: string,
  source: CodeSource = 'user_selected'
): Promise<EncounterIcd10> => {
  const { data, error } = await supabase
    .from('encounter_icd10_codes')
    .insert([
      {
        encounter_id: encounterId,
        icd10_id: icd10Id,
        source,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding code to encounter:', error);
    throw error;
  }

  return data;
};

/**
 * Remove a code from an encounter
 */
export const removeCodeFromEncounter = async (
  encounterId: string,
  icd10Id: string
): Promise<void> => {
  const { error } = await supabase
    .from('encounter_icd10_codes')
    .delete()
    .eq('encounter_id', encounterId)
    .eq('icd10_id', icd10Id);

  if (error) {
    console.error('Error removing code from encounter:', error);
    throw error;
  }
};

/**
 * Get all codes linked to an encounter
 */
export const getEncounterCodes = async (encounterId: string): Promise<EncounterIcd10[]> => {
  const { data, error } = await supabase
    .from('encounter_icd10_codes')
    .select(`
      *,
      icd10_codes (
        id,
        code,
        short_title,
        full_title,
        chapter
      )
    `)
    .eq('encounter_id', encounterId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching encounter codes:', error);
    throw error;
  }

  return data || [];
};
