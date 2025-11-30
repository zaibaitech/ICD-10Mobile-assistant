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

import { AI_CONFIG, validateAIConfig } from '../config/ai';

/**
 * Advanced AI assistant with GPT-4 integration
 * Features:
 * - Natural language processing with medical context
 * - Image analysis with GPT-4 Vision
 * - Context-aware code suggestions
 * - Clinical reasoning and explanations
 * - Fallback to enhanced keyword matching
 */
export const getAssistantReply = async (
  input: string,
  context: AssistantContext
): Promise<AssistantResponse> => {
  try {
    // Validate configuration and use real AI if available
    const { valid } = validateAIConfig();
    if (AI_CONFIG.USE_REAL_AI && valid) {
      return await getAIAssistantReply(input, context);
    }
    
    // Enhanced fallback with better keyword matching
    return await getEnhancedKeywordReply(input, context);
  } catch (error) {
    console.error('AI Assistant error:', error);
    // Fallback to basic keyword matching
    return await getEnhancedKeywordReply(input, context);
  }
};

/**
 * Real AI assistant using Groq AI (FREE) or OpenAI (Paid)
 */
const getAIAssistantReply = async (
  input: string,
  context: AssistantContext
): Promise<AssistantResponse> => {
  // Get API configuration based on provider
  const provider = AI_CONFIG.PROVIDER;
  const apiUrl = provider === 'groq' ? AI_CONFIG.GROQ.API_URL : AI_CONFIG.OPENAI.API_URL;
  const apiKey = provider === 'groq' ? AI_CONFIG.GROQ.API_KEY : AI_CONFIG.OPENAI.API_KEY;
  const model = provider === 'groq' ? AI_CONFIG.GROQ.CHAT_MODEL : AI_CONFIG.OPENAI.CHAT_MODEL;

  const messages: any[] = [
    {
      role: 'system',
      content: AI_CONFIG.PROMPTS.SYSTEM
    }
  ];

  // Add context about current visit codes
  if (context.currentVisitCodes.length > 0) {
    const codesText = context.currentVisitCodes.map(c => `${c.code}: ${c.short_title}`).join(', ');
    messages.push({
      role: 'system',
      content: `Current visit codes: ${codesText}`
    });
  }

  // Handle image + text input (only for OpenAI - Groq doesn't support vision yet)
  if (context.imageUrl && provider === 'openai') {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Analyze this medical image and the following description: "${input}". Suggest relevant ICD-10 codes.`
        },
        {
          type: 'image_url',
          image_url: { url: context.imageUrl }
        }
      ]
    });
  } else if (context.imageUrl && provider === 'groq') {
    // For Groq, inform user that image analysis is not supported
    messages.push({
      role: 'user',
      content: `${input}\n\nNote: An image was provided but Groq doesn't support image analysis yet. Please describe the image findings in text.`
    });
  } else {
    messages.push({
      role: 'user',
      content: input
    });
  }

  try {
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: provider === 'groq' ? AI_CONFIG.GROQ.MAX_TOKENS : AI_CONFIG.OPENAI.MAX_TOKENS,
        temperature: provider === 'groq' ? AI_CONFIG.GROQ.TEMPERATURE : AI_CONFIG.OPENAI.TEMPERATURE,
        // Note: Groq doesn't support function calling yet, so we'll parse the response
      })
    });

    const data = await response.json();
    
    // Parse the AI response to extract codes
    if (data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content;
      return parseAIResponse(content);
    }
  } catch (error) {
    console.error(`${provider.toUpperCase()} API error:`, error);
    throw error;
  }

  throw new Error('No valid AI response received');
};

/**
 * Parse AI response text to extract ICD-10 codes and information
 * Works with both Groq and OpenAI responses
 */
