import React, { useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Halı saha maç verileri
const matchesData = [
  {
    id: '1',
    fieldName: 'Yıldız Halı Saha',
    location: 'Kadıköy, İstanbul',
    date: '25 Mart 2025',
    time: '19:30 - 21:00',
    price: 400,
    organizer: 'Ahmet Y.',
    organizerAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    playersJoined: 8,
    totalPlayers: 14,
    level: 'Orta',
    image: 'https://source.unsplash.com/random/300x200/?soccer,field&sig=1',
    isPrivate: false,
  },
  {
    id: '2',
    fieldName: 'Gol Park',
    location: 'Ataşehir, İstanbul',
    date: '27 Mart 2025',
    time: '20:00 - 22:00',
    price: 350,
    organizer: 'Mehmet K.',
    organizerAvatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    playersJoined: 10,
    totalPlayers: 12,
    level: 'Amatör',
    image: 'https://source.unsplash.com/random/300x200/?soccer,field&sig=2',
    isPrivate: false,
  },
  {
    id: '3',
    fieldName: 'Futbol Arena',
    location: 'Üsküdar, İstanbul',
    date: '28 Mart 2025',
    time: '18:00 - 19:30',
    price: 450,
    organizer: 'Can D.',
    organizerAvatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    playersJoined: 7,
    totalPlayers: 14,
    level: 'İleri',
    image: 'https://source.unsplash.com/random/300x200/?soccer,field&sig=3',
    isPrivate: true,
  },
  {
    id: '4',
    fieldName: 'GreenPitch',
    location: 'Beşiktaş, İstanbul',
    date: '29 Mart 2025',
    time: '21:00 - 22:30',
    price: 480,
    organizer: 'Burak Y.',
    organizerAvatar: 'https://randomuser.me/api/portraits/men/86.jpg',
    playersJoined: 9,
    totalPlayers: 10,
    level: 'İleri',
    image: 'https://source.unsplash.com/random/300x200/?soccer,field&sig=4',
    isPrivate: false,
  },
  {
    id: '5',
    fieldName: 'Sahasever',
    location: 'Beylikdüzü, İstanbul',
    date: '30 Mart 2025',
    time: '17:30 - 19:00',
    price: 380,
    organizer: 'Ali V.',
    organizerAvatar: 'https://randomuser.me/api/portraits/men/62.jpg',
    playersJoined: 6,
    totalPlayers: 12,
    level: 'Orta',
    image: 'https://source.unsplash.com/random/300x200/?soccer,field&sig=5',
    isPrivate: false,
  }
];

export default function MatchesScreen() {
  const [filter, setFilter] = useState('hepsi');
  const [searchQuery, setSearchQuery] = useState('');
  
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  
  // Filtreleme fonksiyonu
  const filteredMatches = matchesData.filter(match => {
    const matchesSearch = match.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        match.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'hepsi') return matchesSearch;
    if (filter === 'açık' && !match.isPrivate) return matchesSearch;
    if (filter === 'özel' && match.isPrivate) return matchesSearch;
    return false;
  });
  
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
  
  const renderMatchCard = ({ item }: { item: any }) => {
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
              <Image source={{ uri: item.organizerAvatar }} style={styles.organizerAvatar} />
              <View>
                <ThemedText style={styles.organizerLabel}>Organizatör</ThemedText>
                <ThemedText style={styles.organizerName}>{item.organizer}</ThemedText>
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
      
      <FlatList
        data={filteredMatches}
        renderItem={renderMatchCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
    fontSize: 14,
    marginLeft: 8,
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
    marginRight: 10,
  },
  organizerLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  organizerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  playersInfo: {
    alignItems: 'flex-end',
  },
  playersProgress: {
    width: 80,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  playersText: {
    fontSize: 12,
  },
  joinButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
