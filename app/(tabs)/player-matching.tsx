import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import PlayerMatchingService, { PlayerMatch, MatchingPreferences, TeamMatchingResult } from '../../services/PlayerMatchingService';
import PlayerMatchCard from '../../components/PlayerMatching/PlayerMatchCard';
import MatchingFilters from '../../components/PlayerMatching/MatchingFilters';
import { useThemeColor } from '../../hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlayerMatchingScreen = () => {
  const [teamResult, setTeamResult] = useState<TeamMatchingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]); // Seçilen oyuncular
  const [filters, setFilters] = useState<MatchingPreferences>({
    maxDistance: 10,
    skillLevelRange: 1,
    ageRange: [18, 50],
    preferredPositions: [],
    preferredTimes: ['18:00-22:00'],
    onlyActiveUsers: true
  });
  const [showFilters, setShowFilters] = useState(false);

  // Tema renkleri
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    loadTeamMatches();
    loadFilters();
  }, []);

  const loadTeamMatches = async () => {
    try {
      setLoading(true);
      console.log('🔄 Gerçek kullanıcı verileriyle takım eşleştirme başlatılıyor...');
      
      // Cache'i temizle
      await AsyncStorage.removeItem('matchingPreferences');
      await AsyncStorage.removeItem('favoritePlayers');
      console.log('🧹 Cache temizlendi');
      
      const result = await PlayerMatchingService.getTeamMatches();
      setTeamResult(result);
      
      if (result.success) {
        console.log('✅ Gerçek kullanıcı verileriyle eşleştirme tamamlandı:', {
          totalMatches: result.totalMatches,
          teamMembers: result.teamMembers.length,
          userPosition: result.userPosition
        });
        
        // Gelen oyuncuları logla
        result.teamMembers.forEach((match, index) => {
          console.log(`${index + 1}. ${match.player.username} | ${match.player.position} | ${match.player.name}`);
        });
      } else {
        console.log('❌ Eşleştirme başarısız:', result.message);
        Alert.alert('Hata', result.message || 'Takım eşleştirmesi yüklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('❌ Takım eşleştirme yükleme hatası:', error);
      Alert.alert('Hata', 'Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    const savedFilters = await PlayerMatchingService.loadPreferences();
    setFilters(savedFilters);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTeamMatches();
    setRefreshing(false);
  };

  const handleFiltersChange = async (newFilters: MatchingPreferences) => {
    setFilters(newFilters);
    await PlayerMatchingService.savePreferences(newFilters);
    
    // Filtreleri uygula ve yeniden yükle
    await loadTeamMatches();
  };

  const handlePlayerPress = (player: any) => {
    // Oyuncu detay sayfasına yönlendir
    Alert.alert('Oyuncu Detayı', `${player.firstName} ${player.lastName} detayları gösterilecek`);
  };

  const handleMessage = (player: any) => {
    // WhatsApp ile mesaj gönder
    const phoneNumber = player.phone?.replace(/[^0-9]/g, '') || '';
    const message = `Merhaba ${player.firstName}, FutbolX uygulaması üzerinden takım arkadaşı olmak ister misin?`;
    
    if (phoneNumber) {
      Alert.alert(
        'WhatsApp ile Mesaj Gönder',
        `${player.firstName} ile WhatsApp üzerinden iletişime geçmek istiyor musunuz?`,
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Mesaj Gönder', 
            onPress: () => {
              // WhatsApp URL'si oluştur
              const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
              console.log('WhatsApp URL:', whatsappUrl);
              Alert.alert('WhatsApp', 'WhatsApp uygulaması açılacak...');
            }
          }
        ]
      );
    } else {
      Alert.alert('Hata', 'Bu kullanıcının telefon numarası bulunamadı.');
    }
  };

  const handleFavorite = async (player: any) => {
    try {
      await PlayerMatchingService.addToFavorites(player._id);
      Alert.alert('Başarılı', `${player.firstName} favorilere eklendi!`);
    } catch (error) {
      Alert.alert('Hata', 'Favorilere eklenirken bir hata oluştu.');
    }
  };

  const renderMatchCard = ({ item }: { item: PlayerMatch }) => (
    <PlayerMatchCard
      match={item}
      onPress={handlePlayerPress}
      onMessage={handleMessage}
      onFavorite={handleFavorite}
    />
  );

  const renderTeamInfo = () => {
    if (!teamResult || !teamResult.success) return null;

    return (
      <View style={styles.teamInfoContainer}>
        <ThemedText style={styles.teamInfoTitle}>
          🏃‍♂️ Sizin Pozisyonunuz: {teamResult.userPosition}
        </ThemedText>
        <ThemedText style={styles.teamInfoSubtitle}>
          6 kişilik takım için gereken oyuncular:
        </ThemedText>
        
        <View style={styles.requiredPositions}>
          {Object.entries(teamResult.requiredPositions).map(([position, count]) => (
            count > 0 && (
              <View key={`position-${position}`} style={[styles.positionItem, { backgroundColor: getPositionColor(position) }]}>
                <ThemedText style={styles.positionText}>
                  {getPositionIcon(position)} {position}: {count} kişi
                </ThemedText>
              </View>
            )
          ))}
        </View>
        
        <View style={styles.teamStats}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{teamMembers.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Bulunan Oyuncu</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>6</ThemedText>
            <ThemedText style={styles.statLabel}>Toplam Takım</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{Math.round((teamMembers.length / 5) * 100)}%</ThemedText>
            <ThemedText style={styles.statLabel}>Tamamlanma</ThemedText>
          </View>
        </View>
      </View>
    );
  };

  // Pozisyon renkleri
  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      'Kaleci': '#FF6B35',
      'Defans': '#4285F4',
      'Orta Saha': '#34A853',
      'Forvet': '#EA4335'
    };
    return colors[position] || '#757575';
  };

  // Pozisyon ikonları
  const getPositionIcon = (position: string) => {
    const icons: Record<string, string> = {
      'Kaleci': '🥅',
      'Defans': '🛡️',
      'Orta Saha': '🏃‍♂️',
      'Forvet': '⚽'
    };
    return icons[position] || '👤';
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="person.3.fill" size={64} color="#ccc" />
      <ThemedText style={styles.emptyStateTitle}>
        {teamResult?.message || 'Henüz takım arkadaşı bulunamadı'}
      </ThemedText>
      <ThemedText style={styles.emptyStateText}>
        Profilinizi tamamlayın ve daha sonra tekrar deneyin
      </ThemedText>
      <TouchableOpacity
        style={[styles.emptyStateButton, { backgroundColor: tintColor }]}
        onPress={() => Alert.alert('Profil', 'Profil sayfasına yönlendirilecek')}
      >
        <Text style={styles.emptyStateButtonText}>Profili Tamamla</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor }]}>
      <ThemedText style={styles.headerTitle}>⚽ Takım Arkadaşları</ThemedText>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <IconSymbol name="slider.horizontal.3" size={24} color={tintColor} />
          {Object.keys(filters).length > 0 && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>Takım arkadaşları aranıyor...</ThemedText>
      </ThemedView>
    );
  }

  const teamMembers = teamResult?.teamMembers || [];

  // Oyuncu seçme/seçimi kaldırma
  const handlePlayerSelection = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      // Seçimi kaldır
      setSelectedPlayers(prev => prev.filter(id => id !== playerId));
    } else {
      // Seç (maksimum 5 kişi)
      if (selectedPlayers.length < 5) {
        setSelectedPlayers(prev => [...prev, playerId]);
      } else {
        Alert.alert('Limit Aşıldı', 'Maksimum 5 oyuncu seçebilirsiniz.');
      }
    }
  };

  // Seçilen oyuncuları temizle
  const clearSelection = () => {
    setSelectedPlayers([]);
  };

  // Takım oluştur
  const createTeam = () => {
    if (selectedPlayers.length !== 5) {
      Alert.alert('Eksik Seçim', 'Lütfen tam 5 oyuncu seçin.');
      return;
    }
    
    Alert.alert(
      'Takım Oluşturuldu!', 
      `${selectedPlayers.length} oyuncu ile takımınız hazır!`,
      [
        { text: 'Tamam', style: 'default' },
        { text: 'Yeni Takım', onPress: clearSelection, style: 'default' }
      ]
    );
  };

  // Pozisyon grubu render et
  const renderPositionGroup = (position: string, players: PlayerMatch[]) => {
    const positionColor = getPositionColor(position);
    const positionIcon = getPositionIcon(position);
    const requiredCount = teamResult?.requiredPositions[position] || 0;

    return (
      <View key={position} style={[styles.positionGroup, { borderColor: positionColor }]}>
        {/* Pozisyon Başlığı */}
        <View style={[styles.positionHeader, { backgroundColor: positionColor }]}>
          <Text style={styles.positionHeaderIcon}>{positionIcon}</Text>
          <Text style={styles.positionHeaderText}>
            {position} ({players.length} alternatif)
          </Text>
          <Text style={styles.positionRequirement}>
            {requiredCount} gerekli
          </Text>
        </View>

        {/* Oyuncular */}
        <View style={styles.playersContainer}>
          {players.map((match, index) => (
            <TouchableOpacity
              key={match.player._id}
              style={[
                styles.playerCard,
                selectedPlayers.includes(match.player._id) && styles.selectedPlayerCard
              ]}
              onPress={() => handlePlayerSelection(match.player._id)}
            >
              {/* Seçim İndikatörü */}
              {selectedPlayers.includes(match.player._id) && (
                <View style={styles.selectionIndicator}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
                </View>
              )}

              <PlayerMatchCard
                match={match}
                onPress={() => handlePlayerSelection(match.player._id)}
                onMessage={handleMessage}
                onFavorite={handleFavorite}
              />
            </TouchableOpacity>
          ))}

          {/* Boş slot göstergesi */}
          {players.length === 0 && (
            <View style={styles.emptySlot}>
              <IconSymbol name="person.badge.plus" size={32} color="#ccc" />
              <Text style={styles.emptySlotText}>Bu pozisyonda oyuncu bulunamadı</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {renderHeader()}
      {renderTeamInfo()}

      {/* Seçim Durumu */}
      {teamMembers.length > 0 && (
        <View style={styles.selectionStatus}>
          <ThemedText style={styles.selectionText}>
            {selectedPlayers.length}/5 oyuncu seçildi
          </ThemedText>
          {selectedPlayers.length > 0 && (
            <TouchableOpacity onPress={clearSelection} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Temizle</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Pozisyon Grupları */}
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {teamResult?.positionAlternatives && Object.keys(teamResult.positionAlternatives).length > 0 ? (
          Object.entries(teamResult.positionAlternatives).map(([position, players]) =>
            renderPositionGroup(position, players)
          )
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {/* Takım Oluştur Butonu */}
      {selectedPlayers.length === 5 && (
        <TouchableOpacity
          style={[styles.createTeamButton, { backgroundColor: tintColor }]}
          onPress={createTeam}
        >
          <IconSymbol name="person.3.fill" size={20} color="white" />
          <Text style={styles.createTeamButtonText}>Takım Oluştur</Text>
        </TouchableOpacity>
      )}

      {/* Filtre Modal */}
      <MatchingFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    position: 'relative',
    padding: 8,
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  statsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    opacity: 0.7,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  teamInfoContainer: {
    padding: 16,
  },
  teamInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  teamInfoSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  requiredPositions: {
    flexDirection: 'row',
    gap: 8,
  },
  positionItem: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  positionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  positionGroup: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  positionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  positionHeaderIcon: {
    fontSize: 20,
  },
  positionHeaderText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  positionRequirement: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  playersContainer: {
    padding: 8,
  },
  playerCard: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedPlayerCard: {
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  emptySlot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 8,
  },
  emptySlotText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  selectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  selectionText: {
    fontSize: 14,
    opacity: 0.7,
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  createTeamButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  createTeamButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PlayerMatchingScreen; 