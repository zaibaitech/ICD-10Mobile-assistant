import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RESEARCH_MODE_BANNER } from '../constants/disclaimers';

export const ResearchModeBanner: React.FC = () => {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>{RESEARCH_MODE_BANNER}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  bannerText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
    fontWeight: '500',
  },
});
