/**
 * DHIS2 Integration Service
 * Export health data for national health information systems
 * 
 * DHIS2 is used in 73 countries for health data aggregation
 * Free and open-source health information system
 * 
 * Free Resources:
 * - DHIS2 API: https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/introduction.html
 * - Documentation: https://dhis2.org/documentation/
 */

import { supabase } from '../supabase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// DHIS2 Data Value Set format
export interface DHIS2DataValueSet {
  dataSet: string; // DHIS2 dataset ID
  completeDate: string;
  period: string; // Format: YYYYMM or YYYYMMDD
  orgUnit: string; // Organization unit ID
  dataValues: DHIS2DataValue[];
}

export interface DHIS2DataValue {
  dataElement: string; // DHIS2 data element ID
  categoryOptionCombo?: string;
  value: string | number;
  comment?: string;
  period?: string;
  orgUnit?: string;
}

// DHIS2 Event format (for tracker programs)
export interface DHIS2Event {
  program: string;
  orgUnit: string;
  eventDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'SCHEDULED';
  trackedEntityInstance?: string;
  dataValues: Array<{
    dataElement: string;
    value: string | number;
  }>;
}

// Aggregate data structure
export interface HealthDataAggregate {
  period: string; // YYYY-MM format
  facilityId: string;
  indicators: {
    total_consultations: number;
    total_patients: number;
    disease_counts: Record<string, number>; // ICD code -> count
    age_groups: Record<string, number>;
    gender_distribution: Record<string, number>;
  };
}

/**
 * DHIS2 Export Service
 */
export class DHIS2Service {
  
  /**
   * Aggregate encounter data by month and disease
   */
  async aggregateMonthlyData(
    startDate: string,
    endDate: string,
    facilityId: string = 'default'
  ): Promise<HealthDataAggregate[]> {
    try {
      const { data: encounters, error } = await supabase
        .from('encounters')
        .select('*, patients(date_of_birth, gender), icd10_codes(code, chapter_number)')
        .gte('encounter_date', startDate)
        .lte('encounter_date', endDate)
        .order('encounter_date');

      if (error) throw error;

      // Group by month
      const monthlyData: Record<string, HealthDataAggregate> = {};

      encounters?.forEach(enc => {
        const period = enc.encounter_date.substring(0, 7); // YYYY-MM

        if (!monthlyData[period]) {
          monthlyData[period] = {
            period,
            facilityId,
            indicators: {
              total_consultations: 0,
              total_patients: 0,
              disease_counts: {},
              age_groups: {
                '0-5': 0,
                '6-17': 0,
                '18-49': 0,
                '50-64': 0,
                '65+': 0,
              },
              gender_distribution: {
                male: 0,
                female: 0,
                other: 0,
              },
            },
          };
        }

        const aggregate = monthlyData[period];
        aggregate.indicators.total_consultations++;

        // Count ICD codes
        enc.icd10_codes?.forEach((code: any) => {
          const icdCode = code.code.substring(0, 3); // Group by 3-char code
          aggregate.indicators.disease_counts[icdCode] = 
            (aggregate.indicators.disease_counts[icdCode] || 0) + 1;
        });

        // Age group
        if (enc.patients?.date_of_birth) {
          const age = this.calculateAge(enc.patients.date_of_birth);
          const ageGroup = this.getAgeGroup(age);
          aggregate.indicators.age_groups[ageGroup]++;
        }

        // Gender
        if (enc.patients?.gender) {
          aggregate.indicators.gender_distribution[enc.patients.gender]++;
        }
      });

      // Count unique patients per month
      for (const period in monthlyData) {
        const periodEncounters = encounters?.filter(
          enc => enc.encounter_date.startsWith(period)
        ) || [];
        
        const uniquePatients = new Set(periodEncounters.map(enc => enc.patient_id));
        monthlyData[period].indicators.total_patients = uniquePatients.size;
      }

      return Object.values(monthlyData);
    } catch (error) {
      console.error('[DHIS2] Error aggregating data:', error);
      return [];
    }
  }

  /**
   * Export to DHIS2 Data Value Set format
   */
  async exportDataValueSet(
    period: string,
    orgUnit: string = 'OU_DEFAULT',
    dataSet: string = 'DS_ICD10_MOBILE'
  ): Promise<DHIS2DataValueSet | null> {
    try {
      const startDate = `${period}-01`;
      const endDate = `${period}-31`;
      
      const aggregates = await this.aggregateMonthlyData(startDate, endDate);
      if (aggregates.length === 0) return null;

      const aggregate = aggregates[0];
      const dataValues: DHIS2DataValue[] = [];

      // Total consultations
      dataValues.push({
        dataElement: 'DE_TOTAL_CONSULTATIONS',
        value: aggregate.indicators.total_consultations,
      });

      // Total patients
      dataValues.push({
        dataElement: 'DE_TOTAL_PATIENTS',
        value: aggregate.indicators.total_patients,
      });

      // Disease counts (top 20 most common)
      const topDiseases = Object.entries(aggregate.indicators.disease_counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20);

      topDiseases.forEach(([code, count]) => {
        dataValues.push({
          dataElement: `DE_ICD10_${code}`,
          value: count,
          comment: `ICD-10 code ${code}`,
        });
      });

      // Age groups
      Object.entries(aggregate.indicators.age_groups).forEach(([group, count]) => {
        dataValues.push({
          dataElement: `DE_AGE_${group.replace(/[^a-zA-Z0-9]/g, '_')}`,
          value: count,
        });
      });

      // Gender distribution
      Object.entries(aggregate.indicators.gender_distribution).forEach(([gender, count]) => {
        dataValues.push({
          dataElement: `DE_GENDER_${gender.toUpperCase()}`,
          value: count,
        });
      });

      const dataValueSet: DHIS2DataValueSet = {
        dataSet,
        completeDate: new Date().toISOString(),
        period: period.replace('-', ''), // YYYYMM format
        orgUnit,
        dataValues,
      };

      return dataValueSet;
    } catch (error) {
      console.error('[DHIS2] Error creating data value set:', error);
      return null;
    }
  }

