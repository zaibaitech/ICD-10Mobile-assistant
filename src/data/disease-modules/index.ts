/**
 * Disease Modules Index
 * 
 * Centralized access to all disease management modules
 * Each module is independently downloadable and works 100% offline
 */

import malariaModule from './malaria';
import tuberculosisModule from './tuberculosis';
import dengueModule from './dengue';
import { DiseaseModule } from './malaria';

export const diseaseModules: Record<string, DiseaseModule> = {
  malaria: malariaModule,
  tuberculosis: tuberculosisModule,
  dengue: dengueModule,
};

export const getModule = (id: string): DiseaseModule | undefined => {
  return diseaseModules[id];
};

export const getAllModules = (): DiseaseModule[] => {
  return Object.values(diseaseModules);
};

export const getModulesBySearch = (query: string): DiseaseModule[] => {
  const lowerQuery = query.toLowerCase();
  return getAllModules().filter(module => 
    module.name.toLowerCase().includes(lowerQuery) ||
    module.id.toLowerCase().includes(lowerQuery) ||
    module.icd10Codes.some(code => 
      code.code.toLowerCase().includes(lowerQuery) ||
      code.title.toLowerCase().includes(lowerQuery)
    )
  );
};

export { malariaModule, tuberculosisModule, dengueModule };
export type { DiseaseModule };