const parseAIResponse = (content: string): AssistantResponse => {
  const suggestedCodes: SuggestedCode[] = [];
  const questions: string[] = [];
  
  // Extract ICD-10 codes using regex patterns
  // Matches formats like: I10, E11.9, R07.9, etc.
  const codePattern = /([A-Z]\d{2}(?:\.\d{1,2})?)\s*[-:]\s*([^\n]+)/gi;
  let match;
  let codeId = 1;
  
  while ((match = codePattern.exec(content)) !== null) {
    const [_, code, description] = match;
    
    // Determine confidence based on keywords in context
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('highly recommend') || lowerContent.includes('definite')) {
      confidence = 'high';
    } else if (lowerContent.includes('possible') || lowerContent.includes('consider')) {
      confidence = 'medium';
    } else if (lowerContent.includes('unlikely') || lowerContent.includes('rule out')) {
      confidence = 'low';
    }
    
    suggestedCodes.push({
      id: codeId.toString(),
      code: code.trim(),
      short_title: description.trim().replace(/[*#]/g, ''),
      confidence
    });
    codeId++;
  }
  
  // Extract questions (lines ending with ?)
  const questionPattern = /^[•\-*]?\s*(.+\?)\s*$/gm;
  while ((match = questionPattern.exec(content)) !== null) {
    questions.push(match[1].trim());
  }
  
  return {
    text: content,
    suggestedCodes: suggestedCodes.slice(0, 5), // Limit to top 5
    clarifyingQuestions: questions.slice(0, 3)  // Limit to 3 questions
  };
};

/**
 * Enhanced keyword matching with medical intelligence
 */
const getEnhancedKeywordReply = async (
  input: string,
  context: AssistantContext
): Promise<AssistantResponse> => {
  const lowerInput = input.toLowerCase();
  
  // Enhanced image analysis simulation
  if (context.imageUrl) {
    const imageAnalysis = await simulateImageAnalysis(lowerInput);
    return {
      text: `🔍 **Image Analysis** (Enhanced Simulation)\n\n${imageAnalysis.description}\n\n**Suggested ICD-10 Codes:**`,
      suggestedCodes: imageAnalysis.suggestedCodes,
      clarifyingQuestions: imageAnalysis.questions
    };
  }
  
  // Find matching keywords with enhanced logic
  const suggestedCodes: SuggestedCode[] = [];
  const seenCodes = new Set<string>();
  const matchedKeywords: string[] = [];
  
  for (const [keyword, codes] of Object.entries(KEYWORD_CODE_MAP)) {
    if (lowerInput.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
      codes.forEach(code => {
        if (!seenCodes.has(code.code)) {
          suggestedCodes.push({
            ...code,
            // Boost confidence for exact matches
            confidence: lowerInput === keyword.toLowerCase() ? 'high' : code.confidence
          });
          seenCodes.add(code.code);
        }
      });
    }
  }
  
  // Add context-based suggestions
  const contextualCodes = getContextualSuggestions(lowerInput, context);
  contextualCodes.forEach(code => {
    if (!seenCodes.has(code.code)) {
      suggestedCodes.push(code);
      seenCodes.add(code.code);
    }
  });
  
  // Generate intelligent response
  const { text, questions } = generateIntelligentResponse(
    lowerInput, 
    suggestedCodes, 
    matchedKeywords, 
    context
  );
  
  // Check if codes already in visit
  const existingCodes = new Set(context.currentVisitCodes.map(c => c.code));
  const filteredSuggestions = suggestedCodes.map(sc => ({
    ...sc,
    confidence: existingCodes.has(sc.code) ? 'low' as const : sc.confidence
  }));
  
  return {
    text,
    suggestedCodes: filteredSuggestions.slice(0, 5),
    clarifyingQuestions: questions.slice(0, 3)
  };
};

/**
 * Advanced speech-to-text transcription with medical vocabulary
 * Uses AssemblyAI (FREE - 100 hours/month) or fallback to simulation
 */
export const transcribeAudio = async (audioUri: string): Promise<string> => {
  console.log('🎤 Transcribing audio:', audioUri);
  
  // Use real AssemblyAI if configured
  const assemblyAIKey = process.env.EXPO_PUBLIC_ASSEMBLYAI_KEY;
  if (AI_CONFIG.USE_REAL_AI && assemblyAIKey && assemblyAIKey !== 'your-assemblyai-key-here') {
    return await transcribeWithAssemblyAI(audioUri, assemblyAIKey);
  }
  
  // Enhanced simulation with realistic medical scenarios
  return await simulateAdvancedTranscription();
};

/**
 * Real AssemblyAI transcription (FREE - 100 hours/month)
 */
const transcribeWithAssemblyAI = async (audioUri: string, apiKey: string): Promise<string> => {
  try {
    console.log('🎤 Using AssemblyAI for transcription...');
    
    // Step 1: Upload audio file to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
      },
      body: await fetch(audioUri).then(r => r.blob())
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio to AssemblyAI');
    }

    const { upload_url } = await uploadResponse.json();

    // Step 2: Request transcription with medical vocabulary boost
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        speech_model: 'best', // Use best model for medical terminology
        language_code: 'en',
        punctuate: true,
        format_text: true,
        word_boost: [
          // Medical terms to boost recognition
          'hypertension', 'diabetes', 'diagnosis', 'symptoms', 'patient',
          'medication', 'treatment', 'chronic', 'acute', 'ICD-10'
        ],
        boost_param: 'high'
      })
    });

    if (!transcriptResponse.ok) {
      throw new Error('Failed to request transcription from AssemblyAI');
    }

    const { id: transcriptId } = await transcriptResponse.json();

    // Step 3: Poll for completion (usually takes 15-30% of audio duration)
    let transcript;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max wait

    while (attempts < maxAttempts) {
      const pollingResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { 'authorization': apiKey }
        }
      );

      transcript = await pollingResponse.json();

      if (transcript.status === 'completed') {
        console.log('✅ Transcription completed!');
        return transcript.text || 'Unable to transcribe audio';
      } else if (transcript.status === 'error') {
        throw new Error('AssemblyAI transcription failed: ' + transcript.error);
      }

      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Transcription timeout - taking too long');

  } catch (error) {
    console.error('AssemblyAI transcription error:', error);
    // Fallback to simulation on error
    return await simulateAdvancedTranscription();
  }
};

