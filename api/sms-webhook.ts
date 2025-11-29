/**
 * SMS/USSD Webhook Handler for Africa's Talking
 * 
 * This serverless function handles incoming SMS and USSD requests
 * Provides ICD-10 code lookup via SMS/USSD for offline/low-connectivity areas
 * 
 * DEPLOYMENT: Vercel/Netlify Functions (FREE tier)
 * API: Africa's Talking (50 free SMS/month)
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// USSD Menu States
enum USSDState {
  HOME = 'home',
  SEARCH = 'search',
  VIEW_CODE = 'view_code',
  EMERGENCY = 'emergency',
}

// SMS command patterns
const SMS_COMMANDS = {
  SEARCH: /^search\s+(.+)/i,
  CODE: /^code\s+([A-Z]\d{2}\.?\d*)/i,
  HELP: /^help/i,
  EMERGENCY: /^emergency\s+(.+)/i,
};

/**
 * Handle SMS requests
 */
async function handleSMS(from: string, text: string): Promise<string> {
  const cleanText = text.trim();

  // HELP command
  if (SMS_COMMANDS.HELP.test(cleanText)) {
    return `ICD-10 Assistant Commands:
SEARCH <term> - Search codes
CODE <code> - Get code details
EMERGENCY <condition> - Emergency protocols
HELP - Show this message`;
  }

  // SEARCH command
  const searchMatch = cleanText.match(SMS_COMMANDS.SEARCH);
  if (searchMatch) {
    const searchTerm = searchMatch[1];
    const { data, error } = await supabase
      .from('icd10_codes')
      .select('code, short_title')
      .or(`code.ilike.%${searchTerm}%,short_title.ilike.%${searchTerm}%`)
      .limit(5);

    if (error || !data || data.length === 0) {
      return `No codes found for "${searchTerm}". Try different terms.`;
    }

    let response = `Found ${data.length} codes:\n`;
    data.forEach((item, idx) => {
      response += `${idx + 1}. ${item.code}: ${item.short_title}\n`;
    });
    response += `\nReply CODE <code> for details`;
    return response;
  }

  // CODE command
  const codeMatch = cleanText.match(SMS_COMMANDS.CODE);
  if (codeMatch) {
    const code = codeMatch[1].toUpperCase().replace('.', '');
    const { data, error } = await supabase
      .from('icd10_codes')
      .select('code, short_title, long_title, chapter_name')
      .eq('code', code)
      .single();

    if (error || !data) {
      return `Code ${code} not found. Check spelling or use SEARCH.`;
    }

    return `${data.code}: ${data.short_title}
Chapter: ${data.chapter_name}
Details: ${data.long_title || data.short_title}`;
  }

  // EMERGENCY command
  const emergencyMatch = cleanText.match(SMS_COMMANDS.EMERGENCY);
  if (emergencyMatch) {
    const condition = emergencyMatch[1].toLowerCase();
    
    // Pre-defined emergency protocols
    const protocols: Record<string, string> = {
      'chest pain': 'CHEST PAIN Protocol:\n1. Check vitals\n2. Aspirin 300mg\n3. ECG if available\n4. Transfer urgently\nCodes: I21.9 (MI), I20.0 (Angina)',
      'difficulty breathing': 'BREATHING Protocol:\n1. Position upright\n2. Oxygen if available\n3. Check for anaphylaxis\n4. Transfer urgently\nCodes: R06.0, J96.0',
      'severe bleeding': 'BLEEDING Protocol:\n1. Direct pressure\n2. Elevate if limb\n3. Tourniquet last resort\n4. Transfer urgently\nCodes: R58, T14.1',
      'unconscious': 'UNCONSCIOUS Protocol:\n1. Check ABC\n2. Recovery position\n3. Check glucose if diabetic\n4. Transfer urgently\nCodes: R40.2',
    };

    const protocol = Object.entries(protocols).find(([key]) => 
      condition.includes(key)
    );

    if (protocol) {
      return protocol[1];
    }

    return `Emergency: ${condition}\nGeneral Protocol:\n1. Assess ABC\n2. Call for help\n3. Stabilize\n4. Transfer\nReply EMERGENCY <condition> for specific protocol`;
  }

  // Default help
  return `Unknown command. Reply HELP for commands.`;
}

