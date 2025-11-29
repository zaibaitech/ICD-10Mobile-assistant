# Using Supabase MCP in Codespaces

The Supabase MCP server is now configured and ready to use in your Codespace!

## What's Configured

✅ MCP server built and ready  
✅ Environment variables configured  
✅ VS Code settings configured  
✅ Server tested and working  

## Available Tools

The MCP server provides these tools for interacting with your Supabase database:

1. **query_icd10_codes** - Search ICD-10 codes by text
2. **get_icd10_by_code** - Get details for a specific code
3. **get_user_favorites** - Get user's favorite codes
4. **add_favorite** - Add a code to favorites
5. **remove_favorite** - Remove from favorites
6. **get_visit_notes** - Get patient visit notes
7. **create_visit_note** - Create new visit note
8. **execute_query** - Run custom SQL queries

## How to Use

### In GitHub Copilot Chat

You can now use `@icd10-supabase` in GitHub Copilot Chat to interact with your Supabase database.

Example queries:
```
@icd10-supabase search for diabetes codes
@icd10-supabase get details for code E11.9
@icd10-supabase show my favorites for user abc-123
@icd10-supabase create a visit note for patient John Doe
```

### Reload Window

After configuration changes, you may need to reload the VS Code window:
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Reload Window"
3. Press Enter

## Configuration Files

- **MCP Server**: `/workspaces/ICD-10Mobile-assistant/mcp-server/`
- **Environment**: `/workspaces/ICD-10Mobile-assistant/mcp-server/.env`
- **VS Code Settings**: `/workspaces/ICD-10Mobile-assistant/.vscode/settings.json`

## Troubleshooting

If the MCP server isn't showing up:
1. Reload the VS Code window
2. Check that GitHub Copilot Chat extension is installed
3. Verify the server builds successfully: `cd mcp-server && npm run build`
4. Check the Output panel (View > Output) and select "MCP" from the dropdown

## Security Note

⚠️ The `.env` file contains your Supabase service role key with full database access. It's excluded from git via `.gitignore` but be careful not to share it.
