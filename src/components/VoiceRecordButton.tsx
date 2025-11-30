import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';

interface Props {
  onRecordingComplete: (audioUri: string) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  isDisabled?: boolean;
}

export const VoiceRecordButton: React.FC<Props> = ({ 
  onRecordingComplete, 
  onRecordingStart,
  onRecordingStop,
  isDisabled 
}) => {
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

      // Create and start new recording with medical-optimized settings
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        }
      };

      const { recording: newRecording } = await Audio.Recording.createAsync(
        recordingOptions
      );

      setRecording(newRecording);
      setIsRecording(true);
      onRecordingStart?.();
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
      onRecordingStop?.();
      
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
