# Disease Modules

Clinical decision support protocols based on WHO/CDC free resources.

## Available Modules

### 1. Malaria (15KB)
**ICD-10 Codes**: B50-B54

**Content**:
- Red flag symptoms requiring immediate action
- Diagnostic criteria (clinical + laboratory)
- Treatment algorithm (uncomplicated vs severe)
- Artemisinin-based combination therapy (ACT) protocols
- Differential diagnosis (typhoid, dengue, meningitis)
- Complications management
- Prevention strategies (bed nets, chemoprevention)

**Sources**: WHO Guidelines for malaria, CDC Malaria Treatment Guidelines

### 2. Tuberculosis (18KB)
**ICD-10 Codes**: A15-A19

**Content**:
- Red flag symptoms (hemoptysis, meningitis signs)
- Diagnostic criteria (sputum, GeneXpert, chest X-ray)
- Treatment phases (intensive 2 months + continuation 4 months)
- RHZE fixed-dose combination protocols
- MDR-TB recognition and referral
- Differential diagnosis (pneumonia, lung cancer, PCP)
- Complications (hepatitis, neuropathy, TB-IRIS)
- Prevention (BCG, TPT for contacts)

**Sources**: WHO TB Treatment Guidelines, CDC TB Guidelines

### 3. Dengue Fever (16KB)
**ICD-10 Codes**: A90-A91

**Content**:
- Warning signs of severe dengue
- WHO 2009 classification (Groups A, B, C)
- Fluid management protocols
- Platelet transfusion criteria
- Differential diagnosis (malaria, chikungunya, influenza)
- Dengue shock syndrome management
- Prevention (vector control, personal protection)

**Sources**: WHO Dengue Guidelines, CDC Dengue Clinical Guidance

## Usage

### In the App

```typescript
import { diseaseModuleService } from '@/services/diseaseModules';

// Get available modules
const modules = await diseaseModuleService.getAvailableModules();

// Download a module
const malariaProtocol = await diseaseModuleService.downloadModule('malaria');

// Search by ICD code
const protocols = await diseaseModuleService.searchByCode('B50');

// Get locally downloaded modules
const downloaded = await diseaseModuleService.getDownloadedModules();
```

### Module Structure

Each module contains:
- **Red Flags**: Critical symptoms requiring immediate action
- **Diagnostic Criteria**: Clinical, laboratory, and imaging findings
- **Treatment Algorithm**: Step-by-step management protocols
- **Medications**: Dosing, routes, contraindications, costs
- **Differential Diagnosis**: Similar conditions to rule out
- **Complications**: Recognition and management
- **Prevention**: Primary, secondary, tertiary strategies
- **References**: WHO/CDC evidence-based sources

## Adding New Modules

1. Create JSON file in `src/data/disease-modules/`
2. Follow the existing structure (see `malaria.json`)
3. Use only FREE data sources:
   - WHO treatment guidelines
   - CDC clinical protocols
   - PubMed open-access articles
4. Keep file size < 20KB for fast downloads
5. Test on low-bandwidth connections

## Data Sources (All FREE)

### WHO Resources
- Treatment guidelines: https://www.who.int/publications
- Disease surveillance: https://www.who.int/data
- Clinical protocols: Creative Commons licensed

### CDC Resources
- Clinical guidelines: https://www.cdc.gov/
- Disease information: Public domain
- Treatment recommendations: Free access

### PubMed
- Open-access articles: https://pubmed.ncbi.nlm.nih.gov/
- Clinical studies: Free full-text
- Systematic reviews: Cochrane Library

## Offline Storage

Modules are stored locally using AsyncStorage:
- Small file sizes (10-20KB each)
- No internet required after download
- Survives app restarts
- Can be deleted individually to save space

## Future Modules

**High Priority**:
- HIV/AIDS (B20-B24)
- Maternal Health (O00-O99)
- Childhood Pneumonia (J12-J18)
- Diarrheal Diseases (A00-A09)
- Malnutrition (E40-E46)

**Medium Priority**:
- Mental Health (F00-F99)
- Hypertension (I10-I15)
- Diabetes (E10-E14)
- Snake Bites (T63)
- Trauma (S00-T14)

## Contributing

To add a new disease module:

1. Identify FREE data sources (WHO, CDC, PubMed)
2. Create JSON following existing structure
3. Include all required sections
4. Add references with evidence levels
5. Test on mobile devices
6. Submit pull request

## License

All disease modules use data from public domain or Creative Commons sources.
Individual references retain their original licenses (cited in each module).

This work is licensed under MIT License - free for any use.
