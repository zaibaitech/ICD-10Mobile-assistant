import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../constants/theme';

interface SurfaceCardProps extends ViewProps {
  elevated?: boolean;
  padding?: number;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  style,
  elevated = true,
  padding = Spacing.lg,
  ...rest
}) => {
  return (
    <View
      style={[
        styles.base,
        elevated ? styles.elevated : styles.flat,
        padding ? { padding } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  elevated: {
    ...Shadows.small,
  },
  flat: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

export default SurfaceCard;
