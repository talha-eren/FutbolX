import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity, TextInput, FlatList, Platform, Pressable, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Link, useRouter } from 'expo-router';
import { FutbolXLogo } from '@/components/FutbolXLogo';
import { Video } from 'expo-av';
import * as Linking from 'expo-linking';
import { useAuth } from '@/context/AuthContext';

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
  video?: string;
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
    image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=1470&auto=format&fit=crop',
    availability: 'Müsait'
  },
  {
    id: '2',
    name: 'Gol Park',
    location: 'Ataşehir, İstanbul',
    price: 350,
    rating: 4.0,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1476&auto=format&fit=crop',
    availability: 'Müsait'
  },
  {
    id: '3',
    name: 'Futbol Arena',
    location: 'Beşiktaş, İstanbul',
    price: 450,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1518555857392-e7572af3e0e8?q=80&w=1471&auto=format&fit=crop',
    availability: 'Dolu'
  },
  {
    id: '4',
    name: 'Green Field',
    location: 'Şişli, İstanbul',
    price: 380,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop',
    availability: 'Müsait'
  }
];

// Post verileri
const postData: Post[] = [
  {
    id: '1',
    username: 'ahmet',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    content: 'Harika bir gol attım! #futbol #halisaha',
    image: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1374&auto=format&fit=crop',
    video: 'https://static.videezy.com/system/resources/previews/000/044/479/original/P1030764.mp4',
    likes: 24,
    comments: 5,
    timestamp: '2 saat önce',
    tags: ['futbol', 'halisaha'],
    location: 'Yıldız Halı Saha'
  },
  {
    id: '2',
    username: 'mehmet',
    userAvatar: 'https://randomuser.me/api/portraits/men/56.jpg',
    content: 'Bu akşam maç var, katılmak isteyen? #futbol #dostlukmaçı',
    likes: 18,
    comments: 8,
    timestamp: '5 saat önce',
    tags: ['futbol', 'dostlukmaçı'],
    location: 'Gol Park'
  }
];

