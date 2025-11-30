# 🚨 SECURITY INCIDENT REPORT

## ⚠️ INCIDENT #2 - November 30, 2025

**Date**: November 30, 2025
**Severity**: CRITICAL
**Status**: ✅ RESOLVED

### Issue
Supabase service role key was exposed in `mcp-server/mcp-config.json` and **committed to git repository**

### Exposed Credentials
- **File**: `mcp-server/mcp-config.json`
- **Supabase URL**: `https://hwclojaalnzruviubxju.supabase.co`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (ROTATED)

### Actions Taken
✅ Added `mcp-server/mcp-config.json` to `.gitignore`
✅ Removed file from git cache with `git rm --cached`
✅ Created `mcp-config.example.json` template without secrets
✅ Rotated Supabase service role key (user confirmed)
✅ Implemented pre-commit hook to prevent future incidents
✅ Updated MCP server to prefer ANON key over SERVICE_ROLE key
✅ Created security best practices documentation
✅ Created safe setup script (`setup-mcp-secure.sh`)

### Prevention Measures Implemented

#### 1. Pre-commit Hook
- Automatically scans for secrets before each commit
- Blocks commits containing JWT tokens, API keys, or sensitive files
- Located at `.git/hooks/pre-commit`

#### 2. Updated MCP Server Architecture
- Now prefers `SUPABASE_ANON_KEY` (safe - public key with RLS)
- Falls back to `SUPABASE_SERVICE_ROLE_KEY` only if needed
- Logs which key type is being used

#### 3. Safe Configuration Pattern
- Secrets in `.env` file (gitignored)
- Config files reference env vars, not literal values
- Example files show structure without secrets

#### 4. Documentation
- `SECURITY_BEST_PRACTICES.md` - Comprehensive security guide
- Explains when you need service role key vs anon key
- Setup instructions for secure configuration

### Recommended Next Steps

✅ **COMPLETED**: Keys rotated
✅ **COMPLETED**: Prevention measures implemented
⏳ **TODO**: Run secure setup script
⏳ **TODO**: Switch to ANON key (recommended)
⏳ **TODO**: Review database logs for unauthorized access
⏳ **TODO**: Clean git history (if needed)

### Switching to ANON Key (Recommended)

Since your database has Row Level Security (RLS) enabled, you can safely use the ANON key:

```bash
# Run the secure setup script
./setup-mcp-secure.sh

# Choose option 1 (ANON KEY) when prompted
```

**Benefits:**
- Anon key is public - safe even if exposed
- RLS policies protect your data
- Proper user context for queries
- No risk of admin access abuse

### ⚠️ STATUS: PUBLICLY EXPOSED ON GITHUB

**Confirmed**: The file was pushed to GitHub in commit `6950a2e`
**Risk Level**: MAXIMUM - Service role key is publicly accessible to anyone

### 🚨 IMMEDIATE ACTIONS REQUIRED (DO NOW)

#### 1. ⚠️ ROTATE SUPABASE KEYS IMMEDIATELY (CRITICAL - DO FIRST)
Your database is currently vulnerable to unauthorized access. **Stop everything and do this now:**

1. Open: https://supabase.com/dashboard/project/hwclojaalnzruviubxju/settings/api
2. Click **"Reset service_role secret"** button
3. **COPY THE NEW KEY** immediately
4. Update `mcp-server/mcp-config.json` with new key
5. Update any deployment configs (Vercel, etc.)

**Time is critical** - anyone with the exposed key has full admin access to your database.

#### 2. Review Database for Unauthorized Access
```bash
# Check Supabase logs IMMEDIATELY for suspicious activity
# Look for: unexpected queries, data exports, user creation, table drops
```
1. Go to: https://supabase.com/dashboard/project/hwclojaalnzruviubxju/logs/explorer
2. Filter: `timestamp > '2025-11-27'` (when file was committed)
3. Look for unauthorized queries, especially DROP, DELETE, or SELECT on sensitive tables

#### 3. Clean Git History (After Rotating Keys)
**Only do this AFTER rotating keys** - otherwise the new key will be exposed too.

```bash
# Option 1: Using git-filter-repo (recommended)
pip install git-filter-repo
git filter-repo --path mcp-server/mcp-config.json --invert-paths

# Option 2: Using BFG Repo Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files mcp-config.json

# After cleaning, force push
git push origin --force --all
git push origin --force --tags
```

#### 4. Monitor for Compromise
- [ ] Check for unexpected database changes
- [ ] Review all user accounts in Supabase Auth
- [ ] Check for new API keys or service roles created
- [ ] Monitor database size for unexpected growth
- [ ] Review storage buckets for unauthorized uploads
- [ ] Check RLS policies haven't been disabled

---

## INCIDENT #1 - November 27, 2025

**Date**: November 27, 2025
**Severity**: HIGH
**Status**: MITIGATED

### Issue
Supabase service role key was exposed in `.vscode/settings.json` (potentially committed to git)

## Exposed Credentials
- **Supabase URL**: `https://hwclojaalnzruviubxju.supabase.co`
- **Service Role Key**: Full admin access to database

## Actions Taken

### 1. ✅ Removed Credentials from Settings
- Updated `.vscode/settings.json` to use environment variables
- Created `.vscode/settings.local.json` with actual credentials (gitignored)

### 2. ✅ Updated .gitignore
Added:
```
.env
.env.local
.vscode/settings.local.json
**/.supabase/
*.key
*.pem
```

## URGENT: Next Steps Required

### 1. Rotate Supabase Keys (DO THIS NOW)
1. Go to: https://supabase.com/dashboard/project/hwclojaalnzruviubxju/settings/api
2. Click "Reset service_role secret" button
3. Copy the NEW service role key
4. Update `.vscode/settings.local.json` with new key
5. Update `mcp-server/.env` with new key

### 2. Check Git History
```bash
# Check if file was ever committed
git log --all --full-history -- ".vscode/settings.json"

# If it shows commits, you MUST rotate keys immediately
```

### 3. Review Database Access Logs
1. Go to: https://supabase.com/dashboard/project/hwclojaalnzruviubxju/logs/explorer
2. Check for any suspicious queries or access patterns
3. Filter by: `timestamp > now() - interval '7 days'`

### 4. If Pushed to GitHub
If this was pushed to public GitHub:
```bash
# Check remote repository
git log origin/main -- ".vscode/settings.json"

# If exposed, you MUST:
# 1. Rotate keys IMMEDIATELY
# 2. Use BFG Repo Cleaner to remove from history
# 3. Force push cleaned history
# 4. Notify GitHub Security
```

## Prevention Measures (Implemented)

✅ Environment variables instead of hardcoded secrets
✅ `.local.json` pattern for local-only config
✅ Updated .gitignore to prevent future leaks
✅ Separate config files for development

## Files Modified
- `.vscode/settings.json` - Cleaned (uses env vars)
- `.vscode/settings.local.json` - Created (has actual keys, gitignored)
- `.gitignore` - Updated with security patterns

## Risk Assessment
- **If not pushed to GitHub**: LOW (local only, fix applied)
- **If pushed to public GitHub**: CRITICAL (rotate keys now)

## Recovery Checklist
- [ ] Rotate Supabase service role key
- [ ] Update local config with new key
- [ ] Check git history for exposure
- [ ] Review database logs for unauthorized access
- [ ] Monitor for unusual activity next 48 hours
- [ ] Update any deployment configs (Vercel, etc.)

## Contact
If you see ANY suspicious database activity, contact Supabase support immediately.
