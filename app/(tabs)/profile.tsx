import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Text, Platform, Linking, Modal } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { userService, OFFLINE_DATA } from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { IS_OFFLINE_MODE, checkOfflineMode } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '../../components/ui/Card';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import VideoPlayer from '../../components/VideoPlayer';
import PlayerMatcher from '../../components/PlayerMatcher';

// Varsayılan profil resmi URL'si
const DEFAULT_PROFILE_IMAGE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

// Yaklaşan maçlar
const upcomingMatches = [];

// Geçmiş maçlar
const pastMatches = [];

// Kullanıcı profil tipi
type UserProfile = {
  id: string;
  _id?: string;
  name?: string;
  username: string;
  email: string;
  profilePicture: string;
  bio?: string;
  location?: string;
  favoriteTeams?: string[];
  stats?: {
    matches: number;
    goals: number;
    assists: number;
    playHours: number;
    rating: number;
  };
  level?: string;
  position?: string;
  footPreference?: string;
  phone?: string;
  // Stats değerlerine doğrudan erişim için
  matches?: number;
  goals?: number;
  assists?: number;
  playHours?: number;
  // Veritabanından gelen ek alanlar
  firstName?: string;
  lastName?: string;
  footballExperience?: string;
  preferredFoot?: string;
  createdAt?: string;
  updatedAt?: string;
};

