import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecordingFile } from '../types';

const STORAGE_KEY_PREFIX = '@CallTracker:';
const SCANNED_FILES_KEY = `${STORAGE_KEY_PREFIX}scannedFiles`;
const WATCH_DIR_KEY = `${STORAGE_KEY_PREFIX}watchDirectory`;

export class FileScanner {
  private watchDirectory: string | null = null;
  private scannedFiles: Set<string> = new Set();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Load watch directory from storage
    const savedDir = await AsyncStorage.getItem(WATCH_DIR_KEY);
    if (savedDir) {
      this.watchDirectory = savedDir;
    }

    // Load previously scanned files
    const savedFiles = await AsyncStorage.getItem(SCANNED_FILES_KEY);
    if (savedFiles) {
      this.scannedFiles = new Set(JSON.parse(savedFiles));
    }

    this.isInitialized = true;
  }

  async setWatchDirectory(directory: string): Promise<void> {
    this.watchDirectory = directory;
    await AsyncStorage.setItem(WATCH_DIR_KEY, directory);
  }

  getWatchDirectory(): string | null {
    return this.watchDirectory;
  }

  async scanForNewRecordings(): Promise<RecordingFile[]> {
    if (!this.watchDirectory) {
      throw new Error('Watch directory not set');
    }

    try {
      // Check if directory exists
      const exists = await RNFS.exists(this.watchDirectory);
      if (!exists) {
        throw new Error('Watch directory does not exist');
      }

      // Read all files in directory
      const items = await RNFS.readDir(this.watchDirectory);

      // Filter for audio files
      const audioExtensions = [
        '.mp3',
        '.m4a',
        '.wav',
        '.aac',
        '.amr',
        '.3gp',
        '.opus',
        '.ogg',
      ];
      const audioFiles = items.filter(
        item =>
          !item.isDirectory() &&
          audioExtensions.some(ext => item.name.toLowerCase().endsWith(ext)),
      );

      // Find new files (not in scanned set)
      const newFiles: RecordingFile[] = [];
      const now = Date.now();

      for (const file of audioFiles) {
        if (!this.scannedFiles.has(file.path)) {
          newFiles.push({
            uri: file.path,
            name: file.name,
            size: file.size,
            mtime: file.mtime ? new Date(file.mtime).getTime() : now,
            detected: now,
          });

          // Mark as scanned
          this.scannedFiles.add(file.path);
        }
      }

      // Persist scanned files
      if (newFiles.length > 0) {
        await AsyncStorage.setItem(
          SCANNED_FILES_KEY,
          JSON.stringify(Array.from(this.scannedFiles)),
        );
      }

      return newFiles;
    } catch (error) {
      console.error('Error scanning directory:', error);
      throw error;
    }
  }

  async clearScannedHistory(): Promise<void> {
    this.scannedFiles.clear();
    await AsyncStorage.removeItem(SCANNED_FILES_KEY);
  }

  async reset(): Promise<void> {
    this.watchDirectory = null;
    this.scannedFiles.clear();
    await AsyncStorage.multiRemove([WATCH_DIR_KEY, SCANNED_FILES_KEY]);
  }
}

// Singleton instance
export const fileScanner = new FileScanner();
