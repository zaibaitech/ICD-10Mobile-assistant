# AI Assistant Setup Guide

## Overview
The ICD-10 Mobile Assistant now includes advanced AI capabilities powered by OpenAI's latest models:

- **GPT-4 Turbo**: Natural language processing for medical coding
- **GPT-4 Vision**: Medical image analysis and interpretation  
- **Whisper**: High-accuracy speech-to-text transcription

## Current Status: Enhanced Mock Mode ✅
The app currently runs in **Enhanced Mock Mode** with:
- ✅ Sophisticated keyword matching with medical intelligence
- ✅ Realistic clinical scenarios for testing
- ✅ Enhanced image analysis simulation
- ✅ Advanced voice transcription simulation
- ✅ Medical context awareness and reasoning

## Enabling Real AI (Optional) 🚀

### Prerequisites
1. OpenAI API account with billing enabled
2. API key with appropriate rate limits
3. Understanding of usage costs

### Cost Estimates (USD)
- **Text processing**: ~$0.09 per 1K tokens (mixed input/output)
- **Image analysis**: ~$0.03 per image
- **Voice transcription**: ~$0.006 per minute
- **Typical session**: $0.50-2.00 for comprehensive consultation

### Setup Steps

#### 1. Get OpenAI API Key
```bash
# Visit: https://platform.openai.com/api-keys
# Create new secret key
# Copy key (starts with 'sk-proj-' or 'sk-')
```

#### 2. Configure Environment
Create `.env` file in project root:
```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-your-actual-key-here
```

#### 3. Enable Real AI
Edit `src/config/ai.ts`:
```typescript
export const AI_CONFIG = {
  // Change this to true
  USE_REAL_AI: true,
  // ... rest of config
};
```

#### 4. Test Configuration
The app will automatically validate your setup and show status in the AI assistant.

### Rate Limits & Safety
- **Default limit**: 60 requests/minute
- **Recommended**: Set billing limits in OpenAI dashboard
- **Monitoring**: Check usage at platform.openai.com/usage

## Features Comparison

| Feature | Mock Mode | Real AI Mode |
|---------|-----------|--------------|
| Keyword Matching | ✅ Enhanced | ✅ + Context |
| Medical Reasoning | ✅ Rule-based | ✅ AI-powered |
| Image Analysis | ✅ Simulated | ✅ GPT-4 Vision |
| Voice Transcription | ✅ Scenarios | ✅ Whisper API |
| Clinical Context | ✅ Basic | ✅ Advanced |
| Cost | 🆓 Free | 💰 Pay-per-use |

## Troubleshooting

### Common Issues

**"API key not configured"**
- Check `.env` file exists and key is correct
- Key must start with `sk-`
- Restart app after adding key

**"Rate limit exceeded"**
- Wait 1 minute and try again
- Check OpenAI dashboard for limits
- Consider upgrading API plan

**"Insufficient credits"**
- Add billing method to OpenAI account
- Check account balance
- Set up usage alerts

**Image analysis not working**
- Ensure images are publicly accessible URLs
- Check image format (JPG, PNG, WebP)
- Verify GPT-4 Vision is enabled in your plan

### Support
- OpenAI API Status: https://status.openai.com/
- Billing & Usage: https://platform.openai.com/usage
- Rate Limits: https://platform.openai.com/account/rate-limits

## Development Notes

### Mock Mode Benefits
- **No API costs** during development
- **Consistent responses** for UI testing  
- **Offline functionality** for demos
- **Realistic scenarios** for user experience testing

### Production Recommendations
1. **Start with mock mode** for development
2. **Enable real AI** for beta testing
3. **Monitor costs** closely during rollout
4. **Set billing alerts** to prevent overages
5. **Implement caching** for repeated queries

### Security Considerations
- Never commit API keys to version control
- Use environment variables for all secrets
- Implement request rate limiting in production
- Consider proxy API for additional security

---

## Quick Start Commands

```bash
# Test current configuration
npm run test:ai-config

# Enable mock mode (default)
npm run ai:mock

# Enable real AI (requires setup)
npm run ai:enable

# Check costs for last 24h
npm run ai:costs
```

The AI assistant is ready to use! Start with mock mode to explore features, then enable real AI when you're ready for production-level accuracy.