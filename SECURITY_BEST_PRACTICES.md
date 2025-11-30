# 🔒 Security Best Practices & Prevention

## Why the Incident Happened

1. **Service role key in config file** - `mcp-config.json` contained admin credentials
2. **Config file not gitignored** - File was tracked and committed to git
3. **Pushed to public GitHub** - Credentials became publicly accessible

## ❓ Do You Actually Need the Service Role Key?

**SHORT ANSWER: Probably NO for most use cases!**

### Service Role Key vs Anon Key

| Feature | Anon Key | Service Role Key |
|---------|----------|------------------|
| **Bypasses RLS** | ❌ No | ✅ Yes (DANGEROUS) |
| **Public exposure** | ✅ Safe | ❌ CRITICAL RISK |
| **User context** | ✅ Yes (auth.uid()) | ❌ No |
| **Admin operations** | ❌ No | ✅ Yes |

### When You NEED Service Role Key:
- ✅ Server-side admin operations (user management, migrations)
- ✅ Bypassing RLS for specific admin tasks
- ✅ Backend services that need full access
- ✅ Database migrations and maintenance

### When You DON'T NEED Service Role Key:
- ❌ User-facing applications (use anon key + RLS)
- ❌ MCP server for personal use (if you have RLS)
- ❌ Mobile/web apps (NEVER expose service role key)
- ❌ Read-only operations on public data

## 🛡️ Recommended Architecture

### Option 1: Use Anon Key with RLS (RECOMMENDED for MCP)

Since your tables have RLS enabled, you can use the **anon key** instead:

```typescript
// mcp-server/src/index.ts
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY; // Public key - safe!
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Then authenticate as yourself
const { data: { session } } = await supabase.auth.signInWithPassword({
  email: 'your@email.com',
  password: 'your-password'
});
```

**Benefits:**
- ✅ Anon key can be safely committed (it's public)
- ✅ RLS policies protect your data
- ✅ Proper user context (auth.uid())
- ✅ No risk if exposed

### Option 2: Environment Variables Only (Current Setup)

Keep using service role key BUT store it properly:

```bash
# mcp-server/.env (gitignored)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
```

```json
// mcp-server/mcp-config.json (safe - no secrets)
{
  "mcpServers": {
    "icd10-local": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

## 🔒 Prevention Measures (Implemented)

### 1. ✅ Proper .gitignore
```ignore
# All secret files
.env*
*.env
mcp-server/.env
mcp-server/mcp-config.json
mcp-config.json
*.key
*.pem
*secret*
```

### 2. ✅ Example Templates (Safe to Commit)
- `mcp-config.example.json` - Shows structure without secrets
- `.env.example` - Shows required variables without values

### 3. ✅ Pre-commit Hooks (ADD THIS)

```bash
# Install git-secrets to prevent committing secrets
npm install --save-dev git-secrets

# Setup pre-commit hook
git secrets --install
git secrets --register-aws
git secrets --add 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'  # JWT pattern
git secrets --add 'supabase.*[0-9a-f]{40}'
```

### 4. ✅ GitHub Secret Scanning

GitHub automatically scans for exposed secrets. You should have received an email about this.

### 5. 🔄 Environment Variable Management

**For local development:**
```bash
# mcp-server/.env (gitignored)
SUPABASE_URL=https://hwclojaalnzruviubxju.supabase.co
SUPABASE_ANON_KEY=your-anon-key  # Safe - this is public
```

**For MCP config:**
```json
{
  "mcpServers": {
    "icd10-local": {
      "type": "stdio", 
      "command": "node",
      "args": ["dist/index.js"]
      // Keys loaded from .env automatically by dotenv
    }
  }
}
```

## 🚀 Recommended Migration Path

### Step 1: Switch to Anon Key (if possible)

```typescript
// mcp-server/src/index.ts
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Step 2: Update .env

```bash
# mcp-server/.env
SUPABASE_URL=https://hwclojaalnzruviubxju.supabase.co
SUPABASE_ANON_KEY=your-anon-key  # This is public - safe to use
```

### Step 3: Remove Service Role Key Dependency

Since you have RLS on all tables, the anon key should work fine. The service role key is only needed if you're doing admin operations.

### Step 4: Clean Up Config

```json
// mcp-server/mcp-config.json (can be committed now)
{
  "mcpServers": {
    "icd10-local": {
      "type": "stdio",
      "command": "node", 
      "args": ["dist/index.js"]
      // No env block needed - dotenv loads from .env
    }
  }
}
```

## 🔍 Audit Checklist

- [ ] Verify all `.env` files are in `.gitignore`
- [ ] Check no secrets in committed config files
- [ ] Use anon key instead of service role key where possible
- [ ] Install pre-commit hooks to scan for secrets
- [ ] Review GitHub security alerts
- [ ] Rotate all exposed keys
- [ ] Update all deployment environments with new keys
- [ ] Document which services need which keys
- [ ] Enable GitHub secret scanning
- [ ] Use environment variables everywhere

## 📚 Further Reading

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [git-secrets on GitHub](https://github.com/awslabs/git-secrets)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

## 🆘 If You Expose Secrets Again

1. **STOP** - Don't commit more changes
2. **ROTATE** - Change the exposed credentials immediately
3. **CLEAN** - Use `git-filter-repo` to remove from history
4. **VERIFY** - Check database logs for unauthorized access
5. **MONITOR** - Watch for suspicious activity for 48 hours