export default function IndexScreen() {
  const [activeTab, setActiveTab] = useState('kesfet');
  const [searchText, setSearchText] = useState('');
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  
  const primaryColor = '#4CAF50';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Misafir kullanıcıları login'e yönlendirme
  const handleRestrictedAction = () => {
    Alert.alert(
      "Giriş Gerekli",
      "Bu özelliği kullanmak için giriş yapmanız gerekmektedir.",
      [
        { text: "İptal", style: "cancel" },
        { text: "Giriş Yap", onPress: () => router.push("/login" as any) }
      ]
    );
  };
  
  // Başlık bileşeni
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <ThemedText style={styles.logoText}>FutbolX</ThemedText>
      </View>
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={16} color="#999" />
        <TextInput 
          style={styles.searchInput}
          placeholder="Ara..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <TouchableOpacity 
        style={styles.reservationButton}
        onPress={isLoggedIn ? () => router.push("/reservation" as any) : handleRestrictedAction}
        activeOpacity={0.7}
      >
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
        activeOpacity={0.7}
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
        onPress={isLoggedIn ? () => setActiveTab('halisaha') : handleRestrictedAction}
        activeOpacity={0.7}
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
        onPress={isLoggedIn ? () => setActiveTab('etkinlikler') : handleRestrictedAction}
        activeOpacity={0.7}
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

  // Popüler Halı Sahalar bölümü
  const renderPopularFields = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Popüler Halı Sahalar</ThemedText>
        <TouchableOpacity 
          onPress={isLoggedIn ? () => router.push("/fields" as any) : handleRestrictedAction}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.seeAllText}>Tümünü Gör</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.fieldsContainer}>
        {fieldData.slice(0, 2).map((field, index) => (
          <Pressable 
            key={field.id} 
            style={[
              styles.fieldCard,
              { marginRight: index === 0 ? 10 : 0 },
              hoveredField === field.id && styles.fieldCardHovered
            ]}
            onHoverIn={() => setHoveredField(field.id)}
            onHoverOut={() => setHoveredField(null)}
            onPress={isLoggedIn ? () => router.push(`/field/${field.id}` as any) : handleRestrictedAction}
          >
            <Image 
              source={{ uri: field.image }} 
              style={styles.fieldImage} 
              resizeMode="cover"
            />
            <View style={styles.fieldInfo}>
              <View style={styles.fieldNameContainer}>
                <IconSymbol name="list.bullet" size={18} color={textColor} />
                <ThemedText style={styles.fieldName}>{field.name}</ThemedText>
              </View>
              <View style={styles.fieldLocationContainer}>
                <IconSymbol name="mappin" size={16} color="#777" />
                <ThemedText style={styles.fieldLocation}>{field.location}</ThemedText>
              </View>
              <View style={styles.fieldPriceContainer}>
                <ThemedText style={styles.fieldPrice}>{field.price}₺</ThemedText>
                <TouchableOpacity 
                  style={[
                    styles.miniButton, 
                    { backgroundColor: field.availability === 'Müsait' ? '#E8F5E9' : '#FFEBEE' }
                  ]}
                  activeOpacity={0.7}
                >
                  <ThemedText 
                    style={[
                      styles.miniButtonText,
                      { color: field.availability === 'Müsait' ? '#4CAF50' : '#F44336' }
                    ]}
                  >
                    {field.availability}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );

  // Son Paylaşımlar bölümü
  const renderRecentPosts = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>Son Paylaşımlar</ThemedText>
      
      {postData.slice(0, 1).map(post => (
        <Pressable 
          key={post.id} 
          style={[
            styles.postCard,
            hoveredPost === post.id && styles.postCardHovered
          ]}
          onHoverIn={() => setHoveredPost(post.id)}
          onHoverOut={() => setHoveredPost(null)}
          onPress={isLoggedIn ? () => router.push(`/post/${post.id}` as any) : handleRestrictedAction}
        >
          <View style={styles.postHeader}>
            {post.userAvatar ? (
              <Image 
                source={{ uri: post.userAvatar }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarContainer}>
                <ThemedText style={styles.avatarText}>
                  {post.username.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
            <View style={styles.postUserInfo}>
              <ThemedText style={styles.postUsername}>{post.username}</ThemedText>
              <View style={styles.postLocationContainer}>
                <IconSymbol name="mappin" size={12} color="#777" />
                <ThemedText style={styles.postLocation}>{post.location}</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.postTime}>{post.timestamp}</ThemedText>
          </View>
          
          <ThemedText style={styles.postContent}>{post.content}</ThemedText>
          
          {post.image && (
            <Image 
              source={{ uri: post.image }}
              style={styles.postImage}
              resizeMode="cover"
            />
          )}
          
          {post.video && (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: post.video }}
                useNativeControls
                resizeMode={Platform.OS === 'web' ? ('contain' as any) : 'contain'}
                style={styles.video}
                posterSource={{ uri: post.image }}
                posterStyle={styles.videoPoster}
                isLooping={false}
              />
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => Alert.alert("Video", "Video oynatılıyor...")}
              >
                <IconSymbol name="play.fill" size={30} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Post interaction buttons */}
          <View style={styles.postActions}>
            <TouchableOpacity 
              style={styles.postAction}
              activeOpacity={0.7}
            >
              <IconSymbol name="heart" size={16} color="#777" />
              <ThemedText style={styles.postActionText}>{post.likes}</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.postAction}
              activeOpacity={0.7}
            >
              <IconSymbol name="bubble.right" size={16} color="#777" />
              <ThemedText style={styles.postActionText}>{post.comments}</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.postAction}
              activeOpacity={0.7}
              onPress={() => {
                if (isLoggedIn) {
                  Linking.openURL(`https://wa.me/?text=FutbolX postunu gör: ${post.content}`);
                } else {
                  handleRestrictedAction();
                }
              }}
            >
              <IconSymbol name="square.and.arrow.up" size={16} color="#777" />
            </TouchableOpacity>
          </View>
        </Pressable>
      ))}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderPopularFields()}
        {renderRecentPosts()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  titleContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  reservationButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reservationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    marginLeft: 5,
    color: '#777',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  fieldsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
      }
    })
  },
  fieldCardHovered: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ translateY: -3 }],
  },
  fieldImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  fieldInfo: {
    padding: 10,
  },
  fieldNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  fieldLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLocation: {
    fontSize: 12,
    color: '#777',
    marginLeft: 5,
  },
  fieldPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  miniButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  miniButtonText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
      }
    })
  },
  postCardHovered: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postUserInfo: {
    marginLeft: 10,
    flex: 1,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: '600',
  },
  postLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postLocation: {
    fontSize: 12,
    color: '#777',
    marginLeft: 3,
  },
  postTime: {
    fontSize: 12,
    color: '#777',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  videoPoster: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  postActionText: {
    fontSize: 14,
    color: '#777',
    marginLeft: 5,
  },
});
