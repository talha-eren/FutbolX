import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/services/api';
// Halı saha maç veri tipi tanımı
interface Match {
  id: string;
  fieldName: string;
  location: string;
  date: string;
  time: string;
  price: number;
  organizer: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  playersJoined: number;
  totalPlayers: number;
  level: string;
  image: string;
  isPrivate: boolean;
}

export default function FindMatchScreen() {
  const [filter, setFilter] = useState('hepsi');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  
  const router = useRouter();
  const { token } = useAuth();
  
  // Verileri API'den çek
  useEffect(() => {
    fetchMatches();
  }, []);

  // Maçları API'den çekme fonksiyonu
  const fetchMatches = async () => {
    // API'den maçları çek
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/matches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Maçlar yüklenirken bir hata oluştu');
      }
      
      // API yanıtını güvenli bir şekilde Match[] tipine dönüştür
      const responseData = await response.json();
      if (Array.isArray(responseData)) {
        setMatches(responseData as Match[]);
      } else {
        console.warn('API yanıtı dizi değil:', responseData);
        setMatches([]);
      }
    } catch (err: any) {
      console.error('Maçları getirme hatası:', err);
      setError('Maçlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filtreleme fonksiyonu
  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        match.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'hepsi') return matchesSearch;
    if (filter === 'açık' && !match.isPrivate) return matchesSearch;
    if (filter === 'özel' && match.isPrivate) return matchesSearch;
    return false;
  });
  
  // Maç oluşturma ekranına yönlendir
  const navigateToCreateMatch = () => {
    router.push('/(tabs)/create-match' as any);
  };
  
  // Seviye gösterimi için fonksiyon
  const renderLevel = (level: string) => {
    const colors: Record<string, string> = {
      'Amatör': '#4CAF50',
      'Orta': '#FFC107',
      'İleri': '#F44336'
    };
    
    return (
      <View style={[styles.levelTag, { backgroundColor: colors[level] }]}>
        <ThemedText style={styles.levelText}>{level}</ThemedText>
      </View>
    );
  };
  
  const renderMatchCard = ({ item }: { item: Match }) => {
    return (
      <View style={[styles.card, { borderColor: '#E0E0E0' }]}>
        <View style={styles.cardHeader}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.fieldImage} />
            {item.isPrivate && (
              <View style={styles.privateTag}>
                <IconSymbol name="lock.fill" size={12} color="#FFFFFF" />
                <ThemedText style={styles.privateText}>Özel</ThemedText>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.cardTitle}>
            <ThemedText style={styles.fieldName}>{item.fieldName}</ThemedText>
            {renderLevel(item.level)}
          </View>
          
          <View style={styles.infoRow}>
            <IconSymbol name="mappin.and.ellipse" size={14} color={textColor} />
            <ThemedText style={styles.infoText}>{item.location}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <IconSymbol name="calendar" size={14} color={textColor} />
            <ThemedText style={styles.infoText}>{item.date} • {item.time}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <IconSymbol name="turkishlirasign.circle" size={14} color={textColor} />
            <ThemedText style={styles.infoText}>{item.price} TL / Kişi</ThemedText>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.organizerRow}>
            <View style={styles.organizerInfo}>
              <Image 
                source={{ 
                  uri: item.organizer?.profilePicture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                }} 
                style={styles.organizerAvatar} 
              />
              <View>
                <ThemedText style={styles.organizerLabel}>Organizatör</ThemedText>
                <ThemedText style={styles.organizerName}>{item.organizer?.username || 'Anonim'}</ThemedText>
              </View>
            </View>
            
            <View style={styles.playersInfo}>
              <View style={styles.playersProgress}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(item.playersJoined / item.totalPlayers) * 100}%`,
                      backgroundColor: tintColor 
                    }
                  ]} 
                />
              </View>
              <ThemedText style={styles.playersText}>
                {item.playersJoined}/{item.totalPlayers} Oyuncu
              </ThemedText>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.joinButton, { backgroundColor: tintColor }]}
            onPress={() => handleJoinMatch(item.id)}
            disabled={item.playersJoined >= item.totalPlayers}
          >
            <ThemedText style={styles.joinButtonText}>
              {item.playersJoined >= item.totalPlayers ? 'Doldu' : 'Katıl'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Maça katılma işlemi
  const handleJoinMatch = async (matchId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/matches/${matchId}/join`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || 'Maça katılırken bir hata oluştu');
      }
      
      // Maçları yeniden yükle
      fetchMatches();
      
    } catch (err: any) {
      console.error('Maça katılma hatası:', err);
      setError(err.message || 'Maça katılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Yaklaşan Maçlar</ThemedText>
        
        {/* Yeni Maç Oluştur Butonu */}
        <TouchableOpacity
          style={[styles.createMatchButton, { backgroundColor: tintColor }]}
          onPress={navigateToCreateMatch}
        >
          <IconSymbol name="plus" size={18} color="#FFFFFF" />
          <ThemedText style={styles.createMatchButtonText}>Yeni Maç</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Saha veya konum ara..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filter === 'hepsi' && { backgroundColor: tintColor }
            ]}
            onPress={() => setFilter('hepsi')}
          >
            <ThemedText 
              style={[
                styles.filterText, 
                filter === 'hepsi' && { color: '#FFFFFF' }
              ]}
            >
              Hepsi
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filter === 'açık' && { backgroundColor: tintColor }
            ]}
            onPress={() => setFilter('açık')}
          >
            <ThemedText 
              style={[
                styles.filterText, 
                filter === 'açık' && { color: '#FFFFFF' }
              ]}
            >
              Açık Maçlar
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filter === 'özel' && { backgroundColor: tintColor }
            ]}
            onPress={() => setFilter('özel')}
          >
            <ThemedText 
              style={[
                styles.filterText, 
                filter === 'özel' && { color: '#FFFFFF' }
              ]}
            >
              Özel Maçlar
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {loading && matches.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Maçlar yükleniyor...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={40} color="#F44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { borderColor: tintColor }]}
            onPress={fetchMatches}
          >
            <IconSymbol name="arrow.clockwise" size={20} color={tintColor} />
            <ThemedText style={[styles.retryText, { color: tintColor }]}>Yeniden Dene</ThemedText>
          </TouchableOpacity>
        </View>
      ) : filteredMatches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="calendar.badge.exclamationmark" size={40} color="#9E9E9E" />
          <ThemedText style={styles.emptyText}>Uygun maç bulunamadı</ThemedText>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: tintColor }]}
            onPress={navigateToCreateMatch}
          >
            <IconSymbol name="plus" size={18} color="#FFFFFF" />
            <ThemedText style={styles.createButtonText}>Yeni Maç Oluştur</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          renderItem={renderMatchCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchMatches}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createMatchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 16,
    paddingLeft: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
  },
  filterText: {
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
  },
  fieldImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  privateTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  privateText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  organizerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  organizerLabel: {
    fontSize: 12,
    color: '#999',
  },
  organizerName: {
    fontWeight: '600',
  },
  playersInfo: {
    alignItems: 'flex-end',
  },
  playersProgress: {
    width: 100,
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  playersText: {
    fontSize: 12,
    fontWeight: '500',
  },
  joinButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#F44336',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#9E9E9E',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 