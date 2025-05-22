import React, { useState, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/context/AuthContext';
import { BackendConnectionProvider } from '@/context/BackendConnectionContext';

// Splash screen'in otomatik kapanmasını engelle
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Özel fontları kullanma hatası olduğu için basitleştirilmiş useFonts kullanımı
  const [fontsLoaded] = useFonts({
    // Varsayılan fontları kullan
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Fonts yüklendikten sonra splash screen'i kapat
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Bildirimleri ayarla
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  useEffect(() => {
    async function checkNotificationPermissions() {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    }

    checkNotificationPermissions();
  }, []);

  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
        <BackendConnectionProvider>
          <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="field/[id]" options={{ title: 'Halı Saha Detay' }} />
            <Stack.Screen name="fields/[id]" options={{ title: 'Halı Saha Detay' }} />
            <Stack.Screen name="video/[id]" options={{ title: 'Video' }} />
            <Stack.Screen name="reservations/[id]" options={{ title: 'Rezervasyon' }} />
            <Stack.Screen name="about" options={{ title: 'Hakkımızda' }} />
            <Stack.Screen name="(auth)/login" options={{ headerTitle: 'Giriş Yap', presentation: 'modal' }} />
            <Stack.Screen name="(auth)/register" options={{ headerTitle: 'Kayıt Ol', presentation: 'modal' }} />
          </Stack>
        </BackendConnectionProvider>
        </AuthProvider>
      </ThemeProvider>
  );
}
