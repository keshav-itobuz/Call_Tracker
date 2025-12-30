import { StyleSheet } from 'react-native';

const HomeStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#059669',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  directoryText: {
    marginTop: 12,
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  clearButton: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  fileCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  browseButton: {
    backgroundColor: '#7c3aed',
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  pathDisplay: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pathDisplayText: {
    fontSize: 12,
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  browserNav: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: '#059669',
  },
  folderList: {
    maxHeight: 300,
  },
  folderItem: {
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
  },
  folderText: {
    fontSize: 14,
    color: '#1f2937',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 16,
    marginBottom: 8,
  },
  pathList: {
    maxHeight: 200,
  },
  pathItem: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  pathText: {
    fontSize: 13,
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  pathInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: '#1f2937',
    fontFamily: 'monospace',
    marginBottom: 12,
    minHeight: 44,
  },
  setPathButton: {
    backgroundColor: '#059669',
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
});

export default HomeStyle;
