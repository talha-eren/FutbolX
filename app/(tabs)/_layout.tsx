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
import CreateMatchScreen from './create-match';
import SharePostScreen from './sharePost';

// Sekme tipini tanımla
type TabType = 'home' | 'upload' | 'profile' | 'matches' | 'admin';

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
  const { isLoggedIn, user } = useAuth();
  
  // Hover durumları için state
  const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);
  
  // Aktif sekme durumu için state tanımla
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  // Admin yetkisi kontrolü
  const isAdmin = user?.isAdmin || false;
  
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
  
  // Admin olmayan kullanıcıları yönlendirme
  const handleAdminRestrictedAction = () => {
    Alert.alert(
      "Yetkisiz Erişim",
      "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
      [
        { text: "Tamam", style: "default" }
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
    
    // Admin sekmesi için yetkiyi kontrol et
    if (tab === 'admin' && !isAdmin) {
      handleAdminRestrictedAction();
      return;
    }
    
    setActiveTab(tab);
    
    // Aynı zamanda ilgili sayfaya yönlendir
    switch(tab) {
      case 'home':
        router.push('/(tabs)' as any);
        break;
      case 'upload':
        router.push('/(tabs)/sharePost' as any);
        break;
      case 'profile':
        router.push('/(tabs)/profile' as any);
        break;
      case 'matches':
        router.push('/(tabs)/matches' as any);
        break;
      case 'admin':
        router.push('/(tabs)/admin' as any);
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
        <Stack.Screen name="index" options={{ title: 'Keşfet' }} />
        <Stack.Screen name="matches" />
        <Stack.Screen name="find-match" options={{ title: 'Maç Bul' }} />
        <Stack.Screen name="create-match" options={{ presentation: 'modal', title: 'Yeni Maç Oluştur' }} />
        <Stack.Screen name="profile" />
        <Stack.Screen name="sharePost" options={{ title: 'Gönderi Paylaş' }} />
        <Stack.Screen name="admin" options={{ title: 'Admin Paneli' }} />
        <Stack.Screen name="settings" options={{ title: 'Ayarlar' }} />
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
            <IconSymbol name="square.grid.2x2" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            activeTab === 'home' && styles.activeFooterTabText,
            hoveredTab === 'home' && styles.hoveredFooterTabText
          ]}>Keşfet</ThemedText>
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
            <IconSymbol name="square.and.arrow.up" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            activeTab === 'upload' && styles.activeFooterTabText,
            hoveredTab === 'upload' && styles.hoveredFooterTabText
          ]}>Paylaş</ThemedText>
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
        
        {/* Admin sekmesi sadece admin kullanıcılara gösterilir */}
        {isAdmin && (
          <HoverableTouchable 
            style={styles.footerTab}
            onPress={() => changeTab('admin')}
            onHoverIn={() => setHoveredTab('admin')}
            onHoverOut={() => setHoveredTab(null)}
          >
            <View style={[
              styles.iconWrapper, 
              activeTab === 'admin' && styles.activeIconWrapper,
              hoveredTab === 'admin' && styles.hoveredIconWrapper
            ]}>
              <IconSymbol name="gear" size={22} color="#FFFFFF" />
            </View>
            <ThemedText style={[
              styles.footerTabText, 
              activeTab === 'admin' && styles.activeFooterTabText,
              hoveredTab === 'admin' && styles.hoveredFooterTabText
            ]}>Admin</ThemedText>
          </HoverableTouchable>
        )}
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
