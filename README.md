# Call_Tracker

Android call recording tracker - monitors selected directories for new audio files (call recordings).

## Features Implemented ✅

- **User-selectable storage location**: Choose from auto-detected common paths or enter custom directory
- **Android permissions handling**: Supports API levels 10-33+ with appropriate permission requests
- **File tracking**: Detects new audio files (mp3, m4a, wav, aac, amr, 3gp, opus, ogg)
- **Persistent storage**: Tracks previously seen files to avoid re-detection
- **Manual scanning**: On-demand scan with stats display

## Quick Start

```bash
# Install dependencies (already done)
npm install

# Start Metro bundler
npm start

# In another terminal, build and run on Android
npm run android
```

## First-Time Setup

1. **Grant Permissions**: App will request storage/audio permissions on launch
2. **Select Directory**: Tap "Select Directory" and choose:
   - A common recording path (auto-detected)
   - Enter a custom path manually
   - Browse and select a file from the target folder
3. **Scan**: Tap "Scan Now" to detect new recordings

## Common Recording Locations

- Samsung: `/storage/emulated/0/Call` or `/storage/emulated/0/Android/data/com.samsung.android.app.soundpicker/files/Recordings`
- Xiaomi: `/storage/emulated/0/MIUI/sound_recorder`
- OnePlus: `/storage/emulated/0/Recordings`
- Google Pixel: `/storage/emulated/0/Recorder`

## Next Steps

See [TRACKING_GUIDE.md](TRACKING_GUIDE.md) for:
- Detailed setup instructions
- Auto-scan implementation options
- S3 upload integration with Lambda (coming next)
- Privacy & compliance notes

## Project Structure

```
src/
├── types.ts                     # TypeScript interfaces
└── services/
    └── FileScanner.ts           # Core file tracking logic
Home.tsx                         # Main UI
android/app/src/main/
└── AndroidManifest.xml          # Permissions configured
```

## Built With

- React Native 0.83
- TypeScript
- react-native-fs (file system access)
- @react-native-async-storage/async-storage (persistent config)

## Testing on Device

Connect an Android device via USB with USB debugging enabled, or use an emulator, then run:

```bash
npm run android
```

Test the tracking:
1. Grant permissions when prompted
2. Select your call recording directory
3. Make a test call recording (using your device's native recorder)
4. Return to app and tap "Scan Now"
5. New recording should appear in the list

---

Original React Native setup instructions backed up to `README.original.md`
