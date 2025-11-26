# ICD-10 Mobile Assistant MVP

A mobile app for healthcare professionals to search, save, and use ICD-10 diagnosis codes in visit documentation.

**⚠️ This is a documentation tool, NOT a medical decision or diagnosis tool.**

## Features

- 🔐 **Authentication**: Email/password signup and login with Supabase Auth
- 🔍 **ICD-10 Search**: Search codes by code or description with chapter filtering
- ⭐ **Favorites**: Save frequently used codes for quick access
- 📝 **Visit Note Builder**: Build and copy formatted diagnosis notes to clipboard
- 📱 **Mobile-First**: Built with React Native and Expo for iOS and Android

## Tech Stack

- **Frontend**: React Native, TypeScript, Expo
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React Context
- **Navigation**: React Navigation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier available at [supabase.com](https://supabase.com))

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd /workspaces/ICD-10Mobile-assistant
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `database/schema.sql`
3. Get your project credentials from **Settings > API**:
   - Project URL
   - Anon/Public Key

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the App

```bash
# Start Expo development server
npm start

# Or run on specific platforms
npm run android
npm run ios
npm run web
```

## Project Structure

```
/src
├── /components          # Reusable UI components
│   ├── SearchBar.tsx
│   ├── Icd10ListItem.tsx
│   ├── ChapterFilter.tsx
│   └── VisitCodeItem.tsx
├── /screens            # Screen components
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── Icd10SearchScreen.tsx
│   ├── Icd10DetailScreen.tsx
│   ├── FavoritesScreen.tsx
│   └── VisitNoteScreen.tsx
├── /services           # API and business logic
│   ├── supabase.ts
│   ├── auth.ts
│   ├── icd10.ts
│   └── favorites.ts
├── /context            # React Context providers
│   ├── AuthContext.tsx
│   └── VisitContext.tsx
├── /navigation         # Navigation configuration
│   └── AppNavigator.tsx
└── /types              # TypeScript type definitions
    └── index.ts
```

## Database Schema

The app uses two main tables in Supabase:

### `icd10_codes`
- Stores all ICD-10 diagnosis codes
- Indexed for fast search by code and description

### `user_favorites`
- Links users to their favorite codes
- Row Level Security (RLS) enabled for user privacy

See `database/schema.sql` for full schema and seed data.

## Usage

1. **Sign Up/Login**: Create an account or sign in
2. **Search Codes**: Use the search tab to find ICD-10 codes
3. **Add Favorites**: Tap the heart icon on any code
4. **Build Visit Notes**: Add codes to the current visit
5. **Copy Notes**: Copy formatted diagnosis list to clipboard

## Visit Note Format

```
Diagnoses:
• I10 - Essential hypertension
• E11.9 - Type 2 diabetes
• J06.9 - Upper respiratory infection
```

## Future Phases (Not in MVP)

- **Phase 2**: Voice-to-text input, image attachments
- **Phase 3**: AI-assisted code suggestions
- **Phase 4**: Full patient visit management, EHR integration

## Development Notes

- Uses TypeScript strictly (no `any` types)
- Components are small and reusable
- `// TODO: Phase 2` comments mark future feature locations
- All database queries use Supabase client with RLS

## Testing

Test on both iOS and Android simulators/devices:

```bash
# iOS (requires macOS)
npm run ios

# Android
npm run android

# Web (for quick testing)
npm run web
```

## License

MIT License - See LICENSE file for details

## Disclaimer

**This is a documentation tool for healthcare professionals. It is NOT intended for medical diagnosis or clinical decision-making. Always consult appropriate medical resources and follow institutional guidelines.**
