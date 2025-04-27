import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity, TextInput, FlatList, Platform, Pressable, Alert, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Link, useRouter } from 'expo-router';
import { FutbolXLogo } from '@/components/FutbolXLogo';
import * as Linking from 'expo-linking';
import { useAuth } from '@/context/AuthContext';
import { fieldService, eventService, postService } from '@/services/api';

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
  const [fields, setFields] = useState<Field[]>(fieldData); // Başlangıçta örnek veriler
  const [events, setEvents] = useState<any[]>([]); // Etkinlikler için boş dizi
  const [posts, setPosts] = useState<Post[]>(postData); // Başlangıçta örnek veriler
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  
  const primaryColor = '#4CAF50';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  // Veritabanından halı sahaları ve etkinlikleri çekme
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'halisaha') {
        fetchFields();
      } else if (activeTab === 'etkinlikler') {
        fetchEvents();
      } else if (activeTab === 'kesfet') {
        fetchPosts();
      }
    };
    
    fetchData();
  }, [activeTab]);
  
  // Halı sahaları çekme fonksiyonu
  const fetchFields = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fieldService.getFields();
      if (data && data.length > 0) {
        setFields(data);
      }
    } catch (err: any) {
      console.error('Halı sahaları getirme hatası:', err);
      setError(err.message || 'Halı sahaları yüklenirken bir hata oluştu');
      // Hata durumunda örnek verileri kullan
      setFields(fieldData);
    } finally {
      setLoading(false);
    }
  };
  
  // Etkinlikleri çekme fonksiyonu
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await eventService.getAll();
      
      // Veri kontrolü
      if (data && Array.isArray(data) && data.length > 0) {
        console.log('Etkinlikler başarıyla yüklendi:', data.length);
        setEvents(data);
      } else {
        console.log('Etkinlik bulunamadı, örnek veriler kullanılıyor');
        // Veritabanında etkinlik yoksa örnek veriler oluştur
        createSampleEvents();
      }
    } catch (err: any) {
      console.error('Etkinlikleri getirme hatası:', err);
      setError(err.message || 'Etkinlikler yüklenirken bir hata oluştu');
      // Hata durumunda örnek etkinlikler oluştur
      createSampleEvents();
    } finally {
      setLoading(false);
    }
  };
  
  // Gönderileri çekme fonksiyonu
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await postService.getAll();
      
      // Veri kontrolü
      if (data && Array.isArray(data) && data.length > 0) {
        console.log('Gönderiler başarıyla yüklendi:', data.length);
        setPosts(data);
      } else {
        console.log('Gönderi bulunamadı, örnek veriler kullanılıyor');
        setPosts(postData); // Örnek verileri kullan
      }
    } catch (err: any) {
      console.error('Gönderileri getirme hatası:', err);
      setError(err.message || 'Gönderiler yüklenirken bir hata oluştu');
      // Hata durumunda örnek verileri kullan
      setPosts(postData);
    } finally {
      setLoading(false);
    }
  };
  
  // Örnek etkinlikler oluşturma fonksiyonu
  const createSampleEvents = async () => {
    // Burada backend'e örnek etkinlikler eklenebilir
    // Şimdilik sadece örnek veri gösteriyoruz
    const sampleEvents = [
      {
        id: '1',
        title: 'Dostluk Maçı',
        description: 'Haftalık dostluk maçımıza davetlisiniz',
        location: 'Yıldız Halı Saha, Kadıköy',
        date: '28 Nisan 2025',
        time: '19:00',
        image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
        participants: 12,
        maxParticipants: 14
      },
      {
        id: '2',
        title: 'Amatör Turnuva',
        description: 'Ödüllü amatör futbol turnuvası',
        location: 'Gol Park, Beyoğlu',
        date: '5 Mayıs 2025',
        time: '16:00',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1364&auto=format&fit=crop',
        participants: 24,
        maxParticipants: 32
      }
    ];
    
    setEvents(sampleEvents);
  };

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
        <ThemedText style={styles.reservationButtonText}>Rezervasyon</ThemedText>
      </TouchableOpacity>
    </View>
  );

  // Tab bileşeni
  const renderTabs = () => (
    <View style={styles.tabs}>
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
      
      {loading && activeTab === 'halisaha' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Halı sahalar yükleniyor...</ThemedText>
        </View>
      ) : error && activeTab === 'halisaha' ? (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={24} color="#F44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : (
        <View style={styles.fieldsContainer}>
          {fields.slice(0, 2).map((field, index) => (
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
                <IconSymbol name="list.bullet" size={18} color="#212121" />
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
      )}
    </View>
  );

  const renderEvents = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Yakın Etkinlikler</ThemedText>
        <TouchableOpacity 
          onPress={isLoggedIn ? () => router.push("/events" as any) : handleRestrictedAction}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.seeAllText}>Tümünü Gör</ThemedText>
        </TouchableOpacity>
      </View>
      
      {loading && activeTab === 'etkinlikler' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Etkinlikler yükleniyor...</ThemedText>
        </View>
      ) : error && activeTab === 'etkinlikler' ? (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={24} color="#F44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="calendar.badge.exclamationmark" size={40} color="#9E9E9E" />
          <ThemedText style={styles.emptyText}>Henüz etkinlik bulunmuyor</ThemedText>
        </View>
      ) : (
        <View style={styles.eventsContainer}>
          {events.map((event) => (
            <Pressable
              key={event.id}
              style={[styles.eventCard]}
              onPress={isLoggedIn ? () => router.push(`/events/${event.id}` as any) : handleRestrictedAction}
            >
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.eventContent}>
                <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                <View style={styles.eventInfoRow}>
                  <IconSymbol name="mappin.and.ellipse" size={14} color="#212121" />
                  <ThemedText style={styles.eventInfoText}>{event.location}</ThemedText>
                </View>
                <View style={styles.eventInfoRow}>
                  <IconSymbol name="calendar" size={14} color="#212121" />
                  <ThemedText style={styles.eventInfoText}>{event.date}, {event.time}</ThemedText>
                </View>
                <View style={styles.eventParticipants}>
                  <ThemedText style={styles.eventParticipantsText}>
                    {event.participants}/{event.maxParticipants} Katılımcı
                  </ThemedText>
                  <View style={styles.eventParticipantsBar}>
                    <View 
                      style={[styles.eventParticipantsFill, { width: `${Math.floor((event.participants / event.maxParticipants) * 100)}%` }]} 
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  const renderRecentPosts = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Gönderiler</ThemedText>
        <TouchableOpacity 
          onPress={isLoggedIn ? () => router.push("/posts" as any) : handleRestrictedAction}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.seeAllText}>Tümünü Gör</ThemedText>
        </TouchableOpacity>
      </View>
      
      {loading && activeTab === 'kesfet' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Gönderiler yükleniyor...</ThemedText>
        </View>
      ) : error && activeTab === 'kesfet' ? (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={24} color="#F44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="photo.on.rectangle.angled" size={40} color="#9E9E9E" />
          <ThemedText style={styles.emptyText}>Henüz gönderi bulunmuyor</ThemedText>
        </View>
      ) : (
        posts.map((post) => (
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
                <ThemedText style={styles.postTime}>{post.timestamp}</ThemedText>
              </View>
            </View>
            
            <ThemedText style={styles.postContent}>{post.content}</ThemedText>
          </Pressable>
        ))
      )}
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
        {activeTab === 'kesfet' && renderRecentPosts()}
        {activeTab === 'halisaha' && renderPopularFields()}
        {activeTab === 'etkinlikler' && renderEvents()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#F44336'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center'
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  eventInfoText: {
    fontSize: 14,
    marginLeft: 4
  },
  eventParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  eventParticipantsText: {
    fontSize: 14,
    marginLeft: 4
  },
  eventParticipantsBar: {
    height: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    marginTop: 4
  },
  eventParticipantsFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  searchContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#424242',
  },
  iconButton: {
    padding: 8,
  },
  reservationButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  reservationButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
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
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  fieldsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  fieldCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    margin: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
      }
    })
  },
  fieldCardHovered: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ translateY: -5 }],
  },
  fieldImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  fieldInfo: {
    padding: 14,
  },
  fieldNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldName: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 6,
    color: '#212121',
    letterSpacing: 0.2,
  },
  fieldLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldLocation: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 6,
    letterSpacing: 0.1,
  },
  fieldPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  fieldPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    letterSpacing: 0.3,
  },
  miniButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  miniButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
      }
    })
  },
  postCardHovered: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ translateY: -3 }],
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  postUserInfo: {
    marginLeft: 12,
    flex: 1,
  },
  postUsername: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  postLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postLocation: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 4,
    letterSpacing: 0.1,
  },
  postTime: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
    color: '#424242',
    letterSpacing: 0.2,
  },
  eventsContainer: {
    marginTop: 10,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingTop: 14,
    marginTop: 4,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 6,
  },
  postActionText: {
    fontSize: 15,
    color: '#757575',
    marginLeft: 8,
    fontWeight: '500',
  },
});