/**
 * Enhanced transcription simulation with realistic medical scenarios
 */
const simulateAdvancedTranscription = async (): Promise<string> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, AI_CONFIG.MOCK.PROCESSING_DELAY));
  
  const medicalScenarios = [
    "Patient is a 45-year-old female presenting with chest pain that started this morning. The pain is described as sharp, located in the center of the chest, and worsens with deep breathing. No radiation to arms or jaw. No shortness of breath or nausea.",
    
    "67-year-old male with a history of diabetes presents with increasing fatigue over the past two weeks. Also reports increased urination and thirst. Blood glucose levels have been running high despite medication compliance.",
    
    "32-year-old patient complains of lower back pain that began after lifting heavy boxes three days ago. Pain is described as aching, worse in the morning, and improves with movement. No numbness or tingling in legs.",
    
    "Patient reports a persistent dry cough for the past month, especially at night. No fever, no sputum production. Has been using over-the-counter cough suppressants with minimal relief. Non-smoker with no known allergies.",
    
    "55-year-old presents with severe headache that started suddenly two hours ago. Describes it as the worst headache of their life. Associated with some nausea but no visual changes or neck stiffness. No recent head trauma.",
    
    "Patient has a rash on the forearm that appeared yesterday. Describes it as red, itchy bumps that seem to be spreading. Recently did yard work and may have encountered poison ivy. No fever or systemic symptoms."
  ];
  
  // Return a random scenario
  const scenario = medicalScenarios[Math.floor(Math.random() * medicalScenarios.length)];
  
  return `🎤 **Transcription** (Enhanced Simulation):\n\n${scenario}`;
};

/**
 * Simulate advanced image analysis with medical intelligence
 */
