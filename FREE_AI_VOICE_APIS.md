# Free AI & Voice API Alternatives

**Date**: November 30, 2025  
**Goal**: Replace mock AI Assistant and Voice Transcription with FREE APIs

---

## 🎯 Free AI APIs for Medical Assistant

### Option 1: Groq (BEST - Fast & Free) ⭐

**Models**: Llama 3, Mixtral, Gemma  
**Cost**: FREE (generous rate limits)  
**Speed**: 10x faster than OpenAI  
**Medical capability**: Good with Llama 3 70B

**Limits**:
- 14,400 requests/day (free tier)
- ~600 requests/hour
- Perfect for your use case!

**Setup** (10 minutes):

1. **Get API Key**
   ```bash
   # Sign up: https://console.groq.com/
   # Get API key (instant, no credit card)
   ```

2. **Add to .env**
   ```bash
   EXPO_PUBLIC_GROQ_API_KEY=gsk_your_key_here
   ```

3. **Update AI config** (`src/config/ai.ts`):
   ```typescript
   export const AI_CONFIG = {
     USE_REAL_AI: true,
     
     // Add Groq configuration
     GROQ: {
       API_URL: 'https://api.groq.com/openai/v1',
       API_KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
       CHAT_MODEL: 'llama3-70b-8192',  // Best for medical
       TEMPERATURE: 0.2,
       MAX_TOKENS: 1000,
     },
   };
   ```

4. **Update assistant service** (`src/services/assistant.ts`):
   ```typescript
   const getAIAssistantReply = async (
     input: string,
     context: AssistantContext
   ): Promise<AssistantResponse> => {
     const messages: any[] = [
       {
         role: 'system',
         content: AI_CONFIG.PROMPTS.SYSTEM
       },
       {
         role: 'user',
         content: input
       }
     ];

     // Use Groq API (OpenAI-compatible)
     const response = await fetch(`${AI_CONFIG.GROQ.API_URL}/chat/completions`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${AI_CONFIG.GROQ.API_KEY}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         model: AI_CONFIG.GROQ.CHAT_MODEL,
         messages,
         temperature: AI_CONFIG.GROQ.TEMPERATURE,
         max_tokens: AI_CONFIG.GROQ.MAX_TOKENS,
       }),
     });

     const data = await response.json();
     const aiText = data.choices[0].message.content;
     
     // Parse AI response for ICD-10 codes
     // ... rest of implementation
   };
   ```

**Pros**:
- ✅ Completely free
- ✅ Very fast inference
- ✅ OpenAI-compatible API
- ✅ No credit card required
- ✅ 14,400 requests/day
- ✅ Good medical reasoning (Llama 3 70B)

**Cons**:
- ⚠️ Rate limited (but generous)
- ⚠️ Slightly less accurate than GPT-4

---

### Option 2: Hugging Face Inference API (Free)

**Models**: Llama 3, Mistral, Zephyr  
**Cost**: FREE  
**Limits**: Rate limited per model

**Setup**:
```bash
# Sign up: https://huggingface.co/
# Get token: https://huggingface.co/settings/tokens
EXPO_PUBLIC_HF_TOKEN=hf_your_token_here
```

**API Call**:
```typescript
const response = await fetch(
  'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-70B-Instruct',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: `You are a medical coding assistant. ${input}`,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.2,
      },
    }),
  }
);
```

**Pros**:
- ✅ Completely free
- ✅ Many models available
- ✅ No credit card

**Cons**:
- ⚠️ Slower than Groq
- ⚠️ Cold start delays
- ⚠️ More complex API

---

### Option 3: Google AI Studio (Gemini - Free) ⭐

**Model**: Gemini 1.5 Flash  
**Cost**: FREE  
**Limits**: 15 requests/minute, 1500/day

**Setup**:
```bash
# Get key: https://aistudio.google.com/app/apikey
EXPO_PUBLIC_GOOGLE_AI_KEY=your_key_here
```

**API Call**:
```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: input }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
      }
    }),
  }
);
```

**Pros**:
- ✅ Free (generous limits)
- ✅ Very capable model
- ✅ Good medical knowledge
- ✅ Fast

**Cons**:
- ⚠️ Different API format
- ⚠️ Rate limited

---

## 🎤 Free Voice Transcription APIs

### Option 1: AssemblyAI (BEST) ⭐

**Cost**: FREE tier (100 hours/month!)  
**Accuracy**: ~95% (state of the art)  
**Medical**: Supports medical vocabulary

**Setup** (15 minutes):

1. **Get API Key**
   ```bash
   # Sign up: https://www.assemblyai.com/
   # Free tier: 100 hours/month (no credit card!)
   ```

