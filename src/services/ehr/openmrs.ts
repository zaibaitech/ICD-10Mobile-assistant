/**
 * OpenMRS Integration Service
 * Export/Import data in OpenMRS-compatible formats
 * 
 * OpenMRS is the most popular open-source EHR in developing countries
 * Used in 100+ countries by 8,000+ health facilities
 * 
 * Free Resources:
 * - OpenMRS REST API: https://rest.openmrs.org/
 * - Documentation: https://guide.openmrs.org/
 */

import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Types matching OpenMRS data model
export interface OpenMRSPatient {
  uuid?: string;
  display?: string;
  person: {
    uuid?: string;
    display?: string;
    gender: 'M' | 'F' | 'O';
    age?: number;
    birthdate: string;
    birthdateEstimated: boolean;
    names: Array<{
      givenName: string;
      familyName: string;
      preferred: boolean;
    }>;
    addresses?: Array<{
      address1?: string;
      cityVillage?: string;
      stateProvince?: string;
      country?: string;
      postalCode?: string;
    }>;
  };
  identifiers: Array<{
    identifier: string;
    identifierType: string;
    location?: string;
    preferred: boolean;
  }>;
}

export interface OpenMRSEncounter {
  uuid?: string;
  encounterDatetime: string;
  patient: string; // UUID
  encounterType: string; // UUID or name
  location?: string; // UUID or name
  provider?: string; // UUID
  obs: Array<OpenMRSObs>;
  diagnoses?: Array<OpenMRSDiagnosis>;
}

export interface OpenMRSObs {
  concept: string; // UUID or name
  value: string | number | boolean;
  obsDatetime?: string;
  comment?: string;
}

export interface OpenMRSDiagnosis {
  diagnosis: {
    coded?: {
      uuid: string;
      display: string;
    };
    nonCoded?: string;
  };
  certainty: 'CONFIRMED' | 'PROVISIONAL';
  rank: number; // 1 = primary, 2+ = secondary
}

/**
 * OpenMRS Export/Import Service
 */
export class OpenMRSService {
  
