import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { VoiceRecordButton } from './VoiceRecordButton';

interface Props {
  onSend: (text: string) => void;
  onImageSelected?: (imageUri: string) => void;
  onVoiceRecordingComplete?: (audioUri: string) => void;
  onVoiceRecordingStart?: () => void;
  onVoiceRecordingStop?: () => void;
  isRecording?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  bottomInset?: number;
}

export const ChatInput: React.FC<Props> = ({
  onSend,
  onImageSelected,
  onVoiceRecordingComplete,
  onVoiceRecordingStart,
  onVoiceRecordingStop,
  isRecording = false,
  isLoading = false,
  placeholder,
  bottomInset = 0,
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleImagePicker = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t('permissions.mediaLibraryTitle'),
          t('permissions.mediaLibraryMessage')
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && onImageSelected) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        t('errors.imagePickerTitle'),
        t('errors.imagePickerMessage')
      );
    }
  };

  const handleCamera = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t('permissions.cameraTitle'),
          t('permissions.cameraMessage')
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && onImageSelected) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error using camera:', error);
      Alert.alert(
        t('errors.cameraTitle'),
        t('errors.cameraMessage')
      );
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      t('attachments.selectSource'),
      '',
      [
        {
          text: t('attachments.camera'),
          onPress: handleCamera,
        },
        {
          text: t('attachments.gallery'),
          onPress: handleImagePicker,
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const containerStyle = bottomInset
    ? [styles.container, { paddingBottom: 8 + bottomInset }]
    : styles.container;

  return (
    <View style={containerStyle}>
      {onImageSelected && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={showImageOptions}
          disabled={isLoading || isRecording}
        >
          <Ionicons name="camera" size={24} color={isLoading || isRecording ? "#CCC" : "#007AFF"} />
        </TouchableOpacity>
      )}

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={placeholder || t('assistant.placeholder')}
        placeholderTextColor="#999"
        multiline
        maxLength={500}
        editable={!isLoading && !isRecording}
      />
      
      {onVoiceRecordingComplete && (
        <VoiceRecordButton
          onRecordingComplete={onVoiceRecordingComplete}
          onRecordingStart={onVoiceRecordingStart}
          onRecordingStop={onVoiceRecordingStop}
          isDisabled={isLoading}
        />
      )}

      <TouchableOpacity
        style={[styles.sendButton, (!text.trim() || isLoading) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="send" size={20} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
});
