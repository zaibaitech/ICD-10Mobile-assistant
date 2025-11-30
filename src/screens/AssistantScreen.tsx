import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { RuleSuggestionCard } from '../components/RuleSuggestionCard';
import { ImageAttachment } from '../components/ImageAttachment';
import { ResearchModeBanner } from '../components/ResearchModeBanner';
import { useVisitContext } from '../context/VisitContext';
import { getAssistantReply, transcribeAudio } from '../services/assistant';
import { getRuleSuggestions } from '../services/rules';
import { logAssistantInteraction } from '../services/logging';
import { uploadImage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { ChatMessage as ChatMessageType, SuggestedCode, RuleSuggestion } from '../types';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomSpacing } from '../hooks/useBottomSpacing';

export const AssistantScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { visitCodes, addCodeToVisit } = useVisitContext();
  
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      role: 'assistant',
      text: t('assistant.welcomeMessage'),
      timestamp: new Date(),
    },
  ]);
  const [ruleSuggestions, setRuleSuggestions] = useState<RuleSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const listBottomPadding = useBottomSpacing();
  const inputBottomInset = Math.max(insets.bottom, 16);
  const keyboardOffset = Platform.OS === 'ios' ? 90 : 60;

  // Check for rule suggestions when codes change
  useEffect(() => {
    if (visitCodes.length > 0) {
      const suggestions = getRuleSuggestions({
        codes: visitCodes,
        lastMessageText: messages[messages.length - 1]?.text || '',
      });
      setRuleSuggestions(suggestions);
    } else {
      setRuleSuggestions([]);
    }
  }, [visitCodes, messages]);

  const handleSendMessage = async (text: string, imageUri?: string) => {
    if (!text.trim() && !imageUri) return;
    if (!user) return;

    let imageUrl: string | undefined;

    // Use provided imageUri or pending image
    const imageToUpload = imageUri || pendingImage;
    
    if (imageToUpload) {
      setPendingImage(imageToUpload);
      try {
        imageUrl = await uploadImage(imageToUpload, user.id);
        setPendingImage(null);
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert(
          t('errors.imageUploadTitle'),
          t('errors.imageUploadMessage')
        );
        return;
      }
    }

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      imageUrl,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get assistant response
      const response = await getAssistantReply(text.trim(), {
        currentVisitCodes: visitCodes,
        imageUrl,
      });

      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.text,
        suggestedCodes: response.suggestedCodes,
        clarifyingQuestions: response.clarifyingQuestions,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Log the interaction
      await logAssistantInteraction({
        userId: user.id,
        inputText: text.trim(),
        assistantResponse: response.text,
        suggestedCodes: response.suggestedCodes || [],
        acceptedCodes: [],
      });

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error getting assistant response:', error);
      
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: t('assistant.errorMessage'),
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecordingStart = () => {
    setIsRecording(true);
  };

  const handleVoiceRecordingStop = () => {
    setIsRecording(false);
  };

  const handleVoiceRecording = async (audioUri: string) => {
    setIsRecording(false);
    setIsLoading(true);

    try {
      // Transcribe audio (placeholder - will be implemented with cloud service)
      const transcribedText = await transcribeAudio(audioUri);
      
      if (transcribedText) {
        await handleSendMessage(transcribedText);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: t('assistant.transcriptionError'),
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCode = async (suggestedCode: SuggestedCode) => {
    // Add code to visit
    addCodeToVisit({
      id: suggestedCode.code,
      code: suggestedCode.code,
      short_title: suggestedCode.short_title,
      full_title: suggestedCode.short_title,
      chapter: '',
    });

    // Log acceptance
    if (user) {
      const lastAssistantMessage = [...messages]
        .reverse()
        .find((msg) => msg.role === 'assistant' && msg.suggestedCodes);

      if (lastAssistantMessage) {
        await logAssistantInteraction({
          userId: user.id,
          inputText: messages[messages.length - 2]?.text || '',
          assistantResponse: lastAssistantMessage.text,
          suggestedCodes: lastAssistantMessage.suggestedCodes || [],
          acceptedCodes: [suggestedCode.code],
        });
      }
    }
  };

  const renderMessage = ({ item }: { item: ChatMessageType }) => (
    <ChatMessage message={item} onAddCode={handleAddCode} />
  );

  const renderRuleSuggestion = ({ item }: { item: RuleSuggestion }) => (
    <RuleSuggestionCard suggestion={item} onAddCode={handleAddCode} />
  );

  const renderHeader = () => (
    <>
      <ResearchModeBanner />
      
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>{t('assistant.disclaimer')}</Text>
      </View>
      
      {pendingImage && (
        <View style={styles.pendingImageContainer}>
          <Text style={styles.pendingImageLabel}>{t('attachments.pendingImage')}</Text>
          <ImageAttachment
            uri={pendingImage}
            tags={[]}
            onRemove={() => setPendingImage(null)}
          />
        </View>
      )}
      
      {ruleSuggestions.length > 0 && (
        <View style={styles.ruleSuggestionsContainer}>
          <Text style={styles.ruleSuggestionsTitle}>
            {t('assistant.clinicalReminders')}
          </Text>
          {ruleSuggestions.map((suggestion, index) => (
            <RuleSuggestionCard
              key={index}
              suggestion={suggestion}
              onAddCode={handleAddCode}
            />
          ))}
        </View>
      )}
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardOffset + inputBottomInset}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.messageList, { paddingBottom: listBottomPadding }]}
        ListHeaderComponent={renderHeader}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {pendingImage ? '🔍 Analyzing image...' : 
             isRecording ? '🎤 Processing voice...' : 
             '🧠 AI thinking...'}
          </Text>
        </View>
      )}

      <ChatInput
        onSend={handleSendMessage}
        onImageSelected={setPendingImage}
        onVoiceRecordingComplete={handleVoiceRecording}
        onVoiceRecordingStart={handleVoiceRecordingStart}
        onVoiceRecordingStop={handleVoiceRecordingStop}
        isLoading={isLoading}
        isRecording={isRecording}
        placeholder={t('assistant.inputPlaceholder')}
        bottomInset={inputBottomInset}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messageList: {
    paddingVertical: Spacing.md,
  },
  disclaimer: {
    backgroundColor: '#FFE5E5',
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  disclaimerText: {
    fontSize: Typography.fontSize.sm,
    color: '#C92A2A',
    lineHeight: 20,
    fontWeight: Typography.fontWeight.semibold,
  },
  pendingImageContainer: {
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  pendingImageLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  ruleSuggestionsContainer: {
    marginVertical: Spacing.sm,
  },
  ruleSuggestionsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    color: Colors.textPrimary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  loadingText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
});
