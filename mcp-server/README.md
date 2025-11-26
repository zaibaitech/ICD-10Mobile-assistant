# ICD-10 Supabase MCP Server

This is a Model Context Protocol (MCP) server for the ICD-10 Mobile Assistant, providing access to Supabase database functionality through standardized tools.

## Features

- **ICD-10 Code Search**: Query ICD-10 codes by text
- **Code Details**: Get detailed information about specific codes
- **Favorites Management**: Add, remove, and list user favorites
- **Visit Notes**: Create and retrieve patient visit notes
- **Custom Queries**: Execute custom SQL queries

## Setup

1. **Install dependencies**:
   ```bash
   cd mcp-server
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Build the server**:
   ```bash
   npm run build
   ```

4. **Run the server**:
   ```bash
   npm start
   ```

## VS Code Configuration

To use this MCP server with Claude in VS Code, add it to your MCP settings:

1. Open VS Code settings
2. Search for "MCP"
3. Add the server configuration:

```json
{
  "mcpServers": {
    "icd10-supabase": {
      "command": "node",
      "args": ["d:/ICD10/ICD-10Mobile-assistant/mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

Alternatively, create a `.env` file in the `mcp-server` directory and the server will load credentials from there.

## Available Tools

### query_icd10_codes
Search for ICD-10 codes by text query.

**Parameters**:
- `search` (string, required): Search query
- `limit` (number, optional): Max results (default: 20)

### get_icd10_by_code
Get details for a specific ICD-10 code.

**Parameters**:
- `code` (string, required): ICD-10 code (e.g., "A00.0")

### get_user_favorites
Get all favorite codes for a user.

**Parameters**:
- `user_id` (string, required): User ID

### add_favorite
Add a code to user favorites.

**Parameters**:
- `user_id` (string, required): User ID
- `icd10_code` (string, required): ICD-10 code

### remove_favorite
Remove a code from favorites.

**Parameters**:
- `user_id` (string, required): User ID
- `icd10_code` (string, required): ICD-10 code

### get_visit_notes
Get visit notes for a user.

**Parameters**:
- `user_id` (string, required): User ID
- `limit` (number, optional): Max results (default: 50)

### create_visit_note
Create a new visit note.

**Parameters**:
- `user_id` (string, required): User ID
- `patient_name` (string, required): Patient name
- `notes` (string, required): Visit notes
- `icd10_codes` (array, required): Array of ICD-10 codes

### execute_query
Execute a custom SQL query.

**Parameters**:
- `query` (string, required): SQL query to execute

## Development

Run in watch mode during development:

```bash
npm run dev
```

## Security Notes

- The MCP server uses the **service role key** for full database access
- Keep your `.env` file secure and never commit it to version control
- The `.env` file is already added to `.gitignore`
