import React from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <StatusBar style="light" backgroundColor="#050510" />
        <View style={styles.statusBarSpacing} />
        <WebView 
          source={{ uri: 'https://bdcinema.vercel.app' }} 
          style={styles.webview}
          bounces={true}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
  },
  statusBarSpacing: {
    // Optional space if you need it outside safe area, but safeAreaView handles it mostly
    height: 0, 
  },
  webview: {
    flex: 1,
    backgroundColor: '#050510',
  },
});
