// ============================================
// NURSING CARE PLAN SERVICE
// Phase 6: Nurse-Specific Features
// ============================================

import { supabase } from './supabase';
import { getCarePlanningSuggestionsForMultiple } from './icd10NandaBridge';
import { getNicsByIds, getNocsByIds } from './nanda';
import type {
  NursingCarePlan,
  NursingCarePlanInput,
  NursingCarePlanUpdate,
  CarePlanItem,
  CarePlanItemInput,
  CarePlanItemUpdate,
  CarePlanStatus,
  CarePlanPriority,
  CarePlanItemStatus,
} from '../types/nursing';

// ============================================
// CARE PLAN CRUD OPERATIONS
// ============================================

/**
 * Create a new nursing care plan
 */
export async function createCarePlan(input: NursingCarePlanInput): Promise<NursingCarePlan> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Get user's organization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();
    
    const { data, error } = await supabase
      .from('nursing_care_plans')
      .insert({
        user_id: user.id,
        organization_id: profile?.organization_id,
        patient_id: input.patient_id,
        encounter_id: input.encounter_id,
        title: input.title,
        priority: input.priority || 'medium',
        target_date: input.target_date,
        status: 'draft',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating care plan:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('createCarePlan error:', error);
    throw error;
  }
}

/**
 * Get care plan by ID with all items
 */
