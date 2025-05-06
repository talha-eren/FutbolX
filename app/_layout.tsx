import React, { useState, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    // Uygulama başlangıç kontrollerini yap (oturum durumu, yerel depolama vb.)
    async function checkInitialState() {
      try {
        // AsyncStorage'dan kullanıcı durumunu kontrol et
        const userData = await AsyncStorage.getItem('user');
        
        // Kullanıcı verisi varsa, giriş yapmış sayılır
        setUserLoggedIn(userData !== null);
      } catch (error) {
        console.error('Başlangıç kontrolü sırasında hata:', error);
        setUserLoggedIn(false);
      } finally {
        setIsLoading(false);
        SplashScreen.hideAsync();
      }
    }

    checkInitialState();
  }, []);

  if (isLoading || !loaded) {
    return null; // Yükleme sırasında splash screen gösteriliyor
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {userLoggedIn ? (
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          )}
          <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
