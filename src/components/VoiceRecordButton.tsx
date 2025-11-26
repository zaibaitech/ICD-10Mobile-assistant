import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';

interface Props {
  onRecordingComplete: (audioUri: string) => void;
  isDisabled?: boolean;
}

export const VoiceRecordButton: React.FC<Props> = ({ onRecordingComplete, isDisabled }) => {
  const { t } = useTranslation();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionResponse, setPermissionResponse] = useState<Audio.PermissionResponse | null>(null);

  const startRecording = async () => {
    try {
      // Request permission if not already granted
      if (!permissionResponse || permissionResponse.status !== 'granted') {
        const permission = await Audio.requestPermissionsAsync();
        setPermissionResponse(permission);
        
        if (permission.status !== 'granted') {
          Alert.alert(
            t('assistant.voicePermissionTitle'),
            t('assistant.voicePermissionMessage')
          );
          return;
        }
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start new recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert(
        t('common.error'),
        t('assistant.recordingStartError')
      );
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        onRecordingComplete(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert(
        t('common.error'),
        t('assistant.recordingStopError')
      );
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isRecording && styles.recordingButton,
        isDisabled && styles.disabledButton
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isRecording ? 'stop-circle' : 'mic'}
        size={24}
        color={isRecording ? '#FF3B30' : '#007AFF'}
      />
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Text style={styles.recordingText}>{t('assistant.recording')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  disabledButton: {
    opacity: 0.4,
  },
  recordingIndicator: {
    marginLeft: 6,
  },
  recordingText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
});
