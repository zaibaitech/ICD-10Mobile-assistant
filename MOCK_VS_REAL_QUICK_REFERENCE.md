# Mock vs Real Data: Quick Reference

Visual guide to identify mock data in your app at a glance.

---

## 🟢 Real Data Features (9/12 = 75%)

These work with production data and are ready for live use:

```
✅ ICD-10 Search
   └─ NIH Clinical Tables API (71,703 codes)
   └─ No mock data, all real

✅ Authentication & User Management  
   └─ Supabase Auth
   └─ Real user accounts, sessions, RLS

✅ Favorites System
   └─ Supabase Database
   └─ Real user preferences stored

✅ Patient Management
   └─ Supabase Database  
   └─ Real patient records (CRUD operations)

✅ Encounters/Visits
   └─ Supabase Database
   └─ Real clinical encounters stored

✅ Disease Modules
   └─ Local JSON (WHO/CDC protocols)
   └─ Real medical guidelines (Malaria, TB, Dengue)

✅ Drug Interaction Checker
   └─ Supabase Database
   └─ Real drug-drug interactions (14 meds, 10 interactions)

✅ Lab Results Interpreter
   └─ Supabase Database
   └─ Real reference ranges (16 lab tests)

✅ Offline Mode & Sync
   └─ SQLite (native) / IndexedDB (web)
   └─ Real local storage and background sync

✅ OCR Text Extraction
   └─ Tesseract.js
   └─ Real text extraction from images (FREE!)
   └─ 70-85% accuracy, works offline
```

---

## 🟡 Mock Data Features (2/12 = 17%)

These need API keys and will cost $30/month to make real:

```
⚠️  AI Assistant
    File: src/services/assistant.ts
    Status: Keyword matching only
    
    Current: Recognizes ~15 hardcoded keywords
             "diabetes" → suggests E11.9
             "hypertension" → suggests I10
             
    To Fix:  1. Get OpenAI API key
             2. Set USE_REAL_AI = true
             3. Cost: ~$20/month
             
    Impact:  Can analyze ANY medical condition
             Provides clinical reasoning
             Differential diagnosis


⚠️  Voice Transcription  
    File: src/screens/AssistantScreen.tsx (line 161)
    Status: Records audio but doesn't transcribe
    
    Current: Returns: "⚠️ MOCK TRANSCRIPTION: Patient presents with..."
             
    To Fix:  1. Use OpenAI Whisper API
             2. Cost: $0.006/minute (~$0.36/hour)
             
    Impact:  Convert speech to text accurately
```

---

## 📊 Visual Comparison

### Current App Flow

```
User Input → AI Assistant → Keyword Match → Limited Results
                            └─ Only ~15 conditions recognized
                            
User Photo → OCR → Mock Text → Always same sample
                   └─ Ignores actual image
                   
User Voice → Record → Mock Text → "⚠️ MOCK TRANSCRIPTION"
                      └─ Doesn't actually transcribe
```

### With Real Data

```
User Input → AI Assistant → GPT-4 → Intelligent Analysis
                            └─ Any medical condition
                            └─ Clinical reasoning
                            
User Photo → OCR → Tesseract/Google → Real Extracted Text
                   └─ Actual text from image
                   
User Voice → Record → Whisper API → Real Transcription
                      └─ Accurate speech-to-text
```

---

## 🎯 How to Identify Mock Data While Using App

### 1. AI Assistant Screen

**Mock Mode (Current)**:
- Only responds to specific keywords
- Generic suggestions
- Limited to ~15 conditions
- No clinical reasoning

**Real Mode**:
- Responds to complex descriptions
- Detailed analysis with reasoning
- Handles any medical condition
- Provides differential diagnosis

**Test**: Type "Patient with progressive dyspnea, orthopnea, and bilateral leg edema"
- Mock: Might miss it or give generic response
- Real: Suggests heart failure (I50.x) with clinical reasoning

### 2. Document Scanner Screen

**Mock Mode (Current)**:
- Shows same text regardless of photo
- Look for: "MEDICAL RECORD" header
- Always shows: I10, E11.9, N18.3

**Real Mode**:
- Different text for each photo
- Extracts actual visible text
- Confidence scores vary

**Test**: Take photo of any text
- Mock: Returns hardcoded sample
- Real: Returns actual text from photo

### 3. Voice Input

**Mock Mode (Current)**:
- Returns text starting with "⚠️ MOCK TRANSCRIPTION:"
- Same regardless of what you say

**Real Mode**:
- Returns actual spoken words
- Accurate medical terminology
- No "MOCK" prefix

**Test**: Record "The patient has diabetes"
- Mock: "⚠️ MOCK TRANSCRIPTION: Patient presents with..."
- Real: "The patient has diabetes"

---

## 💰 Cost to Remove All Mock Data

| Component | Solution | Monthly Cost |
|-----------|----------|--------------|
| AI Assistant | OpenAI GPT-4 | $20 |
| OCR | ✅ Tesseract.js | ✅ $0 (DONE!) |
| Voice | OpenAI Whisper | $10 |
| **Total** | | **$30/month** |

For ~1,000 queries/month + unlimited OCR ✅ + 80 hours voice

---

## 🚀 Quick Fix (15 minutes)

**Enable Real AI Only** (keep OCR and Voice as mock for now):

```bash
# 1. Get OpenAI API key
# Go to: https://platform.openai.com/api-keys

# 2. Add to .env
echo "EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-your-key" >> .env

# 3. Enable real AI
# Edit: src/config/ai.ts
# Change: USE_REAL_AI: false → true

# 4. Restart app
npm start
```

**Result**: AI Assistant now uses GPT-4 ✅  
**Cost**: ~$20/month  
**Time**: 75% → 83% real data

---

## 📋 Code Files with Mock Data

```
src/services/assistant.ts
  └─ Line 6-80: KEYWORD_CODE_MAP (hardcoded)
  └─ Line 210-280: getEnhancedKeywordReply() (mock AI)

src/services/ocr.ts  
  └─ Line 68-101: performOCR() (returns mock text)

src/screens/AssistantScreen.tsx
  └─ Line 161-165: transcribeAudio() (mock transcription)

src/services/clinicalReasoner.ts
  └─ Line 5: TODO comment about mock implementation
```

---

## ✅ Verification Commands

```bash
# Check if using real AI
grep "USE_REAL_AI: true" src/config/ai.ts

# Check if API key is set
grep "EXPO_PUBLIC_OPENAI_API_KEY" .env

# Check translation coverage
npm run i18n:check

# View mock data locations
grep -r "mock\|Mock\|MOCK" src/services/
```

---

## 🎯 Recommended Upgrade Path

**Week 1**: AI Assistant
- Get OpenAI key
- Enable real AI
- Test with 100 queries
- Monitor costs: Should be <$5

**Week 2**: Keep Mock OCR
- Tesseract.js is free but slower
- Wait to see if users actually use OCR
- Only upgrade to Google Vision if high usage

**Week 3**: Keep Mock Voice
- Voice is least critical feature
- Only enable if users request it
- Whisper is cheap ($0.006/min) but adds complexity

**Result**: 
- 83% real data ✅ (OCR + AI + all existing features)
- Cost: $20/month
- Production-ready for most use cases

---

**See Full Guide**: `MOCK_DATA_REPLACEMENT_GUIDE.md`

**Last Updated**: November 30, 2025
