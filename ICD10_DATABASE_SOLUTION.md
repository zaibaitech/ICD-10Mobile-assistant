# Quick ICD-10 Database Access Guide

## Problem
Importing 71,703 ICD-10 codes into Supabase is impractical and unnecessary.

## Solution: Use Free APIs Instead

### ✅ Recommended: NIH Clinical Tables API

**Why?**
- 100% FREE, unlimited requests
- Official U.S. government data (CDC/NIH)
- Always up-to-date
- No database setup required
- Auto-complete search built-in
- Works offline with caching

**Implementation:**
Use the new `src/services/icd10-api.ts` file instead of Supabase queries.

## Setup Instructions (5 minutes)

### 1. Replace Supabase Service

The app now has two ICD-10 services:
- `src/services/icd10.ts` - OLD (Supabase-based)
- `src/services/icd10-api.ts` - NEW (API-based) ✅

### 2. Update Screens to Use API

Replace imports in these files:
```typescript
// OLD
import { searchIcd10Codes } from '../services/icd10';

// NEW
import { searchIcd10Codes } from '../services/icd10-api';
```

Files to update:
- `src/screens/Icd10SearchScreen.tsx`
- `src/screens/Icd10DetailScreen.tsx`
- `src/screens/FavoritesScreen.tsx`

### 3. Test the API

```bash
# Install dependencies (already done)
npm install

# Start the app
npm start
```

Search for any ICD-10 code:
- "diabetes" → Returns E11.9, E10.9, etc.
- "I10" → Returns hypertension codes
- "fracture" → Returns injury codes

## API Details

### Endpoint
```
https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search
```

### Features
- ✅ 71,703+ codes (full ICD-10-CM)
- ✅ Fast autocomplete
- ✅ No API key required
- ✅ No rate limits
- ✅ Official CDC data
- ✅ Updated annually

### Response Format
```json
[
  3,           // Total count
  ["E11.9", "E11.65", "E10.9"],  // Codes
  null,        // Extra data
  [            // Descriptions
    "Type 2 diabetes mellitus without complications",
    "Type 2 diabetes mellitus with hyperglycemia",
    "Type 1 diabetes mellitus without complications"
  ]
]
```

## Offline Support

The new service automatically caches results:
- **Cache duration**: 7 days
- **Storage**: React Native AsyncStorage
- **Fallback**: Returns cached data if API fails

Clear cache:
```typescript
import { clearIcd10Cache } from '../services/icd10-api';
await clearIcd10Cache();
```

## Alternative APIs (Backup Options)

### Option 1: ICD-API.com
```typescript
const response = await fetch(
  `https://icd-api.com/api/icd10?s=${query}`,
  { headers: { 'API-Key': 'your-free-key' } }
);
```
- Free tier: 10,000 requests/month
- Requires registration

### Option 2: WHO ICD API
```typescript
const response = await fetch(
  `https://id.who.int/icd/release/10/2019/${code}`,
  { headers: { 
    'API-Version': 'v2',
    'Authorization': 'Bearer YOUR_TOKEN'
  }}
);
```
- Free, official WHO data
- Requires OAuth token

### Option 3: npm Package (Offline-First)
```bash
npm install icd-10-cm
```

```typescript
import ICD10 from 'icd-10-cm';

const results = ICD10.search('diabetes');
// No internet required!
```

## Database Table Updates

### Keep Supabase for User Data Only

**Remove**: `icd10_codes` table (too large, hard to maintain)

**Keep**:
- `user_favorites` → Store favorite codes (code as string, not FK)
- `patients` → Patient records
- `encounters` → Clinical encounters
- `encounter_icd10_codes` → Link codes to encounters (code as string)

### Schema Changes

```sql
-- Update user_favorites to store code as string
ALTER TABLE user_favorites 
  DROP CONSTRAINT user_favorites_icd10_id_fkey,
  RENAME COLUMN icd10_id TO icd10_code,
  ALTER COLUMN icd10_code TYPE TEXT;

-- Update to store code strings instead of UUIDs
ALTER TABLE encounter_icd10_codes
  DROP CONSTRAINT encounter_icd10_codes_icd10_id_fkey,
  RENAME COLUMN icd10_id TO icd10_code,
  ALTER COLUMN icd10_code TYPE TEXT;
```

## Benefits of API Approach

| Factor | Supabase DB | API + Cache |
|--------|-------------|-------------|
| Setup time | Hours | 5 minutes |
| Data freshness | Manual updates | Always current |
| Storage used | ~100MB | ~1MB |
| Search speed | Fast | Fast |
| Offline support | Full | Last 7 days |
| Maintenance | Manual | None |
| Cost | Free tier limits | Unlimited free |

## Migration Path

### Phase 1 (Now): API-First
1. Use `icd10-api.ts` for all searches
2. Keep Supabase for favorites/encounters
3. Store codes as strings, not IDs

### Phase 2 (Optional): Hybrid
1. Cache popular codes locally
2. Use API for rare codes
3. Best of both worlds

### Phase 3 (If Needed): Full Offline
1. Bundle common codes (~500) in app
2. Download full dataset on-demand
3. Use SQLite for local storage

## Testing Checklist

- [ ] Search works: Try "diabetes", "hypertension", "fracture"
- [ ] Details load: Click on a code
- [ ] Favorites save: Add to favorites (stores code string)
- [ ] Offline works: Turn off internet, search cached term
- [ ] Cache clears: Test cache expiration

## Next Steps

1. ✅ API service created (`icd10-api.ts`)
2. ⏳ Update screen imports (5 min)
3. ⏳ Update database schema (remove FK constraints)
4. ⏳ Test search functionality
5. ⏳ Deploy and verify

**Result**: Full ICD-10 database access without maintaining 71,703 records!

## Support

**API Documentation**: https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html

**Questions?** The NIH API is public and free. No signup, no limits, no cost.
