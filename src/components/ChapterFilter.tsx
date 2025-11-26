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
    maxHeight: 50,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 10,
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
