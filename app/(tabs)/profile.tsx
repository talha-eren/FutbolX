import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { userService } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

// Yaklaşan maçlar
const upcomingMatches = [
  {
    id: '1',
    date: '26 Mart 2025',
    time: '19:30 - 21:00',
    fieldName: 'Yıldız Halı Saha',
    location: 'Kadıköy, İstanbul',
    image: 'https://source.unsplash.com/random/300x200/?soccer,field&sig=100',
    status: 'confirmed', // confirmed, pending
  },
  {
    id: '2',
    date: '2 Nisan 2025',
    time: '20:00 - 21:30',
    fieldName: 'GreenPitch',
    location: 'Beşiktaş, İstanbul',
    image: 'https://source.unsplash.com/random/300x200/?soccer,field&sig=101',
    status: 'pending', // confirmed, pending
  },
];

// Geçmiş maçlar
const pastMatches = Array(6).fill(null).map((_, index) => ({
  id: index.toString(),
  date: `${15 - index} Mart 2025`,
  fieldName: ['Yıldız Halı Saha', 'Gol Park', 'GreenPitch', 'Futbol Arena', 'Sahasever'][index % 5],
  location: ['Kadıköy', 'Ataşehir', 'Beşiktaş', 'Üsküdar', 'Beylikdüzü'][index % 5] + ', İstanbul',
  image: `https://source.unsplash.com/random/300x200/?soccer,field&sig=${200 + index}`,
  performance: {
    goals: Math.floor(Math.random() * 3),
    assists: Math.floor(Math.random() * 2),
    rating: Math.floor(Math.random() * 2) + 3 + Math.random(),
  }
}));

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
  };
  // Doğrudan erişim için ek alanlar
  matches: number;
  goals: number;
  assists: number;
  playHours: number;
  level?: string;
  position?: string;
  footPreference?: string;
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

  // Profil sayfasına giriş kontrolü
  useEffect(() => {
    if (!user) {
      // Kullanıcı giriş yapmamışsa, 2 saniye sonra giriş sayfasına yönlendir
      const timer = setTimeout(() => {
        router.replace('/(auth)/login?returnTo=profile');
        Alert.alert('Giriş Gerekli', 'Bu özelliği kullanmak için giriş yapmanız gerekmektedir.');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  // Profil verilerini yükle
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Eğer kullanıcı giriş yapmışsa, profil bilgilerini getir
        if (user) {
          try {
            const profileData = await userService.getProfile();
            
            // Veritabanından gelen verileri UserProfile formatına dönüştür
            const stats = profileData.stats || {
              matches: 24,
              goals: 38,
              assists: 12,
              playHours: 47,
            };
            
            const formattedData: UserProfile = {
              id: profileData._id || profileData.id,
              name: profileData.name,
              username: profileData.username,
              email: profileData.email,
              profilePicture: profileData.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg',
              bio: profileData.bio || 'Haftasonları halı saha maçlarını kaçırmam. 5 yıllık amatör lig tecrübem var. Forvet pozisyonunda oynuyorum.',
              location: profileData.location || 'İstanbul, Kadıköy',
              phone: profileData.phone || '+90 (555) 123-4567',
              favoriteTeams: profileData.favoriteTeams || [],
              stats: stats,
              // Doğrudan erişim için ek alanlar
              matches: stats.matches,
              goals: stats.goals,
              assists: stats.assists,
              playHours: stats.playHours,
              level: profileData.level || 'Orta',
              position: profileData.position || 'Forvet',
              footPreference: profileData.footPreference || 'Sağ',
            };
            
            setUserData(formattedData);
          } catch (apiError) {
            console.error('Profil getirme hatası:', apiError);
            // API hatası durumunda kullanıcı bilgilerini kullan
            const defaultStats = {
              matches: 24,
              goals: 38,
              assists: 12,
              playHours: 47,
            };
            
            setUserData({
              id: user.id,
              name: user.name,
              username: user.username,
              email: user.email,
              profilePicture: user.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg',
              bio: 'Haftasonları halı saha maçlarını kaçırmam. 5 yıllık amatör lig tecrübem var. Forvet pozisyonunda oynuyorum.',
              location: 'İstanbul, Kadıköy',
              phone: '+90 (555) 123-4567',
              stats: defaultStats,
              // Doğrudan erişim için ek alanlar
              matches: defaultStats.matches,
              goals: defaultStats.goals,
              assists: defaultStats.assists,
              playHours: defaultStats.playHours,
              level: 'Orta',
              position: 'Forvet',
              footPreference: 'Sağ',
            });
          }
        }
      } catch (err) {
        console.error('Profil bilgileri yüklenirken hata:', err);
        setError('Profil bilgileri yüklenemedi. Lütfen tekrar deneyin.');
        
        // Hata durumunda varsayılan verilerle devam et
        if (user) {
          const defaultStats = {
            matches: 24,
            goals: 38,
            assists: 12,
            playHours: 47,
          };
          
          setUserData({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg',
            bio: 'Haftasonları halı saha maçlarını kaçırmam. 5 yıllık amatör lig tecrübem var. Forvet pozisyonunda oynuyorum.',
            location: 'İstanbul, Kadıköy',
            phone: '+90 (555) 123-4567',
            stats: defaultStats,
            // Doğrudan erişim için ek alanlar
            matches: defaultStats.matches,
            goals: defaultStats.goals,
            assists: defaultStats.assists,
            playHours: defaultStats.playHours,
            level: 'Orta',
            position: 'Forvet',
            footPreference: 'Sağ',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchVideos = async () => {
      if (user) {
        try {
          const videos = await videoService.listByUser(user.id);
          setUserVideos(videos);
        } catch (err) {
          // Hata durumunda video listesi boş kalsın
          setUserVideos([]);
        }
      }
    };

    fetchProfileData();
    fetchVideos();
  }, [user]);

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
                source={{ uri: userData.profilePicture || 'https://via.placeholder.com/150' }} 
                style={styles.profileImage} 
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
                <View style={styles.userLevel}>
                  <IconSymbol name="medal" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.userLevelText}>
                    {userData.level || 'Amatör'}
                  </ThemedText>
                </View>
                
                <View style={styles.userPosition}>
                  <IconSymbol name="person.fill" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.userPositionText}>
                    {userData.position || 'Orta Saha'}
                  </ThemedText>
                </View>
                
                <View style={styles.userFootPreference}>
                  <IconSymbol name="figure.walk" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.userFootPreferenceText}>
                    {userData.footPreference || 'Sağ Ayak'}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
        
        {/* İstatistikler */}
        <View style={[styles.statsContainer, { backgroundColor: cardColor }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: tintColor }]}>{userData.matches || 0}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Maçlar</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: tintColor }]}>{userData.goals || 0}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Goller</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: tintColor }]}>{userData.assists || 0}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>Asistler</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: tintColor }]}>{userData.playHours || 0}</ThemedText>
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
    
    // Becerileri ayrı bir fonksiyonda oluştur
    const renderSkills = () => {
      const skills = [
        { name: 'Hız', value: 85 },
        { name: 'Teknik', value: 75 },
        { name: 'Dayanıklılık', value: 70 },
        { name: 'Fizik', value: 60 }
      ];
      
      return skills.map((skill, index) => (
        <View key={index} style={styles.skillItem}>
          <ThemedText style={styles.skillLabel}>{skill.name}</ThemedText>
          <View style={styles.skillBarContainer}>
            <View style={[styles.skillBar, { width: `${skill.value}%`, backgroundColor: tintColor }]} />
          </View>
        </View>
      ));
    };
    
    return (
      <View style={styles.detailsContainer}>
        <ThemedText style={styles.sectionTitle}>İletişim Bilgileri</ThemedText>
        
        {userData.phone ? (
          <View style={styles.detailItem}>
            <IconSymbol name="phone.fill" size={18} color={textColor} />
            <ThemedText style={styles.detailText}>{userData.phone}</ThemedText>
          </View>
        ) : null}
        
        <View style={styles.detailItem}>
          <IconSymbol name="envelope.fill" size={18} color={textColor} />
          <ThemedText style={styles.detailText}>{userData.email}</ThemedText>
        </View>
        
        <ThemedText style={styles.sectionTitle}>Yetenekler</ThemedText>
        
        <View style={styles.skillsContainer}>
          {renderSkills()}
        </View>
      </View>
    );
  };

  const renderUpcomingMatches = () => {
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
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: -25,
    marginBottom: 24,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
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
  detailText: {
    fontSize: 16,
    marginLeft: 10,
    lineHeight: 22,
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
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  skillsContainer: {
    marginBottom: 24,
  },
  skillItem: {
    marginBottom: 18,
  },
  skillLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#424242',
    letterSpacing: 0.2,
  },
  skillBarContainer: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  skillBar: {
    height: '100%',
    borderRadius: 6,
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
});
