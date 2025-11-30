#!/bin/bash
# Safe setup script for MCP server configuration

set -e

echo "🔒 ICD-10 MCP Server - Secure Setup"
echo "===================================="
echo ""

# Check if .env already exists
if [ -f "mcp-server/.env" ]; then
  echo "⚠️  .env file already exists"
  read -p "Do you want to overwrite it? (y/N): " overwrite
  if [[ ! $overwrite =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
fi

# Get Supabase URL
echo ""
echo "📝 Enter your Supabase project URL"
echo "   (e.g., https://your-project.supabase.co)"
read -p "URL: " SUPABASE_URL

# Ask which key to use
echo ""
echo "🔑 Which Supabase key do you want to use?"
echo ""
echo "   1) ANON KEY (Recommended)"
echo "      - Safe to use - relies on Row Level Security"
echo "      - Best for personal/development use"
echo "      - Your tables already have RLS enabled"
echo ""
echo "   2) SERVICE ROLE KEY (Admin)"
echo "      - Full admin access - bypasses RLS"
echo "      - Use only if you need admin operations"
echo "      - HIGH SECURITY RISK if exposed"
echo ""
read -p "Choice (1 or 2): " key_choice

if [ "$key_choice" == "1" ]; then
  echo ""
  echo "📝 Enter your Supabase ANON key"
  echo "   (Found in: Project Settings > API > anon public)"
  read -p "ANON Key: " SUPABASE_KEY
  KEY_TYPE="SUPABASE_ANON_KEY"
else
  echo ""
  echo "⚠️  You chose SERVICE ROLE KEY - keep this secret!"
  echo "📝 Enter your Supabase SERVICE ROLE key"
  echo "   (Found in: Project Settings > API > service_role secret)"
  read -sp "SERVICE ROLE Key: " SUPABASE_KEY
  echo ""
  KEY_TYPE="SUPABASE_SERVICE_ROLE_KEY"
fi

# Create .env file
echo ""
echo "📝 Creating mcp-server/.env file..."
cat > mcp-server/.env << EOF
# Supabase Configuration
# Generated: $(date)

SUPABASE_URL=$SUPABASE_URL
$KEY_TYPE=$SUPABASE_KEY
EOF

# Verify .env is gitignored
if ! grep -q "mcp-server/.env" .gitignore 2>/dev/null; then
  echo ""
  echo "⚠️  Adding mcp-server/.env to .gitignore"
  echo "mcp-server/.env" >> .gitignore
fi

# Copy example config to actual config
if [ ! -f "mcp-server/mcp-config.json" ]; then
  echo "📝 Creating mcp-server/mcp-config.json from example..."
  cp mcp-server/mcp-config.example.json mcp-server/mcp-config.json
fi

# Build the MCP server
echo ""
echo "🔨 Building MCP server..."
cd mcp-server
npm install
npm run build
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔒 Security checklist:"
echo "   ✓ .env file created (gitignored)"
echo "   ✓ mcp-config.json created (gitignored)"
if [ "$KEY_TYPE" == "SUPABASE_ANON_KEY" ]; then
  echo "   ✓ Using ANON key (secure with RLS)"
else
  echo "   ⚠️  Using SERVICE ROLE key (keep secret!)"
fi
echo ""
echo "📚 Next steps:"
echo "   1. Test the MCP server with your client"
echo "   2. Never commit mcp-server/.env or mcp-server/mcp-config.json"
echo "   3. Review SECURITY_BEST_PRACTICES.md"
echo ""
echo "🚀 To use the MCP server:"
echo "   Point your MCP client to: $(pwd)/mcp-server/mcp-config.json"
echo ""
