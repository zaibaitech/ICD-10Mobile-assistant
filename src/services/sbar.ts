// ============================================
// SBAR HANDOFF REPORT SERVICE
// Phase 6: Nurse-Specific Features
// ============================================

import { supabase } from './supabase';
import type {
  SbarReport,
  SbarReportInput,
  SbarTemplate,
  SbarReportType,
  SbarUrgency,
  VitalSigns,
} from '../types/nursing';

// ============================================
// SBAR REPORT CRUD OPERATIONS
// ============================================

/**
 * Create SBAR report
 */
export async function createSbarReport(input: SbarReportInput): Promise<SbarReport> {
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
      .from('sbar_reports')
      .insert({
        user_id: user.id,
        organization_id: profile?.organization_id,
        patient_id: input.patient_id,
        situation: input.situation,
        background: input.background,
        assessment: input.assessment,
        recommendation: input.recommendation,
        report_type: input.report_type,
        recipient_role: input.recipient_role,
        urgency: input.urgency || 'routine',
        vital_signs: input.vital_signs,
        linked_icd10_ids: input.linked_icd10_ids || [],
        linked_nanda_ids: input.linked_nanda_ids || [],
        audio_url: input.audio_url,
        transcription: input.transcription,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating SBAR report:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('createSbarReport error:', error);
    throw error;
  }
}

/**
 * Get SBAR report by ID
 */
export async function getSbarById(id: string): Promise<SbarReport | null> {
  try {
    const { data, error } = await supabase
      .from('sbar_reports')
      .select(`
        *,
        patient:patients(id, display_label, mrn)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error getting SBAR report:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('getSbarById error:', error);
    throw error;
  }
}

/**
 * Get SBAR reports for patient
 */
export async function getSbarReportsForPatient(
  patientId: string,
  limit?: number
): Promise<SbarReport[]> {
  try {
    let query = supabase
      .from('sbar_reports')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error getting SBAR reports:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('getSbarReportsForPatient error:', error);
    throw error;
  }
}

/**
 * Get SBAR reports by type
 */
export async function getSbarReportsByType(
  reportType: SbarReportType,
  limit?: number
): Promise<SbarReport[]> {
  try {
    let query = supabase
      .from('sbar_reports')
      .select(`
        *,
        patient:patients(id, display_label, mrn)
      `)
      .eq('report_type', reportType)
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error getting SBAR reports by type:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('getSbarReportsByType error:', error);
    throw error;
  }
}

/**
 * Delete SBAR report
 */
export async function deleteSbarReport(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('sbar_reports')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting SBAR report:', error);
      throw error;
    }
  } catch (error) {
    console.error('deleteSbarReport error:', error);
    throw error;
  }
}

// ============================================
// TEMPLATE GENERATION
// ⭐ KEY FEATURE ⭐
// ============================================

/**
 * Generate SBAR template from patient data
 * Pre-fills Situation and Background based on patient/encounter info
 */
export async function generateSbarTemplate(
  patientId: string,
  reportType: SbarReportType
): Promise<SbarTemplate> {
  try {
    // Get patient data
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
    
    if (patientError) {
      console.error('Error getting patient:', patientError);
      throw patientError;
    }
    
    // Get most recent encounter
    const { data: encounters } = await supabase
      .from('encounters')
      .select(`
        *,
        encounter_icd10_codes(
          icd10_codes(*)
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    const encounter = encounters?.[0];
    
    // Get recent vital signs from assessments
    const { data: assessments } = await supabase
      .from('nursing_assessments')
      .select('assessment_data')
      .eq('patient_id', patientId)
      .order('assessment_time', { ascending: false })
      .limit(1);
    
    const latestAssessment = assessments?.[0];
    
    // Build situation statement
    let situation = `Calling about ${patient.display_label || 'patient'}`;
    if (patient.mrn) {
      situation += `, MRN: ${patient.mrn}`;
    }
    situation += '. ';
    
    if (reportType === 'shift_handoff') {
      situation += 'Providing shift handoff report.';
    } else if (reportType === 'physician_call') {
      situation += 'Patient requires physician evaluation.';
    } else if (reportType === 'rapid_response') {
      situation += 'Calling rapid response.';
    } else if (reportType === 'transfer') {
      situation += 'Patient transferring to another unit.';
    } else if (reportType === 'discharge') {
      situation += 'Patient ready for discharge.';
    }
    
    // Build background statement
    let background = '';
    if (encounter) {
      background += `Admitted with ${encounter.chief_complaint || 'chief complaint'}. `;
      
      const diagnoses = encounter.encounter_icd10_codes
        ?.map((item: any) => item.icd10_codes?.short_title)
        .filter(Boolean);
      
      if (diagnoses && diagnoses.length > 0) {
        background += `Diagnoses: ${diagnoses.join(', ')}. `;
      }
    }
    
    // Assessment placeholder
    const assessment = latestAssessment
      ? 'Current vital signs and assessment documented. '
      : 'Current assessment: ';
    
    // Recommendation based on type
    let recommendation = '';
    if (reportType === 'physician_call') {
      recommendation = 'I recommend: ';
    } else if (reportType === 'rapid_response') {
      recommendation = 'Immediate assistance needed.';
    } else if (reportType === 'transfer') {
      recommendation = 'Please prepare receiving unit.';
    } else {
      recommendation = 'I recommend: ';
    }
    
    return {
      patient_id: patientId,
      report_type: reportType,
      situation,
      background,
      assessment,
      recommendation,
    };
  } catch (error) {
    console.error('generateSbarTemplate error:', error);
    throw error;
  }
}

// ============================================
// FORMATTING & EXPORT
// ============================================

/**
 * Format SBAR for clipboard/sharing
 */
export function formatSbarForSharing(report: SbarReport): string {
  const lines = [
    '═══════════════════════════════════',
    `SBAR REPORT - ${report.report_type.toUpperCase().replace('_', ' ')}`,
    `Date: ${new Date(report.created_at).toLocaleString()}`,
    `Urgency: ${report.urgency?.toUpperCase() || 'ROUTINE'}`,
    '═══════════════════════════════════',
    '',
    '📋 SITUATION',
    report.situation,
    '',
    '📚 BACKGROUND',
    report.background,
    '',
    '🔍 ASSESSMENT',
    report.assessment,
  ];
  
  // Add vital signs if present
  if (report.vital_signs) {
    const vs = report.vital_signs;
    lines.push('');
    lines.push('📊 VITAL SIGNS');
    if (vs.temperature) {
      const tempF = vs.temperature_fahrenheit || (vs.temperature * 9/5 + 32);
      lines.push(`  • Temp: ${vs.temperature}°C (${tempF.toFixed(1)}°F)`);
    }
    if (vs.heart_rate) lines.push(`  • HR: ${vs.heart_rate} bpm`);
    if (vs.blood_pressure_systolic && vs.blood_pressure_diastolic) {
      lines.push(`  • BP: ${vs.blood_pressure_systolic}/${vs.blood_pressure_diastolic} mmHg`);
    }
    if (vs.respiratory_rate) lines.push(`  • RR: ${vs.respiratory_rate} breaths/min`);
    if (vs.oxygen_saturation) lines.push(`  • SpO2: ${vs.oxygen_saturation}%`);
    if (vs.pain_score !== undefined) lines.push(`  • Pain: ${vs.pain_score}/10`);
  }
  
  lines.push('');
  lines.push('💡 RECOMMENDATION');
  lines.push(report.recommendation);
  
  if (report.recipient_role) {
    lines.push('');
    lines.push(`To: ${report.recipient_role}`);
  }
  
  lines.push('');
  lines.push('═══════════════════════════════════');
  
  return lines.join('\n');
}

/**
 * Format SBAR for voice dictation
 * Returns a structured script that can be read aloud
 */
export function formatSbarForVoice(report: SbarReport): string {
  const lines = [
    `This is an SBAR ${report.report_type.replace('_', ' ')} report.`,
    '',
    'Situation:',
    report.situation,
    '',
    'Background:',
    report.background,
    '',
    'Assessment:',
    report.assessment,
  ];
  
  if (report.vital_signs) {
    const vs = report.vital_signs;
    lines.push('');
    lines.push('Current vital signs are:');
    if (vs.temperature) {
      const tempF = vs.temperature_fahrenheit || (vs.temperature * 9/5 + 32);
      lines.push(`Temperature ${tempF.toFixed(1)} degrees Fahrenheit,`);
    }
    if (vs.heart_rate) lines.push(`Heart rate ${vs.heart_rate},`);
    if (vs.blood_pressure_systolic && vs.blood_pressure_diastolic) {
      lines.push(`Blood pressure ${vs.blood_pressure_systolic} over ${vs.blood_pressure_diastolic},`);
    }
    if (vs.respiratory_rate) lines.push(`Respiratory rate ${vs.respiratory_rate},`);
    if (vs.oxygen_saturation) lines.push(`Oxygen saturation ${vs.oxygen_saturation} percent.`);
  }
  
  lines.push('');
  lines.push('Recommendation:');
  lines.push(report.recommendation);
  
  return lines.join(' ');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get report type label
 */
export function getReportTypeLabel(type: SbarReportType): string {
  const labels: Record<SbarReportType, string> = {
    shift_handoff: 'Shift Handoff',
    physician_call: 'Physician Call',
    rapid_response: 'Rapid Response',
    transfer: 'Patient Transfer',
    discharge: 'Discharge',
  };
  return labels[type];
}

/**
 * Get urgency label
 */
export function getUrgencyLabel(urgency: SbarUrgency): string {
  const labels: Record<SbarUrgency, string> = {
    routine: 'Routine',
    urgent: 'Urgent',
    emergent: 'Emergent',
  };
  return labels[urgency];
}

/**
 * Get urgency color for UI
 */
export function getUrgencyColor(urgency: SbarUrgency): string {
  const colors: Record<SbarUrgency, string> = {
    routine: '#10b981',   // green
    urgent: '#f59e0b',    // amber
    emergent: '#ef4444',  // red
  };
  return colors[urgency];
}

/**
 * Validate SBAR report
 */
export function validateSbar(input: Partial<SbarReportInput>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!input.patient_id) errors.push('Patient is required');
  if (!input.situation || input.situation.trim().length === 0) {
    errors.push('Situation is required');
  }
  if (!input.background || input.background.trim().length === 0) {
    errors.push('Background is required');
  }
  if (!input.assessment || input.assessment.trim().length === 0) {
    errors.push('Assessment is required');
  }
  if (!input.recommendation || input.recommendation.trim().length === 0) {
    errors.push('Recommendation is required');
  }
  if (!input.report_type) errors.push('Report type is required');
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Convert vital signs to display format
 */
export function formatVitalSigns(vs: VitalSigns): string {
  const parts: string[] = [];
  
  if (vs.temperature) {
    const tempF = vs.temperature_fahrenheit || (vs.temperature * 9/5 + 32);
    parts.push(`T: ${tempF.toFixed(1)}°F`);
  }
  if (vs.heart_rate) parts.push(`HR: ${vs.heart_rate}`);
  if (vs.blood_pressure_systolic && vs.blood_pressure_diastolic) {
    parts.push(`BP: ${vs.blood_pressure_systolic}/${vs.blood_pressure_diastolic}`);
  }
  if (vs.respiratory_rate) parts.push(`RR: ${vs.respiratory_rate}`);
  if (vs.oxygen_saturation) parts.push(`SpO2: ${vs.oxygen_saturation}%`);
  if (vs.pain_score !== undefined) parts.push(`Pain: ${vs.pain_score}/10`);
  
  return parts.join(' | ');
}