const simulateImageAnalysis = async (textContext: string): Promise<{
  description: string;
  suggestedCodes: SuggestedCode[];
  questions: string[];
}> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Enhanced simulation based on text context
  const analysisResults = [
    {
      keywords: ['rash', 'skin', 'red', 'lesion', 'bump', 'spot'],
      description: '**Dermatological Presentation Detected**\n\n• Visible skin changes/lesions\n• Requires clinical correlation\n• Consider infection, inflammation, or allergic reaction\n• Location and distribution important for diagnosis',
      codes: [
        { id: 'img1', code: 'L30.9', short_title: 'Dermatitis, unspecified', confidence: 'medium' as const },
        { id: 'img2', code: 'L98.9', short_title: 'Disorder of skin, unspecified', confidence: 'low' as const },
        { id: 'img3', code: 'B08.1', short_title: 'Molluscum contagiosum', confidence: 'low' as const }
      ],
      questions: [
        'How long has this skin change been present?',
        'Is there any itching, pain, or discharge?',
        'Any recent exposure to allergens or irritants?'
      ]
    },
    {
      keywords: ['wound', 'cut', 'laceration', 'injury', 'bleeding'],
      description: '**Traumatic Injury Assessment**\n\n• Visible tissue damage\n• Depth and extent evaluation needed\n• Consider contamination and tetanus status\n• Document mechanism of injury',
      codes: [
        { id: 'img4', code: 'S61.9', short_title: 'Open wound of wrist/hand', confidence: 'medium' as const },
        { id: 'img5', code: 'T14.1', short_title: 'Open wound of unspecified body region', confidence: 'medium' as const },
        { id: 'img6', code: 'Z87.891', short_title: 'Personal history of nicotine dependence', confidence: 'low' as const }
      ],
      questions: [
        'When did the injury occur?',
        'What caused the injury?',
        'Current tetanus vaccination status?'
      ]
    },
    {
      keywords: ['swelling', 'swollen', 'edema', 'inflammation'],
      description: '**Inflammatory/Edematous Changes**\n\n• Tissue swelling observed\n• May indicate infection, trauma, or systemic condition\n• Bilateral vs unilateral distribution significant\n• Consider underlying cardiovascular or renal causes',
      codes: [
        { id: 'img7', code: 'R60.9', short_title: 'Edema, unspecified', confidence: 'high' as const },
        { id: 'img8', code: 'L03.90', short_title: 'Cellulitis, unspecified', confidence: 'medium' as const },
        { id: 'img9', code: 'M79.89', short_title: 'Other specified soft tissue disorders', confidence: 'low' as const }
      ],
      questions: [
        'Is the swelling painful or tender?',
        'Any associated fever or systemic symptoms?',
        'Is this new onset or chronic?'
      ]
    }
  ];
  
  // Find best match based on text context
  let bestMatch = analysisResults[0]; // Default
  for (const result of analysisResults) {
    const matchCount = result.keywords.filter(keyword => 
      textContext.includes(keyword)
    ).length;
    if (matchCount > 0) {
      bestMatch = result;
      break;
    }
  }
  
  return {
    description: bestMatch.description,
    suggestedCodes: bestMatch.codes,
    questions: bestMatch.questions
  };
};

/**
 * Get contextual code suggestions based on medical logic
 */
const getContextualSuggestions = (input: string, context: AssistantContext): SuggestedCode[] => {
  const suggestions: SuggestedCode[] = [];
  const existingCodes = context.currentVisitCodes.map(c => c.code);
  
  // If patient has diabetes, suggest related codes for symptoms
  if (existingCodes.some(code => code.startsWith('E1'))) {
    if (input.includes('neuropathy') || input.includes('numbness')) {
      suggestions.push({ id: 'ctx1', code: 'E11.40', short_title: 'Type 2 diabetes with neuropathy', confidence: 'high' });
    }
    if (input.includes('kidney') || input.includes('proteinuria')) {
      suggestions.push({ id: 'ctx2', code: 'E11.21', short_title: 'Type 2 diabetes with nephropathy', confidence: 'high' });
    }
  }
  
  // If patient has hypertension, suggest related complications
  if (existingCodes.some(code => code.startsWith('I1'))) {
    if (input.includes('heart') || input.includes('cardiac')) {
      suggestions.push({ id: 'ctx3', code: 'I11.9', short_title: 'Hypertensive heart disease', confidence: 'medium' });
    }
  }
  
  return suggestions;
};

