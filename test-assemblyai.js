/**
 * Test script for AssemblyAI Voice Transcription
 * 
 * Run with: node test-assemblyai.js
 * 
 * Prerequisites:
 * 1. Add EXPO_PUBLIC_ASSEMBLYAI_KEY to .env file
 * 2. Have a sample audio file (or use mock test)
 */

require('dotenv').config();

const ASSEMBLYAI_KEY = process.env.EXPO_PUBLIC_ASSEMBLYAI_KEY;

async function testAssemblyAI() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  🧪 Testing AssemblyAI Integration');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check API key
  if (!ASSEMBLYAI_KEY) {
    console.log('❌ ERROR: EXPO_PUBLIC_ASSEMBLYAI_KEY not found in .env file\n');
    console.log('📝 To fix:');
    console.log('1. Go to https://www.assemblyai.com/');
    console.log('2. Sign up (100 hours/month FREE)');
    console.log('3. Get your API key from the dashboard');
    console.log('4. Add to .env file: EXPO_PUBLIC_ASSEMBLYAI_KEY=...\n');
    process.exit(1);
  }

  if (ASSEMBLYAI_KEY === 'your-assemblyai-key-here') {
    console.log('⚠️  WARNING: Please replace placeholder API key\n');
    console.log('Your key:', ASSEMBLYAI_KEY, '\n');
    process.exit(1);
  }

  console.log('✅ API Key found:', ASSEMBLYAI_KEY.substring(0, 10) + '...\n');
  
  // Test with a sample audio URL (public medical consultation sample)
  const sampleAudioUrl = 'https://github.com/AssemblyAI-Examples/audio-examples/raw/main/20230607_me_canadian_wildfires.mp3';
  
  console.log('📤 Testing transcription with sample audio...\n');
  console.log('Note: Using a public sample audio file for testing\n');

  try {
    // Step 1: Request transcription
    console.log('Step 1: Requesting transcription...');
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: sampleAudioUrl,
        speech_model: 'best',
      })
    });

    if (!transcriptResponse.ok) {
      const error = await transcriptResponse.json();
      console.log('❌ API Error:', transcriptResponse.status, transcriptResponse.statusText);
      console.log('Error details:', JSON.stringify(error, null, 2));
      
      if (transcriptResponse.status === 401) {
        console.log('\n⚠️  Authentication failed. Please check:');
        console.log('1. Your API key is correct');
        console.log('2. You have an active AssemblyAI account');
        console.log('3. Your free tier is still active\n');
      }
      
      process.exit(1);
    }

    const { id: transcriptId } = await transcriptResponse.json();
    console.log('✅ Transcription requested! ID:', transcriptId, '\n');

    // Step 2: Poll for completion
    console.log('Step 2: Waiting for transcription to complete...');
    console.log('(This usually takes 15-30% of audio duration)\n');

    let transcript;
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      const pollingResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { 'authorization': ASSEMBLYAI_KEY }
        }
      );

      transcript = await pollingResponse.json();

      if (transcript.status === 'completed') {
        const duration = transcript.audio_duration || 0;
        const processingTime = attempts;
        
        console.log('✅ Transcription completed!\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  📋 Transcription Results:');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log(transcript.text);
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  📊 Statistics:');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('Audio duration:', Math.round(duration), 'seconds');
        console.log('Processing time:', processingTime, 'seconds');
        console.log('Speed:', duration > 0 ? `${((duration / processingTime) * 100).toFixed(0)}% of real-time` : 'N/A');
        console.log('Words transcribed:', transcript.words?.length || 0);
        console.log('Confidence:', transcript.confidence ? `${(transcript.confidence * 100).toFixed(1)}%` : 'N/A');
        
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  ✅ TEST SUCCESSFUL!');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log('🎉 AssemblyAI is working correctly!\n');
        console.log('Next steps:');
        console.log('1. Your API key is already in .env');
        console.log('2. USE_REAL_AI is already enabled');
        console.log('3. Test voice recording in the app');
        console.log('4. Enjoy 100% real data! 🎯\n');
        
        console.log('💡 Usage:');
        console.log(`Audio processed: ${Math.round(duration)}s / ${100 * 3600}s monthly limit`);
        console.log(`Remaining this month: ~${Math.round((100 * 3600 - duration) / 3600)} hours\n`);
        
        return;
        
      } else if (transcript.status === 'error') {
        console.log('❌ Transcription failed:', transcript.error);
        process.exit(1);
      } else {
        process.stdout.write(`\r⏳ Status: ${transcript.status}... (${attempts}s)`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    console.log('\n❌ Timeout: Transcription took too long');
    process.exit(1);

  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    console.log('\n📝 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify API key is correct');
    console.log('3. Check AssemblyAI status: https://status.assemblyai.com/');
    console.log('4. Make sure you have free tier hours remaining\n');
    process.exit(1);
  }
}

// Run the test
testAssemblyAI();