  /**
   * Export patient data to OpenMRS JSON format
   */
  async exportPatient(patientId: string): Promise<OpenMRSPatient | null> {
    try {
      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error || !patient) {
        console.error('[OpenMRS] Error fetching patient:', error);
        return null;
      }

      // Convert to OpenMRS format
      const openMRSPatient: OpenMRSPatient = {
        person: {
          gender: patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : 'O',
          birthdate: patient.date_of_birth,
          birthdateEstimated: false,
          names: [
            {
              givenName: patient.name.split(' ')[0] || '',
              familyName: patient.name.split(' ').slice(1).join(' ') || '',
              preferred: true,
            },
          ],
        },
        identifiers: [
          {
            identifier: patient.id,
            identifierType: 'ICD10_MOBILE_ID',
            preferred: true,
          },
        ],
      };

      return openMRSPatient;
    } catch (error) {
      console.error('[OpenMRS] Error exporting patient:', error);
      return null;
    }
  }

  /**
   * Export encounter to OpenMRS JSON format
   */
  async exportEncounter(encounterId: string): Promise<OpenMRSEncounter | null> {
    try {
      const { data: encounter, error } = await supabase
        .from('encounters')
        .select('*, icd10_codes(*)')
        .eq('id', encounterId)
        .single();

      if (error || !encounter) {
        console.error('[OpenMRS] Error fetching encounter:', error);
        return null;
      }

      // Build diagnoses from ICD codes
      const diagnoses: OpenMRSDiagnosis[] = encounter.icd10_codes?.map((code: any, index: number) => ({
        diagnosis: {
          coded: {
            uuid: code.code,
            display: code.long_description || code.short_title,
          },
        },
        certainty: 'CONFIRMED',
        rank: index + 1,
      })) || [];

      // Build observations
      const obs: OpenMRSObs[] = [];

      if (encounter.chief_complaint) {
        obs.push({
          concept: 'CHIEF_COMPLAINT',
          value: encounter.chief_complaint,
          obsDatetime: encounter.encounter_date,
        });
      }

      if (encounter.notes) {
        obs.push({
          concept: 'CLINICAL_NOTES',
          value: encounter.notes,
          obsDatetime: encounter.encounter_date,
        });
      }

      // Convert to OpenMRS format
      const openMRSEncounter: OpenMRSEncounter = {
        encounterDatetime: encounter.encounter_date,
        patient: encounter.patient_id,
        encounterType: 'CLINICAL_CONSULTATION',
        obs,
        diagnoses,
      };

      return openMRSEncounter;
    } catch (error) {
      console.error('[OpenMRS] Error exporting encounter:', error);
      return null;
    }
  }

  /**
   * Export multiple encounters as CSV (alternative format)
   */
  async exportEncountersCSV(patientId?: string): Promise<string> {
    try {
      let query = supabase
        .from('encounters')
        .select('*, patients(name), icd10_codes(code, short_title)')
        .order('encounter_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data: encounters, error } = await query;

      if (error) throw error;

      // CSV header
      const headers = [
        'Encounter ID',
        'Patient Name',
        'Patient ID',
        'Date',
        'Chief Complaint',
        'ICD-10 Codes',
        'Diagnoses',
        'Notes',
      ];

      // CSV rows
      const rows = encounters?.map(enc => [
        enc.id,
        enc.patients?.name || 'Unknown',
        enc.patient_id,
        new Date(enc.encounter_date).toLocaleDateString(),
        enc.chief_complaint || '',
        enc.icd10_codes?.map((c: any) => c.code).join('; ') || '',
        enc.icd10_codes?.map((c: any) => c.short_title).join('; ') || '',
        enc.notes?.replace(/\n/g, ' ') || '',
      ]) || [];

      // Combine into CSV string
      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      return csv;
    } catch (error) {
      console.error('[OpenMRS] Error exporting CSV:', error);
      return '';
    }
  }

  /**
   * Save export to file and share
   */
  async exportToFile(format: 'json' | 'csv' = 'csv'): Promise<void> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `openmrs_export_${timestamp}.${format}`;
      const filepath = `${FileSystem.documentDirectory}${filename}`;

      let content: string;

      if (format === 'csv') {
        content = await this.exportEncountersCSV();
      } else {
        // Export all encounters as JSON array
        const { data: encounters } = await supabase
          .from('encounters')
          .select('*')
          .order('encounter_date', { ascending: false });

        const openMRSEncounters = await Promise.all(
          (encounters || []).map(enc => this.exportEncounter(enc.id))
        );

        content = JSON.stringify(openMRSEncounters.filter(Boolean), null, 2);
      }

      // Write to file
      await FileSystem.writeAsStringAsync(filepath, content);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filepath, {
          mimeType: format === 'csv' ? 'text/csv' : 'application/json',
          dialogTitle: 'Export to OpenMRS',
        });
      }

      console.log('[OpenMRS] Export completed:', filepath);
    } catch (error) {
      console.error('[OpenMRS] Error exporting to file:', error);
      throw error;
    }
  }

  /**
   * Import patient from OpenMRS JSON
   */
  async importPatient(openMRSData: OpenMRSPatient, userId: string): Promise<string | null> {
    try {
      const name = openMRSData.person.names.find(n => n.preferred)
        ? `${openMRSData.person.names[0].givenName} ${openMRSData.person.names[0].familyName}`
        : 'Unknown';

      const gender = openMRSData.person.gender === 'M' ? 'male' : openMRSData.person.gender === 'F' ? 'female' : 'other';

      const { data, error } = await supabase
        .from('patients')
        .insert({
          user_id: userId,
          name,
          date_of_birth: openMRSData.person.birthdate,
          gender,
          synced: true,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[OpenMRS] Patient imported:', data.id);
      return data.id;
    } catch (error) {
      console.error('[OpenMRS] Error importing patient:', error);
      return null;
    }
  }

  /**
   * Import encounter from OpenMRS JSON
   */
  async importEncounter(openMRSData: OpenMRSEncounter): Promise<string | null> {
    try {
      // Extract chief complaint from obs
      const chiefComplaint = openMRSData.obs.find(o => o.concept === 'CHIEF_COMPLAINT')?.value as string;
      const notes = openMRSData.obs.find(o => o.concept === 'CLINICAL_NOTES')?.value as string;

      const { data, error } = await supabase
        .from('encounters')
        .insert({
          patient_id: openMRSData.patient,
          encounter_date: openMRSData.encounterDatetime,
          chief_complaint: chiefComplaint,
          notes,
          synced: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Import diagnoses as ICD codes
      if (openMRSData.diagnoses) {
        for (const diagnosis of openMRSData.diagnoses) {
          if (diagnosis.diagnosis.coded) {
            await supabase.from('encounter_codes').insert({
              encounter_id: data.id,
              icd10_code: diagnosis.diagnosis.coded.uuid,
            });
          }
        }
      }

      console.log('[OpenMRS] Encounter imported:', data.id);
      return data.id;
    } catch (error) {
      console.error('[OpenMRS] Error importing encounter:', error);
      return null;
    }
  }
}

// Export singleton
export const openMRSService = new OpenMRSService();
