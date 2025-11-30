/**
 * Test script for Groq AI integration
 * 
 * Run with: node test-groq-ai.js
 * 
 * Prerequisites:
 * 1. Add EXPO_PUBLIC_GROQ_API_KEY to .env file
 * 2. Set USE_REAL_AI to true in src/config/ai.ts
 */

require('dotenv').config();

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1';
const MODEL = 'llama-3.3-70b-versatile'; // Updated to current version

async function testGroqAI() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  🧪 Testing Groq AI Integration');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check API key
  if (!GROQ_API_KEY) {
    console.log('❌ ERROR: EXPO_PUBLIC_GROQ_API_KEY not found in .env file\n');
    console.log('📝 To fix:');
    console.log('1. Go to https://console.groq.com/');
    console.log('2. Sign up and get your API key');
    console.log('3. Add to .env file: EXPO_PUBLIC_GROQ_API_KEY=gsk_...\n');
    process.exit(1);
  }

  if (!GROQ_API_KEY.startsWith('gsk_')) {
    console.log('⚠️  WARNING: API key should start with "gsk_"\n');
    console.log('Your key:', GROQ_API_KEY.substring(0, 10) + '...\n');
  }

  console.log('✅ API Key found:', GROQ_API_KEY.substring(0, 10) + '...\n');
  
  // Test medical query
  const testQuery = 'Patient presents with high blood pressure and headaches. What ICD-10 codes should I consider?';
  
  console.log('📤 Sending test query:');
  console.log(`"${testQuery}"\n`);

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert medical coding assistant specializing in ICD-10-CM codes. Provide specific code suggestions with confidence levels.'
          },
          {
            role: 'user',
            content: testQuery
          }
        ],
        max_tokens: 1000,
        temperature: 0.2
      })
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ API Error:', response.status, response.statusText);
      console.log('Error details:', JSON.stringify(errorData, null, 2));
      process.exit(1);
    }

    const data = await response.json();
    
    console.log('✅ Response received!\n');
    console.log('⏱️  Response time:', responseTime, 'ms\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  📋 AI Response:');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const aiResponse = data.choices[0].message.content;
    console.log(aiResponse);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  📊 Usage Statistics:');
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (data.usage) {
      console.log('Tokens used:');
      console.log('  • Prompt tokens:', data.usage.prompt_tokens);
      console.log('  • Completion tokens:', data.usage.completion_tokens);
      console.log('  • Total tokens:', data.usage.total_tokens);
      console.log('  • Model:', data.model);
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ✅ TEST SUCCESSFUL!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('🎉 Groq AI is working correctly!\n');
    console.log('Next steps:');
    console.log('1. Open src/config/ai.ts');
    console.log('2. Set USE_REAL_AI: true');
    console.log('3. Restart your app: npm start');
    console.log('4. Test in the Assistant screen\n');
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('\n📝 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify API key is correct');
    console.log('3. Check Groq status: https://status.groq.com/');
    console.log('\n');
    process.exit(1);
  }
}

// Extract ICD-10 codes from response
function extractCodes(text) {
  const codePattern = /([A-Z]\d{2}(?:\.\d{1,2})?)/g;
  const codes = [...new Set(text.match(codePattern) || [])];
  return codes;
}

// Run the test
testGroqAI();
