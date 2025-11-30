# Mock Data Audit & Replacement Guide

**Date**: November 30, 2025  
**Purpose**: Identify all mock/placeholder features and provide step-by-step replacement instructions

---

## 🔍 Overview

Your app has **3 major features using mock data**:

1. **AI Assistant** (keyword-based, not real AI)
2. **OCR/Image Analysis** (returns sample text, no real OCR)
3. **Voice Transcription** (records but doesn't transcribe)

Everything else uses **real data** (Supabase, NIH API, etc.)

---

## 📊 Mock Features Breakdown

### ✅ Features Using REAL Data

| Feature | Data Source | Status |
|---------|-------------|--------|
| ICD-10 Search | NIH Clinical Tables API | ✅ Real |
| Authentication | Supabase Auth | ✅ Real |
| Favorites | Supabase Database | ✅ Real |
| Patient Management | Supabase Database | ✅ Real |
| Encounters | Supabase Database | ✅ Real |
| Disease Modules | Local JSON files (WHO data) | ✅ Real |
| Drug Interactions | Supabase Database | ✅ Real |
| Lab Results | Supabase Database | ✅ Real |
| Offline Sync | SQLite/IndexedDB | ✅ Real |

### ⚠️ Features Using MOCK Data

| Feature | Current Status | Impact | Cost to Fix |
|---------|---------------|--------|-------------|
| AI Assistant | Keyword matching only | Medium | $10-50/month |
| OCR Text Extraction | Sample text hardcoded | Low | $5-20/month |
| Voice Transcription | Records but doesn't transcribe | Low | $0.006/min |

---

## 🎯 Feature #1: AI Assistant (Mock)

### Current Implementation

**File**: `src/services/assistant.ts`  
**Status**: Uses keyword matching, not real AI

**How it works now**:
```typescript
// Hardcoded keyword map
const KEYWORD_CODE_MAP = {
  'diabetes': [{ code: 'E11.9', title: 'Type 2 diabetes', confidence: 'high' }],
  'hypertension': [{ code: 'I10', title: 'Essential hypertension', confidence: 'high' }],
  // ... only ~15 conditions
};

// Simple text search
function getEnhancedKeywordReply(input: string) {
  // Looks for keywords in user input
  // Returns hardcoded suggestions
  // No real NLP or medical reasoning
}
```

**Limitations**:
- Only recognizes ~15 predefined keywords
- No contextual understanding
- Can't analyze complex symptoms
- No differential diagnosis
- Can't learn from feedback

### How to Replace with Real AI

#### Option A: OpenAI GPT-4 (Recommended)

**Cost**: ~$10-50/month (depends on usage)  
**Setup Time**: 15 minutes

**Steps**:

1. **Get OpenAI API Key**
   ```bash
   # Sign up at https://platform.openai.com/
   # Create API key
   # Add to .env:
   EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-your-key-here
   ```

2. **Enable Real AI**
   ```typescript
   // File: src/config/ai.ts
   export const AI_CONFIG = {
     USE_REAL_AI: true,  // Change from false to true
     OPENAI: {
       API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
       CHAT_MODEL: 'gpt-4-1106-preview',
       TEMPERATURE: 0.2,
       MAX_TOKENS: 1000,
     }
   };
   ```

3. **Test**
   ```bash
   npm start
   # Go to Assistant screen
   # Try: "Patient with fever, cough, and chest pain for 3 days"
   # Should get intelligent ICD-10 suggestions with reasoning
   ```

**What changes**:
- ✅ Real natural language understanding
- ✅ Complex symptom analysis
- ✅ Differential diagnosis suggestions
- ✅ Clinical reasoning explanations
- ✅ Handles any medical condition

**Cost Estimate**:
- GPT-4 Turbo: $0.01 per 1K input tokens, $0.03 per 1K output tokens
- Average query: ~500 input + 800 output tokens = $0.03 per query
- 1,000 queries/month = $30/month

#### Option B: Anthropic Claude (Alternative)

**Cost**: Similar to OpenAI (~$10-40/month)

```bash
# Add to .env
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Code changes needed**:
```typescript
// File: src/services/assistant.ts
// Replace OpenAI API calls with Anthropic API
// See: https://docs.anthropic.com/claude/reference/messages_post
```

#### Option C: Free Alternatives (Limited)

1. **Groq (Free tier)**
   - Fast inference
   - Llama 3 models
   - Limited to 100 requests/day
   - See: https://groq.com/

2. **Hugging Face Inference API**
   - Free tier available
   - Medical models like BioBERT
   - Requires more setup

---

## 🎯 Feature #2: OCR/Image Analysis (Mock)

### Current Implementation

**File**: `src/services/ocr.ts`  
**Status**: Returns hardcoded sample text

**How it works now**:
```typescript
export async function performOCR(imageUri: string): Promise<OCRResult> {
  // Does nothing with the actual image
  // Returns this same text every time:
  const mockText = `
    MEDICAL RECORD
    Diagnosis:
    - Essential hypertension (I10)
    - Type 2 diabetes mellitus (E11.9)
    ...
  `;
  
  return { text: mockText, confidence: 0 };
}
```

**Limitations**:
- Ignores the actual image
- Always returns same text
- No real text extraction

### How to Replace with Real OCR

#### Option A: Google Cloud Vision API (Best Quality)

**Cost**: $1.50 per 1,000 images  
**Setup Time**: 20 minutes

**Steps**:

1. **Setup Google Cloud**
   ```bash
   # Go to: https://console.cloud.google.com/
   # Enable Vision API
   # Create service account and download JSON key
   ```

2. **Install SDK**
   ```bash
   npm install @google-cloud/vision
   ```

3. **Replace OCR function**
   ```typescript
   // File: src/services/ocr.ts
   import vision from '@google-cloud/vision';
   
   export async function performOCR(imageUri: string): Promise<OCRResult> {
     const client = new vision.ImageAnnotatorClient({
       keyFilename: './google-credentials.json'
     });
     
     const [result] = await client.textDetection(imageUri);
     const detections = result.textAnnotations;
     
     return {
       text: detections[0]?.description || '',
       confidence: detections[0]?.confidence || 0,
       words: detections.slice(1).map(d => ({
         text: d.description,
         confidence: d.confidence,
         bbox: d.boundingPoly.vertices
       }))
     };
   }
   ```

#### Option B: AWS Textract (Medical Document Focus)

**Cost**: $1.50 per 1,000 pages  
**Best for**: Medical forms, prescriptions, lab results

```bash
npm install @aws-sdk/client-textract
```

#### Option C: Tesseract.js (Free, Client-Side)

**Cost**: $0 (already installed in your app!)  
**Quality**: Lower accuracy than cloud APIs

**Steps**:

1. **Already installed** (see package.json: `tesseract.js`)

2. **Update OCR function**
   ```typescript
   // File: src/services/ocr.ts
   import Tesseract from 'tesseract.js';
   
   export async function performOCR(
     imageUri: string,
     onProgress?: (progress: number) => void
   ): Promise<OCRResult> {
     const { data } = await Tesseract.recognize(
       imageUri,
       'eng',
       {
         logger: m => {
           if (m.status === 'recognizing text' && onProgress) {
             onProgress(m.progress);
           }
         }
       }
     );
     
     return {
       text: data.text,
       confidence: data.confidence,
       words: data.words.map(w => ({
         text: w.text,
         confidence: w.confidence,
         bbox: w.bbox
       }))
     };
   }
   ```

3. **Test**
   ```bash
   npm start
   # Go to Document Scanner
   # Take photo of medical document
   # Should extract real text (not mock)
   ```

**Pros**:
- Free
- Works offline
- Already installed

**Cons**:
- Lower accuracy (~70-80% vs 95%+ for Google/AWS)
- Slower processing
- Larger bundle size

---

## 🎯 Feature #3: Voice Transcription (Mock)

### Current Implementation

**File**: `src/screens/AssistantScreen.tsx` (line 161)  
**Status**: Records audio but doesn't transcribe

**How it works now**:
```typescript
const transcribeAudio = async (audioUri: string): Promise<string> => {
  // Placeholder - just returns mock text
  return "⚠️ MOCK TRANSCRIPTION: Patient presents with...";
};
```

### How to Replace with Real Transcription

#### Option A: OpenAI Whisper API (Recommended)

**Cost**: $0.006 per minute (~$0.36 per hour)  
**Accuracy**: 95%+ (state of the art)

**Steps**:

1. **Same API key as AI Assistant** (already have if using OpenAI)

2. **Replace transcription function**
   ```typescript
   // File: src/screens/AssistantScreen.tsx
   
   const transcribeAudio = async (audioUri: string): Promise<string> => {
     const formData = new FormData();
     formData.append('file', {
       uri: audioUri,
       type: 'audio/m4a',
       name: 'recording.m4a'
     });
     formData.append('model', 'whisper-1');
     
     const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`
       },
       body: formData
     });
     
     const data = await response.json();
     return data.text;
   };
   ```

3. **Test**
   ```bash
   npm start
   # Go to Assistant screen
   # Tap microphone button
   # Speak: "Patient has fever and cough"
   # Should transcribe accurately
   ```

#### Option B: Google Speech-to-Text

**Cost**: $0.006 per 15 seconds  
**Supports**: Medical vocabulary

#### Option C: AssemblyAI (Free tier available)

**Cost**: Free tier: 100 minutes/month  
**Website**: https://www.assemblyai.com/

---

## 💰 Cost Summary

### Current (All Mock): **$0/month**

### With Real AI/OCR/Voice:

| Setup | Monthly Cost | Features |
|-------|-------------|----------|
| **Minimal** | $0 | Keep mock AI, use Tesseract OCR (free), no voice |
| **Basic** | $15-20 | Real AI (OpenAI), Tesseract OCR, Whisper voice |
| **Standard** | $30-50 | Real AI, Google Vision OCR, Whisper voice |
| **Premium** | $100+ | GPT-4, AWS Textract, advanced features |

### Recommended for Production:

**$30/month package**:
- ✅ OpenAI GPT-4 Turbo for AI assistant
- ✅ Tesseract.js for OCR (free, already installed)
- ✅ OpenAI Whisper for voice transcription

**Gives you**:
- Real medical reasoning
- Accurate text extraction
- Professional voice transcription
- ~1,000 AI queries + unlimited OCR + 80 hours of voice

---

## 🚀 Quick Start: Enable All Real Features (30 min)

### Step 1: Get API Keys (10 min)

```bash
# OpenAI (for AI + Voice)
# 1. Go to https://platform.openai.com/api-keys
# 2. Create new secret key
# 3. Copy and save securely
```

### Step 2: Update Environment (2 min)

```bash
# Add to .env file:
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-your-key-here
```

### Step 3: Enable Real AI (1 min)

```typescript
// File: src/config/ai.ts
export const AI_CONFIG = {
  USE_REAL_AI: true,  // ← Change this
  // ... rest stays same
};
```

### Step 4: Update OCR to Tesseract (10 min)

```typescript
// File: src/services/ocr.ts
// Replace entire file with Tesseract implementation (see Option C above)
```

### Step 5: Update Voice Transcription (5 min)

```typescript
// File: src/screens/AssistantScreen.tsx
// Replace transcribeAudio function (see Whisper implementation above)
```

### Step 6: Test Everything (5 min)

```bash
npm start

# Test AI: "Patient with diabetes and high blood pressure"
# Test OCR: Take photo of medical document
# Test Voice: Record "Patient presents with chest pain"
```

---

## 📋 Verification Checklist

- [ ] OpenAI API key obtained and added to `.env`
- [ ] `USE_REAL_AI` set to `true` in `src/config/ai.ts`
- [ ] AI Assistant responds with intelligent analysis (not keywords)
- [ ] OCR extracts real text from images (not mock sample)
- [ ] Voice transcription converts speech to text accurately
- [ ] No "⚠️ MOCK" warnings in app
- [ ] Billing alerts set up in OpenAI dashboard
- [ ] Error handling added for API failures
- [ ] Offline fallback implemented (keyword matching)

---

## 🔧 Code Files to Modify

### 1. Enable Real AI
```
src/config/ai.ts (line 21)
  USE_REAL_AI: false → true
```

### 2. Replace OCR
```
src/services/ocr.ts (lines 47-101)
  Replace performOCR() function with Tesseract/Google Vision/AWS
```

### 3. Replace Voice Transcription
```
src/screens/AssistantScreen.tsx (lines 161-165)
  Replace transcribeAudio() with Whisper API call
```

---

## 🆘 Troubleshooting

### "Invalid API key"
- Check `.env` file has correct key
- Restart Expo: `npm start --clear`
- Verify key is active in OpenAI dashboard

### "Rate limit exceeded"
- Add billing method to OpenAI account
- Set usage limits in dashboard
- Implement request throttling

### "OCR not working offline"
- Tesseract works offline ✅
- Google/AWS require internet connection
- Add offline fallback to mock data

### "High costs"
- Set hard billing limits in OpenAI dashboard ($20-50/month)
- Add request caching (same input = cached response)
- Implement usage quotas per user

---

## 💡 Best Practices

### 1. Gradual Rollout
- Start with AI assistant only
- Add OCR when needed
- Add voice last (least critical)

### 2. Cost Control
```typescript
// Add usage tracking
let requestCount = 0;
const MAX_REQUESTS_PER_DAY = 100;

if (requestCount >= MAX_REQUESTS_PER_DAY) {
  return getEnhancedKeywordReply(input); // Fallback to free
}
```

### 3. Error Handling
```typescript
try {
  const result = await getAIAssistantReply(input);
  return result;
} catch (error) {
  console.error('AI failed, using fallback:', error);
  return getEnhancedKeywordReply(input); // Always have fallback
}
```

### 4. Caching
```typescript
// Cache common queries to reduce API calls
const cache = new Map();
const cacheKey = input.toLowerCase().trim();

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

---

## 📈 Expected Impact

### Before (Mock Data):
- ❌ AI only recognizes 15 keywords
- ❌ OCR shows same sample text
- ❌ Voice doesn't transcribe

### After (Real Data):
- ✅ AI handles any medical condition
- ✅ OCR extracts actual text from images
- ✅ Voice converts speech accurately
- ✅ Professional-grade features
- ✅ Ready for production use

---

## 🎯 Recommended Action Plan

### Phase 1 (Week 1): AI Assistant
1. Get OpenAI API key
2. Enable real AI
3. Test with 100 queries
4. Monitor costs

### Phase 2 (Week 2): OCR
1. Implement Tesseract.js (free)
2. Test with medical documents
3. Evaluate if Google Vision needed

### Phase 3 (Week 3): Voice
1. Add Whisper transcription
2. Test accuracy with medical terms
3. Optimize for cost

### Total Time: 3 weeks  
### Total Cost: ~$30/month  
### Impact: Production-ready features ✅

---

**Questions?** Check:
- `AI_SETUP_GUIDE.md` - Detailed AI configuration
- `src/config/ai.ts` - Configuration file with comments
- OpenAI docs: https://platform.openai.com/docs

---

**Status**: Ready to Implement  
**Difficulty**: Medium  
**Time**: 30 minutes - 3 weeks (phased)  
**Cost**: $0-30/month  

**Last Updated**: November 30, 2025