  /**
   * Export individual encounters as DHIS2 events
   */
  async exportEvents(
    startDate: string,
    endDate: string,
    program: string = 'PROGRAM_ICD10_MOBILE',
    orgUnit: string = 'OU_DEFAULT'
  ): Promise<DHIS2Event[]> {
    try {
      const { data: encounters, error } = await supabase
        .from('encounters')
        .select('*, icd10_codes(code, short_title)')
        .gte('encounter_date', startDate)
        .lte('encounter_date', endDate)
        .order('encounter_date');

      if (error) throw error;

      const events: DHIS2Event[] = encounters?.map(enc => ({
        program,
        orgUnit,
        eventDate: enc.encounter_date,
        status: 'COMPLETED',
        trackedEntityInstance: enc.patient_id,
        dataValues: [
          {
            dataElement: 'DE_CHIEF_COMPLAINT',
            value: enc.chief_complaint || '',
          },
          {
            dataElement: 'DE_ICD10_CODES',
            value: enc.icd10_codes?.map((c: any) => c.code).join(', ') || '',
          },
          {
            dataElement: 'DE_DIAGNOSES',
            value: enc.icd10_codes?.map((c: any) => c.short_title).join('; ') || '',
          },
        ],
      })) || [];

      return events;
    } catch (error) {
      console.error('[DHIS2] Error creating events:', error);
      return [];
    }
  }

  /**
   * Export aggregated data to JSON file
   */
  async exportToFile(period: string, format: 'json' | 'csv' = 'json'): Promise<void> {
    try {
      const filename = `dhis2_export_${period}.${format}`;
      const filepath = `${FileSystem.documentDirectory}${filename}`;

      let content: string;

      if (format === 'csv') {
        content = await this.exportCSV(period);
      } else {
        const dataValueSet = await this.exportDataValueSet(period);
        content = JSON.stringify(dataValueSet, null, 2);
      }

      await FileSystem.writeAsStringAsync(filepath, content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filepath, {
          mimeType: format === 'csv' ? 'text/csv' : 'application/json',
          dialogTitle: 'Export to DHIS2',
        });
      }

      console.log('[DHIS2] Export completed:', filepath);
    } catch (error) {
      console.error('[DHIS2] Error exporting to file:', error);
      throw error;
    }
  }

  /**
   * Export as CSV format (alternative)
   */
  private async exportCSV(period: string): Promise<string> {
    const startDate = `${period}-01`;
    const endDate = `${period}-31`;
    
    const aggregates = await this.aggregateMonthlyData(startDate, endDate);
    if (aggregates.length === 0) return '';

    const aggregate = aggregates[0];

    // CSV headers
    const headers = ['Indicator', 'Value'];
    const rows: string[][] = [
      ['Period', aggregate.period],
      ['Facility ID', aggregate.facilityId],
      ['Total Consultations', aggregate.indicators.total_consultations.toString()],
      ['Total Patients', aggregate.indicators.total_patients.toString()],
      ['', ''], // Separator
      ['ICD-10 Code', 'Count'],
    ];

    // Add disease counts
    Object.entries(aggregate.indicators.disease_counts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([code, count]) => {
        rows.push([code, count.toString()]);
      });

    // Add age groups
    rows.push(['', ''], ['Age Group', 'Count']);
    Object.entries(aggregate.indicators.age_groups).forEach(([group, count]) => {
      rows.push([group, count.toString()]);
    });

    // Add gender
    rows.push(['', ''], ['Gender', 'Count']);
    Object.entries(aggregate.indicators.gender_distribution).forEach(([gender, count]) => {
      rows.push([gender, count.toString()]);
    });

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Calculate age from birthdate
   */
  private calculateAge(birthdate: string): number {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get age group category
   */
  private getAgeGroup(age: number): string {
    if (age <= 5) return '0-5';
    if (age <= 17) return '6-17';
    if (age <= 49) return '18-49';
    if (age <= 64) return '50-64';
    return '65+';
  }
}

// Export singleton
export const dhis2Service = new DHIS2Service();
