/**
 * OpenMRS EHR Integration
 * 
 * OpenMRS is the most widely used open-source EHR in developing countries
 * Used in 73 countries by 10,000+ health facilities
 * 
 * API: FREE (OpenMRS REST API v1/v2)
 * Documentation: https://rest.openmrs.org/
 */

export interface OpenMRSPatient {
  uuid: string;
  display: string;
  identifiers: Array<{
    identifier: string;
    identifierType: {
      display: string;
    };
  }>;
  person: {
    uuid: string;
    display: string;
    gender: string;
    age: number;
    birthdate: string;
    names: Array<{
      givenName: string;
      familyName: string;
    }>;
  };
}

export interface OpenMRSEncounter {
  uuid?: string;
  encounterDatetime: string;
  patient: string; // UUID
  encounterType: string; // UUID
  location: string; // UUID
  provider: string; // UUID
  obs: Array<{
    concept: string; // UUID
    value: string | number;
    obsDatetime: string;
  }>;
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
 * Export visit note to OpenMRS format
 */
export function exportToOpenMRS(visitNote: {
  patientId: string;
  providerId: string;
  locationId: string;
  encounterDate: Date;
  diagnoses: Array<{
    code: string;
    description: string;
    isPrimary: boolean;
  }>;
  clinicalNotes: string;
}): OpenMRSEncounter {
  return {
    encounterDatetime: visitNote.encounterDate.toISOString(),
    patient: visitNote.patientId,
    encounterType: '81852aad-4e6e-4f7c-9f93-ad099ac66e6d', // Default: Consultation
    location: visitNote.locationId,
    provider: visitNote.providerId,
    obs: [
      // Clinical notes
      {
        concept: '1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Clinical notes concept
        value: visitNote.clinicalNotes,
        obsDatetime: visitNote.encounterDate.toISOString(),
      },
      // Diagnoses (each as separate observation)
      ...visitNote.diagnoses.map((diag, index) => ({
        concept: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Diagnosis concept
        value: `${diag.code}: ${diag.description} (${diag.isPrimary ? 'Primary' : 'Secondary'})`,
        obsDatetime: visitNote.encounterDate.toISOString(),
      })),
    ],
  };
}

/**
 * Import encounter from OpenMRS
 */
export function importFromOpenMRS(encounter: OpenMRSEncounter): {
  patientId: string;
  encounterDate: Date;
  clinicalNotes: string;
  diagnoses: string[];
} {
  const clinicalNotesObs = encounter.obs.find(
    obs => obs.concept === '1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
  );
  
  const diagnosisObs = encounter.obs.filter(
    obs => obs.concept === '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
  );

  return {
    patientId: encounter.patient,
    encounterDate: new Date(encounter.encounterDatetime),
    clinicalNotes: (clinicalNotesObs?.value as string) || '',
    diagnoses: diagnosisObs.map(obs => obs.value as string),
  };
}

/**
 * Generate CSV export for bulk import into OpenMRS
 */
export function generateOpenMRSCSV(visits: Array<{
  patientIdentifier: string;
  encounterDate: string;
  locationName: string;
  providerName: string;
  diagnoses: string[];
  notes: string;
}>): string {
  const headers = [
    'Patient Identifier',
    'Encounter Date',
    'Location',
    'Provider',
    'Primary Diagnosis',
    'Secondary Diagnoses',
    'Clinical Notes',
  ];

  const rows = visits.map(visit => [
    visit.patientIdentifier,
    visit.encounterDate,
    visit.locationName,
    visit.providerName,
    visit.diagnoses[0] || '',
    visit.diagnoses.slice(1).join('; '),
    visit.notes.replace(/"/g, '""'), // Escape quotes
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Sample OpenMRS API client configuration
 */
export const openMRSConfig = {
  baseUrl: 'https://your-openmrs-server.org/openmrs/ws/rest/v1',
  username: 'admin',
  password: 'Admin123',
  
  // API endpoints
  endpoints: {
    patients: '/patient',
    encounters: '/encounter',
    obs: '/obs',
    concepts: '/concept',
    diagnoses: '/diagnosis',
  },
};

/**
 * Example API call to create encounter
 */
export async function createOpenMRSEncounter(
  encounter: OpenMRSEncounter,
  config: typeof openMRSConfig
): Promise<OpenMRSEncounter> {
  const auth = btoa(`${config.username}:${config.password}`);
  
  const response = await fetch(`${config.baseUrl}${config.endpoints.encounters}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify(encounter),
  });

  if (!response.ok) {
    throw new Error(`OpenMRS API error: ${response.statusText}`);
  }

  return response.json();
}
