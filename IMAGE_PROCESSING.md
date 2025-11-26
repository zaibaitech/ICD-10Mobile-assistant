# Image Processing Feature

## Overview
The ICD-10 Mobile Assistant now supports medical image attachments for enhanced clinical documentation.

## Features Implemented

### 1. Image Capture & Selection
- **Camera Access**: Take photos directly from the device camera
- **Gallery Access**: Select existing images from photo library
- **Permissions Handling**: Automatic permission requests for camera and media library

### 2. Image Upload to Supabase Storage
- Secure upload to Supabase Storage bucket
- Automatic file naming with user ID and timestamp
- Support for multiple image formats (JPEG, PNG, WebP, GIF)
- Base64 encoding for reliable transfer

### 3. Image Display in Chat
- Images displayed inline with chat messages
- Preview before sending
- Ability to remove images before sending
- Clean UI integration with existing chat interface

### 4. Vision AI Integration (Placeholder)
- Framework ready for GPT-4 Vision or similar AI services
- Placeholder function `analyzeImageWithAI()` for future implementation
- Context-aware suggestions based on image content

## Setup Instructions

### 1. Configure Supabase Storage
Run the SQL script to create the storage bucket and configure permissions:

```sql
-- Run this in Supabase SQL Editor
-- File: database/storage_setup.sql
```

This will:
- Create a public storage bucket named `medical-images`
- Set up Row Level Security (RLS) policies
- Allow users to upload/read/delete their own images
- Enable public read access (optional)

### 2. Install Dependencies
Already installed:
- `expo-image-picker` - Image selection and camera access
- `expo-file-system` - File handling
- `base64-arraybuffer` - Base64 conversion

### 3. Test the Feature
1. Navigate to the Assistant screen
2. Tap the camera icon in the chat input
3. Choose "Take Photo" or "Choose from Gallery"
4. Grant necessary permissions
5. Select/capture an image
6. Image will appear in the pending area
7. Type a message and send (image will be uploaded automatically)

## File Structure

```
src/
├── components/
│   ├── ChatInput.tsx          # Added image picker button
│   ├── ChatMessage.tsx         # Added image display
│   └── ImageAttachment.tsx     # Image preview component
├── services/
│   ├── storage.ts             # NEW: Image upload/delete functions
│   └── assistant.ts           # Updated: Vision AI placeholder
├── types/
│   └── index.ts               # Updated: Added imageUrl to ChatMessage
└── i18n/
    └── locales/
        ├── en.json            # Added image-related translations
        └── fr.json            # Added image-related translations

database/
└── storage_setup.sql          # NEW: Supabase storage configuration
```

## API Integration (Future)

### GPT-4 Vision Integration
To enable actual AI vision analysis, update `analyzeImageWithAI()` in `src/services/assistant.ts`:

```typescript
export const analyzeImageWithAI = async (imageUrl: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [{
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'Analyze this medical image and suggest relevant ICD-10 codes for documentation purposes only. Do not provide medical diagnoses.' 
          },
          { 
            type: 'image_url', 
            image_url: { url: imageUrl } 
          }
        ]
      }],
      max_tokens: 500
    })
  });
  
  const data = await response.json();
  return {
    description: data.choices[0].message.content,
    suggestedCodes: parseCodesFromResponse(data.choices[0].message.content)
  };
};
```

### Environment Variables
Add to `.env`:
```
EXPO_PUBLIC_OPENAI_KEY=your_openai_api_key_here
```

## Security Considerations

1. **Row Level Security**: Users can only access their own images
2. **File Size Limits**: Consider adding file size validation (recommended max 5MB)
3. **HIPAA Compliance**: Ensure Supabase project is configured for healthcare compliance if handling real patient data
4. **Image Compression**: Currently using 0.8 quality - adjust as needed

## Troubleshooting

### "Permission Denied" Errors
- Ensure iOS Info.plist has camera and photo library usage descriptions
- On Android, ensure permissions are declared in AndroidManifest.xml
- User may need to manually enable permissions in device settings

### Upload Failures
- Check Supabase Storage bucket exists and is named `medical-images`
- Verify RLS policies are correctly configured
- Ensure user is authenticated
- Check network connectivity

### Images Not Displaying
- Verify the storage bucket is set to public
- Check that the public URL is correctly generated
- Ensure the image format is supported

## Performance Tips

1. **Image Compression**: Adjust quality parameter in `launchImageLibraryAsync` (currently 0.8)
2. **Lazy Loading**: Images are loaded on-demand in chat
3. **Caching**: Consider implementing image caching for better performance
4. **Batch Uploads**: If implementing multiple images, use batch upload strategies

## Next Steps

1. ✅ Basic image upload/display - COMPLETE
2. ⏳ Integrate real AI vision API (GPT-4 Vision, Azure Computer Vision, etc.)
3. ⏳ Add image tagging (wound, rash, swelling, etc.)
4. ⏳ Implement image gallery view
5. ⏳ Add image editing/annotation capabilities
6. ⏳ Implement image compression optimization
7. ⏳ Add support for multiple images per message

## License
Part of the ICD-10 Mobile Assistant project.
