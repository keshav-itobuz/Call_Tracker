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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNFS from 'react-native-fs';
import { fileScanner } from './src/services/FileScanner';
import { RecordingFile } from './src/types';
import HomeStyle from './HomeStyle';

// Default Android recording location
const DEFAULT_RECORDING_PATH = '/storage/emulated/0/Recordings';

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

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      if (apiLevel >= 33) {
        // Android 13+ - Request READ_MEDIA_AUDIO
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          {
            title: 'Audio Files Access',
            message: 'App needs access to audio files to track recordings',
            buttonPositive: 'Allow',
          },
        );
        setHasPermissions(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else if (apiLevel >= 30) {
        // Android 11+ - May need MANAGE_EXTERNAL_STORAGE for full access
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Access',
            message: 'App needs access to storage to track recordings',
            buttonPositive: 'Allow',
          },
        );
        setHasPermissions(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        // Android 10 and below
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        setHasPermissions(
          granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED,
        );
      }
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

  const scanNow = async () => {
    if (!watchDirectory) {
      Alert.alert('No Directory', 'Please select a directory to watch first');
      return;
    }

    setIsScanning(true);

    try {
      const newFiles = await fileScanner.scanForNewRecordings();
      setIsScanning(false);

      if (newFiles.length > 0) {
        setDetectedFiles(prev => [...newFiles, ...prev]);
        Alert.alert(
          'New Recordings Found',
          `Detected ${newFiles.length} new recording(s)`,
          [{ text: 'OK' }],
        );
      } else {
        Alert.alert('No New Files', 'No new recordings detected');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      setIsScanning(false);
      Alert.alert('Scan Error', error.message || 'Failed to scan directory');
    }
  };

  return (
    <SafeAreaView style={HomeStyle.container}>
      <ScrollView style={HomeStyle.scrollView}>
        <View style={HomeStyle.header}>
          <Text style={HomeStyle.title}>Call Recording Tracker</Text>
          <Text style={HomeStyle.subtitle}>
            {hasPermissions ? '✓ Permissions Granted' : '✗ Permissions Needed'}
          </Text>
        </View>

        {/* Directory Selection */}
        <View style={HomeStyle.section}>
          <Text style={HomeStyle.sectionTitle}>Watch Directory</Text>
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

        {/* Scan Controls */}
        <View style={HomeStyle.section}>
          <Text style={HomeStyle.sectionTitle}>Scan Controls</Text>
          <TouchableOpacity
            style={[HomeStyle.button, HomeStyle.scanButton]}
            onPress={scanNow}
            disabled={!watchDirectory || isScanning}
          >
            <Text style={HomeStyle.buttonText}>
              {isScanning ? 'Scanning...' : 'Scan Now'}
            </Text>
          </TouchableOpacity>
        </View>
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