import { VideoMeta, videoService, API_URL } from '../../services/videoApi';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVideos, setUserVideos] = useState<VideoMeta[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [pastMatches, setPastMatches] = useState<any[]>([]);
  
  // Gizlilik politikası modalı
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  // Kullanım koşulları modalı
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  
  // PlayerMatcher modalı
  const [showPlayerMatcher, setShowPlayerMatcher] = useState(false);
  
  // Yeni renk şemasından renkleri al - tüm hook'ları bileşenin en üst seviyesinde tanımla
  const tintColor = useThemeColor({}, 'tint');
  const secondaryTint = useThemeColor({}, 'secondaryTint');
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = '#4CAF50'; // Sabit renk
  
  const { user, logout, refreshUserData } = useAuth();
  const router = useRouter();

  const screenWidth = Dimensions.get('window').width;

  // Çevrimdışı mod desteği
  const [isOffline, setIsOffline] = useState(IS_OFFLINE_MODE);
  
  // Stack Screen ekle
  useEffect(() => {
    // Profil sayfası yüklendiğinde çalışacak kodlar
    fetchUserProfile();
    fetchVideos();
    fetchMatches();
    console.log("ProfileScreen useEffect çalıştı - ilk yükleme");
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Sayfa her odaklandığında çalışacak kodlar
      console.log("ProfileScreen useFocusEffect çalıştı - sayfa odaklandı");
      fetchUserProfile();
      return () => {
        // Temizleme işlemleri
        console.log("ProfileScreen cleanup çalıştı");
      };
    }, [])
  );
  
  // Profil verilerini çek - çevrimdışı mod desteği ile
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // Çevrimdışı mod kontrolü
      const offline = await checkOfflineMode();
      setIsOffline(offline);
      
      if (offline) {
        console.log('Çevrimdışı mod: Örnek profil verileri kullanılıyor');
        // Örnek profil verilerini UserProfile formatına dönüştür
        const formattedOfflineUser: UserProfile = {
          id: OFFLINE_DATA.user._id,
          name: OFFLINE_DATA.user.name || '',
          username: OFFLINE_DATA.user.username,
          email: OFFLINE_DATA.user.email,
          profilePicture: OFFLINE_DATA.user.profilePicture || DEFAULT_PROFILE_IMAGE,
          bio: 'Futbol tutkunu',
          location: 'İstanbul',
          level: OFFLINE_DATA.user.level || 'Orta',
          position: OFFLINE_DATA.user.position || 'Forvet',
          footPreference: 'Sağ',
          phone: OFFLINE_DATA.user.phone || '+90 555 123 4567',
          stats: OFFLINE_DATA.user.stats || {
            matches: 15,
            goals: 8,
            assists: 5,
            playHours: 30,
            rating: 4.2
          },
          matches: 15,
          goals: 8,
          assists: 5,
          playHours: 30,
          // Veritabanından gelen ek alanlar
          firstName: 'Test',
          lastName: 'Kullanıcı',
          footballExperience: 'Başlangıç',
          preferredFoot: 'Sağ',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUserData(formattedOfflineUser);
        setLoading(false);
        return;
      }
      
      // AuthContext'ten mevcut kullanıcı bilgilerini al
      // Bu genellikle daha hızlı erişim sağlar ve API yanıt vermediğinde yedek veri kaynağı olur
      if (user) {
        console.log('Mevcut kullanıcı bilgileri kullanılıyor:', user.username || '');
        const userStats = user.stats || {matches: 0, goals: 0, assists: 0, playHours: 0, rating: 0};
        const formattedUserData: UserProfile = {
          id: user.id || '',
          name: user.name || '',
          username: user.username || '',
          email: user.email || '',
          profilePicture: user.profilePicture || DEFAULT_PROFILE_IMAGE,
          bio: user.bio || '',
          location: user.location || '',
          level: user.level || '',
          position: user.position || '',
          footPreference: user.footPreference || '',
          phone: user.phone || '',
          stats: {
            matches: userStats.matches || 0,
            goals: userStats.goals || 0,
            assists: userStats.assists || 0,
            playHours: userStats.playHours || 0,
            rating: userStats.rating || 0
          },
          matches: userStats.matches || 0,
          goals: userStats.goals || 0,
          assists: userStats.assists || 0,
          playHours: userStats.playHours || 0,
          firstName: user.firstName || user.name || '',
          lastName: user.lastName || '',
          footballExperience: user.footballExperience || user.level || '',
          preferredFoot: user.preferredFoot || '',
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString()
        };
        setUserData(formattedUserData);
      }
      
      // Çevrimiçi mod - gerçek API'den verileri çek
      try {
        // Token kontrolü yap
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log('Profil yüklenirken token bulunamadı');
          setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
          setLoading(false);
          return;
        }
        
      const profileData = await userService.getProfile();
      console.log('Profil verileri:', profileData);
      
      // Gelen verileri UserProfile formatına dönüştür
      const stats = profileData.stats || {};
      const formattedData: UserProfile = {
        id: profileData._id || profileData.id || '',
        name: profileData.name || user?.name || '',
        username: profileData.username || user?.username || '',
        email: profileData.email || user?.email || '',
        profilePicture: profileData.profilePicture || user?.profilePicture || DEFAULT_PROFILE_IMAGE,
        bio: profileData.bio || user?.bio || '',
        location: profileData.location || user?.location || '',
        favoriteTeams: profileData.favoriteTeams || [],
        level: profileData.level || user?.level || '',
        position: profileData.position || user?.position || '',
        footPreference: profileData.footPreference || user?.footPreference || '',
        phone: profileData.phone || user?.phone || '',
        stats: {
          matches: stats.matches || 0,
          goals: stats.goals || 0,
          assists: stats.assists || 0,
          playHours: stats.playHours || 0,
          rating: stats.rating || 0
        },
        // Doğrudan erişim için ek alanlar
        matches: stats.matches || 0,
        goals: stats.goals || 0,
        assists: stats.assists || 0,
        playHours: stats.playHours || 0,
        firstName: profileData.firstName || profileData.name || '',
        lastName: profileData.lastName || '',
        footballExperience: profileData.footballExperience || profileData.level || '',
        preferredFoot: profileData.preferredFoot || '',
        createdAt: profileData.createdAt || new Date().toISOString(),
        updatedAt: profileData.updatedAt || new Date().toISOString()
      };
            
      setUserData(formattedData);
      } catch (apiError) {
        console.error('API verilerini alırken hata:', apiError);
        // API hatası durumunda mevcut userData kullanıyoruz (UserContext'ten)
        if (!userData) {
          setError('Profil verileri yüklenemedi. Lütfen tekrar deneyin.');
        }
      }
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      
      // Eğer halihazırda userData varsa (önce context'ten alındıysa), hata gösterme ve mevcut verileri kullan
      if (userData) {
        console.log('API hatası, mevcut önbellek verileri kullanılıyor');
        return;
      }
      
      Alert.alert(
        'Bağlantı Hatası', 
        'Profil bilgileri yüklenemedi. Çevrimdışı mod etkinleştiriliyor.',
      );
      } finally {
        setLoading(false);
      // Token yenileme işlemi
      try {
        await refreshUserData();
      } catch (refreshError) {
        console.log('Token yenileme hatası:', refreshError);
      }
      }
    };

  // Videoları getir
    const fetchVideos = async () => {
      if (user) {
        try {
          const userId = user.id || '';
          const videos = await videoService.listByUser(userId);
          setUserVideos(videos);
        } catch (err) {
          // Hata durumunda video listesi boş kalsın
          setUserVideos([]);
        }
      }
    };

  // Maçları çekme fonksiyonu (yaklaşan ve geçmiş)
  const fetchMatches = async () => {
    if (user) {
      try {
        // Bu fonksiyonları backend'de uygulamanız gerekiyor
        // const upcomingData = await matchService.getUpcomingMatches(user.id);
        // const pastData = await matchService.getPastMatches(user.id);
        
        setUpcomingMatches([]); // API entegrasyonu sonrası upcomingData ile değiştirin
        setPastMatches([]); // API entegrasyonu sonrası pastData ile değiştirin
      } catch (err) {
        console.error('Maçları getirme hatası:', err);
        // Hata durumunda boş listeler göster
        setUpcomingMatches([]);
        setPastMatches([]);
      }
    }
  };

  // Çıkış yapma fonksiyonu
  const handleLogout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Çıkış Yap",
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  // Yıldız derecelendirmesi gösterimi
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const stars: React.ReactNode[] = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <IconSymbol key={`star-${i}`} name="star.fill" size={14} color="#FFC107" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <IconSymbol key={`star-half-${i}`} name="star.leadinghalf.filled" size={14} color="#FFC107" />
        );
      } else {
        stars.push(
          <IconSymbol key={`star-empty-${i}`} name="star" size={14} color="#FFC107" />
        );
      }
    }

    return (
      <View style={styles.stars}>
        {stars}
        <ThemedText style={styles.ratingText}>{rating.toFixed(1)}</ThemedText>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.profileHeader}>
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.headerBackground}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <View style={styles.headerContent}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ 
                  uri: userData?.profilePicture ? 
                    `https://api.futbolx.app/uploads/${userData?.profilePicture}` : 
                    DEFAULT_PROFILE_IMAGE
                }}
                style={styles.profileImage} 
              />
              {isOffline && (
                <View style={styles.offlineBadge}>
                  <IconSymbol name="wifi.slash" size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <ThemedText style={[styles.profileName, {color: '#FFFFFF', fontSize: 26}]}>
                Hoş Geldin, {userData?.firstName || userData?.name || userData?.username || "Kullanıcı"}!
              </ThemedText>
              <ThemedText style={[styles.profileUsername, {color: 'rgba(255,255,255,0.9)'}]}>
                @{userData?.username || "kullanici"}
              </ThemedText>
            </View>
            
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => router.push('/edit-profile')}
            >
              <IconSymbol name="pencil" size={16} color="#FFFFFF" />
              <ThemedText style={styles.editProfileText}>Düzenle</ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderTabs = () => {
    const profileTabStyle = activeTab === 'profile' 
      ? [styles.activeTabButton, { borderBottomColor: tintColor }] 
      : {};
    
    const profileTextStyle = activeTab === 'profile' 
      ? [styles.activeTabText, { color: tintColor }] 
      : {};
    
    const settingsTabStyle = activeTab === 'settings' 
      ? [styles.activeTabButton, { borderBottomColor: tintColor }] 
      : {};
    
    const settingsTextStyle = activeTab === 'settings' 
      ? [styles.activeTabText, { color: tintColor }] 
      : {};
    
    return (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[
          styles.tabButton,
          profileTabStyle
        ]}
        onPress={() => setActiveTab('profile')}
      >
        <ThemedText 
          style={[
            styles.tabText, 
            profileTextStyle
          ]}
        >
          Profil
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.tabButton,
          settingsTabStyle
        ]}
        onPress={() => setActiveTab('settings')}
      >
        <ThemedText 
          style={[
            styles.tabText, 
            settingsTextStyle
          ]}
        >
          Ayarlar
        </ThemedText>
      </TouchableOpacity>
    </View>
  )};

  const renderProfileDetails = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Profil yükleniyor...</ThemedText>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={50} color="#e53935" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: tintColor }]}
            onPress={() => {
              setError(null);
              fetchUserProfile();
            }}
          >
            <ThemedText style={styles.retryButtonText}>Tekrar Dene</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (!userData) {
      return (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={50} color="#e53935" />
          <ThemedText style={styles.errorText}>Kullanıcı bilgileri yüklenemedi</ThemedText>
        </View>
      );
    }
    
    // Stil değişkenlerini önceden hesapla
    const editButtonStyle = { backgroundColor: tintColor };
    const statValueStyle = { color: tintColor };
    const characteristicValueStyle = { color: tintColor };
    
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <ThemedText style={styles.infoTitle}>Kullanıcı Bilgileri</ThemedText>
            <TouchableOpacity 
              style={[styles.editButtonSmall, editButtonStyle]} 
              onPress={() => {
                router.push('/(tabs)/edit-profile' as any);
              }}
            >
              <IconSymbol name="pencil" size={16} color="#FFFFFF" />
              <ThemedText style={styles.editButtonTextSmall}>Düzenle</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}><ThemedText style={styles.infoLabel}>Ad:</ThemedText><ThemedText style={styles.infoValue}>{userData.firstName || '-'}</ThemedText></View>
          <View style={styles.infoRow}><ThemedText style={styles.infoLabel}>Soyad:</ThemedText><ThemedText style={styles.infoValue}>{userData.lastName || '-'}</ThemedText></View>
          <View style={styles.infoRow}><ThemedText style={styles.infoLabel}>Kullanıcı Adı:</ThemedText><ThemedText style={styles.infoValue}>{userData.username || '-'}</ThemedText></View>
          <View style={styles.infoRow}><ThemedText style={styles.infoLabel}>E-posta:</ThemedText><ThemedText style={styles.infoValue}>{userData.email || '-'}</ThemedText></View>
          <View style={styles.infoRow}><ThemedText style={styles.infoLabel}>Telefon:</ThemedText><ThemedText style={styles.infoValue}>{userData.phone || '-'}</ThemedText></View>
          <View style={styles.infoRow}><ThemedText style={styles.infoLabel}>Konum:</ThemedText><ThemedText style={styles.infoValue}>{userData.location || '-'}</ThemedText></View>
          <View style={[styles.infoRow, {borderBottomWidth: 0}]}><ThemedText style={styles.infoLabel}>Hakkında:</ThemedText><ThemedText style={styles.infoValue}>{userData.bio || '-'}</ThemedText></View>
        </View>
        
        <View style={[styles.infoCard, { marginTop: 16 }]}>
          <View style={styles.infoHeader}>
            <ThemedText style={styles.infoTitle}>Futbol Özellikleri</ThemedText>
            <TouchableOpacity 
              style={[styles.editButtonSmall, editButtonStyle]} 
              onPress={() => {
                router.push('/(tabs)/edit-profile' as any);
              }}
            >
              <IconSymbol name="pencil" size={16} color="#FFFFFF" />
              <ThemedText style={styles.editButtonTextSmall}>Düzenle</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footballCharacteristics}>
            <View style={[styles.characteristicItem, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <IconSymbol name="medal" size={24} color={tintColor} />
              <ThemedText style={styles.characteristicLabel}>Seviye</ThemedText>
              <ThemedText style={[styles.characteristicValue, characteristicValueStyle]}>{userData.footballExperience || '-'}</ThemedText>
            </View>
            
            <View style={[styles.characteristicItem, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <IconSymbol name="person.fill" size={24} color={tintColor} />
              <ThemedText style={styles.characteristicLabel}>Pozisyon</ThemedText>
              <ThemedText style={[styles.characteristicValue, characteristicValueStyle]}>{userData.position || '-'}</ThemedText>
            </View>
            
            <View style={[styles.characteristicItem, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <IconSymbol name="figure.walk" size={24} color={tintColor} />
              <ThemedText style={styles.characteristicLabel}>Ayak Tercihi</ThemedText>
              <ThemedText style={[styles.characteristicValue, characteristicValueStyle]}>{userData.footPreference || '-'}</ThemedText>
            </View>
          </View>
          
          <View style={[styles.infoRow, {borderBottomWidth: 0}]}><ThemedText style={styles.infoLabel}>İlerleme:</ThemedText><ThemedText style={styles.infoValue}>{userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('tr-TR') : '-'}</ThemedText></View>
        </View>
        
        <View style={[styles.statsContainer, { backgroundColor: cardColor }]}> 
          <View style={styles.statsHeader}>
            <ThemedText style={styles.statsTitle}>İstatistikler</ThemedText>
            <TouchableOpacity 
              style={[styles.editButtonSmall, editButtonStyle]} 
              onPress={() => {
                router.push('/(tabs)/edit-profile' as any);
              }}
            >
              <IconSymbol name="pencil" size={16} color="#FFFFFF" />
              <ThemedText style={styles.editButtonTextSmall}>Düzenle</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statisticContent}>
              <ThemedText style={[styles.statValue, statValueStyle]}>{userData.stats?.matches || '0'}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Maçlar</ThemedText>
            </View>
            <View style={styles.statisticContent}>
              <ThemedText style={[styles.statValue, statValueStyle]}>{userData.stats?.goals || '0'}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Goller</ThemedText>
            </View>
            <View style={styles.statisticContent}>
              <ThemedText style={[styles.statValue, statValueStyle]}>{userData.stats?.assists || '0'}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Asistler</ThemedText>
            </View>
            <View style={styles.statisticContent}>
              <ThemedText style={[styles.statValue, statValueStyle]}>{userData.stats?.playHours || '0'}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Saat</ThemedText>
            </View>
          </View>
        </View>

        {/* Oyuncu Eşleştirme Butonu */}
        <TouchableOpacity 
          style={styles.playerMatchButton}
          onPress={() => setShowPlayerMatcher(true)}
        >
          <LinearGradient
            colors={[accentColor, '#4CAF50']}
            style={styles.playerMatchGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <IconSymbol name="person.3.fill" size={24} color="white" />
            <ThemedText style={styles.playerMatchButtonText}>🏆 Takım Arkadaşı Bul</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSettings = () => {
    // Bildirim ayarları sayfasına yönlendirme
    const handleNotificationSettings = () => {
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
      } else if (Platform.OS === 'android') {
        Linking.openSettings();
      } else {
        // Web veya diğer platformlar
        Alert.alert("Bildirim Ayarları", "Bildirim ayarlarını cihaz ayarlarınızdan değiştirebilirsiniz.");
      }
    };

    // Gizlilik ve güvenlik
    const handlePrivacySettings = () => {
      Alert.alert(
        "Gizlilik ve Güvenlik",
        "Hesap gizliliği ve güvenlik ayarlarınızı güncellemek ister misiniz?",
        [
          { text: "İptal", style: "cancel" },
          { 
            text: "Şifre Değiştir", 
            onPress: () => router.push('/change-password' as any)
          },
          { 
            text: "Gizlilik Ayarları", 
            onPress: () => setShowPrivacyPolicy(true)
          }
        ]
      );
    };

    // Konum ayarları
    const handleLocationSettings = () => {
      Alert.alert(
        "Konum Ayarları",
        "Konum hizmetlerini yönetin",
        [
          { text: "İptal", style: "cancel" },
          { 
            text: "Konum İzinleri", 
            onPress: () => {
              if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Linking.openSettings();
              } else {
                Alert.alert("Bilgi", "Konum izinlerini tarayıcı ayarlarınızdan değiştirebilirsiniz.");
              }
            }
          },
          { 
            text: "Yakındaki Sahalar", 
            onPress: () => router.push('/field/reservation' as any)
          }
        ]
      );
    };

    return (
      <View style={styles.settingsContainer}>
        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingsItem} onPress={() => router.push('/(tabs)/edit-profile')}>
            <IconSymbol name="person.circle" size={24} color={accentColor} />
            <ThemedText style={styles.settingsItemText}>Profil Bilgilerini Düzenle</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={secondaryTextColor} />
          </TouchableOpacity>
          
          <View style={styles.settingsDivider} />
          
          <TouchableOpacity style={styles.settingsItem} onPress={handleNotificationSettings}>
            <IconSymbol name="bell" size={24} color={accentColor} />
            <ThemedText style={styles.settingsItemText}>Bildirim Ayarları</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={secondaryTextColor} />
          </TouchableOpacity>
          
          <View style={styles.settingsDivider} />
            
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={handlePrivacySettings}
          >
            <IconSymbol name="lock.shield" size={24} color={accentColor} />
            <ThemedText style={styles.settingsItemText}>Gizlilik ve Güvenlik</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={secondaryTextColor} />
          </TouchableOpacity>
          
          <View style={styles.settingsDivider} />
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={handleLocationSettings}
          >
            <IconSymbol name="map" size={24} color={accentColor} />
            <ThemedText style={styles.settingsItemText}>Konum Ayarları</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={secondaryTextColor} />
          </TouchableOpacity>
        </Card>
        
        <Card style={styles.settingsCard}>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => {
              Alert.alert(
                "Yardım ve Destek",
                "Size nasıl yardımcı olabiliriz?",
                [
                  { text: "İptal", style: "cancel" },
                  { 
                    text: "E-posta Gönder", 
                    onPress: () => Linking.openURL('mailto:bilikcitalha@gmail.com?subject=FutbolX%20Destek%20Talebi')
                  },
                  {
                    text: "SSS Görüntüle",
                    onPress: () => router.push('/about' as any)
                  }
                ]
              );
            }}
          >
            <IconSymbol name="questionmark.circle" size={24} color={accentColor} />
            <ThemedText style={styles.settingsItemText}>Yardım ve Destek</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={secondaryTextColor} />
          </TouchableOpacity>
          
          <View style={styles.settingsDivider} />
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => setShowTermsOfService(true)}
          >
            <IconSymbol name="doc.text" size={24} color={accentColor} />
            <ThemedText style={styles.settingsItemText}>Kullanım Koşulları</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={secondaryTextColor} />
          </TouchableOpacity>
          
          <View style={styles.settingsDivider} />
            
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => setShowPrivacyPolicy(true)}
          >
            <IconSymbol name="hand.raised" size={24} color={accentColor} />
            <ThemedText style={styles.settingsItemText}>Gizlilik Politikası</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={secondaryTextColor} />
          </TouchableOpacity>
        </Card>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <IconSymbol name="arrow.right.square" size={20} color="#FFFFFF" />
          <ThemedText style={styles.logoutButtonText}>Çıkış Yap</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  // Çevrimdışı mod uyarısı ekleyelim
  const renderOfflineBanner = () => {
    if (isOffline) {
      return (
        <View style={styles.offlineBanner}>
          <IconSymbol name="exclamationmark.triangle" size={16} color="#FFFFFF" />
          <Text style={styles.offlineBannerText}>Çevrimdışı Mod - Demo verileri görüntüleniyor</Text>
        </View>
      );
    }
    return null;
  };

  // Yükleme durumunu kontrol et
  if (loading && !userData) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Profil bilgileri yükleniyor...</ThemedText>
        </View>
      </ThemedView>
    );
  }
  
  // Hata durumunu kontrol et
  if (error && !userData) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={40} color="tomato" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: tintColor, marginTop: 20 }]}
            onPress={() => router.replace('/(auth)/login')}
          >
            <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Giriş Sayfasına Dön</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }
  
  // Profil sayfasında gösterilecek içerik
  const renderProfileContent = () => {
    return (
      <View>
        {renderProfileDetails()}
        
        {/* Son Aktivitelerim */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="clock.arrow.circlepath" size={20} color="#4CAF50" />
            <ThemedText style={styles.sectionTitle}>Son Aktivitelerim</ThemedText>
          </View>
          
          <View style={styles.activitiesContainer}>
            <View style={styles.activityCard}>
              <View style={styles.activityIconContainer}>
                <IconSymbol name="person.2.fill" size={20} color="#4CAF50" />
              </View>
              <View style={styles.activityContent}>
                <ThemedText style={styles.activityTitle}>Takım Oyunu</ThemedText>
                <ThemedText style={styles.activityDescription}>3 vs 3 maçına katıldınız</ThemedText>
                <ThemedText style={styles.activityTime}>2 gün önce</ThemedText>
              </View>
            </View>
            
            <View style={styles.activityCard}>
              <View style={styles.activityIconContainer}>
                <IconSymbol name="star.fill" size={20} color="#FFC107" />
              </View>
              <View style={styles.activityContent}>
                <ThemedText style={styles.activityTitle}>Başarı Kazandınız</ThemedText>
                <ThemedText style={styles.activityDescription}>5 gol atma başarısı kazandınız</ThemedText>
                <ThemedText style={styles.activityTime}>1 hafta önce</ThemedText>
              </View>
            </View>
            
            <View style={styles.activityCard}>
              <View style={styles.activityIconContainer}>
                <IconSymbol name="soccerball" size={20} color="#2196F3" />
              </View>
              <View style={styles.activityContent}>
                <ThemedText style={styles.activityTitle}>Yeni Antrenman</ThemedText>
                <ThemedText style={styles.activityDescription}>Haftalık antrenman programınız güncellendi</ThemedText>
                <ThemedText style={styles.activityTime}>2 hafta önce</ThemedText>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => {
              Alert.alert(
                "Aktiviteler",
                "Yakında tüm aktivitelerinize buradan erişebileceksiniz.",
                [
                  { text: "Tamam", style: "default" }
                ]
              );
            }}
          >
            <ThemedText style={styles.viewAllButtonText}>Tümünü Görüntüle</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        
        {/* Halı Sahalarımız */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="soccerball" size={20} color="#4CAF50" />
            <ThemedText style={styles.sectionTitle}>Halı Sahalarımız</ThemedText>
          </View>
          
          <View style={styles.fieldList}>
            <TouchableOpacity 
              style={styles.fieldCard}
              onPress={() => router.push('/field/reservation?id=halisaha1')}
            >
              <View style={styles.fieldImageContainer}>
                <Image 
                  source={require('@/assets/images/pitch1.jpg')}
                  style={styles.fieldImage}
                />
                <View style={styles.fieldOverlay}>
                  {/* Rakamlar kaldırıldı */}
                </View>
              </View>
              <ThemedText style={styles.fieldName}>Halı Saha 1</ThemedText>
              <TouchableOpacity 
                style={styles.reserveButton}
                onPress={() => router.push('/fields')}
              >
                {/* <IconSymbol name="calendar" size={14} color="#FFFFFF" /> */}
                <ThemedText style={styles.reserveButtonText}>Rezerv Et</ThemedText>
              </TouchableOpacity>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.fieldCard}
              onPress={() => router.push('/field/reservation?id=halisaha2')}
            >
              <View style={styles.fieldImageContainer}>
                <Image 
                  source={require('@/assets/images/pitch2.jpg')}
                  style={styles.fieldImage}
                />
                <View style={styles.fieldOverlay}>
                  {/* Rakamlar kaldırıldı */}
                </View>
              </View>
              <ThemedText style={styles.fieldName}>Halı Saha 2</ThemedText>
              <TouchableOpacity 
                style={styles.reserveButton}
                onPress={() => router.push('/fields')}
              >
                {/* <IconSymbol name="calendar" size={14} color="#FFFFFF" /> */}
                <ThemedText style={styles.reserveButtonText}>Rezerv Et</ThemedText>
              </TouchableOpacity>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.fieldCard}
              onPress={() => router.push('/field/reservation?id=halisaha3')}
            >
              <View style={styles.fieldImageContainer}>
                <Image 
                  source={require('@/assets/images/pitch3.jpg')}
                  style={styles.fieldImage}
                />
                <View style={styles.fieldOverlay}>
                  {/* Rakamlar kaldırıldı */}
                </View>
              </View>
              <ThemedText style={styles.fieldName}>Halı Saha 3</ThemedText>
              <TouchableOpacity 
                style={styles.reserveButton}
                onPress={() => router.push('/fields')}
              >
                {/* <IconSymbol name="calendar" size={14} color="#FFFFFF" /> */}
                <ThemedText style={styles.reserveButtonText}>Rezerv Et</ThemedText>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Aktif sekmeye göre içerik render etme
  const renderActiveTabContent = () => {
    if (activeTab === 'profile') {
      return renderProfileContent();
    } else {
      return renderSettings();
    }
  };

  // Gizlilik politikası ve kullanım koşulları
  const privacyPolicy = `
FutbolX Gizlilik Politikası

1. Toplanan Bilgiler
FutbolX uygulaması, kullanıcılarından ad, soyad, e-posta adresi, telefon numarası, konum bilgileri, futbol deneyimi ve tercih edilen pozisyon gibi kişisel bilgileri toplar.

2. Bilgilerin Kullanımı
Toplanan bilgiler şu amaçlarla kullanılır:
- Kullanıcı hesabının oluşturulması ve yönetilmesi
- Halı saha rezervasyonlarının yapılması
- Maç organizasyonu ve eşleştirme
- Kullanıcı deneyiminin kişiselleştirilmesi
- Uygulama performansının ve kullanıcı memnuniyetinin artırılması

3. Bilgi Paylaşımı
Kullanıcı bilgileri, kullanıcının açık izni olmadan üçüncü taraflarla paylaşılmaz. Ancak, yasal zorunluluk durumlarında veya kullanıcının güvenliğini sağlamak amacıyla gerekli görüldüğünde bilgiler paylaşılabilir.

4. Veri Güvenliği
FutbolX, kullanıcı bilgilerinin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri alır. Veriler şifrelenir ve güvenli sunucularda saklanır.

5. Çerezler
FutbolX, kullanıcı deneyimini iyileştirmek için çerezler kullanabilir. Kullanıcılar tarayıcı ayarlarından çerezleri yönetebilir.

6. Kullanıcı Hakları
Kullanıcılar, kişisel verilerine erişme, düzeltme, silme ve veri işleme faaliyetlerini kısıtlama haklarına sahiptir.

7. Politika Değişiklikleri
FutbolX, gizlilik politikasını güncelleyebilir. Değişiklikler uygulama üzerinden bildirilir.

8. İletişim
Gizlilik politikası ile ilgili sorular için: bilikcitalha@gmail.com
`;

  const termsOfService = `
FutbolX Kullanım Koşulları

1. Hizmet Kullanımı
FutbolX uygulaması, futbol severlere halı saha rezervasyonu, maç organizasyonu ve sosyal etkileşim imkanı sunan bir platformdur. Kullanıcılar, uygulamayı yasal ve etik kurallara uygun şekilde kullanmayı kabul eder.

2. Hesap Oluşturma
Kullanıcılar, doğru ve güncel bilgilerle hesap oluşturmalıdır. Hesap bilgilerinin güvenliğinden kullanıcı sorumludur.

3. İçerik Politikası
Kullanıcılar, paylaştıkları içeriklerin yasal ve uygun olmasını sağlamalıdır. Yasadışı, zararlı, tehdit edici, taciz edici veya nefret içeren içerikler yasaktır.

4. Fikri Mülkiyet
FutbolX uygulamasının tüm içeriği ve tasarımı, fikri mülkiyet hakları kapsamında korunmaktadır. Kullanıcılar, bu içeriği izinsiz kullanamaz veya dağıtamaz.

5. Sorumluluk Sınırlaması
FutbolX, uygulama kullanımından kaynaklanan doğrudan veya dolaylı zararlardan sorumlu değildir. Rezervasyon ve maç organizasyonlarında yaşanabilecek aksaklıklardan kullanıcılar sorumludur.

6. Hesap Sonlandırma
FutbolX, kullanım koşullarını ihlal eden kullanıcıların hesaplarını askıya alma veya sonlandırma hakkına sahiptir.

7. Değişiklikler
FutbolX, kullanım koşullarını dilediği zaman değiştirebilir. Değişiklikler uygulama üzerinden bildirilir.

8. İletişim
Kullanım koşulları ile ilgili sorular için: bilikcitalha@gmail.com
`;

  const renderPrivacyPolicyModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPrivacyPolicy}
        onRequestClose={() => setShowPrivacyPolicy(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScrollView}>
              <ThemedText style={styles.modalTitle}>Gizlilik Politikası</ThemedText>
              <ThemedText style={styles.modalText}>{privacyPolicy}</ThemedText>
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, {backgroundColor: accentColor}]}
              onPress={() => setShowPrivacyPolicy(false)}
            >
              <ThemedText style={styles.modalButtonText}>Kapat</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTermsOfServiceModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTermsOfService}
        onRequestClose={() => setShowTermsOfService(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScrollView}>
              <ThemedText style={styles.modalTitle}>Kullanım Koşulları</ThemedText>
              <ThemedText style={styles.modalText}>{termsOfService}</ThemedText>
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, {backgroundColor: accentColor}]}
              onPress={() => setShowTermsOfService(false)}
            >
              <ThemedText style={styles.modalButtonText}>Kapat</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Profil bilgilerini güncelleme fonksiyonu
  const updateUserProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const result = await userService.updateProfile(updatedData);
      
      if (result) {
        // Başarılı güncelleme sonrası kullanıcı verilerini yenile
        setUserData(prev => prev ? { ...prev, ...updatedData } : null);
        
        // AuthContext'teki kullanıcı bilgilerini de güncelle
        if (refreshUserData) {
          await refreshUserData();
        }
        
        Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
      }
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert('Hata', error.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Oyuncu eşleştirme fonksiyonu
  const handleMatchPlayers = async () => {
    try {
      const result = await userService.matchPlayers();
      return result;
    } catch (error: any) {
      console.error('Oyuncu eşleştirme hatası:', error);
      throw new Error(error.message || 'Oyuncu eşleştirme sırasında hata oluştu');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      
      <Stack.Screen
        options={{
          headerTitle: "FutbolX",
          headerTitleStyle: { 
            fontWeight: '700', 
            fontSize: 20
          },
          headerStyle: { backgroundColor: primaryColor },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      {isOffline && renderOfflineBanner()}
      
      {/* Profil Banner */}
      <View style={styles.profileBanner}>
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.bannerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <View style={styles.bannerContent}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/33/33699.png' }} 
              style={styles.footballIcon} 
              resizeMode="contain"
            />
            <ThemedText style={styles.bannerTitle}>Profilim</ThemedText>
          </View>
        </LinearGradient>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderTabs()}
        {renderActiveTabContent()}
      </ScrollView>

      {/* Video Oynatıcı Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <IconSymbol name="xmark" size={24} color="#FFF" />
            </TouchableOpacity>
            {selectedVideoUrl && (
              <VideoPlayer
                uri={selectedVideoUrl}
                autoPlay={true}
                isFullScreen={true}
                onClose={() => setModalVisible(false)}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Gizlilik Politikası Modal */}
      {renderPrivacyPolicyModal()}
      
      {/* Kullanım Koşulları Modal */}
      {renderTermsOfServiceModal()}

      {/* Oyuncu Eşleştirme Modal */}
      <PlayerMatcher
        visible={showPlayerMatcher}
        onClose={() => setShowPlayerMatcher(false)}
        userPosition={userData?.position}
        userLocation={userData?.location}
        onMatchPlayers={handleMatchPlayers}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  profileHeader: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerBackground: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  offlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileUsername: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editProfileText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    justifyContent: 'space-around',
    paddingBottom: 2,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginBottom: 28,
    marginHorizontal: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
    paddingBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#555',
    width: 110,
    fontSize: 15,
  },
  infoValue: {
    color: '#222',
    fontSize: 15,
    flex: 1,
  },
  editButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  editButtonTextSmall: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#4CAF50',
  },
  activitiesContainer: {
    marginTop: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  activityIconContainer: {
    marginRight: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  viewAllButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  settingsContainer: {
    padding: 16,
  },
  settingsCard: {
    marginBottom: 16,
    padding: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  settingsItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  offlineBanner: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  footballCharacteristics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  characteristicItem: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  characteristicLabel: {
    fontSize: 12,
    marginTop: 6,
    marginBottom: 4,
    textAlign: 'center',
  },
  characteristicValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalScrollView: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  profileTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 3,
  },
  headerBanner: {
    height: 120,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  patternBackground: {
    width: '100%',
    height: '100%',
  },
  profileBanner: {
    position: 'relative',
  },
  bannerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  footballIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF',
    opacity: 0.8,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 15,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    backgroundColor: '#000',
    width: '100%',
    height: '50%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  // İstatistikler bölümü için stiller
  statsContainer: {
    marginTop: 16,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
    paddingBottom: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 5,
    color: '#4CAF50',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  statisticContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  // Düğmeler için stiller
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fieldList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fieldCard: {
    width: '31%',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  fieldImageContainer: {
    position: 'relative',
    height: 90,
  },
  fieldImage: {
    width: '100%',
    height: '100%',
  },
  fieldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    padding: 8,
    textAlign: 'center',
  },
  reserveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 70,
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  playerMatchButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  playerMatchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  playerMatchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
});

