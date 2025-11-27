// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add web-specific platform extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.ts', 'web.tsx'];

module.exports = config;
