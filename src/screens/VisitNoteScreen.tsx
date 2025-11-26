import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { VisitCodeItem } from '../components/VisitCodeItem';
import { useVisit } from '../context/VisitContext';

export const VisitNoteScreen: React.FC = () => {
  const { visitCodes, removeCodeFromVisit, clearVisit } = useVisit();

  const formatVisitNote = (): string => {
    if (visitCodes.length === 0) {
      return 'No diagnoses added to current visit';
    }

    let note = 'Diagnoses:\n';
    visitCodes.forEach((code) => {
      note += `• ${code.code} - ${code.short_title}\n`;
    });

    return note;
  };

  const handleCopyToClipboard = async () => {
    const note = formatVisitNote();
    await Clipboard.setStringAsync(note);
    Alert.alert('Copied!', 'Visit note copied to clipboard');
  };

  const handleClearVisit = () => {
    Alert.alert('Clear Visit', 'Are you sure you want to remove all codes from this visit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => clearVisit(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Current Visit</Text>
          {visitCodes.length > 0 && (
            <TouchableOpacity onPress={handleClearVisit}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>{visitCodes.length} diagnosis codes</Text>
      </View>

      {visitCodes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={80} color="#bdc3c7" />
          <Text style={styles.emptyText}>No codes in visit yet</Text>
          <Text style={styles.emptySubtext}>
            Add ICD-10 codes from the search or favorites tabs
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={visitCodes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VisitCodeItem code={item} onRemove={() => removeCodeFromVisit(item.id)} />
            )}
            contentContainerStyle={styles.listContent}
            style={styles.list}
          />

          <View style={styles.footer}>
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Note Preview:</Text>
              <Text style={styles.previewText}>{formatVisitNote()}</Text>
            </View>

            <TouchableOpacity style={styles.copyButton} onPress={handleCopyToClipboard}>
              <Ionicons name="copy-outline" size={24} color="#fff" style={styles.copyIcon} />
              <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* TODO: Phase 2 - Add voice-to-text input */}
      {/* TODO: Phase 2 - Add image attachments */}
      {/* TODO: Phase 4 - Add full patient visit management */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  clearText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 20,
  },
  previewContainer: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  previewLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  previewText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  copyButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyIcon: {
    marginRight: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
