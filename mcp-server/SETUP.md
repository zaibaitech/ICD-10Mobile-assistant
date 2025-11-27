# MCP Server Setup Instructions

## Quick Start Guide

### 1. Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Service Role Key** (secret key - keep it safe!)

### 2. Configure Environment Variables

```bash
cd mcp-server
cp .env.example .env
```

Edit `.env` and paste your credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Install & Build

```bash
npm install
npm run build
```

### 4. Configure Your MCP Client

Choose one of these configurations:

#### A. VS Code Copilot/Claude Desktop (Official Supabase MCP)

Add to your MCP settings file:

**Windows**: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`  
**Mac**: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

#### B. Local ICD-10 MCP Server (Custom Tools)

```json
{
  "mcpServers": {
    "icd10-assistant": {
      "type": "stdio",
      "command": "node",
      "args": ["mcp-server/dist/index.js"],
      "cwd": "d:/ICD/ICD-10Mobile-assistant",
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

**Important**: Replace `d:/ICD/ICD-10Mobile-assistant` with your actual workspace path!

#### C. Both (Recommended)

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    },
    "icd10-assistant": {
      "type": "stdio",
      "command": "node",
      "args": ["mcp-server/dist/index.js"],
      "cwd": "d:/ICD/ICD-10Mobile-assistant",
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

### 5. Test the Connection

After configuring, restart your MCP client and try:

```
"Search for ICD-10 code for diabetes"
```

The MCP server should respond with ICD-10 codes from your Supabase database.

## Troubleshooting

### Server won't start
- Check that `.env` file exists in `mcp-server` directory
- Verify Supabase credentials are correct
- Run `npm run build` to rebuild

### MCP client can't connect
- Check the `cwd` path matches your workspace location
- Verify `node` is in your PATH
- Check MCP client logs for errors

### Database queries failing
- Verify Service Role Key (not Anon Key)
- Check Supabase project is active
- Verify database tables exist (run schema.sql)

## Next Steps

1. **Import ICD-10 Data**: Run `tools/import_icd10.py` to populate the database
2. **Test Tools**: Try each MCP tool to verify functionality
3. **Integration**: Use MCP tools in your application

## Support

For issues, see:
- Main README: `../README.md`
- Database Setup: `../database/SETUP.md`
- Project Summary: `../PROJECT_SUMMARY.md`
