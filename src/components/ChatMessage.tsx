import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChatMessage as ChatMessageType, SuggestedCode } from '../types';

interface Props {
  message: ChatMessageType;
  onAddCode?: (code: SuggestedCode) => void;
}

export const ChatMessage: React.FC<Props> = ({ message, onAddCode }) => {
  const { t } = useTranslation();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {/* Image Attachment */}
        {message.imageUrl && (
          <Image 
            source={{ uri: message.imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.text}
        </Text>

        {/* Suggested Codes */}
        {message.suggestedCodes && message.suggestedCodes.length > 0 && (
          <View style={styles.codesContainer}>
            <Text style={styles.codesTitle}>{t('assistant.suggestedCodes')}:</Text>
            {message.suggestedCodes.map((code, index) => (
              <View key={index} style={styles.codeCard}>
                <View style={styles.codeInfo}>
                  <Text style={styles.codeCode}>{code.code}</Text>
                  <Text style={styles.codeTitle}>{code.short_title}</Text>
                  {code.confidence && (
                    <Text style={[styles.confidence, styles[`confidence_${code.confidence}`]]}>
                      {code.confidence}
                    </Text>
                  )}
                  {code.reasoning && (
                    <Text style={styles.reasoning}>{code.reasoning}</Text>
                  )}
                </View>
                {onAddCode && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => onAddCode(code)}
                  >
                    <Text style={styles.addButtonText}>{t('assistant.addCode')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Clarifying Questions */}
        {message.clarifyingQuestions && message.clarifyingQuestions.length > 0 && (
          <View style={styles.questionsContainer}>
            <Text style={styles.questionsTitle}>{t('assistant.clarifyingQuestions')}:</Text>
            {message.clarifyingQuestions.map((question, index) => (
              <Text key={index} style={styles.question}>• {question}</Text>
            ))}
          </View>
        )}

        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  assistantBubble: {
    backgroundColor: '#E9ECEF',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#000000',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  codesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  codesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeInfo: {
    flex: 1,
  },
  codeCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 2,
  },
  codeTitle: {
    fontSize: 14,
    color: '#333',
  },
  confidence: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  confidence_high: {
    color: '#28A745',
  },
  confidence_medium: {
    color: '#FFC107',
  },
  confidence_low: {
    color: '#DC3545',
  },
  reasoning: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  questionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  questionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  question: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#888',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});
