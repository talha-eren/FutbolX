import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity, TextInput, FlatList, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Link } from 'expo-router';

// Halı saha veri yapısı
interface Field {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  availability: string;
}

// Post veri yapısı
interface Post {
  id: string;
  username: string;
  userAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  tags?: string[];
  location?: string;
}

// Örnek halı saha verileri
const fieldData: Field[] = [
  {
    id: '1',
    name: 'Yıldız Halı Saha',
    location: 'Kadıköy, İstanbul',
    price: 400,
    rating: 4.5,
    image: 'https://source.unsplash.com/random/300x200/?soccer,field&sig=1',
    availability: 'Müsait'
  },
  {
    id: '2',
    name: 'Gol Park',
    location: 'Ataşehir, İstanbul',
    price: 350,
    rating: 4.0,
    image: 'https://source.unsplash.com/random/300x200/?soccer,field&sig=2',
    availability: 'Dolu'
  },
  {
    id: '3',
    name: 'Futbol Arena',
    location: 'Üsküdar, İstanbul',
    price: 450,
    rating: 4.7,
    image: 'https://source.unsplash.com/random/300x200/?soccer,field&sig=3',
    availability: 'Müsait'
  },
];

// Örnek post verileri
const postData: Post[] = [
  {
    id: '1',
    username: 'ahmet',
    userAvatar: 'https://randomuser.me/api/portraits/men/72.jpg',
    content: 'Harika bir gol attım! #gol #futbol #halisaha',
    image: 'https://source.unsplash.com/random/400x300/?soccer,goal&sig=1',
    likes: 156,
    comments: 12,
    timestamp: '2 saat önce',
    location: 'Yıldız Halı Saha'
  },
  {
    id: '2',
    username: 'mehmet',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    content: 'Bugün harika bir maç oldu, 3-2 kazandık! #maç #galibiyet',
    image: 'https://source.unsplash.com/random/400x300/?soccer,match&sig=2',
    likes: 89,
    comments: 5,
    timestamp: '3 saat önce',
    location: 'Gol Park'
  }
];

export default function IndexScreen() {
  const [activeTab, setActiveTab] = useState('kesfet');
  const [searchText, setSearchText] = useState('');
  
  const primaryColor = '#4CAF50';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  // Başlık bileşeni
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <ThemedText style={styles.logoText}>FutbolX</ThemedText>
      </View>
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={16} color="#999" />
        <TextInput 
          style={styles.searchInput}
          placeholder="Ara..."
          placeholderTextColor="#999"
        />
      </View>
      <TouchableOpacity style={styles.reservationButton}>
        <ThemedText style={styles.reservationText}>Rezervasyon</ThemedText>
      </TouchableOpacity>
    </View>
  );

  // Tab bileşeni
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'kesfet' && styles.activeTab]}
        onPress={() => setActiveTab('kesfet')}
      >
        <IconSymbol 
          name="sparkles" 
          size={20} 
          color={activeTab === 'kesfet' ? primaryColor : '#777'} 
        />
        <ThemedText style={[
          styles.tabText, 
          activeTab === 'kesfet' && styles.activeTabText
        ]}>
          Keşfet
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'halisaha' && styles.activeTab]}
        onPress={() => setActiveTab('halisaha')}
      >
        <IconSymbol 
          name="sportscourt" 
          size={20} 
          color={activeTab === 'halisaha' ? primaryColor : '#777'} 
        />
        <ThemedText style={[
          styles.tabText, 
          activeTab === 'halisaha' && styles.activeTabText
        ]}>
          Halı Sahalar
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'etkinlikler' && styles.activeTab]}
        onPress={() => setActiveTab('etkinlikler')}
      >
        <IconSymbol 
          name="calendar" 
          size={20} 
          color={activeTab === 'etkinlikler' ? primaryColor : '#777'} 
        />
        <ThemedText style={[
          styles.tabText, 
          activeTab === 'etkinlikler' && styles.activeTabText
        ]}>
          Etkinlikler
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  // Halı saha kartı
  const renderFieldCard = (field: Field) => (
    <TouchableOpacity key={field.id} style={styles.fieldCard}>
      <Image 
        source={{ uri: field.image }}
        style={styles.fieldImage}
        resizeMode="cover"
      />
      <View style={styles.fieldInfo}>
        <ThemedText style={styles.fieldName}>{field.name}</ThemedText>
        <View style={styles.fieldLocation}>
          <IconSymbol name="location" size={14} color="#777" />
          <ThemedText style={styles.fieldLocationText}>{field.location}</ThemedText>
        </View>
      </View>
      <View style={styles.fieldFooter}>
        <ThemedText style={styles.fieldPrice}>{field.price}₺</ThemedText>
        <View style={[
          styles.fieldAvailability,
          { backgroundColor: field.availability === 'Müsait' ? '#E8F5E9' : '#FFEBEE' }
        ]}>
          <ThemedText style={[
            styles.fieldAvailabilityText,
            { color: field.availability === 'Müsait' ? '#2E7D32' : '#C62828' }
          ]}>
            {field.availability}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Post kartı
  const renderPostCard = (post: Post) => (
    <View key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postUserInfo}>
          <View style={styles.postAvatar}>
            <ThemedText style={styles.postAvatarText}>{post.username.charAt(0).toUpperCase()}</ThemedText>
          </View>
          <View>
            <ThemedText style={styles.postUsername}>{post.username}</ThemedText>
            {post.location && (
              <View style={styles.postLocation}>
                <IconSymbol name="mappin" size={12} color="#777" />
                <ThemedText style={styles.postLocationText}>{post.location}</ThemedText>
              </View>
            )}
          </View>
        </View>
        <ThemedText style={styles.postTimestamp}>{post.timestamp}</ThemedText>
      </View>
      
      <ThemedText style={styles.postContent}>{post.content}</ThemedText>
      
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      )}
      
      <View style={styles.postActions}>
        <View style={styles.postAction}>
          <IconSymbol name="heart" size={20} color="#777" />
          <ThemedText style={styles.postActionText}>{post.likes}</ThemedText>
        </View>
        
        <View style={styles.postAction}>
          <IconSymbol name="bubble.right" size={20} color="#777" />
          <ThemedText style={styles.postActionText}>{post.comments}</ThemedText>
        </View>
        
        <View style={styles.postAction}>
          <IconSymbol name="square.and.arrow.up" size={20} color="#777" />
        </View>
      </View>
    </View>
  );

  // Keşfet içeriği
  const renderDiscoverContent = () => (
    <View style={styles.discoverContent}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Popüler Halı Sahalar</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.seeAllText}>Tümünü Gör</ThemedText>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={fieldData}
        renderItem={({item}) => renderFieldCard(item)}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.fieldList}
        ItemSeparatorComponent={() => <View style={{width: 16}} />}
      />
      
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Son Paylaşımlar</ThemedText>
      </View>
      
      {postData.map(post => renderPostCard(post))}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
      >
        {activeTab === 'kesfet' && renderDiscoverContent()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    height: 30,
  },
  reservationButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reservationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    marginLeft: 4,
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  discoverContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  fieldCard: {
    width: 250,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fieldImage: {
    width: '100%',
    height: 150,
  },
  fieldInfo: {
    padding: 12,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  fieldLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldLocationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  fieldFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  fieldPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  fieldAvailability: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fieldAvailabilityText: {
    fontSize: 12,
  },
  fieldList: {
    paddingVertical: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  postUsername: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  postLocationText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 4,
  },
  postTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionText: {
    fontSize: 14,
    marginLeft: 6,
    color: '#777',
  },
});
