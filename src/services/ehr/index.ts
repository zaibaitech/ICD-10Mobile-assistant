/**
 * EHR Integration Index
 * Export all EHR services for easy import
 */

export { openMRSService, OpenMRSService } from './openmrs';
export { dhis2Service, DHIS2Service } from './dhis2';

export type {
  OpenMRSPatient,
  OpenMRSEncounter,
  OpenMRSObs,
  OpenMRSDiagnosis,
} from './openmrs';

export type {
  DHIS2DataValueSet,
  DHIS2DataValue,
  DHIS2Event,
  HealthDataAggregate,
} from './dhis2';
