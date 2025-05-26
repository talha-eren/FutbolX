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
    };
    teamB: {
      name: string;
      goals: number;
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
}

// Halı saha veri tipi
interface Venue {
  _id: string;
  name: string;
  location: string;
  image?: string;
}

export default function MatchesScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [matches, setMatches] = useState<Match[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBgColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  
  const router = useRouter();
  const { token, user } = useAuth();
  
  // Maçları API'den çek
  const fetchMatches = async () => {
    try {
      setError(null);
      
      if (!token) {
        setError('Oturum açmanız gerekiyor');
        return;
      }

      const matchesUrl = await getApiUrl('/matches');
      const venuesUrl = await getApiUrl('/venues');
      console.log('🔗 Matches API URL:', matchesUrl);
      console.log('🔗 Venues API URL:', venuesUrl);
      console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'Yok');

      const [matchesResponse, venuesResponse] = await Promise.all([
        fetch(matchesUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(venuesUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      console.log('📡 Matches Response status:', matchesResponse.status);
      console.log('📡 Venues Response status:', venuesResponse.status);

      if (!matchesResponse.ok || !venuesResponse.ok) {
        const matchesError = !matchesResponse.ok ? await matchesResponse.text() : '';
        const venuesError = !venuesResponse.ok ? await venuesResponse.text() : '';
        console.error('❌ Matches API Error:', matchesError);
        console.error('❌ Venues API Error:', venuesError);
        throw new Error(`Veriler yüklenirken hata oluştu: Matches(${matchesResponse.status}) Venues(${venuesResponse.status})`);
      }

      const matchesData = await matchesResponse.json();
      const venuesData: any = await venuesResponse.json();
      
      console.log('✅ Maçlar yüklendi:', matchesData);
      console.log('✅ Halı sahalar yüklendi:', venuesData);
      
      // API'den gelen maçları formatla
      const formattedMatches = (matchesData as any)?.matches ? (matchesData as any).matches.map((match: any) => ({
        _id: match._id,
        title: match.title || `${match.score?.teamA?.name || 'Takım A'} vs ${match.score?.teamB?.name || 'Takım B'}`,
        venue: match.venue || { name: 'Bilinmeyen Saha', location: 'Bilinmeyen Konum' },
        date: match.date,
        startTime: match.startTime,
        endTime: match.endTime,
        status: match.status || 'upcoming',
        score: match.score,
        organizer: match.organizer || { username: 'Bilinmeyen', profilePicture: '' },
        participants: match.participants || [],
        maxParticipants: match.maxParticipants || 22,
        price: match.price,
        level: match.level,
        description: match.description,
        isPrivate: match.isPrivate || false,
        createdAt: match.createdAt
      })) : [];
      
      // Backend'den gelen venues veri formatını kontrol et
      let venuesArray: Venue[] = [];
      
      if (venuesData && venuesData.success && Array.isArray(venuesData.data)) {
        // Backend'den gelen format: {success: true, data: [...], count: 5}
        venuesArray = venuesData.data.map((venue: any) => ({
          _id: venue.id?.toString() || venue._id,
          name: venue.name,
          location: venue.address || venue.location,
          image: venue.image
        }));
      } else if (Array.isArray(venuesData)) {
        // Doğrudan array formatı
        venuesArray = venuesData;
      } else {
        console.warn('Beklenmeyen venues veri formatı:', venuesData);
        venuesArray = [];
      }
      
      setMatches(formattedMatches);
      setVenues(venuesArray);
      
    } catch (error) {
      console.error('Maçlar yüklenirken hata:', error);
      
      // API başarısız olursa mock data göster
      const mockMatches: Match[] = [
        {
          _id: '1',
          title: 'Yıldızlar vs Aslanlar',
          venue: {
            _id: 'venue1',
            name: 'Sporium 23',
            location: 'Elazığ',
            image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop'
          },
          date: new Date(Date.now() + 86400000).toISOString(), // Yarın
          startTime: '20:00',
          endTime: '21:30',
          status: 'upcoming',
          organizer: {
            _id: 'user1',
            username: 'Organizatör Ali',
            profilePicture: ''
          },
          participants: [
            { _id: 'user1', username: 'Ali', profilePicture: '' },
            { _id: 'user2', username: 'Mehmet', profilePicture: '' }
          ],
          maxParticipants: 22,
          price: 50,
          level: 'Orta',
          description: 'Eğlenceli maç',
          isPrivate: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Kartallar vs Şimşekler',
          venue: {
            _id: 'venue1',
            name: 'Sporium 23',
            location: 'Elazığ',
            image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop'
          },
          date: new Date(Date.now() - 86400000).toISOString(), // Dün
          startTime: '19:00',
          endTime: '20:30',
          status: 'completed',
          score: {
            teamA: { name: 'Kartallar', goals: 3 },
            teamB: { name: 'Şimşekler', goals: 1 }
          },
          organizer: {
            _id: 'user3',
            username: 'Organizatör Veli',
            profilePicture: ''
          },
          participants: [
            { _id: 'user3', username: 'Veli', profilePicture: '' },
            { _id: 'user4', username: 'Ahmet', profilePicture: '' }
          ],
          maxParticipants: 22,
          price: 60,
          level: 'İyi',
          description: 'Rekabetçi maç',
          isPrivate: false,
          createdAt: new Date().toISOString()
        }
      ];
      
      const mockVenues: Venue[] = [
        {
          _id: 'venue1',
          name: 'Sporium 23',
          location: 'Elazığ',
          image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop'
        }
      ];
      
      setMatches(mockMatches);
      setVenues(mockVenues);
      setError('Demo veriler gösteriliyor - Backend bağlantısı kurulamadı');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sayfa yüklendiğinde maçları çek
  useEffect(() => {
    fetchMatches();
  }, [token]);

  // Filtreleme
  useEffect(() => {
    let filtered = matches;

    // Tab filtresi
    const now = new Date();
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.date);
        return matchDate >= now || match.status === 'upcoming';
      });
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.date);
        return matchDate < now || match.status === 'completed';
      });
    } else if (activeTab === 'live') {
      filtered = filtered.filter(match => match.status === 'live');
    }

    // Halı saha filtresi
    if (selectedVenue !== 'all') {
      filtered = filtered.filter(match => match.venue._id === selectedVenue);
    }

    // Tarihe göre sırala
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return activeTab === 'upcoming' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

    setFilteredMatches(filtered);
  }, [matches, activeTab, selectedVenue]);

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
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Durum rengini al
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#2196F3';
      case 'live': return '#4CAF50';
      case 'completed': return '#757575';
      default: return '#757575';
    }
  };

  // Durum metnini al
  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Yaklaşan';
      case 'live': return 'Canlı';
      case 'completed': return 'Tamamlandı';
      default: return 'Bilinmeyen';
    }
  };

  // Tab seçenekleri
  const tabs = [
    { key: 'upcoming', title: 'Yaklaşan', icon: 'calendar' },
    { key: 'live', title: 'Canlı', icon: 'dot.radiowaves.left.and.right' },
    { key: 'completed', title: 'Tamamlanan', icon: 'checkmark.circle' }
  ];

  // Maç kartı render
  const renderMatchItem = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={[styles.matchCard, { backgroundColor: cardBgColor, borderColor }]}
      onPress={() => {
        setSelectedMatch(item);
        setModalVisible(true);
      }}
    >
      {/* Maç Resmi */}
      <View style={styles.matchImageContainer}>
        <Image
          source={{ 
            uri: item.venue.image || 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop'
          }}
          style={styles.matchImage}
        />
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <ThemedText style={styles.statusText}>{getStatusText(item.status)}</ThemedText>
        </View>
      </View>

      {/* Maç Bilgileri */}
      <View style={styles.matchInfo}>
        <ThemedText style={styles.matchTitle} numberOfLines={1}>
          {item.title}
        </ThemedText>
        
        <View style={styles.matchMeta}>
          <View style={styles.metaItem}>
            <IconSymbol name="location" size={14} color={textColor} />
            <ThemedText style={styles.metaText}>{item.venue.name}</ThemedText>
          </View>
          <View style={styles.metaItem}>
            <IconSymbol name="calendar" size={14} color={textColor} />
            <ThemedText style={styles.metaText}>{formatDate(item.date)}</ThemedText>
          </View>
          <View style={styles.metaItem}>
            <IconSymbol name="clock" size={14} color={textColor} />
            <ThemedText style={styles.metaText}>{item.startTime} - {item.endTime}</ThemedText>
          </View>
        </View>

        {/* Skor (Tamamlanan maçlar için) */}
        {item.status === 'completed' && item.score && (
          <View style={styles.scoreContainer}>
            <View style={styles.teamScore}>
              <ThemedText style={styles.teamName}>{item.score.teamA.name}</ThemedText>
              <ThemedText style={styles.score}>{item.score.teamA.goals}</ThemedText>
            </View>
            <ThemedText style={styles.scoreSeparator}>-</ThemedText>
            <View style={styles.teamScore}>
              <ThemedText style={styles.score}>{item.score.teamB.goals}</ThemedText>
              <ThemedText style={styles.teamName}>{item.score.teamB.name}</ThemedText>
            </View>
          </View>
        )}

        {/* Katılımcı Bilgisi */}
        <View style={styles.participantsInfo}>
          <View style={styles.participantsCount}>
            <IconSymbol name="person.2" size={16} color={primaryColor} />
            <ThemedText style={styles.participantsText}>
              {item.participants.length}/{item.maxParticipants} Oyuncu
            </ThemedText>
          </View>
          
          {item.price && (
            <View style={styles.priceContainer}>
              <ThemedText style={styles.priceText}>{item.price}₺</ThemedText>
            </View>
          )}
        </View>

        {/* Organizatör */}
        <View style={styles.organizerInfo}>
          <View style={styles.organizerAvatar}>
            <ThemedText style={styles.organizerAvatarText}>
              {item.organizer.username.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText style={styles.organizerName}>{item.organizer.username}</ThemedText>
          {item.level && (
            <View style={[styles.levelBadge, { backgroundColor: primaryColor }]}>
              <ThemedText style={styles.levelText}>{item.level}</ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
                    <ThemedText style={[styles.infoValue, { color: getStatusColor(selectedMatch.status) }]}>
                      {getStatusText(selectedMatch.status)}
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
        colors={[primaryColor, '#81c784']}
        style={styles.header}
      >
        <ThemedText style={styles.headerTitle}>Maçlar</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {filteredMatches.length} maç bulundu
        </ThemedText>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: cardBgColor }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && { backgroundColor: primaryColor }
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <IconSymbol 
                name={tab.icon as any} 
                size={16} 
                color={activeTab === tab.key ? 'white' : textColor} 
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === tab.key && { color: 'white' }
                ]}
              >
                {tab.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Halı Saha Filtresi */}
      {venues.length > 0 && (
        <View style={[styles.filterContainer, { backgroundColor: cardBgColor }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedVenue === 'all' && { backgroundColor: primaryColor }
              ]}
              onPress={() => setSelectedVenue('all')}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  selectedVenue === 'all' && { color: 'white' }
                ]}
              >
                Tüm Sahalar
              </ThemedText>
            </TouchableOpacity>
            {venues.map((venue) => (
              <TouchableOpacity
                key={venue._id}
                style={[
                  styles.filterButton,
                  selectedVenue === venue._id && { backgroundColor: primaryColor }
                ]}
                onPress={() => setSelectedVenue(venue._id)}
              >
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    selectedVenue === venue._id && { color: 'white' }
                  ]}
                >
                  {venue.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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
              {activeTab === 'upcoming' ? 'Yaklaşan maç bulunmuyor' :
               activeTab === 'live' ? 'Şu an canlı maç yok' :
               'Tamamlanan maç bulunmuyor'}
            </ThemedText>
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
  tabsContainer: {
    padding: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    padding: 16,
    paddingTop: 0,
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
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  matchImageContainer: {
    position: 'relative',
  },
  matchImage: {
    width: '100%',
    height: 150,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchInfo: {
    padding: 16,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  teamScore: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  scoreSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    opacity: 0.5,
  },
  participantsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantsCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  priceContainer: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  organizerAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  organizerName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
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
