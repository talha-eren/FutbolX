import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, Alert, RefreshControl, Modal } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/services/networkConfig';
import { LinearGradient } from 'expo-linear-gradient';

// Maç veri tipi tanımı
interface Match {
  _id: string;
  title?: string;
  venue: {
    _id: string;
    name: string;
    location: string;
    image?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'live' | 'completed';
  score?: {
    teamA: {
      name: string;
      goals: number;
      logo?: string;
    };
    teamB: {
      name: string;
      goals: number;
      logo?: string;
    };
  };
  organizer: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  participants: Array<{
    _id: string;
    username: string;
    profilePicture?: string;
  }>;
  maxParticipants: number;
  price?: number;
  level?: string;
  description?: string;
  isPrivate: boolean;
  createdAt: string;
  sport: 'football' | 'basketball' | 'volleyball' | 'tennis';
}

// Halı saha veri tipi
interface Venue {
  _id: string;
  name: string;
  location: string;
  image?: string;
}

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const textColor = useThemeColor({}, 'text');
  const primaryColor = '#4CAF50'; // Yeşil tema
  const backgroundColor = useThemeColor({}, 'background');
  const cardBgColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  
  const router = useRouter();
  const { token, user } = useAuth();
  
  // Maçları API'den çek - gelişmiş filtreleme ile
  const fetchMatches = async (filterParams = {}) => {
    try {
      setError(null);
      
      if (!token) {
        setError('Oturum açmanız gerekiyor');
        return;
      }

      // URL parametrelerini oluştur
      const params = new URLSearchParams({
        limit: '50',
        sort: 'date',
        ...filterParams
      });

      const matchesUrl = await getApiUrl(`/matches?${params.toString()}`);
      console.log('🔗 Matches API URL:', matchesUrl);

      const matchesResponse = await fetch(matchesUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!matchesResponse.ok) {
        const matchesError = await matchesResponse.text();
        console.error('❌ Matches API Error:', matchesError);
        throw new Error(`Maçlar yüklenirken hata oluştu: ${matchesResponse.status}`);
      }

      const matchesData: any = await matchesResponse.json();
      console.log('✅ Maçlar yüklendi:', matchesData);
      
      // API'den gelen maçları formatla
      let formattedMatches: Match[] = [];
      
      if (matchesData && matchesData.success && Array.isArray(matchesData.matches)) {
        formattedMatches = matchesData.matches.map((match: any) => {
          // Durum kontrolü
          let status: 'upcoming' | 'live' | 'completed' = 'upcoming';
          if (match.status === 'completed' || match.status === 'tamamlandı') {
            status = 'completed';
          } else if (match.status === 'live' || match.status === 'canlı') {
            status = 'live';
          } else {
            status = 'upcoming';
          }

          return {
            _id: match._id,
            title: match.title || `Maç - ${match.venue?.name || 'Bilinmeyen Saha'}`,
            venue: {
              _id: match.venue?._id || '',
              name: match.venue?.name || 'Sporium 23',
              location: match.venue?.location || 'Elazığ',
              image: match.venue?.image || 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop'
            },
            date: match.date,
            startTime: match.startTime || '20:00',
            endTime: match.endTime || '21:30',
            status: status,
            score: match.score ? {
              teamA: {
                name: match.score.teamA?.name || 'Takım A',
                goals: match.score.teamA?.goals || 0,
                logo: match.score.teamA?.logo || 'https://via.placeholder.com/50x50/4CAF50/FFFFFF?text=A'
              },
              teamB: {
                name: match.score.teamB?.name || 'Takım B',
                goals: match.score.teamB?.goals || 0,
                logo: match.score.teamB?.logo || 'https://via.placeholder.com/50x50/2196F3/FFFFFF?text=B'
              }
            } : undefined,
            organizer: {
              _id: match.organizer?._id || match.organizer?.id || '',
              username: match.organizer?.username || 'Bilinmeyen',
              profilePicture: match.organizer?.profilePicture || ''
            },
            participants: (match.participants || []).map((participant: any) => ({
              _id: participant._id || participant.id || '',
              username: participant.username || 'Bilinmeyen',
              profilePicture: participant.profilePicture || ''
            })),
            maxParticipants: match.maxParticipants || 22,
            price: match.price,
            level: match.level,
            description: match.description,
            isPrivate: match.isPrivate || false,
            createdAt: match.createdAt,
            sport: match.sport || 'football'
          };
        });
      } else if (Array.isArray(matchesData)) {
        formattedMatches = matchesData.map(match => ({
          ...match,
          sport: match.sport || 'football'
        }));
      } else {
        console.warn('Beklenmeyen maç veri formatı:', matchesData);
        formattedMatches = [];
      }
      
      console.log(`${formattedMatches.length} maç formatlandı`);
      setMatches(formattedMatches);
      setFilteredMatches(formattedMatches); // Backend'ten filtrelenmiş veri geldiği için direkt set et
      
    } catch (error) {
      console.error('❌ Maçlar yüklenirken hata:', error);
      setError('Maçlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setMatches([]);
      setFilteredMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Gelişmiş halı saha filtreleme - backend API kullanarak
  useEffect(() => {
    let filterParams = {};
    
    if (selectedStatus === 'all') {
      // Tüm maçları getir
      filterParams = {};
    } else if (selectedStatus.startsWith('venue_')) {
      // Halı saha filtresi
      const venueNumber = selectedStatus.split('_')[1];
      const venueNames = {
        '1': 'Sporium 23',
        '2': 'Yeşil Vadi',
        '3': 'Göztepe Park'
      };
      filterParams = { venue: venueNames[venueNumber] || 'Sporium 23' };
    } else {
      // Durum filtresi (completed, live)
      filterParams = { status: selectedStatus };
    }
    
    fetchMatches(filterParams);
  }, [selectedStatus, token]);

  // İlk yükleme
  useEffect(() => {
    fetchMatches();
  }, [token]);

  // Halı saha filtreleri - veritabanından gelen gerçek verilerle
  const statusFilters = [
    { key: 'all', name: 'Tümü', icon: '⚽' },
    { key: 'venue_1', name: 'Halı Saha 1', icon: '🏟️' },
    { key: 'venue_2', name: 'Halı Saha 2', icon: '🏟️' },
    { key: 'venue_3', name: 'Halı Saha 3', icon: '🏟️' },
    { key: 'completed', name: 'Tamamlanan', icon: '✅' },
    { key: 'live', name: 'Canlı', icon: '🔴' }
  ];

  // Yenileme
  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  // Maça katıl
  const joinMatch = async (matchId: string) => {
    try {
      if (!token || !user) {
        Alert.alert('Hata', 'Oturum açmanız gerekiyor');
        return;
      }

      const response = await fetch(await getApiUrl(`/matches/${matchId}/join`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user._id })
      });

      if (!response.ok) {
        throw new Error('Maça katılırken hata oluştu');
      }

      Alert.alert('Başarılı', 'Maça katılma isteğiniz gönderildi!');
      fetchMatches(); // Listeyi güncelle
      setModalVisible(false);
    } catch (error) {
      console.error('Maça katılırken hata:', error);
      Alert.alert('Hata', 'Maça katılırken bir hata oluştu');
    }
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Yarın';
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  // Maç kartı render - Görsel 1'e göre basit tasarım
  const renderMatchItem = ({ item }: { item: Match }) => (
    <View style={[styles.matchCard, { backgroundColor: cardBgColor, borderColor }]}>
      {/* Yeşil Header */}
      <LinearGradient
        colors={[primaryColor, '#66BB6A']}
        style={styles.matchHeader}
      >
        <View style={styles.matchHeaderContent}>
          <View style={styles.matchDateTimeContainer}>
            <ThemedText style={styles.matchHeaderDate}>{formatDate(item.date)}</ThemedText>
            <ThemedText style={styles.matchHeaderTime}>{item.startTime}</ThemedText>
          </View>
          <View style={styles.matchStatusContainer}>
            <ThemedText style={styles.matchHeaderStatus}>
              {item.status === 'live' ? 'CANLI' : item.status === 'completed' ? 'BİTTİ' : ''}
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Maç İçeriği */}
      <TouchableOpacity
        style={styles.matchContent}
        onPress={() => {
          setSelectedMatch(item);
          setModalVisible(true);
        }}
      >
        {item.score ? (
          // Tamamlanan maç - skor göster (yan yana)
          <View style={styles.scoreSection}>
            <View style={styles.teamContainer}>
              <View style={styles.teamLogoContainer}>
                <ThemedText style={styles.teamIcon}>⚽</ThemedText>
              </View>
              <View style={styles.teamInfoContainer}>
                <ThemedText style={styles.teamNameText} numberOfLines={2}>
                  {item.score.teamA.name}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.scoreDisplay}>
              <View style={styles.scoreBox}>
                <ThemedText style={styles.scoreNumber}>
                  {item.score.teamA.goals} - {item.score.teamB.goals}
                </ThemedText>
              </View>
            </View>
            
            <View style={[styles.teamContainer, styles.teamContainerRight]}>
              <View style={styles.teamInfoContainer}>
                <ThemedText style={[styles.teamNameText, styles.teamNameRight]} numberOfLines={2}>
                  {item.score.teamB.name}
                </ThemedText>
              </View>
              <View style={styles.teamLogoContainer}>
                <ThemedText style={styles.teamIcon}>⚽</ThemedText>
              </View>
            </View>
          </View>
        ) : (
          // Yaklaşan maç - venue bilgisi göster
          <View style={styles.upcomingMatchContent}>
            <View style={styles.venueInfoContainer}>
              <IconSymbol name="location" size={16} color={primaryColor} />
              <ThemedText style={styles.venueNameText} numberOfLines={1}>
                {item.venue.name}
              </ThemedText>
            </View>
            <View style={styles.participantsContainer}>
              <IconSymbol name="person.2" size={14} color={textColor} />
              <ThemedText style={styles.participantsCountText}>
                {item.participants.length}/{item.maxParticipants}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Alt bilgiler */}
        <View style={styles.matchFooterInfo}>
          <View style={styles.matchMetaInfo}>
            <ThemedText style={styles.matchMetaText}>
              📍 {item.venue.location}
            </ThemedText>
            {item.price && (
              <ThemedText style={[styles.priceTag, { color: primaryColor }]}>
                {item.price}₺
              </ThemedText>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Maç detay modalı
  const renderMatchModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: cardBgColor }]}>
          {selectedMatch && (
            <>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>{selectedMatch.title}</ThemedText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <IconSymbol name="xmark" size={24} color={textColor} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Maç Resmi */}
                <Image
                  source={{ 
                    uri: selectedMatch.venue.image || 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop'
                  }}
                  style={styles.modalImage}
                />

                {/* Maç Bilgileri */}
                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>Maç Bilgileri</ThemedText>
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Halı Saha:</ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedMatch.venue.name}</ThemedText>
                  </View>
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Konum:</ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedMatch.venue.location}</ThemedText>
                  </View>
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Tarih:</ThemedText>
                    <ThemedText style={styles.infoValue}>{formatDate(selectedMatch.date)}</ThemedText>
                  </View>
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Saat:</ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedMatch.startTime} - {selectedMatch.endTime}</ThemedText>
                  </View>
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Durum:</ThemedText>
                    <ThemedText style={[styles.infoValue, { color: selectedMatch.status === 'live' ? '#4CAF50' : selectedMatch.status === 'completed' ? '#757575' : '#2196F3' }]}>
                      {selectedMatch.status === 'live' ? 'CANLI' : selectedMatch.status === 'completed' ? 'BİTTİ' : 'PLANLANMIŞ'}
                    </ThemedText>
                  </View>
                  {selectedMatch.price && (
                    <View style={styles.infoRow}>
                      <ThemedText style={styles.infoLabel}>Ücret:</ThemedText>
                      <ThemedText style={styles.infoValue}>{selectedMatch.price}₺</ThemedText>
                    </View>
                  )}
                </View>

                {/* Açıklama */}
                {selectedMatch.description && (
                  <View style={styles.modalSection}>
                    <ThemedText style={styles.sectionTitle}>Açıklama</ThemedText>
                    <ThemedText style={styles.description}>{selectedMatch.description}</ThemedText>
                  </View>
                )}

                {/* Skor */}
                {selectedMatch.status === 'completed' && selectedMatch.score && (
                  <View style={styles.modalSection}>
                    <ThemedText style={styles.sectionTitle}>Maç Sonucu</ThemedText>
                    <View style={styles.modalScoreContainer}>
                      <View style={styles.modalTeamScore}>
                        <ThemedText style={styles.modalTeamName}>{selectedMatch.score.teamA.name}</ThemedText>
                        <ThemedText style={styles.modalScore}>{selectedMatch.score.teamA.goals}</ThemedText>
                      </View>
                      <ThemedText style={styles.modalScoreSeparator}>-</ThemedText>
                      <View style={styles.modalTeamScore}>
                        <ThemedText style={styles.modalScore}>{selectedMatch.score.teamB.goals}</ThemedText>
                        <ThemedText style={styles.modalTeamName}>{selectedMatch.score.teamB.name}</ThemedText>
                      </View>
                    </View>
                  </View>
                )}

                {/* Katılımcılar */}
                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>
                    Katılımcılar ({selectedMatch.participants.length}/{selectedMatch.maxParticipants})
                  </ThemedText>
                  {selectedMatch.participants.map((participant, index) => (
                    <View key={participant._id} style={styles.participantItem}>
                      <View style={styles.participantAvatar}>
                        <ThemedText style={styles.participantAvatarText}>
                          {participant.username.charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.participantName}>{participant.username}</ThemedText>
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Katılma Butonu */}
              {selectedMatch.status === 'upcoming' && selectedMatch.participants.length < selectedMatch.maxParticipants && (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalJoinButton, { backgroundColor: primaryColor }]}
                    onPress={() => joinMatch(selectedMatch._id)}
                  >
                    <ThemedText style={styles.modalJoinButtonText}>Maça Katıl</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Maçlar yükleniyor...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#F44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: primaryColor }]}
            onPress={fetchMatches}
          >
            <ThemedText style={styles.retryButtonText}>Tekrar Dene</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[primaryColor, '#66BB6A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <ThemedText style={styles.headerIconText}>⚽</ThemedText>
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.headerTitle}>Maçlar</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Halı sahalarında oynanan maçların skorları ({filteredMatches.length} maç)
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Halı saha filtresi */}
      <View style={[styles.filterContainer, { backgroundColor: cardBgColor }]}>
        <ThemedText style={styles.filterTitle}>Halı Saha Seçimi:</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedStatus === filter.key && { backgroundColor: primaryColor }
              ]}
              onPress={() => setSelectedStatus(filter.key)}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  selectedStatus === filter.key && { color: 'white' }
                ]}
              >
                {filter.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Maç Listesi */}
      <FlatList
        data={filteredMatches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[primaryColor]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="sportscourt" size={64} color={textColor + '40'} />
            <ThemedText style={styles.emptyText}>
              {loading ? 'Maçlar yükleniyor...' :
               error ? 'Maçlar yüklenirken hata oluştu' :
               'Maç bulunmuyor'}
            </ThemedText>
            {!loading && !error && (
              <ThemedText style={[styles.emptyText, { fontSize: 14, marginTop: 8, opacity: 0.6 }]}>
                Toplam {matches.length} maç yüklendi, {filteredMatches.length} maç filtrelendi
              </ThemedText>
            )}
          </View>
        }
      />

      {/* Maç Detay Modalı */}
      {renderMatchModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 16,
  },
  headerIconText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  filterContainer: {
    padding: 16,
    paddingTop: 0,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  matchCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  matchHeader: {
    padding: 16,
  },
  matchHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchDateTimeContainer: {
    flex: 1,
  },
  matchHeaderDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  matchHeaderTime: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  matchStatusContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  matchHeaderStatus: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchContent: {
    padding: 16,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 50,
  },
  teamLogoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    flexShrink: 0,
  },
  teamIcon: {
    color: 'white',
    fontSize: 16,
  },
  teamInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  teamNameText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  teamNameRight: {
    textAlign: 'center',
  },
  teamContainerRight: {
    flexDirection: 'row-reverse',
  },
  scoreDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    flex: 0,
  },
  scoreBox: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    minWidth: 70,
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  upcomingMatchContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  venueInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsCountText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  matchFooterInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchMetaText: {
    fontSize: 12,
    opacity: 0.7,
    marginRight: 12,
  },
  priceTag: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  modalTeamScore: {
    alignItems: 'center',
    flex: 1,
  },
  modalTeamName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  modalScoreSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    opacity: 0.5,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  participantName: {
    fontSize: 14,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalJoinButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalJoinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
