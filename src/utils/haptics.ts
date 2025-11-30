/**
 * Haptic Feedback Utility
 * Provides consistent haptic feedback across the app
 */

import { Platform } from 'react-native';

// Dynamically import expo-haptics only when available
let Haptics: any;
try {
  Haptics = require('expo-haptics');
} catch {
  // Haptics not available
  Haptics = null;
}

export const haptic = {
  /**
   * Light impact - for subtle interactions like button presses
   */
  light: () => {
    if (Platform.OS === 'ios' && Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /**
   * Medium impact - for standard interactions
   */
  medium: () => {
    if (Platform.OS === 'ios' && Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Heavy impact - for important actions
   */
  heavy: () => {
    if (Platform.OS === 'ios' && Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Success notification - for successful operations
   */
  success: () => {
    if (Platform.OS === 'ios' && Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  /**
   * Warning notification - for warnings
   */
  warning: () => {
    if (Platform.OS === 'ios' && Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  /**
   * Error notification - for errors
   */
  error: () => {
    if (Platform.OS === 'ios' && Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  /**
   * Selection changed - for picker/selector changes
   */
  selection: () => {
    if (Platform.OS === 'ios' && Haptics) {
      Haptics.selectionAsync();
    }
  },
};
