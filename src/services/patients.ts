import { supabase } from './supabase';
import { Patient, PatientInput } from '../types';
import NetInfo from '@react-native-community/netinfo';
import { queueOperation } from './syncQueue';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_PATIENTS_KEY = 'offline_patients';

/**
 * Get all patients for the current user
 */
export const getPatients = async (): Promise<Patient[]> => {
  const netState = await NetInfo.fetch();
  
  // Try online first
  if (netState.isConnected) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cache for offline use
      await AsyncStorage.setItem(OFFLINE_PATIENTS_KEY, JSON.stringify(data || []));
      
      return data || [];
    } catch (error) {
      console.error('Error fetching patients online:', error);
      // Fall through to offline cache
    }
  }

  // Use offline cache
  const cached = await AsyncStorage.getItem(OFFLINE_PATIENTS_KEY);
  return cached ? JSON.parse(cached) : [];
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

  const netState = await NetInfo.fetch();
  
  const patientData = {
    user_id: user.id,
    display_label: input.display_label,
    year_of_birth: input.year_of_birth || null,
    sex: input.sex || 'unknown',
    notes: input.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // If offline, queue operation and return optimistic response
  if (!netState.isConnected) {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const tempPatient: Patient = {
      id: tempId,
      ...patientData,
    };

    await queueOperation('create', 'patients', tempPatient);
    
    // Update offline cache
    const cached = await AsyncStorage.getItem(OFFLINE_PATIENTS_KEY);
    const patients = cached ? JSON.parse(cached) : [];
    patients.unshift(tempPatient);
    await AsyncStorage.setItem(OFFLINE_PATIENTS_KEY, JSON.stringify(patients));

    return tempPatient;
  }

  // Online: create directly
  const { data, error } = await supabase
    .from('patients')
    .insert([patientData])
    .select()
    .single();

  if (error) {
    console.error('Error creating patient:', error);
    throw error;
  }

  // Update cache
  const cached = await AsyncStorage.getItem(OFFLINE_PATIENTS_KEY);
  const patients = cached ? JSON.parse(cached) : [];
  patients.unshift(data);
  await AsyncStorage.setItem(OFFLINE_PATIENTS_KEY, JSON.stringify(patients));

  return data;
};

/**
 * Update an existing patient
 */
export const updatePatient = async (
  id: string,
  input: Partial<PatientInput>
): Promise<Patient> => {
  const netState = await NetInfo.fetch();
  
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.display_label !== undefined) updateData.display_label = input.display_label;
  if (input.year_of_birth !== undefined) updateData.year_of_birth = input.year_of_birth;
  if (input.sex !== undefined) updateData.sex = input.sex;
  if (input.notes !== undefined) updateData.notes = input.notes;

  // If offline, queue operation
  if (!netState.isConnected) {
    await queueOperation('update', 'patients', { id, ...updateData });
    
    // Update offline cache optimistically
    const cached = await AsyncStorage.getItem(OFFLINE_PATIENTS_KEY);
    const patients: Patient[] = cached ? JSON.parse(cached) : [];
    const index = patients.findIndex((p) => p.id === id);
    
    if (index !== -1) {
      patients[index] = { ...patients[index], ...updateData };
      await AsyncStorage.setItem(OFFLINE_PATIENTS_KEY, JSON.stringify(patients));
      return patients[index];
    }
    
    throw new Error('Patient not found in offline cache');
  }

  // Online: update directly
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

  // Update cache
  const cached = await AsyncStorage.getItem(OFFLINE_PATIENTS_KEY);
  const patients: Patient[] = cached ? JSON.parse(cached) : [];
  const index = patients.findIndex((p) => p.id === id);
  if (index !== -1) {
    patients[index] = data;
    await AsyncStorage.setItem(OFFLINE_PATIENTS_KEY, JSON.stringify(patients));
  }

  return data;
};

/**
 * Delete a patient (cascades to encounters)
 */
export const deletePatient = async (id: string): Promise<void> => {
  const netState = await NetInfo.fetch();

  // If offline, queue operation
  if (!netState.isConnected) {
    await queueOperation('delete', 'patients', { id });
    
    // Remove from offline cache
    const cached = await AsyncStorage.getItem(OFFLINE_PATIENTS_KEY);
    const patients: Patient[] = cached ? JSON.parse(cached) : [];
    const filtered = patients.filter((p) => p.id !== id);
    await AsyncStorage.setItem(OFFLINE_PATIENTS_KEY, JSON.stringify(filtered));
    
    return;
  }

  // Online: delete directly
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }

  // Update cache
  const cached = await AsyncStorage.getItem(OFFLINE_PATIENTS_KEY);
  const patients: Patient[] = cached ? JSON.parse(cached) : [];
  const filtered = patients.filter((p) => p.id !== id);
  await AsyncStorage.setItem(OFFLINE_PATIENTS_KEY, JSON.stringify(filtered));
};

/**
 * Calculate age from year of birth
 */
export const calculateAge = (yearOfBirth: number | null): number | undefined => {
  if (!yearOfBirth) return undefined;
  const currentYear = new Date().getFullYear();
  return currentYear - yearOfBirth;
};
