# Quick Start Guide

Get the ICD-10 Mobile Assistant running in 5 minutes!

## Prerequisites

- Node.js installed (v14+)
- A Supabase account (free)
- Expo Go app on your phone (optional, for mobile testing)

## Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Click **Run**

### 3. Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your Supabase credentials
# Get these from: Supabase Dashboard > Settings > API
```

Your `.env` should look like:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Start the App

```bash
npm start
```

This will open Expo Dev Tools. You can:
- Press `w` to open in web browser
- Press `i` to open iOS simulator (macOS only)
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your phone

### 5. Create Your First Account

1. On the app, tap "Sign Up"
2. Enter an email and password (min. 6 characters)
3. Tap "Sign Up"
4. Return to login screen and sign in

### 6. Test the Features

**Search for codes:**
1. Tap the Search tab
2. Type "diabetes" or "I10"
3. Browse results

**Save favorites:**
1. Tap any code to view details
2. Tap the heart icon to save

**Build a visit note:**
1. On a code detail screen, tap "Add to Visit"
2. Go to the Visit tab
3. Add more codes
4. Tap "Copy to Clipboard"
5. Paste into your notes!

## Troubleshooting

### "Network request failed"
- Check your `.env` file has correct Supabase URL and key
- Make sure Supabase project is active
- Check your internet connection

### "No codes found"
- Verify you ran the `schema.sql` in Supabase
- Check the `icd10_codes` table has data
- Try searching without filters first

### App won't start
```bash
# Clear cache and restart
npm start -- --clear
```

### Types errors in editor
- Restart VS Code
- Run: `npm install` again
- The app should still work even with some type warnings

## Next Steps

- Add more ICD-10 codes to your database
- Customize the code categories/chapters
- Share with your team for testing
- Review the full `README.md` for more details

## Support

For detailed setup instructions, see:
- `README.md` - Full documentation
- `database/SETUP.md` - Database setup guide
- `IMPLEMENTATION_CHECKLIST.md` - Complete feature list

## Tips

💡 **Search tip**: You can search by code (e.g., "I10") or description (e.g., "hypertension")

💡 **Chapter filter**: Use the horizontal scrolling chips to filter by body system

💡 **Quick favorites**: Heart icon shows if a code is favorited

💡 **Visit notes**: Codes are formatted automatically when you copy

## Demo Account (Optional)

Create a demo account to test:
- Email: `demo@example.com`
- Password: `demo123`

Then add some favorite codes and test the visit builder!

---

**Ready to start!** 🚀

Run `npm start` and begin searching ICD-10 codes!
