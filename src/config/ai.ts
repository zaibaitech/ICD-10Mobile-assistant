/**
 * AI Configuration for ICD-10 Mobile Assistant
 * 
 * Setup Instructions (FREE with Groq):
 * 1. Sign up for Groq AI at https://console.groq.com/ (FREE - no credit card!)
 * 2. Create API key and set EXPO_PUBLIC_GROQ_API_KEY in your .env
 * 3. Set USE_REAL_AI to true to enable production AI features
 * 
 * Groq Benefits:
 * - FREE forever: 14,400 requests/day
 * - Llama 3 70B: Advanced medical reasoning
 * - 10x faster than OpenAI
 * - No credit card required
 * 
 * Example .env file:
 * EXPO_PUBLIC_GROQ_API_KEY=gsk_...your-key-here...
 */

export const AI_CONFIG = {
  // Main toggle - set to true when you have Groq API key configured
  USE_REAL_AI: true, // ✅ ENABLED - Using Groq AI!
  
  // AI Provider - 'groq' (free) or 'openai' (paid)
  PROVIDER: 'groq' as 'groq' | 'openai',
  
  // Groq Configuration (FREE - Recommended!)
  GROQ: {
    API_URL: 'https://api.groq.com/openai/v1',
    API_KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
    
    // Models (updated to current versions)
    CHAT_MODEL: 'llama-3.3-70b-versatile',       // Latest Llama 3.3 70B
    FAST_MODEL: 'llama-3.1-8b-instant',          // For quick responses
    
    // Parameters
    TEMPERATURE: 0.2,        // Lower = more consistent medical responses
    MAX_TOKENS: 1000,        // Reasonable limit for mobile
    
    // Rate limiting (FREE tier: 14,400 requests/day = 600/hour = 10/min)
    RATE_LIMIT: 10,
  },
  
  // OpenAI Configuration (Optional - Paid alternative)
  OPENAI: {
    API_URL: 'https://api.openai.com/v1',
    API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
    
    // Models
    CHAT_MODEL: 'gpt-4-1106-preview',        // Latest GPT-4 Turbo
    VISION_MODEL: 'gpt-4-vision-preview',    // GPT-4 with vision
    WHISPER_MODEL: 'whisper-1',              // Speech-to-text
    
    // Parameters
    TEMPERATURE: 0.2,        // Lower = more consistent medical responses
    MAX_TOKENS: 1000,        // Reasonable limit for mobile
    
    // Rate limiting (requests per minute)
    RATE_LIMIT: 60,
  },
  
  // Medical-specific prompts
  PROMPTS: {
    SYSTEM: `You are an expert medical coding assistant specializing in ICD-10-CM codes.
    
Your role:
- Analyze patient presentations and suggest appropriate ICD-10 codes
- Provide confidence levels (high/medium/low) and clinical reasoning
- Ask clarifying questions to improve accuracy
- Consider comorbidities and medical context

Important guidelines:
- This is for coding assistance only, not clinical diagnosis
- Always include confidence levels and reasoning
- Suggest the most specific appropriate codes
- Consider both primary and secondary diagnoses
- Ask follow-up questions for ambiguous presentations

Format your response with:
1. Clinical reasoning
2. Suggested ICD-10 codes with confidence levels
3. Clarifying questions for better accuracy`,

    IMAGE_ANALYSIS: `Analyze this medical image for ICD-10 coding purposes.

Focus on:
- Visible pathology or abnormalities
- Anatomical location and extent
- Severity and characteristics
- Relevant clinical findings

Provide:
1. Detailed description of findings
2. Suggested ICD-10 codes with confidence levels
3. Additional clinical information needed for accurate coding

Remember: This is for documentation and coding, not diagnosis.`,

    VOICE_CONTEXT: `The following text was transcribed from a voice recording. 
It may contain medical terminology and should be interpreted in clinical context.
Account for potential transcription errors in medical terms.`
  },
  
  // Feature flags
  FEATURES: {
    VISION_ANALYSIS: true,     // Enable image analysis
    VOICE_TRANSCRIPTION: true, // Enable voice-to-text
    CONTEXTUAL_LEARNING: true, // Use conversation history
    MEDICAL_REASONING: true,   // Include clinical reasoning
  },
  
  // Fallback configuration for mock mode
  MOCK: {
    PROCESSING_DELAY: 2000,    // Simulate API delay (ms)
    ENABLE_SCENARIOS: true,    // Use realistic medical scenarios
    LOG_INTERACTIONS: true,    // Log for development
  }
};

// Validation helper
export const validateAIConfig = (): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (AI_CONFIG.USE_REAL_AI) {
    if (AI_CONFIG.PROVIDER === 'groq') {
      if (!AI_CONFIG.GROQ.API_KEY) {
        issues.push('Groq API key not configured. Set EXPO_PUBLIC_GROQ_API_KEY in your environment.');
      }
      if (!AI_CONFIG.GROQ.API_KEY.startsWith('gsk_')) {
        issues.push('Groq API key format appears invalid. Should start with "gsk_".');
      }
    } else if (AI_CONFIG.PROVIDER === 'openai') {
      if (!AI_CONFIG.OPENAI.API_KEY) {
        issues.push('OpenAI API key not configured. Set EXPO_PUBLIC_OPENAI_API_KEY in your environment.');
      }
      if (!AI_CONFIG.OPENAI.API_KEY.startsWith('sk-')) {
        issues.push('OpenAI API key format appears invalid. Should start with "sk-".');
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};

// Cost estimation helper
export const estimateCost = (
  textTokens: number = 500, 
  images: number = 0, 
  audioMinutes: number = 0
): { total: number; breakdown: { text: number; images: number; audio: number } } => {
  const textCost = (textTokens / 1000) * 0.09; // Average input/output cost
  const imageCost = images * 0.03; // Average vision cost
  const audioCost = audioMinutes * 0.006; // Whisper cost
  
  return {
    total: textCost + imageCost + audioCost,
    breakdown: {
      text: textCost,
      images: imageCost,
      audio: audioCost
    }
  };
};