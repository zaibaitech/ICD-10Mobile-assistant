// Suppress React Native Web warnings in development
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0];
    
    // Suppress known React Native Web deprecation warnings
    if (
      typeof message === 'string' && (
        message.includes('Image: style.resizeMode is deprecated') ||
        message.includes('Image: style.tintColor is deprecated') ||
        message.includes('"shadow*" style props are deprecated') ||
        message.includes('expo-av') ||
        message.includes('React DevTools')
      )
    ) {
      return;
    }
    
    originalWarn.apply(console, args);
  };
}

export {};
