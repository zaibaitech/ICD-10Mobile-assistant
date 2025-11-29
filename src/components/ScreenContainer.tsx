import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  ViewProps,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  scrollable = false,
  contentContainerStyle,
  scrollViewProps,
  ...rest
}) => {
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const Wrapper = scrollable ? ScrollView : View;
  const wrapperProps = scrollable
    ? ({
        contentContainerStyle: [styles.contentContainer, contentContainerStyle],
        showsVerticalScrollIndicator: false,
        overScrollMode: 'never' as const,
        ...scrollViewProps,
      })
    : ({
        style: [styles.viewContainer, contentContainerStyle],
      });

  return (
    <SafeAreaView
      style={[styles.safeArea, { paddingTop: topInset }, style]}
      edges={['top', 'left', 'right']}
      {...rest}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : topInset}
      >
        <Wrapper {...(wrapperProps as any)}>
          {children}
        </Wrapper>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 0,
    flexGrow: 1,
  },
});
