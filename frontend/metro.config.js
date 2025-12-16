// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add glb and gltf to asset extensions
config.resolver.assetExts.push('glb', 'gltf');

module.exports = config;
