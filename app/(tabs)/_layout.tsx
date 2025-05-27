import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { Platform, View, StyleSheet, TouchableOpacity, Alert, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { useRouter, usePathname } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FutbolXLogo } from '@/components/FutbolXLogo';
import { useAuth } from '@/context/AuthContext';
import CreateMatchScreen from './create-match';
import SharePostScreen from './sharePost';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import ChatBot from '@/components/ChatBot';
import { Text } from 'react-native';

// Sekme tipini tanımla
type TabType = 'home' | 'upload' | 'profile' | 'matches' | 'teams' | 'admin' | 'reservation';

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
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user } = useAuth();
  
  // Hover durumları için state
  const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);
  
  // Aktif sekme durumu için state tanımla
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  // ChatBot state'i
  const [chatBotVisible, setChatBotVisible] = useState(false);
  
  // Admin yetkisi kontrolü
  const isAdmin = user?.isAdmin || false;
  
  // Sporyum23 renk şeması
  const primaryColor = '#4CAF50'; // Ana yeşil renk
  const secondaryColor = '#2E7D32'; // Koyu yeşil
  const accentColor = '#81C784'; // Açık yeşil
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const cardColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const backgroundColor = isDark ? '#121212' : '#F5F7FA';
  const borderColor = isDark ? '#2C2C2C' : '#E0E0E0';
  
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
      case 'teams':
        router.push('/(tabs)/teams' as any);
        break;
      case 'admin':
        router.push('/(tabs)/admin' as any);
        break;
    }
  };

  // ChatBot navigation handler
  const handleChatBotNavigate = (screen: string) => {
    switch(screen) {
      case 'explore':
        changeTab('home');
        break;
      case 'profile':
        changeTab('profile');
        break;
      case 'matches':
        changeTab('matches');
        break;
      case 'teams':
        changeTab('teams');
        break;
      default:
        changeTab('home');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor }}>
      <Stack screenOptions={{
        headerShown: true,
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FutbolXLogo size={40} showText={false} />
            <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 5 }}>
              FutbolX
            </ThemedText>
          </View>
        ),
        headerTitleAlign: 'left',
        headerShadowVisible: false,
        contentStyle: { backgroundColor: backgroundColor },
        headerStyle: { 
          backgroundColor: cardColor,
        },
        headerTintColor: primaryColor,
      }}>
        <Stack.Screen
          name="index"
          options={{
            title: 'Keşfet',
            headerRight: () => (
              <View style={{ flexDirection: 'row' }}>
                <Link href="/field/reservation" asChild>
                  <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, marginRight: 15 })}>
                    <FontAwesome name="calendar" size={25} color={isDark ? '#FFFFFF' : '#333333'} />
                  </Pressable>
                </Link>
              </View>
            ),
          }}
        />
        <Stack.Screen name="matches" />
        <Stack.Screen name="teams" options={{ title: 'Takımlar' }} />
        <Stack.Screen name="find-match" options={{ title: 'Maç Bul' }} />
        <Stack.Screen name="create-match" options={{ presentation: 'modal', title: 'Yeni Maç Oluştur' }} />
        <Stack.Screen name="profile" />
        <Stack.Screen name="sharePost" options={{ title: 'Gönderi Paylaş' }} />
        <Stack.Screen name="admin" options={{ title: 'Admin Paneli' }} />
        <Stack.Screen name="explore" options={{ title: 'Halı Sahalar' }} />
        <Stack.Screen name="discover" options={{ title: 'Keşfet' }} />
        <Stack.Screen name="videoUpload" options={{ title: 'Video Yükle' }} />
        <Stack.Screen name="edit-profile" options={{ title: 'Profil Düzenle' }} />
      </Stack>
      
      {/* Custom Footer Navigation - Her sayfada görünecek */}
      <View style={[styles.footer, { 
        backgroundColor: cardColor,
        borderTopColor: borderColor
      }]}>
        <HoverableTouchable 
          style={styles.footerTab}
          onPress={() => changeTab('home')}
          onHoverIn={() => setHoveredTab('home')}
          onHoverOut={() => setHoveredTab(null)}
        >
          <View style={[
            styles.iconWrapper, 
            { backgroundColor: hoveredTab === 'home' ? accentColor : (activeTab === 'home' ? primaryColor : '#777') }
          ]}>
            <IconSymbol name="square.grid.2x2" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            { 
              color: activeTab === 'home' ? primaryColor : textColor,
              opacity: activeTab === 'home' ? 1 : 0.7
            }
          ]}>Keşfet</ThemedText>
        </HoverableTouchable>
        
        <HoverableTouchable 
          style={styles.footerTab}
          onPress={() => router.push('/field/reservation')}
          onHoverIn={() => setHoveredTab('reservation')}
          onHoverOut={() => setHoveredTab(null)}
        >
          <View style={[
            styles.iconWrapper, 
            { backgroundColor: hoveredTab === 'reservation' ? accentColor : (pathname.includes('/field/reservation') ? '#4CAF50' : '#777') }
          ]}>
            <IconSymbol name="calendar" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            { 
              color: pathname.includes('/field/reservation') ? '#4CAF50' : textColor,
              fontWeight: pathname.includes('/field/reservation') ? '600' : '500',
              opacity: pathname.includes('/field/reservation') ? 1 : 0.7
            }
          ]}>Rezerv</ThemedText>
        </HoverableTouchable>
        
        <HoverableTouchable 
          style={styles.footerTab}
          onPress={() => changeTab('upload')}
          onHoverIn={() => setHoveredTab('upload')}
          onHoverOut={() => setHoveredTab(null)}
        >
          <View style={[
            styles.iconWrapper, 
            { backgroundColor: hoveredTab === 'upload' ? accentColor : (activeTab === 'upload' ? primaryColor : '#777') }
          ]}>
            <IconSymbol name="square.and.arrow.up" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            { 
              color: activeTab === 'upload' ? primaryColor : textColor,
              opacity: activeTab === 'upload' ? 1 : 0.7
            }
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
            { backgroundColor: hoveredTab === 'profile' ? accentColor : (activeTab === 'profile' ? primaryColor : '#777') }
          ]}>
            <IconSymbol name="person" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            { 
              color: activeTab === 'profile' ? primaryColor : textColor,
              opacity: activeTab === 'profile' ? 1 : 0.7
            }
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
            { backgroundColor: hoveredTab === 'matches' ? accentColor : (activeTab === 'matches' ? primaryColor : '#777') }
          ]}>
            <IconSymbol name="soccerball" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            { 
              color: activeTab === 'matches' ? primaryColor : textColor,
              opacity: activeTab === 'matches' ? 1 : 0.7
            }
          ]}>Maçlar</ThemedText>
        </HoverableTouchable>

        <HoverableTouchable 
          style={styles.footerTab}
          onPress={() => changeTab('teams')}
          onHoverIn={() => setHoveredTab('teams')}
          onHoverOut={() => setHoveredTab(null)}
        >
          <View style={[
            styles.iconWrapper, 
            { backgroundColor: hoveredTab === 'teams' ? accentColor : (activeTab === 'teams' ? primaryColor : '#777') }
          ]}>
            <IconSymbol name="person.3" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            { 
              color: activeTab === 'teams' ? primaryColor : textColor,
              opacity: activeTab === 'teams' ? 1 : 0.7
            }
          ]}>Takımlar</ThemedText>
        </HoverableTouchable>

        <HoverableTouchable 
          style={styles.footerTab}
          onPress={() => router.push('/about' as any)}
          onHoverIn={() => setHoveredTab(null)}
          onHoverOut={() => setHoveredTab(null)}
        >
          <View style={[
            styles.iconWrapper, 
            { backgroundColor: '#777' }
          ]}>
            <IconSymbol name="info.circle" size={22} color="#FFFFFF" />
          </View>
          <ThemedText style={[
            styles.footerTabText, 
            { 
              color: textColor,
              opacity: 0.7
            }
          ]}>Hakkımız</ThemedText>
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
              { backgroundColor: hoveredTab === 'admin' ? accentColor : (activeTab === 'admin' ? primaryColor : '#777') }
            ]}>
              <IconSymbol name="gear" size={22} color="#FFFFFF" />
            </View>
            <ThemedText style={[
              styles.footerTabText, 
              { 
                color: activeTab === 'admin' ? primaryColor : textColor,
                opacity: activeTab === 'admin' ? 1 : 0.7
              }
            ]}>Admin</ThemedText>
          </HoverableTouchable>
        )}
      </View>
      
      {/* Floating ChatBot Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: primaryColor }]}
        onPress={() => setChatBotVisible(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.floatingButtonGradient}
        >
          <Text style={{ fontSize: 24 }}>🤖</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* ChatBot Modal */}
      <ChatBot
        visible={chatBotVisible}
        onClose={() => setChatBotVisible(false)}
        onNavigate={handleChatBotNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'space-between',
  },
  footerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
      }
    })
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease-in-out',
      }
    })
  },
  footerTabText: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease-in-out',
      }
    })
  },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  floatingButtonGradient: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
