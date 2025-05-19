import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Text } from 'react-native';
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

// Varsayılan profil resmi URL'si
const DEFAULT_PROFILE_IMAGE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

// Yaklaşan maçlar
const upcomingMatches = [];

// Geçmiş maçlar
const pastMatches = [];

// Kullanıcı profil tipi
type UserProfile = {
  id: string;
  name: string;
  username: string;
  email: string;
  profilePicture: string;
  bio?: string;
  location?: string;
  phone?: string;
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
  // Stats değerlerine doğrudan erişim için
  matches?: number;
  goals?: number;
  assists?: number;
  playHours?: number;
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
  
  // Yeni renk şemasından renkleri al
  const tintColor = useThemeColor({}, 'tint');
  const secondaryTint = useThemeColor({}, 'secondaryTint');
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');
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
          name: offlineUser.name,
          username: offlineUser.username,
          email: offlineUser.email,
          profilePicture: offlineUser.profilePicture || DEFAULT_PROFILE_IMAGE,
          bio: 'Futbol tutkunu',
          location: 'İstanbul',
          level: offlineUser.level || 'Orta',
          position: offlineUser.position || 'Forvet',
          footPreference: 'Sağ',
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
          playHours: 30
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
          playHours: userStats.playHours || 0
        };
        setUserData(formattedUserData);
      }
      
      // Çevrimiçi mod - gerçek API'den verileri çek
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
        phone: profileData.phone || '',
        favoriteTeams: profileData.favoriteTeams || [],
        level: profileData.level || user?.level || '',
        position: profileData.position || user?.position || '',
        footPreference: profileData.footPreference || user?.footPreference || '',
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
        playHours: stats.playHours || 0
      };
            
      setUserData(formattedData);
      
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
        [{ text: 'Tamam' }]
      );
      
      // Hata durumunda çevrimdışı moda geç
      setIsOffline(true);
      
      // Context'ten alınan kullanıcı bilgilerini kullan (yedek)
      if (user) {
        console.log('Hata durumunda context verileri kullanılıyor:', user.username || '');
        const userStats = user.stats || {matches: 0, goals: 0, assists: 0, playHours: 0, rating: 0};
        const backupUserData: UserProfile = {
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
          playHours: userStats.playHours || 0
        };
        setUserData(backupUserData);
        return;
      }
      
      // Örnek profil verilerini UserProfile formatına dönüştür
      const offlineUser = OFFLINE_DATA.user;
      const formattedOfflineUser: UserProfile = {
        id: offlineUser._id,
        name: offlineUser.name,
        username: offlineUser.username,
        email: offlineUser.email,
        profilePicture: offlineUser.profilePicture || DEFAULT_PROFILE_IMAGE,
        bio: 'Futbol tutkunu',
        location: 'İstanbul',
        level: offlineUser.level || 'Orta',
        position: offlineUser.position || 'Forvet',
            footPreference: 'Sağ',
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
        playHours: 30
      };
      setUserData(formattedOfflineUser);
      } finally {
        setLoading(false);
      }
    };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
      fetchVideos();
      fetchMatches();
    }, [])
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
    const stars = [];

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
    if (!userData) return null;
    
    return (
      <View style={styles.headerContainer}>
        {/* Profil başlığı */}
        <LinearGradient
          colors={[tintColor, secondaryTint]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeaderContent}>
            {/* Profil resmi */}
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: userData.profilePicture || DEFAULT_PROFILE_IMAGE }} 
                style={styles.profileImage} 
                defaultSource={{ uri: DEFAULT_PROFILE_IMAGE }}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={() => router.push('/(tabs)/edit-profile' as any)}
              >
                <IconSymbol name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {/* Kullanıcı bilgileri */}
            <View style={styles.profileInfo}>
              <ThemedText style={styles.userName}>{userData.name}</ThemedText>
              <ThemedText style={styles.userUsername}>@{userData.username}</ThemedText>
              
              <View style={styles.userBadges}>
                {userData.level && (
                <View style={styles.userLevel}>
                  <IconSymbol name="medal" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.userLevelText}>
                      {userData.level}
                  </ThemedText>
                </View>
                )}
                
                {userData.position && (
                <View style={styles.userPosition}>
                  <IconSymbol name="person.fill" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.userPositionText}>
                      {userData.position}
                  </ThemedText>
                </View>
                )}
                
                {userData.footPreference && (
                <View style={styles.userFootPreference}>
                  <IconSymbol name="figure.walk" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.userFootPreferenceText}>
                      {userData.footPreference}
                  </ThemedText>
                </View>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
        
        {/* İstatistikler */}
        <View style={[styles.statsContainer, { backgroundColor: cardColor }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: tintColor }]}>{userData.stats?.matches ?? 0}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Maçlar</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: tintColor }]}>{userData.stats?.goals ?? 0}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Goller</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: tintColor }]}>{userData.stats?.assists ?? 0}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Asistler</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: tintColor }]}>{userData.stats?.playHours ?? 0}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Saat</ThemedText>
          </View>
        </View>
        
        {/* Eylem butonları */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={() => router.push('/(tabs)/find-match' as any)}
          >
            <IconSymbol name="magnifyingglass" size={18} color="#FFFFFF" />
            <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Maç Bul</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton, { borderColor: tintColor }]}
            onPress={handleLogout}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color={tintColor} />
            <ThemedText style={[styles.buttonText, { color: tintColor }]}>Çıkış Yap</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={[styles.tabs, { borderBottomColor: '#E0E0E0' }]}>
      <TouchableOpacity 
        style={[
          styles.tab, 
          activeTab === 'profile' && { borderBottomColor: tintColor, borderBottomWidth: 2 }
        ]}
        onPress={() => setActiveTab('profile')}
      >
        <IconSymbol 
          name="person.fill" 
          size={20} 
          color={activeTab === 'profile' ? tintColor : textColor} 
        />
        <ThemedText 
          style={[
            styles.tabText, 
            activeTab === 'profile' && { color: tintColor, fontWeight: 'bold' }
          ]}
        >
          Profil
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.tab, 
          activeTab === 'upcoming' && { borderBottomColor: tintColor, borderBottomWidth: 2 }
        ]}
        onPress={() => setActiveTab('upcoming')}
      >
        <IconSymbol 
          name="calendar" 
          size={20} 
          color={activeTab === 'upcoming' ? tintColor : textColor} 
        />
        <ThemedText 
          style={[
            styles.tabText, 
            activeTab === 'upcoming' && { color: tintColor, fontWeight: 'bold' }
          ]}
        >
          Yaklaşan
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.tab, 
          activeTab === 'history' && { borderBottomColor: tintColor, borderBottomWidth: 2 }
        ]}
        onPress={() => setActiveTab('history')}
      >
        <IconSymbol 
          name="clock.arrow.circlepath" 
          size={20} 
          color={activeTab === 'history' ? tintColor : textColor} 
        />
        <ThemedText 
          style={[
            styles.tabText, 
            activeTab === 'history' && { color: tintColor, fontWeight: 'bold' }
          ]}
        >
          Geçmiş
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderProfileDetails = () => {
    if (!userData) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      );
    }
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <ThemedText style={styles.infoTitle}>Kullanıcı Bilgileri</ThemedText>
            <TouchableOpacity 
              style={[styles.editButtonSmall, { backgroundColor: tintColor }]} 
              onPress={() => {
                // Profil düzenleme sayfasına yönlendir
                router.push('/(tabs)/edit-profile' as any);
              }}
            >
              <IconSymbol name="pencil" size={16} color="#FFFFFF" />
              <ThemedText style={styles.editButtonTextSmall}>Düzenle</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}><ThemedText style={styles.infoLabel}>Ad Soyad:</ThemedText><ThemedText style={styles.infoValue}>{userData.name || '-'}</ThemedText></View>
          <View style={styles.infoRow}><ThemedText style={styles.infoLabel}>Kullanıcı Adı:</ThemedText><ThemedText style={styles.infoValue}>{userData.username || '-'}</ThemedText></View>
          <View style={styles.infoRow}><ThemedText style={styles.infoLabel}>E-posta:</ThemedText><ThemedText style={styles.infoValue}>{userData.email || '-'}</ThemedText></View>
          <View style={styles.infoRow}><ThemedText style={styles.infoLabel}>Konum:</ThemedText><ThemedText style={styles.infoValue}>{userData.location || '-'}</ThemedText></View>
          <View style={styles.infoRow}><ThemedText style={styles.infoLabel}>Telefon:</ThemedText><ThemedText style={styles.infoValue}>{userData.phone || '-'}</ThemedText></View>
          <View style={[styles.infoRow, {borderBottomWidth: 0}]}><ThemedText style={styles.infoLabel}>Hakkında:</ThemedText><ThemedText style={styles.infoValue}>{userData.bio || '-'}</ThemedText></View>
        </View>
        
        <View style={[styles.infoCard, { marginTop: 16 }]}>
          <View style={styles.infoHeader}>
            <ThemedText style={styles.infoTitle}>Futbol Özellikleri</ThemedText>
            <TouchableOpacity 
              style={[styles.editButtonSmall, { backgroundColor: tintColor }]} 
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
              <ThemedText style={[styles.characteristicValue, { color: tintColor }]}>{userData.level || '-'}</ThemedText>
        </View>
            
            <View style={[styles.characteristicItem, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <IconSymbol name="person.fill" size={24} color={tintColor} />
              <ThemedText style={styles.characteristicLabel}>Pozisyon</ThemedText>
              <ThemedText style={[styles.characteristicValue, { color: tintColor }]}>{userData.position || '-'}</ThemedText>
            </View>
            
            <View style={[styles.characteristicItem, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <IconSymbol name="figure.walk" size={24} color={tintColor} />
              <ThemedText style={styles.characteristicLabel}>Ayak Tercihi</ThemedText>
              <ThemedText style={[styles.characteristicValue, { color: tintColor }]}>{userData.footPreference || '-'}</ThemedText>
          </View>
          </View>
        </View>
        
        <View style={[styles.statsContainer, { backgroundColor: cardColor }]}> 
          <View style={styles.statsHeader}>
            <ThemedText style={styles.statsTitle}>İstatistikler</ThemedText>
            <TouchableOpacity 
              style={[styles.editButtonSmall, { backgroundColor: tintColor }]} 
              onPress={() => {
                // Profil düzenleme sayfasına istatistikler bölümüne yönlendir
                router.push('/(tabs)/edit-profile' as any);
              }}
            >
              <IconSymbol name="pencil" size={16} color="#FFFFFF" />
              <ThemedText style={styles.editButtonTextSmall}>Düzenle</ThemedText>
            </TouchableOpacity>
        </View>
        
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: tintColor }]}>{userData.stats?.matches || '0'}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Maçlar</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: tintColor }]}>{userData.stats?.goals || '0'}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Goller</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: tintColor }]}>{userData.stats?.assists || '0'}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Asistler</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: tintColor }]}>{userData.stats?.playHours || '0'}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Saat</ThemedText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderUpcomingMatches = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Maçlar yükleniyor...</ThemedText>
        </View>
      );
    }
    
    if (upcomingMatches.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <IconSymbol name="calendar.badge.exclamationmark" size={40} color="#9E9E9E" />
          <ThemedText style={styles.emptyText}>Yaklaşan maç bulunmuyor</ThemedText>
          <TouchableOpacity style={[styles.findMatchButton, { backgroundColor: tintColor }]}>
            <IconSymbol name="plus" size={18} color="#FFFFFF" />
            <ThemedText style={styles.findMatchText}>Yeni Maç Bul</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }
    
    const renderMatchItem = (match: typeof upcomingMatches[0]) => {
      return (
        <View key={match.id} style={[styles.matchCard, { borderColor: '#E0E0E0' }]}>
          <View style={styles.matchImageContainer}>
            <Image source={{ uri: match.image }} style={styles.matchImage} />
            <View style={[
              styles.statusTag, 
              { backgroundColor: match.status === 'confirmed' ? '#4CAF50' : '#FFC107' }
            ]}>
              <ThemedText style={styles.statusText}>
                {match.status === 'confirmed' ? 'Onaylandı' : 'Beklemede'}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.matchContent}>
            <ThemedText style={styles.matchTitle}>{match.fieldName}</ThemedText>
            
            <View style={styles.matchInfoRow}>
              <IconSymbol name="mappin.and.ellipse" size={14} color={textColor} />
              <ThemedText style={styles.matchInfoText}>{match.location}</ThemedText>
            </View>
            
            <View style={styles.matchInfoRow}>
              <IconSymbol name="calendar" size={14} color={textColor} />
              <ThemedText style={styles.matchInfoText}>{match.date}</ThemedText>
            </View>
            
            <View style={styles.matchInfoRow}>
              <IconSymbol name="clock" size={14} color={textColor} />
              <ThemedText style={styles.matchInfoText}>{match.time}</ThemedText>
            </View>
            
            <View style={styles.matchActions}>
              <TouchableOpacity style={[styles.matchButton, { backgroundColor: '#F44336' }]}>
                <ThemedText style={styles.matchButtonText}>İptal Et</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.matchButton, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.matchButtonText}>Detaylar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    };
    
    return (
      <View style={styles.matchesContainer}>
        {upcomingMatches.map(match => renderMatchItem(match))}
        
        <TouchableOpacity style={[styles.findMatchButton, { backgroundColor: tintColor }]}>
          <IconSymbol name="plus" size={18} color="#FFFFFF" />
          <ThemedText style={styles.findMatchText}>Yeni Maç Bul</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMatchHistory = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Maç geçmişi yükleniyor...</ThemedText>
        </View>
      );
    }
    
    if (pastMatches.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <IconSymbol name="clock.arrow.circlepath" size={40} color="#9E9E9E" />
          <ThemedText style={styles.emptyText}>Geçmiş maç bulunmuyor</ThemedText>
        </View>
      );
    }
    
    const renderHistoryItem = (match: typeof pastMatches[0]) => {
      return (
        <View key={match.id} style={[styles.matchCard, { borderColor: '#E0E0E0' }]}>
          <View style={styles.matchImageContainer}>
            <Image source={{ uri: match.image }} style={styles.matchImage} />
            <View style={[styles.dateTag]}>
              <ThemedText style={styles.dateText}>{match.date}</ThemedText>
            </View>
          </View>
          
          <View style={styles.matchContent}>
            <ThemedText style={styles.matchTitle}>{match.fieldName}</ThemedText>
            
            <View style={styles.matchInfoRow}>
              <IconSymbol name="mappin.and.ellipse" size={14} color={textColor} />
              <ThemedText style={styles.matchInfoText}>{match.location}</ThemedText>
            </View>
            
            <View style={styles.performanceContainer}>
              <View style={styles.performanceItem}>
                <IconSymbol name="soccerball" size={16} color={textColor} />
                <ThemedText style={styles.performanceValue}>{match.performance.goals}</ThemedText>
                <ThemedText style={styles.performanceLabel}>Gol</ThemedText>
              </View>
              
              <View style={styles.performanceItem}>
                <IconSymbol name="figure.walk" size={16} color={textColor} />
                <ThemedText style={styles.performanceValue}>{match.performance.assists}</ThemedText>
                <ThemedText style={styles.performanceLabel}>Asist</ThemedText>
              </View>
              
              <View style={styles.performanceItem}>
                {renderRating(match.performance.rating)}
                <ThemedText style={styles.performanceLabel}>Puan</ThemedText>
              </View>
            </View>
          </View>
        </View>
      );
    };
    
    return (
      <View style={styles.matchesContainer}>
        {pastMatches.map(match => renderHistoryItem(match))}
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
    switch(activeTab) {
      case 'profile':
        return renderProfileDetails();
      case 'upcoming':
        return renderUpcomingMatches();
      case 'history':
        return renderMatchHistory();
      default:
        return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {renderOfflineBanner()}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderHeader()}
        {renderTabs()}
        {renderActiveTabContent()}
      </ScrollView>
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
  profileHeaderContent: {
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
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userUsername: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  userBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userLevelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  userPosition: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userPositionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  userFootPreference: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userFootPreferenceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
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
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    justifyContent: 'space-around',
    paddingBottom: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
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
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footballCharacteristics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  characteristicItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  characteristicLabel: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '500',
  },
  characteristicValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  offlineBanner: {
    backgroundColor: '#FF9800',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  offlineBannerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 12,
  },
});
