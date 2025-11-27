# EHR Integration Services

Export and import data for integration with popular open-source Electronic Health Records (EHR) systems.

## Supported Systems

### 1. OpenMRS
**Most popular open-source EHR in developing countries**
- Used in 100+ countries
- 8,000+ health facilities
- REST API available
- Free and open-source

### 2. DHIS2
**National health information system**
- Used in 73 countries
- Health data aggregation
- WHO HMIS standard
- Free and open-source

## Features

### OpenMRS Integration

**Export**:
- Patient demographics (JSON format)
- Clinical encounters with diagnoses
- ICD-10 coded observations
- CSV format for bulk export

**Import**:
- Patient data from OpenMRS
- Encounter data with ICD codes
- Maintains UUID references

**Usage**:
```typescript
import { openMRSService } from '@/services/ehr';

// Export patient
const patient = await openMRSService.exportPatient(patientId);

// Export encounter
const encounter = await openMRSService.exportEncounter(encounterId);

// Export to file (CSV or JSON)
await openMRSService.exportToFile('csv');

// Import patient
const newPatientId = await openMRSService.importPatient(openMRSData, userId);
```

### DHIS2 Integration

**Export**:
- Monthly aggregated health data
- Data Value Sets (DHIS2 format)
- Individual events (tracker programs)
- Disease surveillance indicators

**Aggregation**:
- Total consultations and patients
- Disease counts by ICD-10 code
- Age group distribution
- Gender distribution

**Usage**:
```typescript
import { dhis2Service } from '@/services/ehr';

// Aggregate data for a period
const aggregates = await dhis2Service.aggregateMonthlyData(
  '2025-11-01',
  '2025-11-30',
  'facility_id'
);

// Export Data Value Set
const dataValueSet = await dhis2Service.exportDataValueSet(
  '2025-11',
  'OU_DEFAULT',
  'DS_ICD10_MOBILE'
);

// Export events
const events = await dhis2Service.exportEvents(
  '2025-11-01',
  '2025-11-30'
);

// Export to file
await dhis2Service.exportToFile('2025-11', 'json');
```

## Data Formats

### OpenMRS JSON Format

```json
{
  "person": {
    "gender": "M",
    "birthdate": "1990-01-01",
    "names": [{
      "givenName": "John",
      "familyName": "Doe"
    }]
  },
  "identifiers": [{
    "identifier": "12345",
    "identifierType": "ICD10_MOBILE_ID"
  }]
}
```

### DHIS2 Data Value Set

```json
{
  "dataSet": "DS_ICD10_MOBILE",
  "period": "202511",
  "orgUnit": "OU_DEFAULT",
  "dataValues": [
    {
      "dataElement": "DE_TOTAL_CONSULTATIONS",
      "value": 150
    },
    {
      "dataElement": "DE_ICD10_B50",
      "value": 25,
      "comment": "Malaria cases"
    }
  ]
}
```

### CSV Export Format

```csv
Encounter ID,Patient Name,Date,ICD-10 Codes,Diagnoses
enc_001,John Doe,2025-11-27,"B50, J18","Malaria; Pneumonia"
```

## Integration Workflows

### Workflow 1: Export to National DHIS2

1. Aggregate data monthly
2. Export as DHIS2 Data Value Set (JSON)
3. Upload to national DHIS2 instance via API
4. Support health surveillance and reporting

### Workflow 2: Import from OpenMRS

1. Export patient data from OpenMRS
2. Import to ICD-10 Mobile Assistant
3. Continue care with mobile app
4. Sync back to OpenMRS when online

### Workflow 3: Bulk Data Export

1. Export all encounters as CSV
2. Share via email/WhatsApp
3. Import to Excel/Google Sheets
4. Analyze data for quality improvement

## Offline Support

All export functions work offline:
- Data cached locally in SQLite/Supabase
- Export to device storage
- Share via Bluetooth/USB when internet unavailable
- Sync to EHR when connection restored

## Security & Privacy

- No patient identifiable information (PII) in aggregates
- Encrypted exports available
- HIPAA/GDPR compliant formats
- Local storage encryption

## API Documentation

### OpenMRS REST API
- Base URL: `https://demo.openmrs.org/openmrs/ws/rest/v1`
- Authentication: Basic Auth
- Documentation: https://rest.openmrs.org/

### DHIS2 Web API
- Base URL: `https://play.dhis2.org/demo/api`
- Authentication: Basic Auth or OAuth2
- Documentation: https://docs.dhis2.org/en/develop/using-the-api/

## Future Integrations

**Planned**:
- HL7 FHIR compliance
- mHero (mobile health worker communications)
- CommCare integration
- ODK (Open Data Kit) forms

**Under Consideration**:
- LOINC code mapping
- SNOMED CT integration
- ICD-11 support

## Testing

Use free sandbox environments:
- OpenMRS Demo: https://demo.openmrs.org/
- DHIS2 Play: https://play.dhis2.org/

## Contributing

To add new EHR integrations:
1. Research EHR data format
2. Implement export/import services
3. Add tests with sandbox data
4. Document API endpoints
5. Submit pull request

## License

MIT License - free for any use.
EHR systems have their own licenses (all are open-source).
