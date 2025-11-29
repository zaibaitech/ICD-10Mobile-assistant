import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Props {
  chapters: string[];
  selectedChapter: string;
  onSelectChapter: (chapter: string) => void;
}

export const ChapterFilter: React.FC<Props> = ({ chapters, selectedChapter, onSelectChapter }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {chapters.map((chapter) => (
        <TouchableOpacity
          key={chapter}
          style={[styles.chip, selectedChapter === chapter && styles.chipSelected]}
          onPress={() => onSelectChapter(chapter)}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedChapter === chapter }}
          accessibilityLabel={`Filter ${chapter}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.chipText, selectedChapter === chapter && styles.chipTextSelected]}>
            {chapter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    overflow: 'visible',
  },
  content: {
    paddingLeft: 20,
    paddingRight: 24,
    paddingVertical: 12,
  },
  chip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  chipText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
