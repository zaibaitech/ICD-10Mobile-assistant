import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskLevel } from '../types';

interface Props {
  riskLevel: RiskLevel;
  size?: 'small' | 'medium' | 'large';
}

const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#4CAF50',      // green
  moderate: '#FF9800', // orange
  high: '#F44336',     // red
  unknown: '#9E9E9E',  // gray
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Low Risk',
  moderate: 'Moderate Risk',
  high: 'High Risk',
  unknown: 'Unknown',
};

export const RiskBadge: React.FC<Props> = ({ riskLevel, size = 'medium' }) => {
  const fontSize = size === 'small' ? 11 : size === 'large' ? 15 : 13;
  const paddingVertical = size === 'small' ? 3 : size === 'large' ? 8 : 5;
  const paddingHorizontal = size === 'small' ? 8 : size === 'large' ? 14 : 10;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: RISK_COLORS[riskLevel],
          paddingVertical,
          paddingHorizontal,
        },
      ]}
    >
      <Text style={[styles.badgeText, { fontSize }]}>
        {RISK_LABELS[riskLevel]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
