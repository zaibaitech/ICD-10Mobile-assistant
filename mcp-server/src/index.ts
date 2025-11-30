#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
// Prefer ANON key for better security (uses RLS), fall back to SERVICE_ROLE key if needed
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing required environment variables');
  console.error('Please set SUPABASE_URL and either SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in .env file');
  console.error('Recommended: Use SUPABASE_ANON_KEY for better security with Row Level Security');
  process.exit(1);
}

// Initialize Supabase client
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Log which key type is being used (without exposing the actual key)
if (process.env.SUPABASE_ANON_KEY) {
  console.error('✅ Using ANON key (secure - RLS enabled)');
} else {
  console.error('⚠️  Using SERVICE_ROLE key (admin access - bypasses RLS)');
}

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'query_icd10_codes',
    description: 'Search ICD-10 codes by text query',
    inputSchema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Search query for ICD-10 codes',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 20)',
          default: 20,
        },
      },
      required: ['search'],
    },
  },
  {
    name: 'get_icd10_by_code',
    description: 'Get detailed information about a specific ICD-10 code',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The ICD-10 code (e.g., A00.0)',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'get_user_favorites',
    description: 'Get all favorite ICD-10 codes for a user',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'User ID to get favorites for',
        },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'add_favorite',
    description: 'Add an ICD-10 code to user favorites',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'User ID',
        },
        icd10_code: {
          type: 'string',
          description: 'ICD-10 code to add to favorites',
        },
      },
      required: ['user_id', 'icd10_code'],
    },
  },
  {
    name: 'remove_favorite',
    description: 'Remove an ICD-10 code from user favorites',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'User ID',
        },
        icd10_code: {
          type: 'string',
          description: 'ICD-10 code to remove from favorites',
        },
      },
      required: ['user_id', 'icd10_code'],
    },
  },
  {
    name: 'get_visit_notes',
    description: 'Get visit notes for a user',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'User ID to get visit notes for',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 50)',
          default: 50,
        },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'create_visit_note',
    description: 'Create a new visit note',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'User ID',
        },
        patient_name: {
          type: 'string',
          description: 'Patient name',
        },
        notes: {
          type: 'string',
          description: 'Visit notes',
        },
        icd10_codes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of ICD-10 codes associated with the visit',
        },
      },
      required: ['user_id', 'patient_name', 'notes', 'icd10_codes'],
    },
  },
  {
    name: 'execute_query',
    description: 'Execute a custom SQL query on the Supabase database',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'SQL query to execute',
        },
      },
      required: ['query'],
    },
  },
];

// Create MCP server
const server = new Server(
  {
    name: 'icd10-supabase-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'query_icd10_codes': {
        const { search, limit = 20 } = args as { search: string; limit?: number };
        
        const { data, error } = await supabase
          .from('icd10_codes')
          .select('*')
          .or(`code.ilike.%${search}%,description.ilike.%${search}%`)
          .limit(limit);

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_icd10_by_code': {
        const { code } = args as { code: string };
        
        const { data, error } = await supabase
          .from('icd10_codes')
          .select('*')
          .eq('code', code)
          .single();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_user_favorites': {
        const { user_id } = args as { user_id: string };
        
        const { data, error } = await supabase
          .from('favorites')
          .select('*, icd10_codes(*)')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'add_favorite': {
        const { user_id, icd10_code } = args as { user_id: string; icd10_code: string };
        
        const { data, error } = await supabase
          .from('favorites')
          .insert({ user_id, icd10_code })
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, data }, null, 2),
            },
          ],
        };
      }

      case 'remove_favorite': {
        const { user_id, icd10_code } = args as { user_id: string; icd10_code: string };
        
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user_id)
          .eq('icd10_code', icd10_code);

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Favorite removed' }, null, 2),
            },
          ],
        };
      }

      case 'get_visit_notes': {
        const { user_id, limit = 50 } = args as { user_id: string; limit?: number };
        
        const { data, error } = await supabase
          .from('visit_notes')
          .select('*')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'create_visit_note': {
        const { user_id, patient_name, notes, icd10_codes } = args as {
          user_id: string;
          patient_name: string;
          notes: string;
          icd10_codes: string[];
        };
        
        const { data, error } = await supabase
          .from('visit_notes')
          .insert({
            user_id,
            patient_name,
            notes,
            icd10_codes,
          })
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, data }, null, 2),
            },
          ],
        };
      }

      case 'execute_query': {
        const { query } = args as { query: string };
        
        const { data, error } = await supabase.rpc('execute_sql', { sql: query });

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ICD-10 Supabase MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
