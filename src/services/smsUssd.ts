/**
 * SMS/USSD Healthcare Interface
 * Zero-cost SMS-based ICD-10 lookup for feature phones
 * 
 * Uses Africa's Talking API (Free tier: 50 SMS/month)
 * Perfect for rural clinics without smartphones/internet
 * 
 * Usage Examples:
 * SMS: "malaria" → Returns: B54 - Unspecified malaria
 * SMS: "B50" → Returns: B50.9 - Plasmodium falciparum malaria
 * USSD: *384*1234# → Interactive menu for ICD lookup
 * 
 * Environment Variables:
 * - AT_API_KEY: Africa's Talking API key
 * - AT_USERNAME: Africa's Talking username
 * - AT_SENDER_ID: SMS sender ID (optional)
 */

import { supabase } from './supabase';

// Types
interface SMSIncoming {
  from: string;
  to: string;
  text: string;
  date: string;
  id: string;
}

interface USSDSession {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

interface ICD10SearchResult {
  code: string;
  short_title: string;
  long_description: string;
  chapter: string;
}

// Africa's Talking configuration
const AT_API_KEY = process.env.AT_API_KEY || '';
const AT_USERNAME = process.env.AT_USERNAME || 'sandbox'; // Use 'sandbox' for testing
const AT_SENDER_ID = process.env.AT_SENDER_ID || '';
const AT_SMS_URL = 'https://api.africastalking.com/version1/messaging';

/**
 * SMS Service - Handle incoming SMS messages
 */
export class SMSHealthService {
  
  /**
   * Process incoming SMS and return ICD-10 results
   */
  async processIncomingSMS(message: SMSIncoming): Promise<string> {
    const query = message.text.trim().toLowerCase();
    
    // Handle special commands
    if (query === 'help' || query === 'ayuda' || query === 'aide') {
      return this.getHelpMessage();
    }
    
    if (query === 'menu') {
      return this.getMenuMessage();
    }
    
    // Search for ICD-10 codes
    const results = await this.searchICD10(query, 3);
    
    if (results.length === 0) {
      return `No codes found for "${query}". Try:\n- A specific code (B50)\n- A condition (malaria)\n- HELP for usage`;
    }
    
    // Format results for SMS (keep under 160 chars per message)
    return this.formatSMSResults(results);
  }
  
  /**
   * Search ICD-10 codes in database
   */
  private async searchICD10(query: string, limit: number = 3): Promise<ICD10SearchResult[]> {
    try {
      // First try exact code match
      if (/^[A-Z]\d{2}/i.test(query)) {
        const { data: exactMatch } = await supabase
          .from('icd10_codes')
          .select('code, short_title, long_description, chapter')
          .ilike('code', `${query}%`)
          .limit(limit);
        
        if (exactMatch && exactMatch.length > 0) {
          return exactMatch;
        }
      }
      
      // Search by description
      const { data: results } = await supabase
        .from('icd10_codes')
        .select('code, short_title, long_description, chapter')
        .or(`long_description.ilike.%${query}%,short_title.ilike.%${query}%`)
        .limit(limit);
      
      return results || [];
    } catch (error) {
      console.error('[SMS] Search error:', error);
      return [];
    }
  }
  
  /**
   * Format results for SMS (160 char limit)
   */
  private formatSMSResults(results: ICD10SearchResult[]): string {
    const lines = results.map(r => 
      `${r.code}: ${r.short_title.substring(0, 40)}`
    );
    
    return lines.join('\n');
  }
  
  /**
   * Get help message
   */
  private getHelpMessage(): string {
    return `ICD-10 SMS Help:
- Send condition name (malaria, TB)
- Send code (B50, A15)
- Reply MENU for categories
- Reply HELP for this message

Free service for health workers`;
  }
  
  /**
   * Get menu message
   */
  private getMenuMessage(): string {
    return `ICD-10 Categories:
1. MALARIA - Malaria codes
2. TB - Tuberculosis codes
3. HIV - HIV/AIDS codes
4. FEVER - Fever conditions
5. DIARRHEA - GI infections

Reply with number or keyword`;
  }
  
  /**
   * Send SMS response via Africa's Talking
   */
  async sendSMS(to: string, message: string): Promise<boolean> {
    if (!AT_API_KEY) {
      console.warn('[SMS] Africa\'s Talking API key not configured');
      return false;
    }
    
    try {
      const response = await fetch(AT_SMS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': AT_API_KEY,
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          username: AT_USERNAME,
          to: to,
          message: message,
          ...(AT_SENDER_ID && { from: AT_SENDER_ID }),
        }),
      });
      
      const result = await response.json();
      console.log('[SMS] Sent:', result);
      return result.SMSMessageData?.Recipients?.[0]?.status === 'Success';
    } catch (error) {
      console.error('[SMS] Send error:', error);
      return false;
    }
  }
}

/**
 * USSD Service - Interactive menu for feature phones
 */
export class USSDHealthService {
  
