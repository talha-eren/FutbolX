import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { Platform, View, StyleSheet, TouchableOpacity, Alert, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FutbolXLogo } from '@/components/FutbolXLogo';
import { useAuth } from '@/context/AuthContext';

// Sekme tipini tanımla
type TabType = 'home' | 'upload' | 'profile' | 'explore' | 'matches';

// Hover props tipini tanımla
type HoverableProps = {
  children: React.ReactNode;
  style: any;
  onPress: () => void;
  activeOpacity?: number;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
};

// Özelleştirilmiş HoverableTouchable bileşeni
const HoverableTouchable = ({ children, style, onPress, activeOpacity = 0.7, onHoverIn, onHoverOut }: HoverableProps) => {
  // Web platformu için Pressable kullan, mobil için TouchableOpacity
  if (Platform.OS === 'web') {
    return (
      <Pressable
        style={style}
        onPress={onPress}
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}
      >
        {children}
      </Pressable>
    );
  }

  // Mobil için TouchableOpacity (hover işlevleri olmadan)
  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      activeOpacity={activeOpacity}
    >
      {children}
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === 'web';
  const primaryColor = '#4CAF50';
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  
  // Hover durumları için state
  const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);
  
  // Aktif sekme durumu için state tanımla
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  // Misafir kullanıcıları login'e yönlendirme
  const handleRestrictedAction = () => {
    Alert.alert(
      "Giriş Gerekli",
      "Bu özelliği kullanmak için giriş yapmanız gerekmektedir.",
      [
        { text: "İptal", style: "cancel" },
        { text: "Giriş Yap", onPress: () => router.push("/login" as any) }
      ]
    );
  };
  
  // Sekme değiştirme fonksiyonu
  const changeTab = (tab: TabType) => {
    // Eğer kullanıcı giriş yapmamışsa ve ev sayfası dışında bir sayfaya gitmeye çalışıyorsa
    if (!isLoggedIn && tab !== 'home') {
      handleRestrictedAction();
      return;
    }
    
    setActiveTab(tab);
    
    // Aynı zamanda ilgili sayfaya yönlendir
    switch(tab) {
      case 'home':
        router.push('/(tabs)' as any);
        break;
      case 'upload':
        router.push('/(tabs)/upload' as any);
        break;
      case 'profile':
        router.push('/(tabs)/profile' as any);
        break;
      case 'explore':
        router.push('/(tabs)/explore' as any);
        break;
      case 'matches':
        router.push('/(tabs)/matches' as any);
        break;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{
        headerShown: true,
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FutbolXLogo size={40} showText={false} simplified={true} />
            <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 5 }}>
              FutbolX
            </ThemedText>
          </View>
        ),
        headerTitleAlign: 'left',
        headerShadowVisible: false,
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
        <HoverableTouchable 
          style={styles.footerTab}
          onPress={() => changeTab('home')}
          onHoverIn={() => setHoveredTab('home')}
          onHoverOut={() => setHoveredTab(null)}
        >
          <View style={[
            styles.iconWrapper, 
            activeTab === 'home' && styles.activeIconWrapper,
            hoveredTab === 'home' && styles.hoveredIconWrapper
          ]}>
            <IconSymbol name="house.fill" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            activeTab === 'home' && styles.activeFooterTabText,
            hoveredTab === 'home' && styles.hoveredFooterTabText
          ]}>Ana Sayfa</ThemedText>
        </HoverableTouchable>
        
        <HoverableTouchable 
          style={styles.footerTab}
          onPress={() => changeTab('upload')}
          onHoverIn={() => setHoveredTab('upload')}
          onHoverOut={() => setHoveredTab(null)}
        >
          <View style={[
            styles.iconWrapper, 
            activeTab === 'upload' && styles.activeIconWrapper,
            hoveredTab === 'upload' && styles.hoveredIconWrapper
          ]}>
            <IconSymbol name="plus.circle" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            activeTab === 'upload' && styles.activeFooterTabText,
            hoveredTab === 'upload' && styles.hoveredFooterTabText
          ]}>Yükle</ThemedText>
        </HoverableTouchable>
        
        <HoverableTouchable 
          style={styles.footerTab}
          onPress={() => changeTab('profile')}
          onHoverIn={() => setHoveredTab('profile')}
          onHoverOut={() => setHoveredTab(null)}
        >
          <View style={[
            styles.iconWrapper, 
            activeTab === 'profile' && styles.activeIconWrapper,
            hoveredTab === 'profile' && styles.hoveredIconWrapper
          ]}>
            <IconSymbol name="person" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            activeTab === 'profile' && styles.activeFooterTabText,
            hoveredTab === 'profile' && styles.hoveredFooterTabText
          ]}>Profil</ThemedText>
        </HoverableTouchable>
        
        <HoverableTouchable 
          style={styles.footerTab}
          onPress={() => changeTab('explore')}
          onHoverIn={() => setHoveredTab('explore')}
          onHoverOut={() => setHoveredTab(null)}
        >
          <View style={[
            styles.iconWrapper, 
            activeTab === 'explore' && styles.activeIconWrapper,
            hoveredTab === 'explore' && styles.hoveredIconWrapper
          ]}>
            <IconSymbol name="magnifyingglass" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            activeTab === 'explore' && styles.activeFooterTabText,
            hoveredTab === 'explore' && styles.hoveredFooterTabText
          ]}>Keşfet</ThemedText>
        </HoverableTouchable>
        
        <HoverableTouchable 
          style={styles.footerTab}
          onPress={() => changeTab('matches')}
          onHoverIn={() => setHoveredTab('matches')}
          onHoverOut={() => setHoveredTab(null)}
        >
          <View style={[
            styles.iconWrapper, 
            activeTab === 'matches' && styles.activeIconWrapper,
            hoveredTab === 'matches' && styles.hoveredIconWrapper
          ]}>
            <IconSymbol name="soccerball" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            activeTab === 'matches' && styles.activeFooterTabText,
            hoveredTab === 'matches' && styles.hoveredFooterTabText
          ]}>Maçlar</ThemedText>
        </HoverableTouchable>
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
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
      }
    })
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#777',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease-in-out',
      }
    })
  },
  activeIconWrapper: {
    backgroundColor: '#4CAF50', // Aktif seçili buton için yeşil arka plan
  },
  hoveredIconWrapper: {
    backgroundColor: '#66BB6A', // Hover durumunda daha açık yeşil
    transform: [{ scale: 1.05 }],
  },
  footerTabText: {
    fontSize: 12,
    marginTop: 2,
    color: '#777',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease-in-out',
      }
    })
  },
  activeFooterTabText: {
    color: '#4CAF50', // Aktif seçili buton için yeşil yazı rengi
    fontWeight: 'bold',
  },
  hoveredFooterTabText: {
    color: '#66BB6A', // Hover durumunda daha açık yeşil
  },
});
