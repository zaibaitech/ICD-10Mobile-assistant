import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AttachmentTag } from '../types';

interface Props {
  selectedTags: AttachmentTag[];
  onToggleTag: (tag: AttachmentTag) => void;
}

const AVAILABLE_TAGS: AttachmentTag[] = [
  'skin',
  'wound',
  'swelling',
  'bruising',
  'rash',
  'other',
];

export const TagSelector: React.FC<Props> = ({ selectedTags, onToggleTag }) => {
  const { t } = useTranslation();

  const isSelected = (tag: AttachmentTag) => selectedTags.includes(tag);

  const getTagIcon = (tag: AttachmentTag): string => {
    switch (tag) {
      case 'skin': return 'body';
      case 'wound': return 'medical';
      case 'swelling': return 'alert-circle';
      case 'bruising': return 'water';
      case 'rash': return 'warning';
      case 'other': return 'ellipsis-horizontal';
      default: return 'pricetag';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('attachments.selectTags')}:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {AVAILABLE_TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagChip,
              isSelected(tag) && styles.tagChipSelected,
            ]}
            onPress={() => onToggleTag(tag)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={getTagIcon(tag)}
              size={18}
              color={isSelected(tag) ? '#FFFFFF' : '#007AFF'}
            />
            <Text
              style={[
                styles.tagText,
                isSelected(tag) && styles.tagTextSelected,
              ]}
            >
              {t(`attachments.tags.${tag}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  scrollContent: {
    paddingRight: 16,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  tagChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tagText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
});
