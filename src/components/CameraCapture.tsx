/**
 * Camera Capture Component
 * Capture photos of medical documents for OCR processing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

interface CameraCaptureProps {
  visible: boolean;
  onCapture: (imageUri: string) => void;
  onClose: () => void;
}

export function CameraCapture({ visible, onCapture, onClose }: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');

  React.useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible]);

  const takePicture = async () => {
    // Note: Taking picture requires ref access which is complex with new CameraView
    // For now, we'll rely on image picker
    pickImage();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onCapture(result.assets[0].uri);
        onClose();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Requesting camera permission...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.container}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-off" size={64} color={Colors.textTertiary} />
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              Please grant camera access to capture images.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={requestPermission}>
              <Text style={styles.closeButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.closeButton, styles.secondaryButton]} onPress={onClose}>
              <Text style={[styles.closeButtonText, styles.secondaryButtonText]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Capture Document</Text>
            <TouchableOpacity style={styles.headerButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Frame Guide */}
          <View style={styles.frameGuide}>
            <View style={styles.frameCornerTL} />
            <View style={styles.frameCornerTR} />
            <View style={styles.frameCornerBL} />
            <View style={styles.frameCornerBR} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Position the document within the frame
            </Text>
            <Text style={styles.instructionsSubtext}>
              Ensure good lighting and focus
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickImage}
            >
              <Ionicons name="images" size={32} color="#fff" />
              <Text style={styles.buttonLabel}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <View style={styles.placeholderButton} />
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  permissionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  permissionText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  closeButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: '#fff',
  },
  frameGuide: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '40%',
  },
  frameCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#fff',
  },
  frameCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#fff',
  },
  frameCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#fff',
  },
  frameCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#fff',
  },
  instructionsContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  instructionsSubtext: {
    fontSize: Typography.fontSize.sm,
    color: '#fff',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingTop: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  galleryButton: {
    alignItems: 'center',
    width: 80,
  },
  buttonLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#fff',
    marginTop: 4,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  placeholderButton: {
    width: 80,
  },
});