/**
 * Generate intelligent response based on context and matches
 */
const generateIntelligentResponse = (
  input: string,
  suggestedCodes: SuggestedCode[],
  matchedKeywords: string[],
  context: AssistantContext
): { text: string; questions: string[] } => {
  const questions: string[] = [];
  let text = '';
  
  if (suggestedCodes.length === 0) {
    text = `I understand you're describing: "${input.substring(0, 100)}${input.length > 100 ? '...' : ''}"\n\n` +
           'To provide accurate ICD-10 code suggestions, I need more specific clinical information.';
    
    questions.push('What are the primary symptoms or chief complaint?');
    questions.push('How long have these symptoms been present?');
    questions.push('Any relevant medical history or current medications?');
  } else {
    const highConfidenceCodes = suggestedCodes.filter(c => c.confidence === 'high');
    const matchedText = matchedKeywords.length > 0 ? 
      ` for "${matchedKeywords.join(', ')}"` : '';
    
    if (highConfidenceCodes.length > 0) {
      text = `🎯 **Strong Match Found${matchedText}**\n\n` +
             'Based on the clinical presentation, here are highly relevant ICD-10 codes:';
    } else {
      text = `🔍 **Analysis Complete${matchedText}**\n\n` +
             'Based on the available information, here are potential ICD-10 codes to consider:';
    }
    
    // Add specific questions based on code categories
    if (suggestedCodes.some(c => c.code.startsWith('R'))) {
      questions.push('Can you provide more details about the symptom onset and characteristics?');
    }
    if (suggestedCodes.some(c => c.code.startsWith('M'))) {
      questions.push('What is the pain level and does it radiate to other areas?');
    }
    if (suggestedCodes.some(c => c.code.startsWith('I'))) {
      questions.push('Any family history of cardiovascular disease?');
    }
  }
  
  return { text, questions };
};

/**
 * Analyze medical image with AI vision
 * Production-ready GPT-4 Vision integration
 */
export const analyzeImageWithAI = async (imageUrl: string): Promise<{
  description: string;
  suggestedCodes: SuggestedCode[];
}> => {
  const { valid } = validateAIConfig();
  if (!AI_CONFIG.USE_REAL_AI || !valid) {
    return simulateImageAnalysis('');
  }

  try {
    const response = await fetch(`${AI_CONFIG.OPENAI.API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.OPENAI.API_KEY}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.OPENAI.VISION_MODEL,
        messages: [{
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: AI_CONFIG.PROMPTS.IMAGE_ANALYSIS
            },
            { 
              type: 'image_url', 
              image_url: { url: imageUrl, detail: 'high' }
            }
          ]
        }],
        max_tokens: AI_CONFIG.OPENAI.MAX_TOKENS,
        temperature: AI_CONFIG.OPENAI.TEMPERATURE
      })
    });

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || 'Unable to analyze image';
    
    // Parse AI response for ICD-10 codes (simple regex extraction)
    const codePattern = /([A-TV-Z]\d{2}(?:\.\d{1,4})?)/g;
    const foundCodes = analysisText.match(codePattern) || [];
    
    const suggestedCodes: SuggestedCode[] = foundCodes.slice(0, 3).map((code, index) => ({
      id: `ai_img_${index}`,
      code,
      short_title: `AI suggested: ${code}`,
      confidence: 'medium' as const
    }));

    return {
      description: `**AI Vision Analysis:**\n\n${analysisText}`,
      suggestedCodes
    };
  } catch (error) {
    console.error('AI Vision error:', error);
    return simulateImageAnalysis('');
  }
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
