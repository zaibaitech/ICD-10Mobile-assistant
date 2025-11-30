#!/usr/bin/env node
/**
 * AI Assistant Test Script
 * Tests the enhanced AI assistant functionality
 */

const { AI_CONFIG, validateAIConfig } = require('./src/config/ai');
const { getAssistantReply } = require('./src/services/assistant');

async function testAIAssistant() {
  console.log('🧪 Testing AI Assistant Upgrades\n');
  
  // Test 1: Configuration validation
  console.log('1. Testing Configuration...');
  const { valid, issues } = validateAIConfig();
  console.log(`   ✅ Config valid: ${valid}`);
  if (issues.length > 0) {
    console.log(`   ⚠️  Issues: ${issues.join(', ')}`);
  }
  console.log(`   📊 Mode: ${AI_CONFIG.USE_REAL_AI ? 'Real AI' : 'Enhanced Mock'}\n`);
  
  // Test 2: Basic text input
  console.log('2. Testing Text Processing...');
  const testInput = "Patient has chest pain and shortness of breath";
  const context = {
    currentVisitCodes: [],
    recentMessages: []
  };
  
  try {
    const response = await getAssistantReply(testInput, context);
    console.log(`   ✅ Response generated: ${response.text.substring(0, 100)}...`);
    console.log(`   📋 Suggested codes: ${response.suggestedCodes.length}`);
    console.log(`   ❓ Questions: ${response.clarifyingQuestions?.length || 0}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
  
  // Test 3: Image context
  console.log('3. Testing Image Analysis...');
  const imageContext = {
    ...context,
    imageUrl: 'https://example.com/medical-image.jpg'
  };
  
  try {
    const imageResponse = await getAssistantReply("skin rash on arm", imageContext);
    console.log(`   ✅ Image analysis: ${imageResponse.text.substring(0, 100)}...`);
    console.log(`   📋 Image-specific codes: ${imageResponse.suggestedCodes.length}\n`);
  } catch (error) {
    console.log(`   ❌ Image error: ${error.message}\n`);
  }
  
  // Test 4: Feature status
  console.log('4. Feature Status:');
  console.log(`   🔍 Vision Analysis: ${AI_CONFIG.FEATURES.VISION_ANALYSIS ? '✅' : '❌'}`);
  console.log(`   🎤 Voice Transcription: ${AI_CONFIG.FEATURES.VOICE_TRANSCRIPTION ? '✅' : '❌'}`);
  console.log(`   🧠 Medical Reasoning: ${AI_CONFIG.FEATURES.MEDICAL_REASONING ? '✅' : '❌'}`);
  console.log(`   📚 Contextual Learning: ${AI_CONFIG.FEATURES.CONTEXTUAL_LEARNING ? '✅' : '❌'}\n`);
  
  console.log('🎉 AI Assistant test complete!');
  console.log('\n💡 To enable real AI:');
  console.log('   1. Get OpenAI API key from https://platform.openai.com/');
  console.log('   2. Set EXPO_PUBLIC_OPENAI_API_KEY in .env');
  console.log('   3. Change USE_REAL_AI to true in src/config/ai.ts');
}

// Run if called directly
if (require.main === module) {
  testAIAssistant().catch(console.error);
}

module.exports = { testAIAssistant };