2. **Add to .env**
   ```bash
   EXPO_PUBLIC_ASSEMBLYAI_KEY=your_key_here
   ```

3. **Update transcription** (`src/screens/AssistantScreen.tsx`):
   ```typescript
   const transcribeAudio = async (audioUri: string): Promise<string> => {
     try {
       // Step 1: Upload audio file
       const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
         method: 'POST',
         headers: {
           'authorization': process.env.EXPO_PUBLIC_ASSEMBLYAI_KEY!,
         },
         body: audioBlob, // Your audio file
       });
       
       const { upload_url } = await uploadResponse.json();

       // Step 2: Request transcription
       const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
         method: 'POST',
         headers: {
           'authorization': process.env.EXPO_PUBLIC_ASSEMBLYAI_KEY!,
           'content-type': 'application/json',
         },
         body: JSON.stringify({
           audio_url: upload_url,
           language_code: 'en',
         }),
       });

       const { id } = await transcriptResponse.json();

       // Step 3: Poll for results
       let transcript;
       while (true) {
         const pollingResponse = await fetch(
           `https://api.assemblyai.com/v2/transcript/${id}`,
           {
             headers: {
               'authorization': process.env.EXPO_PUBLIC_ASSEMBLYAI_KEY!,
             },
           }
         );

         transcript = await pollingResponse.json();

         if (transcript.status === 'completed') {
           return transcript.text;
         } else if (transcript.status === 'error') {
           throw new Error('Transcription failed');
         }

         await new Promise(resolve => setTimeout(resolve, 1000));
       }
     } catch (error) {
       console.error('AssemblyAI error:', error);
       throw error;
     }
   };
   ```

**Pros**:
- ✅ 100 hours/month FREE
- ✅ High accuracy (~95%)
- ✅ Medical vocabulary support
- ✅ No credit card for free tier
- ✅ Speaker diarization available
- ✅ Punctuation & capitalization

**Cons**:
- ⚠️ Requires file upload (not streaming)
- ⚠️ Processing takes a few seconds

---

### Option 2: Deepgram (Free Tier)

**Cost**: FREE ($200 credit)  
**Accuracy**: ~90%+  
**Speed**: Very fast

**Setup**:
```bash
# Sign up: https://console.deepgram.com/signup
# $200 free credit (no card required)
EXPO_PUBLIC_DEEPGRAM_KEY=your_key_here
```

**API Call**:
```typescript
const response = await fetch(
  'https://api.deepgram.com/v1/listen',
  {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.EXPO_PUBLIC_DEEPGRAM_KEY}`,
      'Content-Type': 'audio/wav',
    },
    body: audioFile,
  }
);

const { results } = await response.json();
const transcript = results.channels[0].alternatives[0].transcript;
```

**Pros**:
- ✅ $200 free credit
- ✅ Very fast
- ✅ Good accuracy
- ✅ Streaming available

**Cons**:
- ⚠️ Credit eventually runs out
- ⚠️ Requires credit card after free trial

---

### Option 3: Vosk (Fully Offline & Free!)

**Cost**: FREE forever  
**Accuracy**: ~75-85%  
**Special**: Works completely offline!

**Setup**:
```bash
npm install react-native-vosk
# Download language model (~50MB)
```

**Pros**:
- ✅ 100% free
- ✅ Works offline
- ✅ No API calls
- ✅ Privacy-focused
- ✅ No rate limits

**Cons**:
- ⚠️ Lower accuracy
- ⚠️ Larger app size
- ⚠️ Native module complexity

---

## 💰 Cost Comparison

| Feature | Free Option | Monthly Cost | Limits |
|---------|-------------|--------------|--------|
| **AI Assistant** | Groq (Llama 3) | $0 | 14,400 requests/day ✅ |
| **Voice** | AssemblyAI | $0 | 100 hours/month ✅ |
| **Total** | | **$0** | More than enough! |

vs OpenAI:
- GPT-4: $20-50/month
- Whisper: $10/month
- **Savings: $30-60/month** ✅

---

## 🚀 Recommended Setup (30 minutes)

### Complete Free Stack:

1. **AI**: Groq + Llama 3 70B
   - 14,400 requests/day
   - Fast inference
   - Good medical reasoning

2. **Voice**: AssemblyAI
   - 100 hours/month
   - High accuracy
   - Medical vocabulary

3. **OCR**: Tesseract.js (already done!)
   - Unlimited usage
   - Works offline

**Total Cost**: $0/month 🎉

---

## 📋 Implementation Checklist

### Phase 1: AI Assistant (15 min)
- [ ] Sign up for Groq: https://console.groq.com/
- [ ] Get API key (instant, no card)
- [ ] Add `EXPO_PUBLIC_GROQ_API_KEY` to `.env`
- [ ] Update `src/config/ai.ts` with Groq config
- [ ] Modify `src/services/assistant.ts` to use Groq API
- [ ] Test with medical queries

### Phase 2: Voice Transcription (15 min)
- [ ] Sign up for AssemblyAI: https://www.assemblyai.com/
- [ ] Get API key (100 hours free)
- [ ] Add `EXPO_PUBLIC_ASSEMBLYAI_KEY` to `.env`
- [ ] Update `src/screens/AssistantScreen.tsx` transcription
- [ ] Test voice recording → transcription

### Phase 3: Test Everything (10 min)
- [ ] Test AI: "Patient with fever, cough, chest pain"
- [ ] Test Voice: Record and transcribe
- [ ] Test OCR: Scan medical document
- [ ] Verify no mock responses
- [ ] Check console logs for API calls

---

## 🔧 Quick Code Template

### AI Config Update (`src/config/ai.ts`):

```typescript
export const AI_CONFIG = {
  USE_REAL_AI: true,
  
  // FREE Groq API
  GROQ: {
    API_URL: 'https://api.groq.com/openai/v1',
    API_KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
    CHAT_MODEL: 'llama3-70b-8192',
    TEMPERATURE: 0.2,
    MAX_TOKENS: 1000,
    RATE_LIMIT: 14400, // requests per day
  },
  
  // FREE AssemblyAI
  ASSEMBLYAI: {
    API_URL: 'https://api.assemblyai.com/v2',
    API_KEY: process.env.EXPO_PUBLIC_ASSEMBLYAI_KEY || '',
    LANGUAGE: 'en',
  },
};
```

### Environment Variables (`.env`):

```bash
# Existing
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key

# NEW - FREE APIs
EXPO_PUBLIC_GROQ_API_KEY=gsk_your_groq_key
EXPO_PUBLIC_ASSEMBLYAI_KEY=your_assemblyai_key
```

---

## 🎯 Expected Results

### Before (Mock):
- ❌ AI: Only 15 keywords recognized
- ❌ Voice: "⚠️ MOCK TRANSCRIPTION"
- ✅ OCR: Real (Tesseract)

### After (100% Free):
- ✅ AI: Full medical reasoning with Llama 3 70B
- ✅ Voice: Accurate transcription (95%)
- ✅ OCR: Real (Tesseract)

### App Status:
- **Real Data**: 12/12 (100%) ✅
- **Mock Data**: 0/12 (0%) 🎉
- **Monthly Cost**: $0 💰

---

## 💡 Tips for Free APIs

### Rate Limit Management:

```typescript
// Simple rate limiter
let requestCount = 0;
let resetTime = Date.now() + 86400000; // 24 hours

async function rateLimitedRequest() {
  if (Date.now() > resetTime) {
    requestCount = 0;
    resetTime = Date.now() + 86400000;
  }
  
  if (requestCount >= 14400) {
    throw new Error('Daily limit reached. Please try again tomorrow.');
  }
  
  requestCount++;
  // Make API call
}
```

### Error Handling:

```typescript
try {
  const result = await groqAPI(input);
  return result;
} catch (error) {
  console.error('Groq API error, falling back to keywords:', error);
  return getEnhancedKeywordReply(input); // Fallback to mock
}
```

---

## 🆘 Troubleshooting

### "Groq API quota exceeded"
- You've hit 14,400 requests/day
- Wait 24 hours for reset
- Or upgrade to paid plan (optional)

### "AssemblyAI credit depleted"
- You've used 100 hours
- Create new account (if allowed)
- Or upgrade to paid plan

### "API key invalid"
- Check `.env` file has correct key
- Restart Expo: `npm start --clear`
- Verify key is active in dashboard

---

## 📊 Feature Comparison

| Feature | OpenAI (Paid) | Groq (Free) | AssemblyAI (Free) |
|---------|---------------|-------------|-------------------|
| AI Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | N/A |
| Voice Quality | N/A | N/A | ⭐⭐⭐⭐⭐ |
| Speed | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Cost | $30/mo | $0 | $0 |
| Limits | Generous | 14K/day | 100 hr/mo |
| Medical | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Recommendation**: Use Groq + AssemblyAI for FREE production-ready app! 🚀

---

**Ready to implement?** See implementation guide in next section.

**Questions?** All these APIs have excellent documentation and community support.

---

**Last Updated**: November 30, 2025  
**Status**: Ready to Implement  
**Time to Complete**: 30-40 minutes  
**Cost**: $0 forever 🎉
