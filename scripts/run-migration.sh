#!/bin/bash
# Phase 3 Database Migration via Supabase REST API

# Load environment variables
source /workspaces/ICD-10Mobile-assistant/mcp-server/.env

# Read the SQL file
SQL_FILE="/workspaces/ICD-10Mobile-assistant/database/phase3_clinical.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ SQL file not found: $SQL_FILE"
    exit 1
fi

echo "🚀 Running Phase 3 Database Migration..."
echo "📄 SQL file: $SQL_FILE"
echo ""

# Execute the SQL via Supabase REST API
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(cat "$SQL_FILE" | jq -Rs .)}")

echo "Response: $RESPONSE"

# Check if successful
if echo "$RESPONSE" | grep -q "error"; then
    echo ""
    echo "❌ Migration failed. Error details:"
    echo "$RESPONSE" | jq .
    echo ""
    echo "💡 Please run the SQL manually in Supabase Dashboard:"
    echo "   1. Go to https://supabase.com/dashboard"
    echo "   2. Open SQL Editor"
    echo "   3. Paste contents of: $SQL_FILE"
    echo "   4. Run the query"
    exit 1
else
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Verifying tables..."
    
    # Verify each table
    for table in patients encounters encounter_icd10_codes encounter_ai_results clinical_analysis_logs; do
        COUNT=$(curl -s -X GET \
          "${SUPABASE_URL}/rest/v1/${table}?select=count" \
          -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
          -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
          -H "Prefer: count=exact")
        
        if echo "$COUNT" | grep -q "error"; then
            echo "   ⚠️  $table: Not found"
        else
            echo "   ✓ $table: Ready"
        fi
    done
    
    echo ""
    echo "🎉 Phase 3 database setup complete!"
fi
