# Call Recording Tracker - Setup Guide

## Android-Only Implementation

This app tracks new call recordings saved on your Android device by monitoring a user-selected directory.

## Features Implemented

✅ **Directory Selection**

- Auto-detect common recording paths on device
- Manual path input with validation
- File browser to navigate to any directory

✅ **File Tracking**

- Scans selected directory for audio files (.mp3, .m4a, .wav, .aac, .amr, .3gp, .opus, .ogg)
- Tracks new files only (doesn't re-detect previously seen files)
- Displays file details (name, size, detection time)
- Persistent storage of scan history

✅ **Permissions Handling**

- Android 13+ (API 33): READ_MEDIA_AUDIO
- Android 11-12 (API 30-32): READ_EXTERNAL_STORAGE
- Android 10 and below: READ/WRITE_EXTERNAL_STORAGE

## Setup Instructions

### 1. Install Dependencies (Already Done)

```bash
npm install react-native-fs react-native-document-picker @react-native-async-storage/async-storage react-native-permissions
```

### 2. Build & Run on Android

```bash
# Start Metro bundler
npm start

# In another terminal, build and run on Android device/emulator
npm run android
```

### 3. Grant Permissions

On first launch:

1. App will request storage/audio permissions
2. Grant the permissions when prompted
3. For Android 11+, you may need to enable "All files access" in Settings for full functionality

### 4. Select Recording Directory

**Option A: Use Common Paths (Recommended)**

1. Tap "Select Directory"
2. Choose from auto-detected recording folders
3. Common paths checked:
   - `/storage/emulated/0/Recordings`
   - `/storage/emulated/0/Call Recordings`
   - `/storage/emulated/0/MIUI/sound_recorder` (Xiaomi)
   - `/storage/emulated/0/Recorder`
   - `/storage/emulated/0/Voice Recorder`
   - And more...

**Option B: Enter Custom Path**

1. Tap "Select Directory"
2. Enter full path manually (e.g., `/storage/emulated/0/MyRecordings`)
3. Or tap "Browse" to navigate and select a file from that folder

**Option C: Use File Browser**

1. Tap "Select Directory" → "Browse"
2. Navigate to your recording folder
3. Select any file in that folder
4. App will extract the directory path

### 5. Start Tracking

1. Tap "Scan Now" to check for new recordings
2. New files will appear in the "Detected Files" list
3. Scan manually whenever needed, or implement auto-scan (see below)

## Common Recording Locations by Device

- **Samsung**: `/storage/emulated/0/Call` or `/storage/emulated/0/Android/data/com.samsung.android.app.soundpicker/files/Recordings`
- **Xiaomi/MIUI**: `/storage/emulated/0/MIUI/sound_recorder`
- **OnePlus**: `/storage/emulated/0/Recordings`
- **Google Pixel**: `/storage/emulated/0/Recorder`
- **Truecaller**: `/storage/emulated/0/truecaller/voices`

## Testing the Tracker

1. **Manual Test**:

   - Open your phone's call recorder app
   - Make/record a test call
   - Return to Call Tracker app
   - Tap "Scan Now"
   - New recording should appear in the list

2. **Verify Permissions**:
   - Check that "✓ Permissions Granted" shows in the header
   - If not, tap the status to request permissions again

## Troubleshooting

### "Directory does not exist" error

- Verify the path is correct
- Check if the folder has been created by your recording app
- Try browsing to the folder using a file manager app first

### No files detected

- Ensure you selected the correct directory where recordings are saved
- Check that your recording app actually saves files (some only save to cloud)
- Tap "Clear" to reset tracking history and rescan

### Permission denied

- Go to Settings → Apps → Call_Tracker → Permissions
- Grant "Files and media" or "Storage" permission
- For Android 11+, may need "All files access" from Special app access

### Files detected multiple times

- This shouldn't happen unless you tap "Clear" to reset history
- The app tracks previously seen files in AsyncStorage

## Next Steps: Auto-Scanning

To add automatic background scanning (not yet implemented):

1. **Option A: Foreground Service**

   - Use `react-native-background-actions` or similar
   - Run scan every 30-60 seconds while service is active
   - Requires foreground notification

2. **Option B: WorkManager (Recommended)**

   - Use native Android WorkManager via custom module
   - Schedule periodic scans (minimum 15 minutes)
   - More battery efficient

3. **Option C: File Observer**
   - Create native Android module using `FileObserver`
   - Real-time detection when files are created
   - Most reliable but requires native code

## File Structure

```
src/
├── types.ts                 # TypeScript interfaces
└── services/
    └── FileScanner.ts       # Core scanning logic
Home.tsx                     # Main UI component
android/
└── app/
    └── src/main/
        └── AndroidManifest.xml  # Permissions configured
```

## Technical Notes

- **Storage**: Uses `@react-native-async-storage/async-storage` to persist:
  - Selected watch directory
  - Set of previously scanned file paths
- **File System**: Uses `react-native-fs` for directory reading and file stat operations
- **Permissions**: Handles different Android API levels (10-13+) appropriately
- **iOS**: Not implemented (iOS restricts call recording and file access)

## Privacy & Compliance

⚠️ **Important**: Call recording laws vary by location

- Inform users about data collection
- Only upload recordings with explicit user consent
- Consider per-file upload confirmation
- Implement clear privacy policy
- Check local recording consent laws (one-party vs two-party consent)

---

**Status**: ✅ Tracking system fully implemented and ready to test on Android device
**Next**: Integrate S3 upload with Lambda (Lambda function + presigned URL flow)
