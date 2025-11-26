import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { RuleSuggestionCard } from '../components/RuleSuggestionCard';
import { useVisitContext } from '../context/VisitContext';
import { getAssistantReply, transcribeAudio } from '../services/assistant';
import { getRuleSuggestions } from '../services/rules';
import { logAssistantInteraction } from '../services/logging';
import { useAuth } from '../context/AuthContext';
import { ChatMessage as ChatMessageType, SuggestedCode, RuleSuggestion } from '../types';

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
  
  const flatListRef = useRef<FlatList>(null);

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

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !user) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get assistant response
      const response = await getAssistantReply(text.trim(), {
        currentVisitCodes: visitCodes,
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
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>{t('assistant.disclaimer')}</Text>
      </View>
      
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
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        ListHeaderComponent={renderHeader}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>{t('assistant.thinking')}</Text>
        </View>
      )}

      <ChatInput
        onSend={handleSendMessage}
        onVoiceRecordingComplete={handleVoiceRecording}
        isLoading={isLoading}
        isRecording={isRecording}
        placeholder={t('assistant.inputPlaceholder')}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messageList: {
    paddingVertical: 10,
  },
  disclaimer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  ruleSuggestionsContainer: {
    marginVertical: 8,
  },
  ruleSuggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    marginBottom: 8,
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});
