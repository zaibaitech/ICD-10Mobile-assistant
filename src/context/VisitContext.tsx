import React, { createContext, useContext, useState } from 'react';
import { Icd10Code, VisitAttachment } from '../types';

interface VisitContextType {
  visitCodes: Icd10Code[];
  addCodeToVisit: (code: Icd10Code) => void;
  removeCodeFromVisit: (codeId: string) => void;
  clearVisit: () => void;
  isCodeInVisit: (codeId: string) => boolean;
  // Attachments
  attachments: VisitAttachment[];
  addAttachment: (attachment: VisitAttachment) => void;
  removeAttachment: (attachmentId: string) => void;
  clearAttachments: () => void;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

export const VisitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitCodes, setVisitCodes] = useState<Icd10Code[]>([]);
  const [attachments, setAttachments] = useState<VisitAttachment[]>([]);

  const addCodeToVisit = (code: Icd10Code) => {
    setVisitCodes((prevCodes) => {
      // Check if code already exists (using code.code instead of code.id)
      if (prevCodes.some((c) => c.code === code.code)) {
        return prevCodes;
      }
      return [...prevCodes, code];
    });
  };

  const removeCodeFromVisit = (codeId: string) => {
    setVisitCodes((prevCodes) => prevCodes.filter((c) => c.code !== codeId));
  };

  const clearVisit = () => {
    setVisitCodes([]);
    setAttachments([]);
  };

  const isCodeInVisit = (codeId: string): boolean => {
    return visitCodes.some((c) => c.code === codeId);
  };

  const addAttachment = (attachment: VisitAttachment) => {
    setAttachments((prev) => [...prev, attachment]);
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const clearAttachments = () => {
    setAttachments([]);
  };

  return (
    <VisitContext.Provider
      value={{
        visitCodes,
        addCodeToVisit,
        removeCodeFromVisit,
        clearVisit,
        isCodeInVisit,
        attachments,
        addAttachment,
        removeAttachment,
        clearAttachments,
      }}
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

// Alias for consistency with AssistantScreen
export const useVisitContext = useVisit;
