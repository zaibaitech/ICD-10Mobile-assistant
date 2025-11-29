# Disease Management Modules

Clinical decision support modules based on WHO guidelines. Each module is independently downloadable and works 100% offline.

## Available Modules

### 1. Malaria Management (15KB)
- **Based on**: WHO Malaria Treatment Guidelines
- **ICD-10 Codes**: 9 codes (B50.0 - B54)
- **Features**:
  - Diagnostic criteria
  - Differential diagnosis
  - Treatment protocols (mild/moderate/severe)
  - Red flags and emergency management
  - Follow-up guidelines
  - Prevention strategies

### 2. Tuberculosis (TB) Management (12KB)
- **Based on**: WHO TB Treatment Guidelines
- **ICD-10 Codes**: 12 codes (A15.0 - A19.9)
- **Features**:
  - Pulmonary and extrapulmonary TB
  - Drug-sensitive TB treatment (6-month regimen)
  - MDR-TB considerations
  - TB meningitis protocols
  - Contact tracing
  - Preventive therapy

### 3. Dengue Fever Management (10KB)
- **Based on**: WHO Dengue Guidelines
- **ICD-10 Codes**: 4 codes (A90, A91, A97.0, A97.1)
- **Features**:
  - Classification (without warnings, with warnings, severe)
  - Fluid management protocols
  - Shock management
  - Warning signs monitoring
  - Critical phase management (days 4-7)
  - Vector control

## Usage

```typescript
import { getModule, getAllModules } from './data/disease-modules';

// Get specific module
const malariaModule = getModule('malaria');

// Get all modules
const allModules = getAllModules();

// Access module data
console.log(malariaModule.icd10Codes);
console.log(malariaModule.treatmentGuidelines.severe);
console.log(malariaModule.redFlags);
```

## Data Sources (All FREE)

1. **WHO - World Health Organization**
   - Malaria Guidelines: https://www.who.int/publications/i/item/guidelines-for-malaria
   - TB Guidelines: https://www.who.int/publications/i/item/9789240083851
   - Dengue Guidelines: https://www.who.int/publications/i/item/9789241547871
   - License: Public Domain

2. **CDC - Centers for Disease Control**
   - Clinical protocols and treatment recommendations
   - License: Public Domain (US Government)

## Future Modules (Planned)

- HIV/AIDS Management
- Maternal Health Protocols
- Child Health Integrated Management (IMCI)
- Snakebite Management
- Diabetic Emergencies
- Hypertensive Emergencies

## Contributing

To add a new disease module:

1. Create a new file in `src/data/disease-modules/`
2. Follow the `DiseaseModule` interface structure
3. Base content on WHO/CDC free guidelines
4. Keep file size <20KB for offline efficiency
5. Include proper attribution and license

## License

MIT License - Free to use, modify, and distribute

## Medical Disclaimer

These modules are documentation and education tools only. They do NOT replace:
- Clinical judgment
- Local treatment protocols
- Specialist consultation
- Laboratory confirmation

Always follow your country's national guidelines and local protocols.
