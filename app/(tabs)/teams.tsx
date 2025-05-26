import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Linking
} from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/services/networkConfig';
import { LinearGradient } from 'expo-linear-gradient';

// Takım veri tipi tanımı
interface Team {
  _id: string;
  name: string;
  level: string;
  neededPlayers: number;
  currentPlayerCount: number;
  preferredTime: string;
  venue?: {
    _id: string;
    name: string;
    location: string;
  };
  contactNumber?: string;
  matchHistory: string;
  description?: string;
  isApproved: boolean;
  captain: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  players: Array<{
    _id: string;
    username: string;
    profilePicture?: string;
  }>;
  createdAt: string;
}

export default function TeamsScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBgColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  
  const router = useRouter();
  const { token, user } = useAuth();

  // Backend bağlantısını test et
  const testBackendConnection = async () => {
    try {
      const testUrl = await getApiUrl('/test');
      console.log('🧪 Testing backend connection:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend test successful:', data);
        return true;
      } else {
        console.error('❌ Backend test failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend test error:', error);
      return false;
    }
  };

  // Takımları API'den çek
  const fetchTeams = async () => {
    try {
      setError(null);
      
      if (!token) {
        setError('Oturum açmanız gerekiyor');
        return;
      }

      // Önce backend bağlantısını test et
      const isBackendConnected = await testBackendConnection();
      if (!isBackendConnected) {
        throw new Error('Backend bağlantısı kurulamadı');
      }

      const apiUrl = await getApiUrl('/teams');
      console.log('🔗 Teams API URL:', apiUrl);
      console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'Yok');

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Takımlar yüklenirken hata oluştu: ${response.status} - ${errorText}`);
      }

      const data: any = await response.json();
      console.log('✅ Takımlar yüklendi:', data);
      
      // Backend'den gelen veri formatını kontrol et
      let teamsData: Team[] = [];
      
      if (data && data.success && Array.isArray(data.data)) {
        // Backend'den gelen format: {success: true, data: [...], count: 8}
        teamsData = data.data;
      } else if (Array.isArray(data)) {
        // Doğrudan array formatı
        teamsData = data;
      } else {
        console.warn('Beklenmeyen veri formatı:', data);
        teamsData = [];
      }
      
      // Sadece onaylanmış takımları göster (eğer isApproved alanı varsa)
      const approvedTeams = teamsData.filter((team: any) => {
        // isApproved alanı yoksa tüm takımları göster
        return team.isApproved !== false;
      });
      
      setTeams(approvedTeams);
      setFilteredTeams(approvedTeams);
    } catch (error) {
      console.error('❌ Takımlar yüklenirken hata:', error);
      
      // API başarısız olursa mock data göster
      const mockTeams: Team[] = [
        {
          _id: '1',
          name: 'Yıldızlar FC',
          level: 'Orta',
          neededPlayers: 3,
          currentPlayerCount: 8,
          preferredTime: '20:00',
          venue: {
            _id: 'venue1',
            name: 'Sporium 23',
            location: 'Elazığ'
          },
          contactNumber: '+905551234567',
          matchHistory: '15',
          description: 'Haftada 2-3 kez oynayan aktif takım',
          isApproved: true,
          captain: {
            _id: 'user1',
            username: 'Kaptan Ali',
            profilePicture: ''
          },
          players: [
            { _id: 'user1', username: 'Kaptan Ali', profilePicture: '' },
            { _id: 'user2', username: 'Mehmet', profilePicture: '' },
            { _id: 'user3', username: 'Ahmet', profilePicture: '' }
          ],
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Aslanlar SK',
          level: 'İyi',
          neededPlayers: 2,
          currentPlayerCount: 9,
          preferredTime: '19:00',
          venue: {
            _id: 'venue1',
            name: 'Sporium 23',
            location: 'Elazığ'
          },
          contactNumber: '+905559876543',
          matchHistory: '22',
          description: 'Rekabetçi oyun arayan takım',
          isApproved: true,
          captain: {
            _id: 'user4',
            username: 'Kaptan Veli',
            profilePicture: ''
          },
          players: [
            { _id: 'user4', username: 'Kaptan Veli', profilePicture: '' },
            { _id: 'user5', username: 'Emre', profilePicture: '' }
          ],
          createdAt: new Date().toISOString()
        }
      ];
      
      setTeams(mockTeams);
      setFilteredTeams(mockTeams);
      setError('Demo veriler gösteriliyor - Backend bağlantısı kurulamadı');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sayfa yüklendiğinde takımları çek
  useEffect(() => {
    fetchTeams();
  }, [token]);

  // Arama ve filtreleme
  useEffect(() => {
    let filtered = teams;

    // Seviye filtresi
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(team => team.level === selectedLevel);
    }

    // Arama filtresi
    if (searchQuery.trim()) {
      filtered = filtered.filter(team => 
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.venue?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.venue?.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTeams(filtered);
  }, [teams, searchQuery, selectedLevel]);

  // Yenileme
  const onRefresh = () => {
    setRefreshing(true);
    fetchTeams();
  };

  // Takıma katıl
  const joinTeam = async (teamId: string) => {
    try {
      if (!token || !user) {
        Alert.alert('Hata', 'Oturum açmanız gerekiyor');
        return;
      }

      const response = await fetch(await getApiUrl(`/teams/${teamId}/players`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ playerId: user._id })
      });

      if (!response.ok) {
        throw new Error('Takıma katılırken hata oluştu');
      }

      Alert.alert('Başarılı', 'Takıma katılma isteğiniz gönderildi!');
      fetchTeams(); // Listeyi güncelle
      setModalVisible(false);
    } catch (error) {
      console.error('Takıma katılırken hata:', error);
      Alert.alert('Hata', 'Takıma katılırken bir hata oluştu');
    }
  };

  // WhatsApp ile iletişim
  const contactTeam = (phoneNumber: string) => {
    if (phoneNumber) {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const whatsappUrl = `whatsapp://send?phone=${cleanNumber}`;
      Linking.openURL(whatsappUrl).catch(() => {
        Alert.alert('Hata', 'WhatsApp açılamadı');
      });
    }
  };

  // Seviye rengini al
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Başlangıç': return '#4CAF50';
      case 'Orta': return '#2196F3';
      case 'İyi': return '#FFC107';
      case 'Pro': return '#F44336';
      default: return '#757575';
    }
  };

  // Seviye filtreleri
  const levelFilters = ['all', 'Başlangıç', 'Orta', 'İyi', 'Pro'];

  // Takım kartı render
  const renderTeamCard = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={[styles.teamCard, { backgroundColor: cardBgColor, borderColor }]}
      onPress={() => {
        setSelectedTeam(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <View style={[styles.teamAvatar, { backgroundColor: getLevelColor(item.level) }]}>
            <ThemedText style={styles.teamAvatarText}>
              {item.name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.teamDetails}>
            <ThemedText style={styles.teamName}>{item.name}</ThemedText>
            <View style={styles.teamMeta}>
              <IconSymbol name="clock" size={14} color={textColor} />
              <ThemedText style={styles.teamMetaText}>{item.preferredTime}</ThemedText>
              {item.venue && (
                <>
                  <ThemedText style={styles.teamMetaText}> • </ThemedText>
                  <ThemedText style={styles.teamMetaText}>{item.venue.name}</ThemedText>
                </>
              )}
            </View>
          </View>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.level) }]}>
          <ThemedText style={styles.levelBadgeText}>{item.level}</ThemedText>
        </View>
      </View>

      <View style={styles.teamStats}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{item.currentPlayerCount}</ThemedText>
          <ThemedText style={styles.statLabel}>Mevcut</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{item.neededPlayers}</ThemedText>
          <ThemedText style={styles.statLabel}>Aranan</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{item.matchHistory}</ThemedText>
          <ThemedText style={styles.statLabel}>Maç</ThemedText>
        </View>
      </View>

      <View style={styles.teamActions}>
        <TouchableOpacity
          style={[styles.joinButton, { backgroundColor: primaryColor }]}
          onPress={() => joinTeam(item._id)}
        >
          <IconSymbol name="person.badge.plus" size={16} color="white" />
          <ThemedText style={styles.joinButtonText}>Katıl</ThemedText>
        </TouchableOpacity>
        
        {item.contactNumber && (
          <TouchableOpacity
            style={[styles.contactButton, { borderColor: '#25D366' }]}
            onPress={() => contactTeam(item.contactNumber!)}
          >
            <IconSymbol name="message" size={16} color="#25D366" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  // Takım detay modalı
  const renderTeamModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: cardBgColor }]}>
          {selectedTeam && (
            <>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>{selectedTeam.name}</ThemedText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <IconSymbol name="xmark" size={24} color={textColor} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>Takım Bilgileri</ThemedText>
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Seviye:</ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedTeam.level}</ThemedText>
                  </View>
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Tercih Edilen Saat:</ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedTeam.preferredTime}</ThemedText>
                  </View>
                  {selectedTeam.venue && (
                    <View style={styles.infoRow}>
                      <ThemedText style={styles.infoLabel}>Halı Saha:</ThemedText>
                      <ThemedText style={styles.infoValue}>{selectedTeam.venue.name}</ThemedText>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Kaptan:</ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedTeam.captain.username}</ThemedText>
                  </View>
                </View>

                {selectedTeam.description && (
                  <View style={styles.modalSection}>
                    <ThemedText style={styles.sectionTitle}>Açıklama</ThemedText>
                    <ThemedText style={styles.description}>{selectedTeam.description}</ThemedText>
                  </View>
                )}

                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>Oyuncular ({selectedTeam.players.length})</ThemedText>
                  {selectedTeam.players.map((player, index) => (
                    <View key={player._id} style={styles.playerItem}>
                      <View style={styles.playerAvatar}>
                        <ThemedText style={styles.playerAvatarText}>
                          {player.username.charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.playerName}>{player.username}</ThemedText>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalJoinButton, { backgroundColor: primaryColor }]}
                  onPress={() => joinTeam(selectedTeam._id)}
                >
                  <ThemedText style={styles.modalJoinButtonText}>Takıma Katıl</ThemedText>
                </TouchableOpacity>
              </View>
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
          <ThemedText style={styles.loadingText}>Takımlar yükleniyor...</ThemedText>
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
            onPress={fetchTeams}
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
        <ThemedText style={styles.headerTitle}>Takımlar</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {filteredTeams.length} takım bulundu
        </ThemedText>
      </LinearGradient>

      {/* Arama ve Filtreler */}
      <View style={[styles.searchContainer, { backgroundColor: cardBgColor }]}>
        <View style={[styles.searchBox, { borderColor }]}>
          <IconSymbol name="magnifyingglass" size={20} color={textColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Takım ara..."
            placeholderTextColor={textColor + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {levelFilters.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.filterButton,
                selectedLevel === level && { backgroundColor: primaryColor }
              ]}
              onPress={() => setSelectedLevel(level)}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  selectedLevel === level && { color: 'white' }
                ]}
              >
                {level === 'all' ? 'Tümü' : level}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Takım Listesi */}
      <FlatList
        data={filteredTeams}
        renderItem={renderTeamCard}
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
            <IconSymbol name="person.3" size={64} color={textColor + '40'} />
            <ThemedText style={styles.emptyText}>
              {searchQuery || selectedLevel !== 'all' 
                ? 'Arama kriterlerinize uygun takım bulunamadı'
                : 'Henüz takım bulunmuyor'
              }
            </ThemedText>
          </View>
        }
      />

      {/* Takım Detay Modalı */}
      {renderTeamModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  searchContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'transparent',
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
  teamCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  teamInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  teamAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamMetaText: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 4,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  teamActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  contactButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
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
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playerName: {
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