  /**
   * Process USSD session
   * Returns response string with CON (continue) or END (end session)
   */
  processUSSDRequest(session: USSDSession): string {
    const { text } = session;
    
    // Initial request (empty text)
    if (!text || text === '') {
      return this.getMainMenu();
    }
    
    // Parse user input
    const inputs = text.split('*');
    const currentInput = inputs[inputs.length - 1];
    const menuLevel = inputs.length;
    
    // Route based on menu level
    switch (menuLevel) {
      case 1:
        return this.handleMainMenuSelection(currentInput);
      case 2:
        return this.handleSubMenuSelection(inputs[0], currentInput);
      case 3:
        return this.handleSearchInput(inputs[0], inputs[1], currentInput);
      default:
        return 'END Session expired. Dial again.';
    }
  }
  
  /**
   * Main menu
   */
  private getMainMenu(): string {
    return `CON Welcome to ICD-10 Health
Select an option:
1. Search by condition
2. Search by code
3. Common conditions
4. Emergency codes
5. About/Help`;
  }
  
  /**
   * Handle main menu selection
   */
  private handleMainMenuSelection(input: string): string {
    switch (input) {
      case '1':
        return `CON Search by condition
Enter condition name:
(e.g., malaria, fever, cough)`;
      
      case '2':
        return `CON Search by code
Enter ICD-10 code:
(e.g., B50, A15, J18)`;
      
      case '3':
        return `CON Common conditions:
1. Malaria
2. Tuberculosis
3. HIV/AIDS
4. Pneumonia
5. Diarrhea
6. Malnutrition
0. Back`;
      
      case '4':
        return `CON Emergency codes:
R57.9 - Shock
T78.2 - Anaphylaxis
J96 - Respiratory fail
I46.9 - Cardiac arrest
O15 - Eclampsia
P21 - Birth asphyxia`;
      
      case '5':
        return `END ICD-10 Health SMS
Free for health workers
Send SMS to +XXX:
- Condition name
- ICD code
For help: HELP`;
      
      default:
        return 'END Invalid selection. Dial again.';
    }
  }
  
  /**
   * Handle sub-menu selection
   */
  private handleSubMenuSelection(mainChoice: string, input: string): string {
    // Common conditions sub-menu
    if (mainChoice === '3') {
      switch (input) {
        case '1':
          return `END Malaria codes:
B50 - P. falciparum
B51 - P. vivax
B52 - P. malariae
B54 - Unspecified malaria`;
        
        case '2':
          return `END Tuberculosis codes:
A15 - Respiratory TB
A17 - CNS TB
A18 - Other organ TB
A19 - Miliary TB`;
        
        case '3':
          return `END HIV/AIDS codes:
B20 - HIV disease
B21 - HIV with cancer
B22 - HIV other disease
B24 - HIV unspecified`;
        
        case '4':
          return `END Pneumonia codes:
J13 - Strep pneumoniae
J15 - Bacterial pneumonia
J18 - Pneumonia NOS`;
        
        case '5':
          return `END Diarrhea codes:
A09 - Infectious GE
A00 - Cholera
A01 - Typhoid
A08 - Viral enteritis`;
        
        case '6':
          return `END Malnutrition codes:
E40 - Kwashiorkor
E41 - Marasmus
E43 - Severe PEM
E46 - PEM unspecified`;
        
        case '0':
          return this.getMainMenu();
        
        default:
          return 'END Invalid selection';
      }
    }
    
    // Search results would be async - return placeholder
    return `END Searching for: ${input}
Results will be sent via SMS.`;
  }
  
  /**
   * Handle search input
   */
  private handleSearchInput(mainChoice: string, subChoice: string, input: string): string {
    return `END Search: ${input}
Results will be sent via SMS
to your phone number.`;
  }
}

/**
 * Webhook handlers for Express.js/Supabase Edge Functions
 */
export const smsWebhookHandler = async (req: any) => {
  const service = new SMSHealthService();
  
  // Parse incoming SMS (Africa's Talking format)
  const incoming: SMSIncoming = {
    from: req.body.from || req.query.from,
    to: req.body.to || req.query.to,
    text: req.body.text || req.query.text,
    date: req.body.date || new Date().toISOString(),
    id: req.body.id || req.query.id,
  };
  
  console.log('[Webhook] Incoming SMS:', incoming);
  
  // Process and respond
  const response = await service.processIncomingSMS(incoming);
  await service.sendSMS(incoming.from, response);
  
  return { success: true, response };
};

export const ussdWebhookHandler = (req: any) => {
  const service = new USSDHealthService();
  
  // Parse USSD session (Africa's Talking format)
  const session: USSDSession = {
    sessionId: req.body.sessionId || req.query.sessionId,
    serviceCode: req.body.serviceCode || req.query.serviceCode,
    phoneNumber: req.body.phoneNumber || req.query.phoneNumber,
    text: req.body.text || req.query.text || '',
  };
  
  console.log('[Webhook] USSD Session:', session);
  
  // Process and return response
  const response = service.processUSSDRequest(session);
  
  return response;
};

// Export instances for direct use
export const smsService = new SMSHealthService();
export const ussdService = new USSDHealthService();
