import React, { useState, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/context/AuthContext';
import { BackendConnectionProvider } from '../context/BackendConnectionContext';

// Notification ayarları
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.log('Bildirim ayarları yüklenemedi:', error);
}

// Splash screen'in otomatik kapanmasını engelle
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  
  // FutbolX tema renkleri
  const appTheme = {
    light: {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: '#4CAF50',
        background: '#F5F7FA',
        card: '#FFFFFF',
        text: '#333333',
        border: '#E0E0E0',
        notification: '#4CAF50',
      },
    },
    dark: {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: '#81C784',
        background: '#121212',
        card: '#1E1E1E',
        text: '#FFFFFF',
        border: '#2C2C2C',
        notification: '#81C784',
      },
    },
  };

  useEffect(() => {
    // Uygulama başlangıç kontrollerini yap (oturum durumu, yerel depolama vb.)
    async function checkInitialState() {
      try {
        // AsyncStorage'dan kullanıcı durumunu kontrol et
        const userData = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        
        // Kullanıcı verisi ve token varsa, giriş yapmış sayılır
        setUserLoggedIn(userData !== null && token !== null);
        
        // Bildirim izinlerini kontrol et ve talep et
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          console.log('Bildirim izni durumu:', status);
        }
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
    <BackendConnectionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? appTheme.dark : appTheme.light}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AuthProvider>
          <Stack screenOptions={{ 
            headerShown: false,
            contentStyle: { 
              backgroundColor: colorScheme === 'dark' ? appTheme.dark.colors.background : appTheme.light.colors.background 
            },
            animation: 'slide_from_right'
          }}>
            {userLoggedIn ? (
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            ) : (
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            )}
            <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </BackendConnectionProvider>
  );
}
