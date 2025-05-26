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
  Linking,
  Image
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
    position?: string;
  }>;
  createdAt: string;
  logo?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  city?: string;
}

// Takım renkleri - Daha güzel ve profesyonel renkler
const TEAM_COLORS = [
  '#2E7D32', '#1976D2', '#F57C00', '#7B1FA2', 
  '#D32F2F', '#0097A7', '#5D4037', '#455A64',
  '#C2185B', '#303F9F', '#E64A19', '#00695C'
];

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
  const primaryColor = '#4CAF50';
  const backgroundColor = useThemeColor({}, 'background');
  const cardBgColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  
  const router = useRouter();
  const { token, user } = useAuth();

  // Seviye filtreleri
  const levelFilters = ['all', 'Başlangıç', 'Orta', 'İyi', 'Pro'];

  // Takımları API'den çek
  const fetchTeams = async () => {
    try {
      setError(null);
      
      if (!token) {
        setError('Oturum açmanız gerekiyor');
        return;
      }

      const apiUrl = await getApiUrl('/teams');
      console.log('🔗 Teams API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);

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
        teamsData = data.data.map((team: any, index: number) => ({
          _id: team._id,
          name: team.name,
          level: team.level || 'Orta',
          neededPlayers: team.neededPlayers || 0,
          currentPlayerCount: team.currentPlayerCount || team.players?.length || 0,
          preferredTime: team.preferredTime || '20:00',
          venue: team.venue || { 
            _id: '',
            name: 'Bilinmeyen Saha', 
            location: 'Bilinmeyen Konum' 
          },
          contactNumber: team.contactNumber || '',
          matchHistory: team.matchHistory || '0',
          description: team.description || '',
          isApproved: team.isApproved !== false,
          captain: {
            _id: team.captain?._id || team.captain?.id || '',
            username: team.captain?.username || 'Bilinmeyen',
            profilePicture: team.captain?.profilePicture || ''
          },
          players: (team.players || []).map((player: any) => ({
            _id: player._id || player.id || '',
            username: player.username || 'Bilinmeyen',
            profilePicture: player.profilePicture || '',
            position: player.position || 'Oyuncu'
          })),
          createdAt: team.createdAt || team.updatedAt || new Date().toISOString(),
          logo: team.logo || `https://via.placeholder.com/80x80/${TEAM_COLORS[index % TEAM_COLORS.length].replace('#', '')}/FFFFFF?text=${team.name?.charAt(0) || 'T'}`,
          wins: team.wins || 0,
          losses: team.losses || 0,
          draws: team.draws || 0,
          goalsFor: team.goalsFor || 0,
          goalsAgainst: team.goalsAgainst || 0,
          city: team.city || 'Bilinmeyen'
        }));
      } else if (Array.isArray(data)) {
        teamsData = data.map((team, index) => ({
          ...team,
          logo: team.logo || `https://via.placeholder.com/80x80/${TEAM_COLORS[index % TEAM_COLORS.length].replace('#', '')}/FFFFFF?text=${team.name?.charAt(0) || 'T'}`,
          wins: team.wins || 0,
          losses: team.losses || 0,
          draws: team.draws || 0,
          goalsFor: team.goalsFor || 0,
          goalsAgainst: team.goalsAgainst || 0,
          city: team.city || 'Bilinmeyen'
        }));
      } else {
        console.warn('Beklenmeyen veri formatı:', data);
        teamsData = [];
      }
      
      console.log(`${teamsData.length} takım bulundu`);
      setTeams(teamsData);
      setFilteredTeams(teamsData);
    } catch (error) {
      console.error('❌ Takımlar yüklenirken hata:', error);
      setError('Takımlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setTeams([]);
      setFilteredTeams([]);
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
        team.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTeams(filtered);
  }, [teams, selectedLevel, searchQuery]);

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

      const response = await fetch(await getApiUrl(`/teams/${teamId}/join`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user._id })
      });

      if (!response.ok) {
        throw new Error('Takıma katılırken hata oluştu');
      }

      Alert.alert('Başarılı', 'Takıma katılma isteğiniz gönderildi!');
      fetchTeams();
      setModalVisible(false);
    } catch (error) {
      console.error('Takıma katılırken hata:', error);
      Alert.alert('Hata', 'Takıma katılırken bir hata oluştu');
    }
  };

  // İletişim
  const contactTeam = (phoneNumber: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Hata', 'Telefon numarası bulunamadı');
    }
  };

  // WhatsApp ile iletişim
  const openWhatsApp = (phoneNumber: string, teamName: string) => {
    if (phoneNumber) {
      const message = `Merhaba! ${teamName} takımınız hakkında bilgi almak istiyorum.`;
      const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Hata', 'WhatsApp açılamadı. Lütfen WhatsApp\'ın yüklü olduğundan emin olun.');
      });
    } else {
      Alert.alert('Hata', 'Telefon numarası bulunamadı');
    }
  };

  // Takım kartı render - Daha etkileyici tasarım
  const renderTeamCard = ({ item, index }: { item: Team; index: number }) => {
    const teamColor = TEAM_COLORS[index % TEAM_COLORS.length];
    const totalMatches = (item.wins || 0) + (item.losses || 0) + (item.draws || 0);
    const winRate = totalMatches > 0 ? Math.round(((item.wins || 0) / totalMatches) * 100) : 0;

    return (
      <TouchableOpacity
        style={[styles.teamCard, { backgroundColor: cardBgColor, borderColor }]}
        onPress={() => {
          setSelectedTeam(item);
          setModalVisible(true);
        }}
      >
        {/* Takım Header - Gradient Background */}
        <LinearGradient
          colors={[teamColor, teamColor + 'CC', teamColor + '99']}
          style={styles.teamHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.teamHeaderContent}>
            <View style={styles.teamBasicInfo}>
              <View style={styles.teamNameContainer}>
                <ThemedText style={styles.teamName} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <View style={styles.teamBadgeContainer}>
                  <View style={[styles.levelBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                    <ThemedText style={styles.levelText}>
                      {item.level}
                    </ThemedText>
                  </View>
                </View>
              </View>
              {item.city && item.city !== 'Bilinmeyen' && (
                <View style={styles.cityContainer}>
                  <ThemedText style={styles.cityIcon}>📍</ThemedText>
                  <ThemedText style={styles.teamCity}>
                    {item.city}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Takım Body - Etkileyici Bilgiler */}
        <View style={styles.teamBody}>
          {/* Takım Bilgileri Grid */}
          <View style={styles.teamInfoGrid}>
            <View style={styles.infoCard}>
              <ThemedText style={styles.infoCardIcon}>👥</ThemedText>
              <ThemedText style={styles.infoCardValue}>{item.currentPlayerCount}</ThemedText>
              <ThemedText style={styles.infoCardLabel}>Oyuncu</ThemedText>
            </View>
            
            <View style={styles.infoCard}>
              <ThemedText style={styles.infoCardIcon}>🕐</ThemedText>
              <ThemedText style={styles.infoCardValue}>{item.preferredTime}</ThemedText>
              <ThemedText style={styles.infoCardLabel}>Saat</ThemedText>
            </View>

            <View style={styles.infoCard}>
              <ThemedText style={styles.infoCardIcon}>⚽</ThemedText>
              <ThemedText style={styles.infoCardValue}>{item.matchHistory}</ThemedText>
              <ThemedText style={styles.infoCardLabel}>Maç</ThemedText>
            </View>
          </View>

          {/* Takım Özellikleri Progress Bars */}
          <View style={styles.teamPropertiesSection}>
            <View style={styles.propertiesTitleContainer}>
              <ThemedText style={styles.propertiesIcon}>⚡</ThemedText>
              <ThemedText style={styles.propertiesTitle}>Takım Özellikleri</ThemedText>
            </View>
            
            <View style={styles.propertyItem}>
              <View style={styles.propertyHeader}>
                <ThemedText style={styles.propertyLabel}>🔥 Hücum</ThemedText>
                <ThemedText style={styles.propertyValue}>50%</ThemedText>
              </View>
              <View style={styles.propertyBar}>
                <View style={[styles.propertyFill, { width: '50%', backgroundColor: '#FF6B35' }]} />
              </View>
            </View>

            <View style={styles.propertyItem}>
              <View style={styles.propertyHeader}>
                <ThemedText style={styles.propertyLabel}>🛡️ Defans</ThemedText>
                <ThemedText style={styles.propertyValue}>50%</ThemedText>
              </View>
              <View style={styles.propertyBar}>
                <View style={[styles.propertyFill, { width: '50%', backgroundColor: '#4A90E2' }]} />
              </View>
            </View>

            <View style={styles.propertyItem}>
              <View style={styles.propertyHeader}>
                <ThemedText style={styles.propertyLabel}>⚡ Hız</ThemedText>
                <ThemedText style={styles.propertyValue}>95%</ThemedText>
              </View>
              <View style={styles.propertyBar}>
                <View style={[styles.propertyFill, { width: '95%', backgroundColor: '#E74C3C' }]} />
              </View>
            </View>

            <View style={styles.propertyItem}>
              <View style={styles.propertyHeader}>
                <ThemedText style={styles.propertyLabel}>🤝 Takım Oyunu</ThemedText>
                <ThemedText style={styles.propertyValue}>50%</ThemedText>
              </View>
              <View style={styles.propertyBar}>
                <View style={[styles.propertyFill, { width: '50%', backgroundColor: '#9B59B6' }]} />
              </View>
            </View>
          </View>

          {/* WhatsApp İletişim Butonu - Daha etkileyici */}
          <TouchableOpacity
            style={[styles.whatsappButton, { backgroundColor: '#25D366' }]}
            onPress={() => {
              openWhatsApp(item.contactNumber || '', item.name);
            }}
          >
            <View style={styles.whatsappButtonContent}>
              <ThemedText style={styles.whatsappIcon}>💬</ThemedText>
              <ThemedText style={styles.whatsappButtonText}>WhatsApp ile İletişim</ThemedText>
              <ThemedText style={styles.whatsappArrow}>→</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Takım detay modalı - Detaylı bilgiler
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
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Image
                    source={{ uri: selectedTeam.logo }}
                    style={styles.modalTeamLogo}
                  />
                  <View style={styles.modalTeamInfo}>
                    <ThemedText style={styles.modalTitle}>{selectedTeam.name}</ThemedText>
                    <ThemedText style={styles.modalSubtitle}>📍 {selectedTeam.city}</ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <IconSymbol name="xmark" size={24} color={textColor} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Seviye ve Durum */}
                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>📊 Takım Bilgileri</ThemedText>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoGridItem}>
                      <ThemedText style={styles.infoLabel}>Seviye:</ThemedText>
                      <View style={[styles.levelBadgeModal, { backgroundColor: primaryColor }]}>
                        <ThemedText style={styles.levelTextModal}>{selectedTeam.level}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.infoGridItem}>
                      <ThemedText style={styles.infoLabel}>Maç Günü:</ThemedText>
                      <ThemedText style={styles.infoValue}>Pazartesi</ThemedText>
                    </View>
                    <View style={styles.infoGridItem}>
                      <ThemedText style={styles.infoLabel}>Tercih Edilen Saat:</ThemedText>
                      <ThemedText style={styles.infoValue}>{selectedTeam.preferredTime}</ThemedText>
                    </View>
                    <View style={styles.infoGridItem}>
                      <ThemedText style={styles.infoLabel}>Oyuncu Arıyor:</ThemedText>
                      <ThemedText style={styles.infoValue}>
                        {selectedTeam.neededPlayers > 0 ? `${selectedTeam.neededPlayers} oyuncu` : 'Tam kadro'}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Maç İstatistikleri */}
                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>🏆 Maç İstatistikleri</ThemedText>
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <ThemedText style={[styles.statNumber, { color: '#4CAF50' }]}>
                        {selectedTeam.wins || 0}
                      </ThemedText>
                      <ThemedText style={styles.statCardLabel}>Galibiyet</ThemedText>
                    </View>
                    <View style={styles.statCard}>
                      <ThemedText style={[styles.statNumber, { color: '#FF9800' }]}>
                        {selectedTeam.draws || 0}
                      </ThemedText>
                      <ThemedText style={styles.statCardLabel}>Beraberlik</ThemedText>
                    </View>
                    <View style={styles.statCard}>
                      <ThemedText style={[styles.statNumber, { color: '#F44336' }]}>
                        {selectedTeam.losses || 0}
                      </ThemedText>
                      <ThemedText style={styles.statCardLabel}>Mağlubiyet</ThemedText>
                    </View>
                  </View>
                </View>

                {/* Gol İstatistikleri */}
                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>⚽ Gol İstatistikleri</ThemedText>
                  <View style={styles.goalStatsModal}>
                    <View style={styles.goalStatRow}>
                      <ThemedText style={styles.goalStatLabel}>Gol Atılan:</ThemedText>
                      <ThemedText style={[styles.goalStatValue, { color: '#4CAF50' }]}>
                        {selectedTeam.goalsFor || 0}
                      </ThemedText>
                    </View>
                    <View style={styles.goalStatRow}>
                      <ThemedText style={styles.goalStatLabel}>Gol Yenilen:</ThemedText>
                      <ThemedText style={[styles.goalStatValue, { color: '#F44336' }]}>
                        {selectedTeam.goalsAgainst || 0}
                      </ThemedText>
                    </View>
                    <View style={styles.goalStatRow}>
                      <ThemedText style={styles.goalStatLabel}>Averaj:</ThemedText>
                      <ThemedText style={styles.goalStatValue}>
                        {(selectedTeam.goalsFor || 0) - (selectedTeam.goalsAgainst || 0) > 0 ? '+' : ''}
                        {(selectedTeam.goalsFor || 0) - (selectedTeam.goalsAgainst || 0)}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Takım Özellikleri */}
                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>📋 Takım Özellikleri</ThemedText>
                  <View style={styles.teamPropertiesGrid}>
                    <View style={styles.propertyItem}>
                      <ThemedText style={styles.propertyIcon}>⚡</ThemedText>
                      <ThemedText style={styles.propertyLabel}>Hücum</ThemedText>
                      <View style={styles.propertyBar}>
                        <View style={[styles.propertyFill, { width: '50%', backgroundColor: '#FF9800' }]} />
                      </View>
                      <ThemedText style={styles.propertyValue}>50%</ThemedText>
                    </View>
                    <View style={styles.propertyItem}>
                      <ThemedText style={styles.propertyIcon}>🛡️</ThemedText>
                      <ThemedText style={styles.propertyLabel}>Defans</ThemedText>
                      <View style={styles.propertyBar}>
                        <View style={[styles.propertyFill, { width: '50%', backgroundColor: '#2196F3' }]} />
                      </View>
                      <ThemedText style={styles.propertyValue}>50%</ThemedText>
                    </View>
                    <View style={styles.propertyItem}>
                      <ThemedText style={styles.propertyIcon}>🏃</ThemedText>
                      <ThemedText style={styles.propertyLabel}>Hız</ThemedText>
                      <View style={styles.propertyBar}>
                        <View style={[styles.propertyFill, { width: '95%', backgroundColor: '#F44336' }]} />
                      </View>
                      <ThemedText style={styles.propertyValue}>95%</ThemedText>
                    </View>
                    <View style={styles.propertyItem}>
                      <ThemedText style={styles.propertyIcon}>👥</ThemedText>
                      <ThemedText style={styles.propertyLabel}>Takım Oyunu</ThemedText>
                      <View style={styles.propertyBar}>
                        <View style={[styles.propertyFill, { width: '50%', backgroundColor: '#9C27B0' }]} />
                      </View>
                      <ThemedText style={styles.propertyValue}>50%</ThemedText>
                    </View>
                  </View>
                </View>

                {/* İletişim Bilgileri */}
                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>📞 İletişim</ThemedText>
                  <View style={styles.contactInfo}>
                    <View style={styles.contactRow}>
                      <ThemedText style={styles.contactLabel}>Telefon:</ThemedText>
                      <ThemedText style={styles.contactValue}>
                        {selectedTeam.contactNumber || 'Belirtilmemiş'}
                      </ThemedText>
                    </View>
                    <View style={styles.contactRow}>
                      <ThemedText style={styles.contactLabel}>Konum:</ThemedText>
                      <ThemedText style={styles.contactValue}>merkez</ThemedText>
                    </View>
                  </View>
                </View>

                {/* Ana Saha */}
                {selectedTeam.venue && (
                  <View style={styles.modalSection}>
                    <ThemedText style={styles.sectionTitle}>🏟️ Ana Saha</ThemedText>
                    <View style={styles.venueCard}>
                      <ThemedText style={styles.venueName}>{selectedTeam.venue.name}</ThemedText>
                      <ThemedText style={styles.venueLocation}>{selectedTeam.venue.location}</ThemedText>
                    </View>
                  </View>
                )}

                {/* Açıklama */}
                {selectedTeam.description && (
                  <View style={styles.modalSection}>
                    <ThemedText style={styles.sectionTitle}>📝 Açıklama</ThemedText>
                    <ThemedText style={styles.description}>{selectedTeam.description}</ThemedText>
                  </View>
                )}

                {/* Kaptan Bilgisi */}
                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>👑 Kaptan</ThemedText>
                  <View style={styles.captainCard}>
                    <View style={[styles.captainAvatarLarge, { backgroundColor: primaryColor }]}>
                      <ThemedText style={styles.captainAvatarLargeText}>
                        {selectedTeam.captain.username.charAt(0).toUpperCase()}
                      </ThemedText>
                    </View>
                    <View style={styles.captainInfoLarge}>
                      <ThemedText style={styles.captainNameLarge}>{selectedTeam.captain.username}</ThemedText>
                      <ThemedText style={styles.captainRole}>Takım Kaptanı</ThemedText>
                    </View>
                  </View>
                </View>

                {/* Oyuncular */}
                <View style={styles.modalSection}>
                  <ThemedText style={styles.sectionTitle}>
                    👥 Oyuncular ({selectedTeam.players.length})
                  </ThemedText>
                  {selectedTeam.players.map((player, index) => (
                    <View key={player._id} style={styles.playerItem}>
                      <View style={styles.playerAvatar}>
                        <ThemedText style={styles.playerAvatarText}>
                          {player.username.charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>
                      <View style={styles.playerInfo}>
                        <ThemedText style={styles.playerName}>{player.username}</ThemedText>
                        <ThemedText style={styles.playerPosition}>{player.position || 'Oyuncu'}</ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* WhatsApp İletişim Butonu */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.whatsappButton, { backgroundColor: '#25D366' }]}
                  onPress={() => {
                    // WhatsApp ile iletişim
                    openWhatsApp(selectedTeam.contactNumber || '', selectedTeam.name);
                    setModalVisible(false);
                  }}
                >
                  <ThemedText style={styles.whatsappButtonText}>📱 WhatsApp ile İletişim</ThemedText>
                </TouchableOpacity>
                
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
        colors={[primaryColor, '#66BB6A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <ThemedText style={styles.headerIconText}>⚽</ThemedText>
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.headerTitle}>Sporyum 23 Halı</ThemedText>
            <ThemedText style={styles.headerTitle}>Sahamızın Takımları</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {filteredTeams.length} takım bulundu
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Arama ve Filtreler */}
      <View style={[styles.searchContainer, { backgroundColor: cardBgColor }]}>
        <View style={[styles.searchBox, { borderColor: primaryColor + '30' }]}>
          <IconSymbol name="magnifyingglass" size={20} color={primaryColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Takım ara..."
            placeholderTextColor={textColor + '60'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={textColor + '60'} />
            </TouchableOpacity>
          )}
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
                selectedLevel === level && { 
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                  elevation: 2,
                  shadowColor: primaryColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }
              ]}
              onPress={() => setSelectedLevel(level)}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  selectedLevel === level && { color: 'white', fontWeight: 'bold' }
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 22,
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
  teamHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamBasicInfo: {
    flex: 1,
  },
  teamNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teamBadgeContainer: {
    marginLeft: 8,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cityIcon: {
    marginRight: 4,
  },
  teamCity: {
    fontSize: 14,
    opacity: 0.7,
  },
  teamBody: {
    padding: 16,
  },
  teamInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  infoCardIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoCardLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  teamPropertiesSection: {
    marginBottom: 24,
  },
  propertiesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertiesIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  propertiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  propertyItem: {
    marginBottom: 12,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  propertyLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  propertyBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  propertyFill: {
    height: '100%',
    borderRadius: 4,
  },
  whatsappButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  whatsappButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  whatsappArrow: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
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
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTeamLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  modalTeamInfo: {
    flexDirection: 'column',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    opacity: 0.7,
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
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoGridItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  levelBadgeModal: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelTextModal: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statCardLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  goalStatsModal: {
    marginBottom: 24,
  },
  goalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalStatLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  goalStatValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  teamPropertiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  propertyIcon: {
    fontSize: 14,
    opacity: 0.7,
  },
  contactInfo: {
    marginBottom: 24,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  venueCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  venueLocation: {
    fontSize: 14,
    opacity: 0.7,
  },
  captainCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captainAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  captainAvatarLargeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  captainInfoLarge: {
    flexDirection: 'column',
  },
  captainNameLarge: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  captainRole: {
    fontSize: 12,
    opacity: 0.7,
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
  playerInfo: {
    flexDirection: 'column',
  },
  playerPosition: {
    fontSize: 12,
    opacity: 0.7,
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
    marginTop: 12,
  },
  modalJoinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  propertyValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
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
}); 