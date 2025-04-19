import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { userService } from '@/services/api';

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
  
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  const { user, logout, refreshUserData } = useAuth();
  const router = useRouter();

  const screenWidth = Dimensions.get('window').width;

  // Profil verilerini yükle
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Eğer kullanıcı giriş yapmışsa, profil bilgilerini getir
        if (user) {
          const profileData = await userService.getProfile();
          
          // Veritabanından gelen verileri UserProfile formatına dönüştür
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
            stats: profileData.stats || {
              matches: 24,
              goals: 38,
              assists: 12,
              playHours: 47,
            },
            level: profileData.level || 'Orta',
            position: profileData.position || 'Forvet',
            footPreference: profileData.footPreference || 'Sağ',
          };
          
          setUserData(formattedData);
        }
      } catch (err) {
        console.error('Profil bilgileri yüklenirken hata:', err);
        setError('Profil bilgileri yüklenemedi. Lütfen tekrar deneyin.');
        
        // Hata durumunda varsayılan verilerle devam et
        if (user) {
          setUserData({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg',
            bio: 'Haftasonları halı saha maçlarını kaçırmam. 5 yıllık amatör lig tecrübem var. Forvet pozisyonunda oynuyorum.',
            location: 'İstanbul, Kadıköy',
            phone: '+90 (555) 123-4567',
            stats: {
              matches: 24,
              goals: 38,
              assists: 12,
              playHours: 47,
            },
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
          const videos = await videoService.listByUser(user._id || user.id);
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
    if (!userData) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Profil bilgileri yükleniyor...</ThemedText>
        </View>
      );
    }
    
    return (
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image 
            source={{ uri: userData.profilePicture }} 
            style={styles.profilePic} 
            defaultSource={require('@/assets/images/default-avatar.png')}
          />
          
          <View style={styles.userInfo}>
            <ThemedText style={styles.fullName}>{userData.name}</ThemedText>
            <ThemedText style={styles.username}>@{userData.username}</ThemedText>
            
            <View style={styles.playerDetails}>
              {userData.location && (
                <View style={styles.playerDetail}>
                  <IconSymbol name="location.fill" size={14} color={textColor} />
                  <ThemedText style={styles.detailText}>{userData.location}</ThemedText>
                </View>
              )}
              
              <View style={styles.playerAttributeContainer}>
                {userData.level && (
                  <View style={[styles.playerAttributeTag, { backgroundColor: '#4CAF50' }]}>
                    <ThemedText style={styles.playerAttributeText}>{userData.level}</ThemedText>
                  </View>
                )}
                
                {userData.position && (
                  <View style={[styles.playerAttributeTag, { backgroundColor: '#2196F3' }]}>
                    <ThemedText style={styles.playerAttributeText}>{userData.position}</ThemedText>
                  </View>
                )}
                
                {userData.footPreference && (
                  <View style={[styles.playerAttributeTag, { backgroundColor: '#FF9800' }]}>
                    <ThemedText style={styles.playerAttributeText}>{userData.footPreference} Ayak</ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {userData.bio && <ThemedText style={styles.bio}>{userData.bio}</ThemedText>}

        {userData.stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{userData.stats.matches}</ThemedText>
              <ThemedText style={styles.statLabel}>Maç</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{userData.stats.goals}</ThemedText>
              <ThemedText style={styles.statLabel}>Gol</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{userData.stats.assists}</ThemedText>
              <ThemedText style={styles.statLabel}>Asist</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{userData.stats.playHours}</ThemedText>
              <ThemedText style={styles.statLabel}>Saat</ThemedText>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={() => Alert.alert('Bilgi', 'Profil düzenleme özelliği yakında eklenecek.')}
          >
            <IconSymbol name="pencil" size={16} color="#FFFFFF" />
            <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Profili Düzenle</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton, { borderColor: '#E0E0E0' }]}
            onPress={() => handleLogout()}
          >
            <IconSymbol name="arrow.right.square" size={16} color="tomato" />
            <ThemedText style={[styles.buttonText, {color: 'tomato'}]}>Çıkış Yap</ThemedText>
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
        <ThemedText style={styles.sectionTitle}>İletişim Bilgileri</ThemedText>
        
        {userData.phone && (
          <View style={styles.detailItem}>
            <IconSymbol name="phone.fill" size={18} color={textColor} />
            <ThemedText style={styles.detailText}>{userData.phone}</ThemedText>
          </View>
        )}
        
        <View style={styles.detailItem}>
          <IconSymbol name="envelope.fill" size={18} color={textColor} />
          <ThemedText style={styles.detailText}>{userData.email}</ThemedText>
        </View>
        
        <ThemedText style={styles.sectionTitle}>Yetenekler</ThemedText>
        
        <View style={styles.skillsContainer}>
          <View style={styles.skillItem}>
            <ThemedText style={styles.skillLabel}>Hız</ThemedText>
            <View style={styles.skillBarContainer}>
              <View style={[styles.skillBar, { width: '85%', backgroundColor: tintColor }]} />
            </View>
          </View>
          
          <View style={styles.skillItem}>
            <ThemedText style={styles.skillLabel}>Şut</ThemedText>
            <View style={styles.skillBarContainer}>
              <View style={[styles.skillBar, { width: '75%', backgroundColor: tintColor }]} />
            </View>
          </View>
          
          <View style={styles.skillItem}>
            <ThemedText style={styles.skillLabel}>Pas</ThemedText>
            <View style={styles.skillBarContainer}>
              <View style={[styles.skillBar, { width: '65%', backgroundColor: tintColor }]} />
            </View>
          </View>
          
          <View style={styles.skillItem}>
            <ThemedText style={styles.skillLabel}>Dribling</ThemedText>
            <View style={styles.skillBarContainer}>
              <View style={[styles.skillBar, { width: '70%', backgroundColor: tintColor }]} />
            </View>
          </View>
          
          <View style={styles.skillItem}>
            <ThemedText style={styles.skillLabel}>Fizik</ThemedText>
            <View style={styles.skillBarContainer}>
              <View style={[styles.skillBar, { width: '60%', backgroundColor: tintColor }]} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderUpcomingMatches = () => (
    <View style={styles.matchesContainer}>
      {upcomingMatches.map((match) => (
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
      ))}
      
      <TouchableOpacity style={[styles.findMatchButton, { backgroundColor: tintColor }]}>
        <IconSymbol name="plus" size={18} color="#FFFFFF" />
        <ThemedText style={styles.findMatchText}>Yeni Maç Bul</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderMatchHistory = () => (
    <View style={styles.matchesContainer}>
      {pastMatches.map((match) => (
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
      ))}
    </View>
  );

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
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderHeader()}
        {renderTabs()}
        
        {activeTab === 'profile' && renderProfileDetails()}
        {activeTab === 'upcoming' && renderUpcomingMatches()}
        {activeTab === 'history' && renderMatchHistory()}
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
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: 'tomato',
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  playerDetails: {
    flexDirection: 'column',
  },
  playerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 6,
  },
  playerAttributeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playerAttributeTag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  playerAttributeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  primaryButton: {
    marginRight: 10,
  },
  secondaryButton: {
    borderWidth: 1,
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    justifyContent: 'space-around',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  skillsContainer: {
    marginBottom: 16,
  },
  skillItem: {
    marginBottom: 12,
  },
  skillLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  skillBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillBar: {
    height: '100%',
    borderRadius: 4,
  },
  matchesContainer: {
    marginBottom: 16,
  },
  matchCard: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  matchImageContainer: {
    position: 'relative',
  },
  matchImage: {
    width: '100%',
    height: 120,
  },
  statusTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchContent: {
    padding: 16,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  matchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchInfoText: {
    fontSize: 14,
    marginLeft: 6,
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  matchButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  matchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  findMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  findMatchText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  performanceLabel: {
    fontSize: 12,
    opacity: 0.7,
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