/**
 * Handle USSD sessions
 */
async function handleUSSD(
  sessionId: string,
  serviceCode: string,
  phoneNumber: string,
  text: string
): Promise<{ response: string; endSession: boolean }> {
  const parts = text.split('*');
  const level = parts.length;

  // Home menu
  if (text === '') {
    return {
      response: `CON Welcome to ICD-10 Assistant
1. Search ICD-10 Code
2. Common Diagnoses
3. Emergency Protocols
4. About`,
      endSession: false,
    };
  }

  // Main menu selection
  if (level === 1) {
    switch (parts[0]) {
      case '1': // Search
        return {
          response: `CON Enter search term:
(e.g., diabetes, fever, injury)`,
          endSession: false,
        };
      
      case '2': // Common diagnoses
        return {
          response: `CON Common Diagnoses:
1. Malaria (B54)
2. Diabetes (E11.9)
3. Hypertension (I10)
4. Pneumonia (J18.9)
5. Diarrhea (A09)
0. Back`,
          endSession: false,
        };
      
      case '3': // Emergency protocols
        return {
          response: `CON Emergency Protocols:
1. Chest Pain
2. Difficulty Breathing
3. Severe Bleeding
4. Unconscious
0. Back`,
          endSession: false,
        };
      
      case '4': // About
        return {
          response: `END ICD-10 Mobile Assistant
FREE documentation tool
SMS: Reply HELP
Web: icd10.health`,
          endSession: true,
        };
      
      default:
        return {
          response: `END Invalid option. Dial again.`,
          endSession: true,
        };
    }
  }

  // Search flow
  if (parts[0] === '1' && level === 2) {
    const searchTerm = parts[1];
    const { data } = await supabase
      .from('icd10_codes')
      .select('code, short_title')
      .or(`code.ilike.%${searchTerm}%,short_title.ilike.%${searchTerm}%`)
      .limit(5);

    if (!data || data.length === 0) {
      return {
        response: `END No codes found for "${searchTerm}"`,
        endSession: true,
      };
    }

    let response = `END Results for "${searchTerm}":\n`;
    data.forEach((item, idx) => {
      response += `${idx + 1}. ${item.code}: ${item.short_title}\n`;
    });
    return { response, endSession: true };
  }

  // Common diagnoses details
  if (parts[0] === '2' && level === 2) {
    const codes: Record<string, string> = {
      '1': 'B54: Malaria, unspecified\nFever, chills, sweats',
      '2': 'E11.9: Type 2 diabetes\nWithout complications',
      '3': 'I10: Essential hypertension\nHigh blood pressure',
      '4': 'J18.9: Pneumonia, unspecified\nLung infection',
      '5': 'A09: Diarrhea, unspecified\nGastroenteritis',
    };

    return {
      response: `END ${codes[parts[1]] || 'Invalid selection'}`,
      endSession: true,
    };
  }

  // Emergency protocols
  if (parts[0] === '3' && level === 2) {
    const protocols: Record<string, string> = {
      '1': 'CHEST PAIN:\n1. Vitals\n2. Aspirin 300mg\n3. ECG\n4. Transfer\nCode: I21.9',
      '2': 'BREATHING:\n1. Upright\n2. Oxygen\n3. Check anaphylaxis\n4. Transfer\nCode: R06.0',
      '3': 'BLEEDING:\n1. Direct pressure\n2. Elevate\n3. Transfer\nCode: R58',
      '4': 'UNCONSCIOUS:\n1. ABC\n2. Recovery position\n3. Transfer\nCode: R40.2',
    };

    return {
      response: `END ${protocols[parts[1]] || 'Invalid selection'}`,
      endSession: true,
    };
  }

  return {
    response: `END Invalid input. Please try again.`,
    endSession: true,
  };
}

/**
 * Main webhook handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, serviceCode, phoneNumber, text, from, message } = req.body;

    // USSD request
    if (sessionId && serviceCode) {
      const { response, endSession } = await handleUSSD(
        sessionId,
        serviceCode,
        phoneNumber,
        text || ''
      );

      return res.status(200).send(response);
    }

    // SMS request
    if (from && message) {
      const response = await handleSMS(from, message);
      
      return res.status(200).json({
        message: response,
        to: from,
      });
    }

    return res.status(400).json({ error: 'Invalid request format' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
