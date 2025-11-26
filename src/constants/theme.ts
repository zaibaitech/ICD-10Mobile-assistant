// Healthcare-focused color theme for ICD-10 Mobile Assistant
// Professional, accessible, and mobile-optimized

export const Colors = {
  // Primary Healthcare Colors
  primary: '#3498db',        // Medical Blue - trust, professionalism
  primaryDark: '#2980b9',    // Darker blue for emphasis
  primaryLight: '#5dade2',   // Lighter blue for backgrounds
  
  // Secondary Colors
  secondary: '#2ecc71',      // Medical Green - health, success
  secondaryDark: '#27ae60',
  secondaryLight: '#58d68d',
  
  // Accent Colors
  accent: '#9b59b6',         // Purple for AI/Assistant features
  accentDark: '#8e44ad',
  accentLight: '#bb8fce',
  
  // Alert Colors
  danger: '#e74c3c',         // Red for warnings, errors
  warning: '#f39c12',        // Orange for cautions
  success: '#2ecc71',        // Green for success states
  info: '#3498db',           // Blue for informational messages
  
  // Neutral Colors
  background: '#f8f9fa',     // Light gray background
  surface: '#FFFFFF',        // White surfaces (cards, modals)
  border: '#e0e0e0',         // Subtle borders
  divider: '#ecf0f1',        // Section dividers
  
  // Text Colors
  textPrimary: '#2c3e50',    // Dark gray for primary text
  textSecondary: '#7f8c8d',  // Medium gray for secondary text
  textTertiary: '#95a5a6',   // Light gray for tertiary text
  textDisabled: '#bdc3c7',   // Disabled state text
  textOnPrimary: '#FFFFFF',  // White text on primary color
  
  // Status Colors
  statusActive: '#2ecc71',
  statusInactive: '#95a5a6',
  statusPending: '#f39c12',
  
  // Risk Level Colors (for clinical decision support)
  riskLow: '#2ecc71',
  riskModerate: '#f39c12',
  riskHigh: '#e74c3c',
  
  // Semantic Colors
  favorite: '#e74c3c',       // Heart icon
  code: '#3498db',           // ICD-10 codes
  patient: '#2ecc71',        // Patient-related
  assistant: '#9b59b6',      // AI assistant
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Transparent Colors for accents
  primaryTransparent: 'rgba(52, 152, 219, 0.1)',
  secondaryTransparent: 'rgba(46, 204, 113, 0.1)',
  accentTransparent: 'rgba(155, 89, 182, 0.1)',
  dangerTransparent: 'rgba(231, 76, 60, 0.1)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 999,
};

export const Typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    heading: 32,
  },
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const Layout = {
  tabBarHeight: 60,
  headerHeight: 56,
  inputHeight: 48,
  buttonHeight: 48,
  iconSize: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
};

// Export a complete theme object
export const theme = {
  colors: Colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
  shadows: Shadows,
  layout: Layout,
};

export default theme;
