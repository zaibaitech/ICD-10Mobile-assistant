import React, { createContext, useContext, useState } from 'react';
import { Icd10Code } from '../types';

interface VisitContextType {
  visitCodes: Icd10Code[];
  addCodeToVisit: (code: Icd10Code) => void;
  removeCodeFromVisit: (codeId: string) => void;
  clearVisit: () => void;
  isCodeInVisit: (codeId: string) => boolean;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

export const VisitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitCodes, setVisitCodes] = useState<Icd10Code[]>([]);

  const addCodeToVisit = (code: Icd10Code) => {
    setVisitCodes((prevCodes) => {
      // Check if code already exists
      if (prevCodes.some((c) => c.id === code.id)) {
        return prevCodes;
      }
      return [...prevCodes, code];
    });
  };

  const removeCodeFromVisit = (codeId: string) => {
    setVisitCodes((prevCodes) => prevCodes.filter((c) => c.id !== codeId));
  };

  const clearVisit = () => {
    setVisitCodes([]);
  };

  const isCodeInVisit = (codeId: string): boolean => {
    return visitCodes.some((c) => c.id === codeId);
  };

  return (
    <VisitContext.Provider
      value={{ visitCodes, addCodeToVisit, removeCodeFromVisit, clearVisit, isCodeInVisit }}
    >
      {children}
    </VisitContext.Provider>
  );
};

export const useVisit = () => {
  const context = useContext(VisitContext);
  if (context === undefined) {
    throw new Error('useVisit must be used within a VisitProvider');
  }
  return context;
};
