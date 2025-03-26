import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { Platform, View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

// Sekme tipini tanımla
type TabType = 'home' | 'upload' | 'profile' | 'explore' | 'matches';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === 'web';
  const primaryColor = '#4CAF50';
  const router = useRouter();
  
  // Aktif sekme durumu için state tanımla
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  // Sekme değiştirme fonksiyonu
  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    
    // Aynı zamanda ilgili sayfaya yönlendir
    switch(tab) {
      case 'home':
        router.push('/(tabs)');
        break;
      case 'upload':
        router.push('/(tabs)/upload');
        break;
      case 'profile':
        router.push('/(tabs)/profile');
        break;
      case 'explore':
        router.push('/(tabs)/explore');
        break;
      case 'matches':
        router.push('/(tabs)/matches');
        break;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colorScheme === 'dark' ? '#121212' : '#F5F5F5' }
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="matches" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="upload" />
      </Stack>
      
      {/* Custom Footer Navigation - Her sayfada görünecek */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => changeTab('home')}
        >
          <View style={[styles.iconWrapper, activeTab === 'home' && styles.activeIconWrapper]}>
            <IconSymbol name="house.fill" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[styles.footerTabText, activeTab === 'home' && styles.activeFooterTabText]}>Ana Sayfa</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => changeTab('upload')}
        >
          <View style={[styles.iconWrapper, activeTab === 'upload' && styles.activeIconWrapper]}>
            <IconSymbol name="plus.circle" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[styles.footerTabText, activeTab === 'upload' && styles.activeFooterTabText]}>Yükle</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => changeTab('profile')}
        >
          <View style={[styles.iconWrapper, activeTab === 'profile' && styles.activeIconWrapper]}>
            <IconSymbol name="person" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[styles.footerTabText, activeTab === 'profile' && styles.activeFooterTabText]}>Profil</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => changeTab('explore')}
        >
          <View style={[styles.iconWrapper, activeTab === 'explore' && styles.activeIconWrapper]}>
            <IconSymbol name="magnifyingglass" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[styles.footerTabText, activeTab === 'explore' && styles.activeFooterTabText]}>Keşfet</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => changeTab('matches')}
        >
          <View style={[styles.iconWrapper, activeTab === 'matches' && styles.activeIconWrapper]}>
            <IconSymbol name="soccerball" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[styles.footerTabText, activeTab === 'matches' && styles.activeFooterTabText]}>Maçlar</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#777',
  },
  activeIconWrapper: {
    backgroundColor: '#4CAF50', // Aktif seçili buton için yeşil arka plan
  },
  footerTabText: {
    fontSize: 12,
    marginTop: 2,
    color: '#777',
  },
  activeFooterTabText: {
    color: '#4CAF50', // Aktif seçili buton için yeşil yazı rengi
    fontWeight: 'bold',
  },
});
