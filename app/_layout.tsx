import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import {
  KantumruyPro_400Regular,
  KantumruyPro_600SemiBold,
  KantumruyPro_700Bold,
} from '@expo-google-fonts/kantumruy-pro';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [timeoutExpired, setTimeoutExpired] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    // Khmer Modern Font
    'Krasar-Regular': require('../assets/fonts/Krasar-Regular.ttf'),
    'Krasar-Bold': require('../assets/fonts/Krasar-Bold.ttf'),
    'KantumruyPro-Regular': KantumruyPro_400Regular,
    'KantumruyPro-SemiBold': KantumruyPro_600SemiBold,
    'KantumruyPro-Bold': KantumruyPro_700Bold,

    // Ultra-Modern English Fonts (Linear & Raycast Aesthetic)
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,

    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-ExtraBold': Inter_800ExtraBold,
  });

  // Failsafe: Never allow infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutExpired(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const isReady = fontsLoaded || fontError || timeoutExpired;

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0E17', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2A9D8F" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
