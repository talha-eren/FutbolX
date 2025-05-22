import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/services/networkConfig';
import { LinearGradient } from 'expo-linear-gradient';

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
  teams?: {
    home: {
      name: string;
      avatar: string;
      score: number;
    },
    away: {
      name: string;
      avatar: string;
      score: number;
    }
  };
  status?: 'upcoming' | 'live' | 'completed';
}

export default function MatchesScreen() {
  const [activeTab, setActiveTab] = useState('son');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBgColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  
  const router = useRouter();
  const { token } = useAuth();
  
  // Verileri API'den çek
  useEffect(() => {
    fetchMatches();
  }, [activeTab]);

  // Maçları API'den çekme fonksiyonu
  const fetchMatches = async () => {
    setLoading(true);
    try {
      // Gerçek veriler için API çağrısı yapılacak
      // Şu an için örnek veri kullanıyoruz
      setTimeout(() => {
        const mockMatches: Match[] = [
          {
            id: '1',
            fieldName: 'Sporium 23',
            location: 'Elazığ',
            date: '01.12.2023',
            time: '19:00',
            price: 50,
            organizer: {
              _id: 'user1',
              username: 'TalhaEren',
              profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            playersJoined: 8,
            totalPlayers: 10,
            level: 'Orta',
            image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
            isPrivate: false,
            teams: {
              home: {
                name: 'Yıldızlar',
                avatar: 'Y',
                score: 1
              },
              away: {
                name: 'Aslanlar',
                avatar: 'A',
                score: 0
              }
            },
            status: 'completed'
          },
          {
            id: '2',
            fieldName: 'Sporium 23',
            location: 'Elazığ',
            date: '02.12.2023',
            time: '20:00',
            price: 60,
            organizer: {
              _id: 'user2',
              username: 'Şirinler',
              profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg'
            },
            playersJoined: 10,
            totalPlayers: 10,
            level: 'Amatör',
            image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
            isPrivate: true,
            teams: {
              home: {
                name: 'Şimşekler',
                avatar: 'Ş',
                score: 0
              },
              away: {
                name: 'Aslanlar',
                avatar: 'A',
                score: 3
              }
            },
            status: 'completed'
          },
          {
            id: '3',
            fieldName: 'Sporium 23',
            location: 'Elazığ',
            date: '03.12.2023',
            time: '21:00',
            price: 55,
            organizer: {
              _id: 'user3',
              username: 'Kartallar',
              profilePicture: 'https://randomuser.me/api/portraits/men/22.jpg'
            },
            playersJoined: 6,
            totalPlayers: 12,
            level: 'İleri',
            image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
            isPrivate: false,
            teams: {
              home: {
                name: 'Kartallar',
                avatar: 'K',
                score: 2
              },
              away: {
                name: 'Yıldızlar',
                avatar: 'Y',
                score: 0
              }
            },
            status: 'completed'
          },
          {
            id: '4',
            fieldName: 'Sporium 23',
            location: 'Elazığ',
            date: '05.12.2023',
            time: '18:00',
            price: 65,
            organizer: {
              _id: 'user4',
              username: 'Sivri',
              profilePicture: 'https://randomuser.me/api/portraits/men/42.jpg'
            },
            playersJoined: 12,
            totalPlayers: 12,
            level: 'Orta',
            image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
            isPrivate: false,
            teams: {
              home: {
                name: 'Sivri',
                avatar: 'S',
                score: 1
              },
              away: {
                name: 'Alternatif',
                avatar: 'Alt',
                score: 4
              }
            },
            status: 'completed'
          },
          {
            id: '5',
            fieldName: 'Sporium 23',
            location: 'Elazığ',
            date: '07.12.2023',
            time: '20:00',
            price: 55,
            organizer: {
              _id: 'user5',
              username: 'Kartallar',
              profilePicture: 'https://randomuser.me/api/portraits/men/30.jpg'
            },
            playersJoined: 7,
            totalPlayers: 12,
            level: 'Amatör',
            image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
            isPrivate: false,
            teams: {
              home: {
                name: 'Kartallar',
                avatar: 'K',
                score: 0
              },
              away: {
                name: 'Aslanlar',
                avatar: 'A',
                score: 1
              }
            },
            status: 'completed'
          },
          {
            id: '6',
            fieldName: 'Sporium 23',
            location: 'Elazığ',
            date: '11.12.2023',
            time: '19:00',
            price: 60,
            organizer: {
              _id: 'user6',
              username: 'Şimsekler',
              profilePicture: 'https://randomuser.me/api/portraits/men/50.jpg'
            },
            playersJoined: 9,
            totalPlayers: 10,
            level: 'İleri',
            image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
            isPrivate: false,
            teams: {
              home: {
                name: 'Şimşekler',
                avatar: 'Ş',
                score: 1
              },
              away: {
                name: 'Kartallar',
                avatar: 'K',
                score: 4
              }
            },
            status: 'completed'
          }
        ];
        setMatches(mockMatches);
        setLoading(false);
      }, 1000);
      
    } catch (err: any) {
      console.error('Maçları getirme hatası:', err);
      setError('Maçlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
      setLoading(false);
    }
  };
  
  // Tab butonlarını render et
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'son' && styles.activeTabButton]}
        onPress={() => setActiveTab('son')}
      >
        <IconSymbol 
          name="clock.arrow.circlepath" 
          size={16} 
          color={activeTab === 'son' ? 'white' : textColor} 
        />
        <ThemedText style={[
          styles.tabButtonText, 
          activeTab === 'son' && styles.activeTabButtonText
        ]}>
          Son Oynanan Maçlar
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'yaklaşan' && styles.activeTabButton]}
        onPress={() => setActiveTab('yaklaşan')}
      >
        <IconSymbol 
          name="calendar" 
          size={16} 
          color={activeTab === 'yaklaşan' ? 'white' : textColor} 
        />
        <ThemedText style={[
          styles.tabButtonText, 
          activeTab === 'yaklaşan' && styles.activeTabButtonText
        ]}>
          Yaklaşan Maçlar
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
  
  // Maç kartını render et
  const renderMatchItem = ({ item }: { item: Match }) => {
    if (!item.teams) return null;
    
    return (
      <View style={[styles.matchCard, { backgroundColor: cardBgColor, borderColor }]}>
        <View style={styles.matchHeader}>
          <ThemedText style={styles.matchDate}>{item.date}</ThemedText>
          <ThemedText style={styles.matchTime}>{item.time}</ThemedText>
        </View>
        
        <View style={styles.matchContent}>
          <View style={styles.teamContainer}>
            <View style={styles.teamAvatar}>
              <ThemedText style={styles.teamAvatarText}>{item.teams.home.avatar}</ThemedText>
            </View>
            <ThemedText style={styles.teamName}>{item.teams.home.name}</ThemedText>
          </View>
          
          <View style={styles.scoreContainer}>
            <ThemedText style={styles.scoreText}>{item.teams.home.score}</ThemedText>
            <ThemedText style={styles.scoreSeparator}>-</ThemedText>
            <ThemedText style={styles.scoreText}>{item.teams.away.score}</ThemedText>
          </View>
          
          <View style={styles.teamContainer}>
            <View style={[styles.teamAvatar, styles.awayTeamAvatar]}>
              <ThemedText style={styles.teamAvatarText}>{item.teams.away.avatar}</ThemedText>
          </View>
            <ThemedText style={styles.teamName}>{item.teams.away.name}</ThemedText>
              </View>
            </View>
            
        <View style={styles.matchFooter}>
          <View style={styles.fieldInfo}>
            <IconSymbol name="mappin" size={14} color={primaryColor} />
            <ThemedText style={styles.fieldText}>{item.fieldName}</ThemedText>
          </View>
          
          <TouchableOpacity style={styles.detailsButton}>
            <ThemedText style={styles.detailsButtonText}>Detaylar</ThemedText>
            <IconSymbol name="chevron.right" size={14} color={primaryColor} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>Sporium 23</ThemedText>
          <ThemedText style={styles.subtitle}>Son Oynanan Maçlar</ThemedText>
        </View>
        
        <TouchableOpacity
          style={[styles.createMatchButton, { backgroundColor: primaryColor }]}
          onPress={() => router.push('/reservations?fieldId=sporium23')}
        >
          <IconSymbol name="plus" size={18} color="#FFFFFF" />
          <ThemedText style={styles.createMatchButtonText}>Yeni Maç</ThemedText>
        </TouchableOpacity>
      </View>
      
      {renderTabs()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Maçlar yükleniyor...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={40} color="#F44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: primaryColor }]}
            onPress={fetchMatches}
          >
            <ThemedText style={styles.retryButtonText}>Tekrar Dene</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
      <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.matchList}
        showsVerticalScrollIndicator={false}
      />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  createMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  createMatchButtonText: {
    marginLeft: 6,
    fontWeight: '600',
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeTabButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  tabButtonText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 16,
    opacity: 0.7,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  matchList: {
    paddingBottom: 16,
  },
  matchCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  matchDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  matchTime: {
    fontSize: 14,
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  teamContainer: {
    alignItems: 'center',
    width: '35%',
  },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  awayTeamAvatar: {
    backgroundColor: '#2196F3',
  },
  teamAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  teamName: {
    textAlign: 'center',
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 8,
    opacity: 0.6,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  fieldInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldText: {
    marginLeft: 6,
    fontSize: 14,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButtonText: {
    marginRight: 4,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  }
});
