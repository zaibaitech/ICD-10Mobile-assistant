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
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { useVisit } from '../context/VisitContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomSpacing } from '../hooks/useBottomSpacing';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { haptic } from '../utils/haptics';

export const VisitNoteScreen: React.FC = () => {
  const { visitCodes, removeCodeFromVisit, clearVisit } = useVisit();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const listBottomPadding = useBottomSpacing(40);
  const footerBottomInset = Math.max(insets.bottom, 16);

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
    haptic.success();
    Alert.alert('Copied!', 'Visit note copied to clipboard');
  };

  const handleClearVisit = () => {
    Alert.alert('Clear Visit', 'Are you sure you want to remove all codes from this visit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          haptic.warning();
          clearVisit();
        },
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
        <EmptyState
          icon="document-text-outline"
          title="No codes in visit yet"
          message="Add ICD-10 codes from the search or favorites tabs to build your visit note"
          actionLabel="Search Codes"
          onActionPress={() => navigation.navigate('Search' as never)}
          iconColor={Colors.primary}
        />
      ) : (
        <>
          <FlatList
            data={visitCodes}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <VisitCodeItem code={item} onRemove={() => removeCodeFromVisit(item.code)} />
            )}
            contentContainerStyle={[styles.listContent, { paddingBottom: listBottomPadding }]}
            style={styles.list}
          />

          <View style={[styles.footer, { paddingBottom: footerBottomInset }]}>
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Note Preview:</Text>
              <Text style={styles.previewText}>{formatVisitNote()}</Text>
            </View>

            <Button
              title="Copy to Clipboard"
              onPress={handleCopyToClipboard}
              icon="copy-outline"
              variant="primary"
              size="large"
              fullWidth
            />
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
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.small,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.heading,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  clearText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.danger,
    fontWeight: Typography.fontWeight.semibold,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
  },
  footer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.xl,
    ...Shadows.medium,
  },
  previewContainer: {
    backgroundColor: Colors.primaryTransparent,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  previewLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
});
