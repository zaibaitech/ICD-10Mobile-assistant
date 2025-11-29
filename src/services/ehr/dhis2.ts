/**
 * DHIS2 Integration
 * 
 * DHIS2 is the world's largest health information system
 * Used in 73 countries for health data management
 * 
 * API: FREE (DHIS2 Web API)
 * Documentation: https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/web-api.html
 */

export interface DHIS2Event {
  program: string; // Program UID
  programStage: string; // Program stage UID
  orgUnit: string; // Organization unit UID
  eventDate: string; // ISO date
  status: 'ACTIVE' | 'COMPLETED' | 'VISITED' | 'SCHEDULE' | 'OVERDUE' | 'SKIPPED';
  dataValues: Array<{
    dataElement: string; // Data element UID
    value: string | number | boolean;
  }>;
}

export interface DHIS2TrackedEntity {
  trackedEntityType: string; // Tracked entity type UID (e.g., person)
  orgUnit: string; // Organization unit UID
  attributes: Array<{
    attribute: string; // Attribute UID
    value: string;
  }>;
  enrollments?: Array<{
    program: string;
    enrollmentDate: string;
    incidentDate: string;
    orgUnit: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  }>;
}

/**
 * Export visit note to DHIS2 event format
 */
export function exportToDHIS2Event(visitNote: {
  programId: string;
  programStageId: string;
  orgUnitId: string;
  eventDate: Date;
  patientId: string;
  diagnoses: Array<{
    code: string;
    description: string;
  }>;
  clinicalNotes: string;
}): DHIS2Event {
  return {
    program: visitNote.programId,
    programStage: visitNote.programStageId,
    orgUnit: visitNote.orgUnitId,
    eventDate: visitNote.eventDate.toISOString().split('T')[0], // YYYY-MM-DD
    status: 'COMPLETED',
    dataValues: [
      // Patient identifier
      {
        dataElement: 'PATIENT_ID_DATA_ELEMENT', // Replace with actual UID
        value: visitNote.patientId,
      },
      // Primary diagnosis code
      {
        dataElement: 'PRIMARY_DIAGNOSIS_CODE', // Replace with actual UID
        value: visitNote.diagnoses[0]?.code || '',
      },
      // Primary diagnosis description
      {
        dataElement: 'PRIMARY_DIAGNOSIS_DESC', // Replace with actual UID
        value: visitNote.diagnoses[0]?.description || '',
      },
      // Secondary diagnoses (comma-separated)
      {
        dataElement: 'SECONDARY_DIAGNOSES', // Replace with actual UID
        value: visitNote.diagnoses.slice(1).map(d => `${d.code}: ${d.description}`).join(', '),
      },
      // Clinical notes
      {
        dataElement: 'CLINICAL_NOTES', // Replace with actual UID
        value: visitNote.clinicalNotes,
      },
      // Number of diagnoses
      {
        dataElement: 'DIAGNOSIS_COUNT', // Replace with actual UID
        value: visitNote.diagnoses.length,
      },
    ],
  };
}

/**
 * Generate CSV for DHIS2 bulk import
 */
export function generateDHIS2CSV(events: Array<{
  orgUnit: string;
  eventDate: string;
  patientId: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string;
  notes: string;
}>): string {
  const headers = [
    'orgUnit',
    'eventDate',
    'patientId',
    'primaryDiagnosis',
    'secondaryDiagnoses',
    'clinicalNotes',
    'status',
  ];

  const rows = events.map(event => [
    event.orgUnit,
    event.eventDate,
    event.patientId,
    event.primaryDiagnosis,
    event.secondaryDiagnoses,
    event.notes.replace(/"/g, '""'),
    'COMPLETED',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
}

/**
 * DHIS2 aggregate data value set (for reporting)
 */
export interface DHIS2DataValueSet {
  dataSet: string; // Dataset UID
  completeDate: string; // ISO date
  period: string; // e.g., "202311" for Nov 2023
  orgUnit: string; // Organization unit UID
  dataValues: Array<{
    dataElement: string; // Data element UID
    categoryOptionCombo: string; // Category option combo UID
    value: string | number;
  }>;
}

/**
 * Generate aggregate report for DHIS2
 * Example: Monthly ICD-10 code frequency report
 */
export function generateDHIS2AggregateReport(
  orgUnitId: string,
  period: string, // e.g., "202311"
  diagnoses: Record<string, number> // { "A00.0": 5, "B50.9": 12, ... }
): DHIS2DataValueSet {
  return {
    dataSet: 'ICD10_MONTHLY_REPORT', // Replace with actual dataset UID
    completeDate: new Date().toISOString(),
    period,
    orgUnit: orgUnitId,
    dataValues: Object.entries(diagnoses).map(([code, count]) => ({
      dataElement: `ICD10_${code.replace('.', '_')}`, // e.g., ICD10_A00_0
      categoryOptionCombo: 'default', // Replace with actual UID
      value: count,
    })),
  };
}

/**
 * DHIS2 API client configuration
 */
export const dhis2Config = {
  baseUrl: 'https://your-dhis2-server.org/api',
  username: 'admin',
  password: 'district',
  
  // API endpoints
  endpoints: {
    events: '/events',
    trackedEntities: '/trackedEntityInstances',
    dataValueSets: '/dataValueSets',
    programs: '/programs',
    organisationUnits: '/organisationUnits',
  },
};

/**
 * Example API call to post event
 */
export async function createDHIS2Event(
  event: DHIS2Event,
  config: typeof dhis2Config
): Promise<{ httpStatus: string; response: { importCount: { imported: number } } }> {
  const auth = btoa(`${config.username}:${config.password}`);
  
  const response = await fetch(`${config.baseUrl}${config.endpoints.events}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify({ events: [event] }),
  });

  if (!response.ok) {
    throw new Error(`DHIS2 API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Batch import events (more efficient)
 */
export async function importDHIS2Events(
  events: DHIS2Event[],
  config: typeof dhis2Config
): Promise<{ httpStatus: string; response: { importCount: { imported: number } } }> {
  const auth = btoa(`${config.username}:${config.password}`);
  
  const response = await fetch(`${config.baseUrl}${config.endpoints.events}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify({ events }),
  });

  if (!response.ok) {
    throw new Error(`DHIS2 API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Query events from DHIS2
 */
export async function queryDHIS2Events(
  params: {
    orgUnit: string;
    program: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  },
  config: typeof dhis2Config
): Promise<{ events: DHIS2Event[] }> {
  const auth = btoa(`${config.username}:${config.password}`);
  
  const queryParams = new URLSearchParams({
    orgUnit: params.orgUnit,
    program: params.program,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  const response = await fetch(
    `${config.baseUrl}${config.endpoints.events}?${queryParams}`,
    {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`DHIS2 API error: ${response.statusText}`);
  }

  return response.json();
}
