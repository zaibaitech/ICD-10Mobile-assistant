import { AssistantResponse, AssistantContext, SuggestedCode, Icd10Code } from '../types';

// Keyword to ICD-10 code mappings (bilingual support)
const KEYWORD_CODE_MAP: Record<string, SuggestedCode[]> = {
  // English keywords
  'hypertension': [
    { id: '1', code: 'I10', short_title: 'Essential hypertension', confidence: 'high' }
  ],
  'blood pressure': [
    { id: '1', code: 'I10', short_title: 'Essential hypertension', confidence: 'high' }
  ],
  'diabetes': [
    { id: '2', code: 'E11.9', short_title: 'Type 2 diabetes', confidence: 'high' },
    { id: '3', code: 'E10.9', short_title: 'Type 1 diabetes', confidence: 'medium' }
  ],
  'chest pain': [
    { id: '4', code: 'R07.9', short_title: 'Chest pain, unspecified', confidence: 'medium' }
  ],
  'cough': [
    { id: '5', code: 'R05.9', short_title: 'Cough, unspecified', confidence: 'medium' }
  ],
  'back pain': [
    { id: '6', code: 'M54.5', short_title: 'Low back pain', confidence: 'high' }
  ],
  'headache': [
    { id: '7', code: 'R51.9', short_title: 'Headache', confidence: 'medium' }
  ],
  'anxiety': [
    { id: '8', code: 'F41.1', short_title: 'Generalized anxiety disorder', confidence: 'medium' }
  ],
  'depression': [
    { id: '9', code: 'F32.9', short_title: 'Major depressive disorder', confidence: 'medium' }
  ],
  'fever': [
    { id: '10', code: 'R50.9', short_title: 'Fever, unspecified', confidence: 'high' }
  ],
  'infection': [
    { id: '11', code: 'A49.9', short_title: 'Bacterial infection, unspecified', confidence: 'low' }
  ],
  
  // French keywords
  'tension artérielle': [
    { id: '1', code: 'I10', short_title: 'Hypertension essentielle', confidence: 'high' }
  ],
  'diabète': [
    { id: '2', code: 'E11.9', short_title: 'Diabète de type 2', confidence: 'high' },
    { id: '3', code: 'E10.9', short_title: 'Diabète de type 1', confidence: 'medium' }
  ],
  'douleur thoracique': [
    { id: '4', code: 'R07.9', short_title: 'Douleur thoracique, sans précision', confidence: 'medium' }
  ],
  'toux': [
    { id: '5', code: 'R05.9', short_title: 'Toux, sans précision', confidence: 'medium' }
  ],
  'mal de dos': [
    { id: '6', code: 'M54.5', short_title: 'Lombalgie', confidence: 'high' }
  ],
  'douleur lombaire': [
    { id: '6', code: 'M54.5', short_title: 'Lombalgie', confidence: 'high' }
  ],
  'migraine': [
    { id: '7', code: 'R51.9', short_title: 'Céphalée', confidence: 'medium' }
  ],
  'céphalée': [
    { id: '7', code: 'R51.9', short_title: 'Céphalée', confidence: 'medium' }
  ],
  'anxiété': [
    { id: '8', code: 'F41.1', short_title: 'Trouble anxieux généralisé', confidence: 'medium' }
  ],
  'dépression': [
    { id: '9', code: 'F32.9', short_title: 'Trouble dépressif majeur', confidence: 'medium' }
  ],
  'fièvre': [
    { id: '10', code: 'R50.9', short_title: 'Fièvre, sans précision', confidence: 'high' }
  ],
};

/**
 * Get assistant reply based on user input
 * Supports vision analysis when imageUrl is provided
 * TODO: Replace with real AI integration in Phase 3 (OpenAI/Claude API)
 */