export async function getCarePlanById(id: string): Promise<NursingCarePlan | null> {
  try {
    const { data, error } = await supabase
      .from('nursing_care_plans')
      .select(`
        *,
        items:care_plan_items(
          *,
          nanda:nanda_diagnoses(*),
          icd10:icd10_codes(id, code, short_title, long_description)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error getting care plan:', error);
      throw error;
    }
    
    // Fetch patient info separately if patient_id exists
    if (data && data.patient_id) {
      const { data: patient } = await supabase
        .from('patients')
        .select('id, display_label, mrn')
        .eq('id', data.patient_id)
        .single();
      
      if (patient) {
        data.patient = patient;
      }
    }
    
    // Fetch NICs and NOCs for each item
    if (data.items) {
      for (const item of data.items) {
        const [nics, nocs] = await Promise.all([
          getNicsByIds(item.nic_ids || []),
          getNocsByIds(item.noc_ids || []),
        ]);
        item.nics = nics;
        item.nocs = nocs;
      }
    }
    
    return data;
  } catch (error) {
    console.error('getCarePlanById error:', error);
    throw error;
  }
}

/**
 * Get all care plans for a patient
 */
export async function getCarePlansForPatient(patientId: string): Promise<NursingCarePlan[]> {
  try {
    const { data, error } = await supabase
      .from('nursing_care_plans')
      .select(`
        *,
        items:care_plan_items(
          *,
          nanda:nanda_diagnoses(*),
          icd10:icd10_codes(id, code, short_title, long_description)
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting care plans for patient:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('getCarePlansForPatient error:', error);
    throw error;
  }
}

/**
 * Get all care plans for current user (across all patients)
 */
export async function getAllCarePlansForCurrentUser(): Promise<NursingCarePlan[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await supabase
      .from('nursing_care_plans')
      .select(`
        *,
        items:care_plan_items(
          *,
          nanda:nanda_diagnoses(*),
          icd10:icd10_codes(id, code, short_title, long_description)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting care plans for user:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('getAllCarePlansForCurrentUser error:', error);
    throw error;
  }
}

/**
 * Get active care plan for patient
 */
export async function getActiveCarePlan(patientId: string): Promise<NursingCarePlan | null> {
  try {
    const { data, error } = await supabase
      .from('nursing_care_plans')
      .select(`
        *,
        items:care_plan_items(
          *,
          nanda:nanda_diagnoses(*),
          icd10:icd10_codes(id, code, short_title, long_description)
        )
      `)
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error getting active care plan:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('getActiveCarePlan error:', error);
    return null;
  }
}

/**
 * Update care plan
 */
export async function updateCarePlan(
  id: string,
  updates: NursingCarePlanUpdate
): Promise<NursingCarePlan> {
  try {
    const { data, error } = await supabase
      .from('nursing_care_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating care plan:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('updateCarePlan error:', error);
    throw error;
  }
}

/**
 * Delete care plan
 */
export async function deleteCarePlan(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('nursing_care_plans')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting care plan:', error);
      throw error;
    }
  } catch (error) {
    console.error('deleteCarePlan error:', error);
    throw error;
  }
}

// ============================================
// CARE PLAN ITEM OPERATIONS
// ============================================

/**
 * Add item to care plan
 */
export async function addCarePlanItem(
  carePlanId: string,
  input: CarePlanItemInput
): Promise<CarePlanItem> {
  try {
    const { data, error } = await supabase
      .from('care_plan_items')
      .insert({
        care_plan_id: carePlanId,
        nanda_id: input.nanda_id,
        custom_diagnosis: input.custom_diagnosis,
        icd10_id: input.icd10_id,
        related_factors: input.related_factors || [],
        evidenced_by: input.evidenced_by || [],
        noc_ids: input.noc_ids || [],
        goal_statement: input.goal_statement,
        baseline_score: input.baseline_score,
        target_score: input.target_score,
        nic_ids: input.nic_ids || [],
        custom_interventions: input.custom_interventions || [],
        status: 'active',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding care plan item:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('addCarePlanItem error:', error);
    throw error;
  }
}

/**
 * Update care plan item (typically for evaluation)
 */
export async function updateCarePlanItem(
  itemId: string,
  updates: CarePlanItemUpdate
): Promise<CarePlanItem> {
  try {
    const { data, error } = await supabase
      .from('care_plan_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating care plan item:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('updateCarePlanItem error:', error);
    throw error;
  }
}

/**
 * Delete care plan item
 */
export async function deleteCarePlanItem(itemId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('care_plan_items')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      console.error('Error deleting care plan item:', error);
      throw error;
    }
  } catch (error) {
    console.error('deleteCarePlanItem error:', error);
    throw error;
  }
}

// ============================================
// AUTO-GENERATION FROM ICD-10
// ⭐ KEY FEATURE ⭐
// ============================================

/**
 * Generate care plan from ICD-10 codes (auto-populate)
 * This is the magic that bridges medical and nursing diagnosis
 */
export async function generateCarePlanFromIcd10(params: {
  patientId: string;
  icd10Codes: string[];
  name?: string;
  encounterId?: string;
  priority?: CarePlanPriority;
}): Promise<NursingCarePlan> {
  try {
    const { patientId, icd10Codes, name, encounterId, priority } = params;
    
    // Step 1: Create the care plan
    const carePlan = await createCarePlan({
      patient_id: patientId,
      encounter_id: encounterId,
      title: name || `Care Plan - ${new Date().toLocaleDateString()}`,
      priority: priority,
    });
    
    // Step 2: Get care planning suggestions for all ICD-10 codes
    const suggestions = await getCarePlanningSuggestionsForMultiple(icd10Codes);
    
    // Check if we got any suggestions
    if (!suggestions || suggestions.length === 0) {
      console.warn('No NANDA mappings found for provided ICD-10 codes:', icd10Codes);
      // Return the care plan even if empty
      const completePlan = await getCarePlanById(carePlan.id);
      return completePlan!;
    }
    
    // Step 3: Add care plan items for each suggestion
    for (const suggestion of suggestions) {
      // Safety checks for undefined arrays
      const nocIds = (suggestion.suggestedNocs || []).slice(0, 3).map(n => n.id);
      const nicIds = (suggestion.suggestedNics || []).slice(0, 3).map(n => n.id);
      
      await addCarePlanItem(carePlan.id, {
        nanda_id: suggestion.nanda.id,
        icd10_id: suggestion.icd10.id,
        noc_ids: nocIds,
        nic_ids: nicIds,
        baseline_score: 3, // Default to moderately compromised
        target_score: 5,   // Target: not compromised
      });
    }
    
    // Step 4: Return the complete care plan
    const completePlan = await getCarePlanById(carePlan.id);
    return completePlan!;
  } catch (error) {
    console.error('generateCarePlanFromIcd10 error:', error);
    throw error;
  }
}

/**
 * Generate care plan from encounter
 * Automatically uses ICD-10 codes from the encounter
 */
export async function generateCarePlanFromEncounter(
  encounterId: string
): Promise<NursingCarePlan> {
  try {
    // Get encounter with ICD-10 codes
    const { data: encounter, error } = await supabase
      .from('encounters')
      .select(`
        *,
        encounter_icd10_codes(
          icd10_code_id
        )
      `)
      .eq('id', encounterId)
      .single();
    
    if (error) {
      console.error('Error getting encounter:', error);
      throw error;
    }
    
    const icd10Ids = encounter.encounter_icd10_codes?.map(
      (item: any) => item.icd10_code_id
    ) || [];
    
    if (icd10Ids.length === 0) {
      throw new Error('No ICD-10 codes found for this encounter');
    }
    
    return generateCarePlanFromIcd10({
      patientId: encounter.patient_id,
      icd10Codes: icd10Ids,
      name: `Care Plan - ${encounter.chief_complaint || 'Encounter'}`,
      encounterId: encounter.id,
    });
  } catch (error) {
    console.error('generateCarePlanFromEncounter error:', error);
    throw error;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get care plan progress percentage
 */
export function getCarePlanProgress(carePlan: NursingCarePlan): number {
  if (!carePlan.items || carePlan.items.length === 0) {
    return 0;
  }
  
  const resolvedCount = carePlan.items.filter(
    item => item.status === 'resolved'
  ).length;
  
  return Math.round((resolvedCount / carePlan.items.length) * 100);
}

/**
 * Get status label
 */
export function getStatusLabel(status: CarePlanStatus): string {
  const labels: Record<CarePlanStatus, string> = {
    draft: 'Draft',
    active: 'Active',
    completed: 'Completed',
    discontinued: 'Discontinued',
  };
  return labels[status];
}

/**
 * Get priority label
 */
export function getPriorityLabel(priority: CarePlanPriority): string {
  const labels: Record<CarePlanPriority, string> = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  };
  return labels[priority];
}

/**
 * Get priority color for UI
 */
export function getPriorityColor(priority: CarePlanPriority): string {
  const colors: Record<CarePlanPriority, string> = {
    high: '#ef4444',    // red
    medium: '#f59e0b',  // amber
    low: '#10b981',     // green
  };
  return colors[priority];
}

/**
 * Format care plan for export/sharing
 */
export function formatCarePlanForExport(carePlan: NursingCarePlan): string {
  const lines = [
    '═══════════════════════════════════',
    'NURSING CARE PLAN',
    '═══════════════════════════════════',
    '',
    `Title: ${carePlan.title}`,
    `Patient: ${carePlan.patient?.display_label || 'Unknown'}`,
    `Priority: ${getPriorityLabel(carePlan.priority)}`,
    `Status: ${getStatusLabel(carePlan.status)}`,
    `Start Date: ${carePlan.start_date}`,
  ];
  
  if (carePlan.target_date) {
    lines.push(`Target Date: ${carePlan.target_date}`);
  }
  
  lines.push('');
  lines.push('CARE PLAN ITEMS');
  lines.push('───────────────────────────────────');
  
  carePlan.items?.forEach((item, index) => {
    lines.push('');
    lines.push(`${index + 1}. Nursing Diagnosis`);
    if (item.nanda) {
      lines.push(`   ${item.nanda.code} - ${item.nanda.label}`);
    } else if (item.custom_diagnosis) {
      lines.push(`   ${item.custom_diagnosis}`);
    }
    
    if (item.icd10) {
      lines.push(`   Related to: ${item.icd10.code} - ${item.icd10.short_title}`);
    }
    
    if (item.goal_statement) {
      lines.push(`   Goal: ${item.goal_statement}`);
    }
    
    if (item.nics && item.nics.length > 0) {
      lines.push(`   Interventions:`);
      item.nics.forEach(nic => {
        lines.push(`     • ${nic.label}`);
      });
    }
    
    if (item.nocs && item.nocs.length > 0) {
      lines.push(`   Expected Outcomes:`);
      item.nocs.forEach(noc => {
        lines.push(`     • ${noc.label}`);
      });
    }
    
    lines.push(`   Status: ${item.status.toUpperCase()}`);
  });
  
  lines.push('');
  lines.push('═══════════════════════════════════');
  
  return lines.join('\n');
}
