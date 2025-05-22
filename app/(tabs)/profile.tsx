import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Text, Platform, Linking, Modal } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { userService } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { IS_OFFLINE_MODE, OFFLINE_DATA, checkOfflineMode } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '../../components/ui/Card';

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
import VideoPlayer from '../../components/VideoPlayer';

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
        const offlineUser = OFFLINE_DATA.user;
        const formattedOfflineUser: UserProfile = {
          id: offlineUser._id,
          name: offlineUser.name || '',
          username: offlineUser.username,
          email: offlineUser.email,
          profilePicture: offlineUser.profilePicture || DEFAULT_PROFILE_IMAGE,
          bio: 'Futbol tutkunu',
          location: 'İstanbul',
          level: offlineUser.level || 'Orta',
          position: offlineUser.position || 'Forvet',
          footPreference: 'Sağ',
          phone: offlineUser.phone || '+90 555 123 4567',
          stats: offlineUser.stats || {
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

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
      fetchVideos();
      fetchMatches();
      
      // Cleanup function if needed
      return () => {
        // Cleanup code here if needed
      };
    }, []) // Empty dependency array ensures this only runs when screen is focused
  );

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
        />
        
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
          <ThemedText style={[styles.profileName, {color: '#FFFFFF'}]}>
            {userData?.firstName} {userData?.lastName}
                  </ThemedText>
          <ThemedText style={[styles.profileUsername, {color: 'rgba(255,255,255,0.9)'}]}>
            @{userData?.username || "kullanici"}
                  </ThemedText>
          
          <View style={styles.profileStatsContainer}>
            <View style={styles.badgeContainer}>
              <IconSymbol name="person.badge.key" size={16} color="#FFC107" />
              <ThemedText style={styles.badgeText}>
                {userData?.footballExperience || "Sporcu"}
                  </ThemedText>
                </View>
              </View>
            </View>
        
          <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => router.push('/edit-profile')}
          >
          <IconSymbol name="pencil" size={16} color="#FFFFFF" />
          <ThemedText style={styles.editProfileText}>Düzenle</ThemedText>
          </TouchableOpacity>
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
          
          <View style={[styles.infoRow, {borderBottomWidth: 0}]}><ThemedText style={styles.infoLabel}>İlerleme:</ThemedText><ThemedText style={styles.infoValue}>{userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-'}</ThemedText></View>
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
  
  // Aktif sekmeye göre içerik render etme
  const renderActiveTabContent = () => {
    if (activeTab === 'profile') {
        return renderProfileDetails();
    } else if (activeTab === 'settings') {
      return renderSettings();
    }
    return renderProfileDetails();
  };

  // Profil sayfasındaki istatistik kartları için düzenleme
  const renderProfileStatistics = () => {
    // Stil değişkenlerini önceden hesapla
    const iconContainerStyle = { backgroundColor: accentColor };
    
    return (
      <View style={[styles.statsContainer, { marginTop: 20, marginBottom: 30 }]}>
        <ThemedText style={[styles.statsTitle, { marginBottom: 16 }]}>İstatistiklerim</ThemedText>
        <ScrollView horizontal={false} showsHorizontalScrollIndicator={false}>
          <View style={styles.statsRowContainer}>
            <Card style={styles.statisticCard}>
              <View style={styles.statisticContent}>
                <View style={[styles.statisticIconContainer, iconContainerStyle]}>
                  <IconSymbol name="figure.soccer" size={24} color="white" />
                </View>
                <View style={styles.statisticTextContent}>
                  <ThemedText style={styles.statValue}>{userData?.matches || 0}</ThemedText>
                  <ThemedText style={styles.statLabel}>Maçlar</ThemedText>
                </View>
              </View>
            </Card>

            <Card style={styles.statisticCard}>
              <View style={styles.statisticContent}>
                <View style={[styles.statisticIconContainer, iconContainerStyle]}>
                  <IconSymbol name="soccerball" size={24} color="white" />
                </View>
                <View style={styles.statisticTextContent}>
                  <ThemedText style={styles.statValue}>{userData?.goals || 0}</ThemedText>
                  <ThemedText style={styles.statLabel}>Goller</ThemedText>
                </View>
              </View>
            </Card>
          </View>

          <View style={styles.statsRowContainer}>
            <Card style={styles.statisticCard}>
              <View style={styles.statisticContent}>
                <View style={[styles.statisticIconContainer, iconContainerStyle]}>
                  <IconSymbol name="hand.point.up" size={24} color="white" />
                </View>
                <View style={styles.statisticTextContent}>
                  <ThemedText style={styles.statValue}>{userData?.assists || 0}</ThemedText>
                  <ThemedText style={styles.statLabel}>Asistler</ThemedText>
                </View>
              </View>
            </Card>

            <Card style={styles.statisticCard}>
              <View style={styles.statisticContent}>
                <View style={[styles.statisticIconContainer, iconContainerStyle]}>
                  <IconSymbol name="clock" size={24} color="white" />
                </View>
                <View style={styles.statisticTextContent}>
                  <ThemedText style={styles.statValue}>{userData?.playHours || 0}</ThemedText>
                  <ThemedText style={styles.statLabel}>Oyun Saati</ThemedText>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </View>
    );
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
      
      // Mevcut kullanıcı verilerini al
      const currentUserData = userData || {};
      
      // Güncellenecek verileri hazırla
      const profileUpdateData = {
        ...currentUserData,
        ...updatedData
      };
      
      // API'ye gönderilecek verileri hazırla
      const apiData = {
        firstName: profileUpdateData.firstName,
        lastName: profileUpdateData.lastName,
        bio: profileUpdateData.bio,
        location: profileUpdateData.location,
        level: profileUpdateData.level,
        position: profileUpdateData.position,
        footPreference: profileUpdateData.footPreference,
        footballExperience: profileUpdateData.footballExperience,
        preferredFoot: profileUpdateData.preferredFoot,
        phone: profileUpdateData.phone
      };
      
      // API çağrısı yap
      await userService.updateProfile(apiData);
      
      // Kullanıcı verilerini yenile
      await refreshUserData();
      
      // Profil verilerini tekrar çek
      await fetchUserProfile();
      
      Alert.alert("Başarılı", "Profil bilgileriniz güncellendi.");
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert("Hata", error.message || "Profil güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {renderOfflineBanner()}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderHeader()}
        {renderTabs()}
        {renderActiveTabContent()}
        {renderProfileStatistics()}
      </ScrollView>
      {renderPrivacyPolicyModal()}
      {renderTermsOfServiceModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
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
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
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
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 14,
  },
  profileStatsContainer: {
    marginTop: 16,
  },
  editProfileText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '600',
  },
  offlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackground: {
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
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 12,
    letterSpacing: 0.3,
    color: '#212121',
  },
  detailText: {
    fontSize: 16,
    marginLeft: 10,
    lineHeight: 22,
  },
  matchesContainer: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  matchCard: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#FFFFFF',
  },
  matchImageContainer: {
    position: 'relative',
  },
  matchImage: {
    width: '100%',
    height: 150,
  },
  statusTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  dateTag: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  matchContent: {
    padding: 24,
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    letterSpacing: 0.3,
    color: '#212121',
  },
  matchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchInfoText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#424242',
    letterSpacing: 0.2,
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  matchButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  matchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  findMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  findMatchText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 12,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: 'rgba(0,0,0,0.01)',
    paddingBottom: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  performanceItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#4CAF50',
  },
  performanceLabel: {
    fontSize: 14,
    opacity: 0.9,
    fontWeight: '500',
    marginTop: 2,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginVertical: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    color: '#9E9E9E',
    marginBottom: 20,
  },
  ratingContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  ratingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 4,
  },
  ratingMax: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9E9E9E',
  },
  ratingBarContainer: {
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  ratingBar: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#4CAF50',
  },
  statsContainer: {
    marginTop: 16,
    marginBottom: 20,
    padding: 10,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  statsRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statisticCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 10,
  },
  statisticContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statisticIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statisticTextContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 28,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButton: {
    marginRight: 12,
  },
  secondaryButton: {
    borderWidth: 1.5,
    marginLeft: 12,
    backgroundColor: 'white',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.3,
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
  // Eksik stil tanımları
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
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
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
});
