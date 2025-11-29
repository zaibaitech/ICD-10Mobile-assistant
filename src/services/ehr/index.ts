/**
 * EHR Integration Index
 * 
 * Centralized access to all EHR system integrations
 * Supports: OpenMRS, DHIS2
 */

export * from './openmrs';
export * from './dhis2';

import { 
  exportToOpenMRS, 
  importFromOpenMRS, 
  generateOpenMRSCSV,
  createOpenMRSEncounter,
  openMRSConfig,
} from './openmrs';

import {
  exportToDHIS2Event,
  generateDHIS2CSV,
  generateDHIS2AggregateReport,
  createDHIS2Event,
  importDHIS2Events,
  queryDHIS2Events,
  dhis2Config,
} from './dhis2';

export const EHRIntegration = {
  OpenMRS: {
    export: exportToOpenMRS,
    import: importFromOpenMRS,
    generateCSV: generateOpenMRSCSV,
    createEncounter: createOpenMRSEncounter,
    config: openMRSConfig,
  },
  DHIS2: {
    exportEvent: exportToDHIS2Event,
    generateCSV: generateDHIS2CSV,
    generateAggregateReport: generateDHIS2AggregateReport,
    createEvent: createDHIS2Event,
    importEvents: importDHIS2Events,
    queryEvents: queryDHIS2Events,
    config: dhis2Config,
  },
};

export default EHRIntegration;
