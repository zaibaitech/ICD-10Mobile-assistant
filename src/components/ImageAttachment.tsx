import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AttachmentTag } from '../types';

interface Props {
  uri: string;
  tags: AttachmentTag[];
  onRemove: () => void;
  onEditTags?: (tags: AttachmentTag[]) => void;
}

export const ImageAttachment: React.FC<Props> = ({ uri, tags, onRemove, onEditTags }) => {
  const { t } = useTranslation();

  const handleRemove = () => {
    Alert.alert(
      t('attachments.removeTitle'),
      t('attachments.removeMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.remove'), 
          style: 'destructive',
          onPress: onRemove 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={handleRemove}
        activeOpacity={0.7}
      >
        <Ionicons name="close-circle" size={28} color="#FF3B30" />
      </TouchableOpacity>

      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{t(`attachments.tags.${tag}`)}</Text>
            </View>
          ))}
        </View>
      )}

      {onEditTags && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {/* Edit tags functionality */}}
          activeOpacity={0.7}
        >
          <Ionicons name="pricetag" size={20} color="#007AFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 150,
    height: 150,
    marginRight: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
  },
  editButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 6,
  },
  tagsContainer: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: '70%',
  },
  tag: {
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