export const getAssistantReply = async (
  input: string,
  context: AssistantContext
): Promise<AssistantResponse> => {
  const lowerInput = input.toLowerCase();
  
  // If image is provided, add vision-related context
  let visionContext = '';
  if (context.imageUrl) {
    visionContext = ' [Image attached for analysis] ';
    // TODO: In production, send image to GPT-4 Vision or similar API
    // const visionAnalysis = await analyzeImageWithAI(context.imageUrl);
  }
  
  // Find matching keywords
  const suggestedCodes: SuggestedCode[] = [];
  const seenCodes = new Set<string>();
  
  for (const [keyword, codes] of Object.entries(KEYWORD_CODE_MAP)) {
    if (lowerInput.includes(keyword.toLowerCase())) {
      codes.forEach(code => {
        if (!seenCodes.has(code.code)) {
          suggestedCodes.push(code);
          seenCodes.add(code.code);
        }
      });
    }
  }
  
  // Add image-specific code suggestions if image detected
  if (context.imageUrl) {
    // Add common visual presentation codes
    const imageRelatedCodes: SuggestedCode[] = [
      { id: 'img1', code: 'L98.9', short_title: 'Skin condition, unspecified', confidence: 'medium' },
      { id: 'img2', code: 'T14.9', short_title: 'Injury, unspecified', confidence: 'low' },
    ];
    
    imageRelatedCodes.forEach(code => {
      if (!seenCodes.has(code.code)) {
        suggestedCodes.push(code);
        seenCodes.add(code.code);
      }
    });
  }
  
  // Generate response text
  let text = '';
  const clarifyingQuestions: string[] = [];
  
  if (context.imageUrl) {
    text = '📷 I can see you\'ve attached an image. ' + (suggestedCodes.length > 0 
      ? 'Based on your description and the visual information, here are relevant ICD-10 codes:'
      : 'Please describe what the image shows (e.g., location, appearance, symptoms) for accurate coding.');
    
    clarifyingQuestions.push('What is the location and extent of the presentation?');
    clarifyingQuestions.push('How long has this been present?');
    clarifyingQuestions.push('Any associated symptoms or pain?');
  } else if (suggestedCodes.length > 0) {
    text = 'Based on your description, here are some relevant ICD-10 codes to consider:';
    
    // Add clarifying questions based on found codes
    if (suggestedCodes.some(c => c.code.startsWith('R07'))) {
      clarifyingQuestions.push('Is the chest pain radiating to arm, jaw, or back?');
      clarifyingQuestions.push('Any associated shortness of breath?');
    }
    if (suggestedCodes.some(c => c.code.startsWith('E1'))) {
      clarifyingQuestions.push('Any diabetic complications (neuropathy, nephropathy, retinopathy)?');
    }
    if (suggestedCodes.some(c => c.code.startsWith('M54'))) {
      clarifyingQuestions.push('Is the pain acute or chronic?');
      clarifyingQuestions.push('Any radiation down the leg?');
    }
  } else {
    text = 'I understand you described a clinical presentation. Could you provide more specific details about:';
    clarifyingQuestions.push('Primary symptoms?');
    clarifyingQuestions.push('Duration of symptoms?');
    clarifyingQuestions.push('Any relevant medical history?');
  }
  
  // Check if codes already in visit
  const existingCodes = new Set(context.currentVisitCodes.map(c => c.code));
  const filteredSuggestions = suggestedCodes.map(sc => ({
    ...sc,
    confidence: existingCodes.has(sc.code) ? 'low' as const : sc.confidence
  }));
  
  return {
    text,
    suggestedCodes: filteredSuggestions.slice(0, 5), // Limit to top 5
    clarifyingQuestions: clarifyingQuestions.slice(0, 3), // Limit to 3 questions
  };
};

/**
 * Transcribe audio to text
 * TODO: Integrate real speech-to-text API (Whisper, Google Cloud, Azure)
 */
export const transcribeAudio = async (audioUri: string): Promise<string> => {
  // Placeholder implementation
  console.log('Transcribing audio from:', audioUri);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // TODO: Replace with actual API call
  // Example: 
  // const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  //   method: 'POST',
  //   body: formData,
  //   headers: { 'Authorization': `Bearer ${OPENAI_KEY}` }
  // });
  
  return 'Patient presents with chest pain on exertion';
};

/**
 * Analyze medical image with AI vision
 * TODO: Integrate with GPT-4 Vision or similar medical imaging AI
 * @param imageUrl - Public URL of the uploaded image
 * @returns Analysis of the image including potential diagnoses
 */
export const analyzeImageWithAI = async (imageUrl: string): Promise<{
  description: string;
  suggestedCodes: SuggestedCode[];
}> => {
  console.log('Analyzing image:', imageUrl);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // TODO: Replace with actual AI vision API call
  // Example with OpenAI GPT-4 Vision:
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${OPENAI_KEY}`
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-4-vision-preview',
  //     messages: [{
  //       role: 'user',
  //       content: [
  //         { type: 'text', text: 'Analyze this medical image and suggest relevant ICD-10 codes.' },
  //         { type: 'image_url', image_url: { url: imageUrl } }
  //       ]
  //     }],
  //     max_tokens: 500
  //   })
  // });
  
  return {
    description: 'Placeholder: Image analysis would appear here in production',
    suggestedCodes: []
  };
};

/**
 * Convert suggested code to full ICD-10 code
 */
export const suggestedCodeToIcd10 = (suggested: SuggestedCode): Icd10Code => {
  return {
    id: suggested.id,
    code: suggested.code,
    short_title: suggested.short_title,
    full_title: suggested.short_title,
    long_description: null,
    chapter: getChapterFromCode(suggested.code),
  };
};

/**
 * Get chapter from code prefix
 */
const getChapterFromCode = (code: string): string => {
  const prefix = code.charAt(0);
  
  const chapterMap: Record<string, string> = {
    'A': 'Infectious diseases',
    'B': 'Infectious diseases',
    'C': 'Neoplasms',
    'D': 'Blood/Immune',
    'E': 'Endocrine/Metabolic',
    'F': 'Mental/Behavioral',
    'G': 'Nervous System',
    'H': 'Eye/Ear',
    'I': 'Circulatory System',
    'J': 'Respiratory System',
    'K': 'Digestive System',
    'L': 'Skin',
    'M': 'Musculoskeletal',
    'N': 'Genitourinary',
    'O': 'Pregnancy/Childbirth',
    'P': 'Perinatal',
    'Q': 'Congenital',
    'R': 'Symptoms/Signs',
    'S': 'Injury/Poisoning',
    'T': 'Injury/Poisoning',
    'Z': 'Health Status',
  };
  
  return chapterMap[prefix] || 'Other';
};
