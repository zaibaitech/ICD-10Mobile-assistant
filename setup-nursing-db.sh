#!/bin/bash
# ============================================
# NURSING MODULE DATABASE SETUP SCRIPT
# ============================================
# This script creates all nursing tables and loads sample data

set -e  # Exit on error

echo "🏥 Phase 6 Nursing Module Database Setup"
echo "========================================"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Error: .env file not found"
    exit 1
fi

# Check for required environment variables
if [ -z "$EXPO_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: EXPO_PUBLIC_SUPABASE_URL not set in .env"
    exit 1
fi

if [ -z "$EXPO_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: EXPO_PUBLIC_SUPABASE_ANON_KEY not set in .env"
    exit 1
fi

# Extract project ref from URL (e.g., hwclojaalnzruviubxju from https://hwclojaalnzruviubxju.supabase.co)
PROJECT_REF=$(echo $EXPO_PUBLIC_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')

echo "📊 Supabase Project: $PROJECT_REF"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "Step 1: Running nursing schema migration..."
echo "-------------------------------------------"

# Option 1: Using Supabase CLI (recommended)
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI..."
    
    # Link to project if not already linked
    if [ ! -f .supabase/config.toml ]; then
        echo "Linking to Supabase project..."
        supabase link --project-ref $PROJECT_REF
    fi
    
    # Run the schema migration
    supabase db push database/nursing-schema.sql
    
    echo "✅ Schema created successfully"
    echo ""
    
    echo "Step 2: Loading sample data..."
    echo "-------------------------------------------"
    
    # Run the sample data
    supabase db push database/seeds/nursing-sample-data.sql
    
    echo "✅ Sample data loaded successfully"
    
else
    # Option 2: Using direct SQL (fallback)
    echo "Using direct SQL execution..."
    echo ""
    echo "⚠️  Please run the following manually in Supabase SQL Editor:"
    echo ""
    echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
    echo "2. Copy and paste the contents of: database/nursing-schema.sql"
    echo "3. Click 'Run'"
    echo "4. Then copy and paste: database/seeds/nursing-sample-data.sql"
    echo "5. Click 'Run' again"
    echo ""
    exit 1
fi

echo ""
echo "Step 3: Verifying tables..."
echo "-------------------------------------------"

# Create a quick verification query
cat > /tmp/verify-nursing-tables.sql << 'EOF'
-- Verify nursing tables were created
SELECT 
  COUNT(*) FILTER (WHERE table_name = 'nanda_diagnoses') as nanda_table,
  COUNT(*) FILTER (WHERE table_name = 'nic_interventions') as nic_table,
  COUNT(*) FILTER (WHERE table_name = 'noc_outcomes') as noc_table,
  COUNT(*) FILTER (WHERE table_name = 'icd10_nanda_mappings') as mappings_table,
  COUNT(*) FILTER (WHERE table_name = 'nursing_care_plans') as care_plans_table,
  COUNT(*) FILTER (WHERE table_name = 'sbar_reports') as sbar_table
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'n%' OR table_name LIKE 'i%' OR table_name = 'sbar_reports';

-- Count sample data
SELECT 
  (SELECT COUNT(*) FROM nanda_diagnoses) as nanda_count,
  (SELECT COUNT(*) FROM nic_interventions) as nic_count,
  (SELECT COUNT(*) FROM noc_outcomes) as noc_count,
  (SELECT COUNT(*) FROM icd10_nanda_mappings) as mapping_count;
EOF

if command -v supabase &> /dev/null; then
    supabase db push /tmp/verify-nursing-tables.sql
fi

echo ""
echo "🎉 Database setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Run: node test-nursing-backend.js (to test services)"
echo "2. Integrate navigation (see PHASE6_NAVIGATION_EXAMPLE.tsx)"
echo "3. Test the UI end-to-end"
echo ""
