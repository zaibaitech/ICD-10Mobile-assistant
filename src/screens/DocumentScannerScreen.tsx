/**
 * Document Scanner Screen
 * Scan medical documents and extract ICD-10 codes via OCR
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '../components/ScreenContainer';
import { SurfaceCard } from '../components/SurfaceCard';
import { CameraCapture } from '../components/CameraCapture';
import { processMedicalDocument } from '../services/ocr';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { useBottomSpacing } from '../hooks/useBottomSpacing';

export function DocumentScannerScreen() {
  const navigation = useNavigation();
  const bottomPadding = useBottomSpacing();
  
  const [cameraVisible, setCameraVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    cleanText: string;
    icd10Codes: string[];
    medicalTerms: string[];
    confidence: number;
  } | null>(null);

  const handleCapture = async (imageUri: string) => {
    setProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const docResult = await processMedicalDocument(imageUri, (p) => {
        setProgress(p);
      });

      setResult(docResult);

      if (docResult.icd10Codes.length === 0) {
        Alert.alert(
          'No Codes Found',
          'No ICD-10 codes were detected in the image. Please try again with a clearer image.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Document processing error:', error);
      Alert.alert(
        'Processing Failed',
        'Failed to process the document. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCodePress = (code: string) => {
    (navigation as any).navigate('Search', { initialQuery: code });
  };

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Document Scanner</Text>
        <Text style={styles.subtitle}>
          Scan medical documents to extract ICD-10 codes
        </Text>
      </View>

      {/* Scan Buttons */}
      <View style={styles.scanButtonsContainer}>
        <TouchableOpacity
          style={[styles.scanButton, { flex: 1, marginRight: Spacing.sm }]}
          onPress={() => setCameraVisible(true)}
          disabled={processing}
        >
          <Ionicons name="camera" size={32} color="#fff" />
          <Text style={styles.scanButtonText}>
            {processing ? 'Processing...' : 'Camera'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.scanButton, styles.galleryButton, { flex: 1, marginLeft: Spacing.sm }]}
          onPress={async () => {
            try {
              // Request media library permissions
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              
              if (status !== 'granted') {
                Alert.alert(
                  'Permission Required',
                  'Please allow access to your photo library to select images.',
                  [{ text: 'OK' }]
                );
                return;
              }

              // Quick gallery access
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
              });
              
              if (!result.canceled && result.assets[0]) {
                handleCapture(result.assets[0].uri);
              }
            } catch (error) {
              console.error('Error picking image:', error);
              Alert.alert('Error', 'Failed to access photo library');
            }
          }}
          disabled={processing}
        >
          <Ionicons name="images" size={32} color="#fff" />
          <Text style={styles.scanButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Processing Indicator */}
      {processing && (
        <SurfaceCard style={styles.processingCard}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.processingText}>
            Processing image... {Math.round(progress * 100)}%
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </SurfaceCard>
      )}

      {/* Results */}
      {result && !processing && (
        <View style={styles.results}>
          {/* Confidence Score */}
          <SurfaceCard style={styles.confidenceCard}>
            <View style={styles.confidenceHeader}>
              <Ionicons
                name={result.confidence > 80 ? 'checkmark-circle' : 'alert-circle'}
                size={24}
                color={result.confidence > 80 ? Colors.success : Colors.warning}
              />
              <Text style={styles.confidenceText}>
                {result.confidence.toFixed(1)}% Confidence
              </Text>
            </View>
            <Text style={styles.confidenceSubtext}>
              {result.confidence > 80
                ? 'High accuracy - results reliable'
                : 'Lower accuracy - please verify results'}
            </Text>
          </SurfaceCard>

          {/* ICD-10 Codes Found */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ICD-10 Codes Found ({result.icd10Codes.length})
            </Text>
            {result.icd10Codes.length > 0 ? (
              <View style={styles.codesList}>
                {result.icd10Codes.map((code) => (
                  <TouchableOpacity
                    key={code}
                    style={styles.codeChip}
                    onPress={() => handleCodePress(code)}
                  >
                    <Ionicons name="search" size={16} color={Colors.primary} />
                    <Text style={styles.codeText}>{code}</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No ICD-10 codes detected</Text>
            )}
          </View>

          {/* Medical Terms */}
          {result.medicalTerms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Medical Terms ({result.medicalTerms.length})
              </Text>
              <View style={styles.termsList}>
                {result.medicalTerms.map((term, index) => (
                  <View key={index} style={styles.termChip}>
                    <Text style={styles.termText}>{term}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Extracted Text */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Extracted Text</Text>
            <SurfaceCard style={styles.textCard}>
              <ScrollView style={styles.textScroll} nestedScrollEnabled>
                <Text style={styles.extractedText}>
                  {result.cleanText || 'No text extracted'}
                </Text>
              </ScrollView>
            </SurfaceCard>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setCameraVisible(true)}
            >
              <Ionicons name="camera" size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Instructions */}
      {!result && !processing && (
        <SurfaceCard style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.instructionText}>
              Tap the camera button above
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.instructionText}>
              Position the medical document in the frame
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.instructionText}>
              Ensure good lighting and clear text
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.instructionText}>
              Capture the image and wait for processing
            </Text>
          </View>
        </SurfaceCard>
      )}

      {/* Camera Modal */}
      <CameraCapture
        visible={cameraVisible}
        onCapture={handleCapture}
        onClose={() => setCameraVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  scanButtonsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  scanButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: '#fff',
    marginTop: Spacing.sm,
  },
  scanButtonSubtext: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.xs,
  },
  galleryButton: {
    backgroundColor: Colors.secondary,
  },
  processingCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  processingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  results: {
    gap: Spacing.lg,
  },
  confidenceCard: {
    padding: Spacing.lg,
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  confidenceText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  confidenceSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: 32,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  codesList: {
    gap: Spacing.sm,
  },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  codeText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  termsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  termChip: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  termText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  textCard: {
    padding: Spacing.md,
    maxHeight: 200,
  },
  textScroll: {
    maxHeight: 180,
  },
  extractedText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  instructionsCard: {
    padding: Spacing.lg,
  },
  instructionsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  instructionText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    flex: 1,
  },
});
