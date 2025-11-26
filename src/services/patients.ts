import { supabase } from './supabase';
import { Patient, PatientInput } from '../types';

/**
 * Get all patients for the current user
 */
export const getPatients = async (): Promise<Patient[]> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get a single patient by ID
 */
export const getPatientById = async (id: string): Promise<Patient | null> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }

  return data;
};

/**
 * Create a new patient
 */
export const createPatient = async (input: PatientInput): Promise<Patient> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('patients')
    .insert([
      {
        user_id: user.id,
        display_label: input.display_label,
        year_of_birth: input.year_of_birth || null,
        sex: input.sex || 'unknown',
        notes: input.notes || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating patient:', error);
    throw error;
  }

  return data;
};

/**
 * Update an existing patient
 */
export const updatePatient = async (
  id: string,
  input: Partial<PatientInput>
): Promise<Patient> => {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.display_label !== undefined) updateData.display_label = input.display_label;
  if (input.year_of_birth !== undefined) updateData.year_of_birth = input.year_of_birth;
  if (input.sex !== undefined) updateData.sex = input.sex;
  if (input.notes !== undefined) updateData.notes = input.notes;

  const { data, error } = await supabase
    .from('patients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating patient:', error);
    throw error;
  }

  return data;
};

/**
 * Delete a patient (cascades to encounters)
 */
export const deletePatient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};

/**
 * Calculate age from year of birth
 */
export const calculateAge = (yearOfBirth: number | null): number | undefined => {
  if (!yearOfBirth) return undefined;
  const currentYear = new Date().getFullYear();
  return currentYear - yearOfBirth;
};
