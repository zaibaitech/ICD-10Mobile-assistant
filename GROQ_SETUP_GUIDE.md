# Groq AI Setup Guide 🚀

Complete guide to integrate **FREE** Groq AI into your ICD-10 Mobile Assistant.

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Your Free Groq API Key

1. Go to **https://console.groq.com/**
2. Click **"Sign Up"** (can use Google/GitHub account)
3. After login, go to **"API Keys"** in the left sidebar
4. Click **"Create API Key"**
5. Give it a name like "ICD10-Mobile"
6. **Copy the key** (starts with `gsk_`)

### Step 2: Add API Key to Your Project

Open `.env` file and add your Groq API key:

```bash
# Replace 'your-groq-api-key-here' with your actual key
EXPO_PUBLIC_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Enable Real AI

Open `src/config/ai.ts` and change:

```typescript
// Change this line:
USE_REAL_AI: false,

// To this:
USE_REAL_AI: true,
```

### Step 4: Restart the App

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

✅ **Done!** Your app now uses real AI!

---

## 🎯 What You Get

### FREE Forever
- ✅ **14,400 requests per day** (600/hour, 10/minute)
- ✅ **No credit card required**
- ✅ **No trial period** - truly free forever
- ✅ **Commercial use allowed**

### Powerful AI Model
- ✅ **Llama 3.1 70B** - Advanced medical reasoning
- ✅ **10x faster** than OpenAI GPT-4
- ✅ **Better medical understanding** than GPT-3.5
- ✅ **Lower latency** - faster responses

### Features
- ✅ Natural language ICD-10 code suggestions
- ✅ Clinical reasoning explanations
- ✅ Context-aware recommendations
- ✅ Multi-turn conversations
- ✅ Confidence scoring

---

## 🧪 Test It Out

### Test 1: Simple Query

1. Open the app
2. Go to **Assistant** tab
3. Type: `"Patient has high blood pressure"`
4. Send message

**Expected Response:**
```
Clinical Reasoning: The patient presents with hypertension...

Suggested ICD-10 Codes:
• I10 - Essential (primary) hypertension [High confidence]

Clarifying Questions:
• Is this newly diagnosed or chronic hypertension?
• Any complications like heart disease or kidney disease?
```

### Test 2: Complex Scenario

Try: `"65-year-old diabetic patient with chest pain and shortness of breath"`

**Expected Response:**
- Multiple relevant ICD-10 codes
- Risk assessment
- Follow-up questions about symptoms

---

## 📊 Rate Limits

### Free Tier Limits
- **14,400 requests/day** = 600/hour = 10/minute
- **8,000 tokens per request** (context + response)
- **No monthly spending limit**

### Is This Enough?

**YES!** For most medical practices:
- Average clinic: 30-50 patients/day
- 2-3 AI queries per patient
- **Total: 60-150 requests/day** (well within 14,400 limit!)

### If You Hit Limits

The app automatically falls back to smart keyword matching (the current mock system).

---

## 🔧 Configuration Options

### Use Faster Model for Quick Responses

In `src/config/ai.ts`:

```typescript
GROQ: {
  // Change this for faster responses (less detailed)
  CHAT_MODEL: 'llama-3.1-8b-instant',  // Faster, less detailed
  
  // Or keep for best medical reasoning
  CHAT_MODEL: 'llama-3.1-70b-versatile',  // Slower, more detailed
}
```

### Adjust Response Temperature

```typescript
GROQ: {
  // Lower = more consistent/factual (recommended for medical)
  TEMPERATURE: 0.2,
  
  // Higher = more creative (not recommended for medical coding)
  // TEMPERATURE: 0.8,
}
```

### Adjust Response Length

```typescript
GROQ: {
  // Shorter responses (faster, cheaper)
  MAX_TOKENS: 500,
  
  // Longer responses (more detailed)
  MAX_TOKENS: 1500,
}
```

---

## 🐛 Troubleshooting

### Error: "Groq API key not configured"

**Solution:**
1. Check `.env` file has the key
2. Make sure key starts with `gsk_`
3. Restart the Expo server (Ctrl+C, then `npm start`)

### Error: "Rate limit exceeded"

**Solution:**
1. You've hit 14,400 requests/day (unlikely!)
2. App will automatically use fallback keyword matching
3. Wait until next day for limit reset
4. Or upgrade to Groq Pro (paid) for higher limits

### No Response from AI

**Solution:**
1. Check internet connection
2. Verify `USE_REAL_AI: true` in `src/config/ai.ts`
3. Check console for error messages
4. Verify API key is correct

### Slow Responses

**Solution:**
1. Switch to faster model: `llama-3.1-8b-instant`
2. Reduce `MAX_TOKENS` to 500
3. Check your internet speed

---

## 🆚 Groq vs OpenAI Comparison

| Feature | Groq (FREE) | OpenAI (PAID) |
|---------|-------------|---------------|
| **Cost** | $0/month | $20-50/month |
| **Model** | Llama 3.1 70B | GPT-4 Turbo |
| **Speed** | 10x faster | Slower |
| **Rate Limit** | 14,400/day | Pay per use |
| **Quality** | Excellent | Excellent |
| **Medical Reasoning** | Very good | Excellent |
| **Image Analysis** | ❌ Not yet | ✅ Yes |
| **Setup** | 5 minutes | 10 minutes |
| **Credit Card** | ❌ Not required | ✅ Required |

**Recommendation:** Start with Groq (free), upgrade to OpenAI only if you need image analysis.

---

## 📈 Next Steps

### After Groq is Working

1. ✅ Test with real patient scenarios
2. ✅ Monitor usage in Groq dashboard
3. ✅ Set up AssemblyAI for voice (FREE_AI_VOICE_APIS.md)
4. ✅ Deploy to production

### Optional: Add Image Analysis

If you need image analysis, you can:
1. Keep Groq for chat (free)
2. Add OpenAI just for images (small cost)
3. Update config to use both providers

---

## 🎉 Success!

You now have:
- ✅ Professional AI assistant
- ✅ Real medical reasoning
- ✅ Zero monthly costs
- ✅ 14,400 free requests/day

**Your app is now production-ready with real AI!** 🚀

---

## 💡 Pro Tips

### Optimize for Medical Use

1. **Use specific prompts:** "Patient presents with..." works better than "Someone has..."
2. **Include context:** Mention age, existing conditions, medications
3. **Ask follow-ups:** The AI learns from conversation context

### Monitor Usage

Visit https://console.groq.com/usage to see:
- Requests per day
- Token usage
- Error rates
- Response times

### Save Costs (Even Though It's Free!)

- Cache common responses
- Use keyword matching for simple queries
- Only call AI for complex scenarios

---

## 📚 Additional Resources

- **Groq Documentation:** https://console.groq.com/docs
- **Llama 3.1 Info:** https://ai.meta.com/llama/
- **Rate Limits:** https://console.groq.com/docs/rate-limits
- **API Status:** https://status.groq.com/

---

**Questions?** Check `FREE_AI_VOICE_APIS.md` for more details!

**Last Updated:** November 30, 2024
