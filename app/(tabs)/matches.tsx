import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/services/networkConfig';

// Halı saha maç veri tipi tanımı
interface Match {
  id: string;
  _id?: string; // MongoDB kullanıldığında oluşan kimlik
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

export default function MatchesScreen() {
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
      const apiUrl = await getApiUrl('/matches');
      console.log('Maç listesi isteği URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Maçlar yüklenirken bir hata oluştu');
      }
      
      const data = await response.json() as Match[];
      setMatches(data);
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
    router.push('/(tabs)/create-match');
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
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.messageText}>Maçlar yükleniyor...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <IconSymbol name="exclamationmark.triangle" size={40} color="#FF6B6B" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: tintColor }]}
            onPress={fetchMatches}
          >
            <ThemedText style={styles.retryButtonText}>Tekrar Dene</ThemedText>
          </TouchableOpacity>
        </View>
      ) : filteredMatches.length === 0 ? (
        <View style={styles.centerContainer}>
          <IconSymbol name="calendar.badge.exclamationmark" size={50} color="#9E9E9E" />
          <ThemedText style={styles.messageText}>
            {searchQuery ? 'Aramanızla eşleşen maç bulunamadı.' : 'Henüz maç bulunmuyor.'}
          </ThemedText>
          <TouchableOpacity 
            style={[styles.createButton, { backgroundColor: tintColor }]}
            onPress={navigateToCreateMatch}
          >
            <ThemedText style={styles.createButtonText}>Yeni Maç Oluştur</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
      <FlatList
        data={filteredMatches}
        renderItem={renderMatchCard}
        keyExtractor={item => item._id || item.id || `match-${Math.random()}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
    marginBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  createMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  createMatchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: 150,
  },
  fieldImage: {
    width: '100%',
    height: '100%',
  },
  privateTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  privateText: {
    color: '#FFFFFF',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  organizerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    opacity: 0.6,
  },
  organizerName: {
    fontWeight: '500',
  },
  playersInfo: {
    alignItems: 'flex-end',
  },
  playersProgress: {
    width: 100,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  playersText: {
    fontSize: 12,
  },
  joinButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    color: '#9E9E9E',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    color: '#FF6B6B',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
