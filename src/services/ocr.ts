/**
 * OCR Service
 * Extract text from images using Tesseract.js
 */

import Tesseract from 'tesseract.js';
import * as ImageManipulator from 'expo-image-manipulator';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

/**
 * Preprocess image for better OCR accuracy
 */
async function preprocessImage(imageUri: string): Promise<string> {
  try {
    // Resize and enhance image
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Resize to reasonable dimensions (max 2000px width)
        { resize: { width: 2000 } },
      ],
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    return imageUri; // Return original if preprocessing fails
  }
}

/**
 * Perform OCR on an image
 */
export async function performOCR(
  imageUri: string,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    // Preprocess image
    const processedUri = await preprocessImage(imageUri);

    // Perform OCR with Tesseract
    const { data } = await Tesseract.recognize(
      processedUri,
      'eng',
      {
        logger: onProgress ? (m: any) => {
          if (m.status === 'recognizing text' && m.progress) {
            onProgress(m.progress);
          }
        } : undefined,
      }
    );

    // Extract word-level data if available
    const words = (data as any).words ? (data as any).words.map((word: any) => ({
      text: word.text,
      confidence: word.confidence,
      bbox: word.bbox,
    })) : [];

    return {
      text: data.text,
      confidence: data.confidence,
      words,
    };
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to perform OCR on image');
  }
}

/**
 * Extract ICD-10 codes from OCR text
 * Matches patterns like: A00.0, J44.1, Z23
 */
export function extractICD10Codes(text: string): string[] {
  // ICD-10 code pattern: Letter + 2 digits + optional (.digit(s))
  const icd10Pattern = /\b[A-TV-Z]\d{2}(?:\.\d{1,4})?\b/gi;
  const matches = text.match(icd10Pattern) || [];
  
  // Remove duplicates and sort
  const uniqueCodes = Array.from(new Set(matches.map(code => code.toUpperCase())));
  
  return uniqueCodes.sort();
}

/**
 * Extract medical terms from OCR text
 * Common medical keywords that might be relevant
 */
export function extractMedicalTerms(text: string): string[] {
  const medicalKeywords = [
    'diagnosis', 'treatment', 'prescription', 'medication',
    'symptoms', 'condition', 'disease', 'disorder',
    'infection', 'inflammation', 'chronic', 'acute',
    'patient', 'history', 'exam', 'vital signs',
    'temperature', 'blood pressure', 'heart rate',
    'respiratory', 'cardiovascular', 'neurological',
    'fever', 'pain', 'cough', 'nausea', 'fatigue',
  ];

  const words = text.toLowerCase().split(/\s+/);
  const foundTerms = words.filter(word => 
    medicalKeywords.some(keyword => word.includes(keyword))
  );

  return Array.from(new Set(foundTerms));
}

/**
 * Clean and format OCR text
 * Remove extra whitespace, fix common OCR errors
 */
export function cleanOCRText(text: string): string {
  return text
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove spaces before punctuation
    .replace(/\s+([.,;:!?])/g, '$1')
    // Fix common OCR mistakes
    .replace(/\bl\b/gi, 'I') // lowercase L to I
    .replace(/\bO\b/g, '0')   // uppercase O to zero in numbers
    .trim();
}

/**
 * Process medical document image
 * Complete pipeline: OCR → Extract codes → Extract terms
 */
export async function processMedicalDocument(
  imageUri: string,
  onProgress?: (progress: number) => void
): Promise<{
  rawText: string;
  cleanText: string;
  icd10Codes: string[];
  medicalTerms: string[];
  confidence: number;
}> {
  // Perform OCR
  const ocrResult = await performOCR(imageUri, onProgress);

  // Clean text
  const cleanText = cleanOCRText(ocrResult.text);

  // Extract ICD-10 codes
  const icd10Codes = extractICD10Codes(cleanText);

  // Extract medical terms
  const medicalTerms = extractMedicalTerms(cleanText);

  return {
    rawText: ocrResult.text,
    cleanText,
    icd10Codes,
    medicalTerms,
    confidence: ocrResult.confidence,
  };
}
