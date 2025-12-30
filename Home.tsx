import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
  Modal,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNFS from 'react-native-fs';
import { fileScanner } from './src/services/FileScanner';
import { RecordingFile } from './src/types';
import HomeStyle from './HomeStyle';

// Default Android recording location
const DEFAULT_RECORDING_PATH = '/storage/emulated/0/Recordings';

const { CallDetectionModule } = NativeModules;

export function Home() {
  const [watchDirectory, setWatchDirectory] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedFiles, setDetectedFiles] = useState<RecordingFile[]>([]);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [showPathModal, setShowPathModal] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [currentBrowserPath, setCurrentBrowserPath] = useState(
    '/storage/emulated/0',
  );
  const [browserFolders, setBrowserFolders] = useState<string[]>([]);
  const [lastCallEndTime, setLastCallEndTime] = useState<number>(0);

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android' || !CallDetectionModule) return;

    const eventEmitter = new NativeEventEmitter(CallDetectionModule);
    const subscription = eventEmitter.addListener('CallEnded', () => {
      console.log('Call ended, scanning for recordings...');
      setLastCallEndTime(Date.now());
      setTimeout(() => {
        scanForRecordings();
      }, 2000);
    });

    CallDetectionModule.startListening();

    return () => {
      subscription.remove();
      CallDetectionModule.stopListening();
    };
  }, [watchDirectory]);

  const initializeApp = async () => {
    // Request permissions
    await requestStoragePermissions();

    // Initialize scanner
    await fileScanner.initialize();
    let dir = fileScanner.getWatchDirectory();

    // Set default path if none exists
    if (!dir) {
      dir = DEFAULT_RECORDING_PATH;
      await fileScanner.setWatchDirectory(dir);
    }

    setWatchDirectory(dir);
  };

  const requestStoragePermissions = async () => {
    if (Platform.OS !== 'android') {
      setHasPermissions(true);
      return;
    }

    try {
      const apiLevel = Platform.Version;
      const permissions: Array<
        (typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS]
      > = [PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE];

      if (apiLevel >= 33) {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO);
      } else {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        if (apiLevel < 30) {
          permissions.push(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
        }
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const hasStoragePermission =
        apiLevel >= 33
          ? granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO] ===
            PermissionsAndroid.RESULTS.GRANTED
          : granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED;

      const hasPhonePermission =
        granted[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] ===
        PermissionsAndroid.RESULTS.GRANTED;

      setHasPermissions(hasStoragePermission && hasPhonePermission);
    } catch (err) {
      console.error('Permission error:', err);
      setHasPermissions(false);
    }
  };

  const selectDirectory = async () => {
    if (!hasPermissions) {
      Alert.alert(
        'Permission Required',
        'Please grant storage permissions to select a directory',
        [
          {
            text: 'Request',
            onPress: () => {
              requestStoragePermissions();
            },
          },
        ],
      );
      return;
    }

    setShowPathModal(true);
  };

  const openBrowser = async () => {
    setShowBrowser(true);
    await loadBrowserFolders('/storage/emulated/0');
  };

  const loadBrowserFolders = async (path: string) => {
    try {
      const items = await RNFS.readDir(path);
      const folders = items
        .filter(item => item.isDirectory())
        .map(item => item.name)
        .sort((a, b) => a.localeCompare(b));
      setBrowserFolders(folders);
      setCurrentBrowserPath(path);
    } catch (error) {
      Alert.alert('Error', 'Cannot access this directory');
      console.error('Browser error:', error);
    }
  };

  const navigateToFolder = async (folderName: string) => {
    const newPath = `${currentBrowserPath}/${folderName}`;
    await loadBrowserFolders(newPath);
  };

  const navigateUp = async () => {
    const parentPath = currentBrowserPath.substring(
      0,
      currentBrowserPath.lastIndexOf('/'),
    );
    if (parentPath) {
      await loadBrowserFolders(parentPath);
    }
  };

  const selectBrowserPath = async () => {
    try {
      await fileScanner.setWatchDirectory(currentBrowserPath);
      setWatchDirectory(currentBrowserPath);
      setShowBrowser(false);
      setShowPathModal(false);
      Alert.alert('Success', `Now watching: ${currentBrowserPath}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to set directory');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const scanForRecordings = async () => {
    if (!watchDirectory) {
      console.log('No watch directory set');
      return;
    }

    if (isScanning) {
      console.log('Already scanning, skipping...');
      return;
    }

    setIsScanning(true);

    try {
      const newFiles = await fileScanner.scanForNewRecordings();
      setIsScanning(false);

      if (newFiles.length > 0) {
        setDetectedFiles(prev => [...newFiles, ...prev]);
        Alert.alert(
          'Recording Detected',
          `Found ${newFiles.length} new recording(s) after call`,
          [{ text: 'OK' }],
        );
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      setIsScanning(false);
    }
  };

  return (
    <SafeAreaView style={HomeStyle.container}>
      <ScrollView style={HomeStyle.scrollView}>
        <View style={HomeStyle.header}>
          <Text style={HomeStyle.title}>Call Recording Tracker</Text>
          <Text style={HomeStyle.subtitle}>
            {hasPermissions ? '✓ Auto-Tracking Active' : '✗ Permissions Needed'}
          </Text>
          {lastCallEndTime > 0 && (
            <Text style={HomeStyle.subtitle}>
              Last checked: {new Date(lastCallEndTime).toLocaleTimeString()}
            </Text>
          )}
        </View>

        {/* Directory Selection */}
        <View style={HomeStyle.section}>
          <Text style={HomeStyle.sectionTitle}>Watch Directory</Text>
          <Text style={HomeStyle.infoText}>
            Automatically scans for recordings after each call
          </Text>
          <TouchableOpacity
            style={HomeStyle.button}
            onPress={selectDirectory}
            disabled={!hasPermissions}
          >
            <Text style={HomeStyle.buttonText}>
              {watchDirectory ? 'Change Directory' : 'Select Directory'}
            </Text>
          </TouchableOpacity>
          {watchDirectory && (
            <Text style={HomeStyle.directoryText} numberOfLines={2}>
              📁 {watchDirectory}
            </Text>
          )}
        </View>

        {/* Recently Detected Recordings */}
        {detectedFiles.length > 0 && (
          <View style={HomeStyle.section}>
            <View style={HomeStyle.sectionHeader}>
              <Text style={HomeStyle.sectionTitle}>
                Recent Recordings ({detectedFiles.length})
              </Text>
              <TouchableOpacity onPress={() => setDetectedFiles([])}>
                <Text style={HomeStyle.clearButton}>Clear</Text>
              </TouchableOpacity>
            </View>
            {detectedFiles.slice(0, 5).map((file, index) => (
              <View key={`${file.uri}-${index}`} style={HomeStyle.fileCard}>
                <Text style={HomeStyle.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={HomeStyle.fileDetails}>
                  Size: {formatFileSize(file.size)}
                </Text>
                <Text style={HomeStyle.fileDetails}>
                  Detected: {formatTime(file.detected)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Directory Selection Modal */}
      <Modal
        visible={showPathModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPathModal(false)}
      >
        <View style={HomeStyle.modalOverlay}>
          <View style={HomeStyle.modalContent}>
            <Text style={HomeStyle.modalTitle}>Select Recording Directory</Text>

            <Text style={HomeStyle.infoText}>
              Current: {watchDirectory || 'Not set'}
            </Text>

            {/* Browse Folders */}
            <Text style={HomeStyle.modalSectionTitle}>Browse Folders:</Text>
            <TouchableOpacity
              style={[HomeStyle.button, HomeStyle.browseButton]}
              onPress={openBrowser}
            >
              <Text style={HomeStyle.buttonText}>📂 Browse Folders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBrowser}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBrowser(false)}
      >
        <View style={HomeStyle.modalOverlay}>
          <View style={HomeStyle.modalContent}>
            <Text style={HomeStyle.modalTitle}>Browse Folders</Text>

            {/* Current Path Display */}
            <View style={HomeStyle.pathDisplay}>
              <Text style={HomeStyle.pathDisplayText} numberOfLines={2}>
                📁 {currentBrowserPath}
              </Text>
            </View>

            {/* Navigation Buttons */}
            <View style={HomeStyle.browserNav}>
              <TouchableOpacity
                style={HomeStyle.navButton}
                onPress={navigateUp}
                disabled={
                  currentBrowserPath === '/storage/emulated/0' ||
                  currentBrowserPath === '/storage'
                }
              >
                <Text style={HomeStyle.navButtonText}>⬆️ Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[HomeStyle.navButton, HomeStyle.selectButton]}
                onPress={selectBrowserPath}
              >
                <Text style={HomeStyle.buttonText}>✓ Select This Folder</Text>
              </TouchableOpacity>
            </View>

            {/* Folder List */}
            <ScrollView style={HomeStyle.folderList}>
              {browserFolders.map(folder => (
                <TouchableOpacity
                  key={folder}
                  style={HomeStyle.folderItem}
                  onPress={() => navigateToFolder(folder)}
                >
                  <Text style={HomeStyle.folderText}>📁 {folder}</Text>
                </TouchableOpacity>
              ))}
              {browserFolders.length === 0 && (
                <Text style={HomeStyle.emptyText}>
                  No folders in this directory
                </Text>
              )}
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              style={HomeStyle.closeButton}
              onPress={() => setShowBrowser(false)}
            >
              <Text style={HomeStyle.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
