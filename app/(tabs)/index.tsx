import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator, Alert, Platform, Dimensions, RefreshControl, Pressable, Modal } from 'react-native';
import { getApiUrl } from '@/services/videoApi';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Link, useRouter } from 'expo-router';
import { FutbolXLogo } from '@/components/FutbolXLogo';
import * as Linking from 'expo-linking';
import { useAuth } from '@/context/AuthContext';
import { fieldService, eventService, postService } from '@/services/api';

// Ana renk
const primaryColor = '#4CAF50';

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
  id?: string;
  _id?: string; 
  username?: string;
  userAvatar?: string;
  userImage?: string;
  content: string;
  image?: string;
  video?: string;
  likes?: number;
  comments?: number;
  timestamp?: string;
  tags?: string[];
  location?: string;
  contentType?: string;
  title?: string;
  description?: string;
  url?: string;
  filename?: string;
  uploadDate?: string;
  createdAt?: string;
  user?: { 
    username?: string; 
    _id?: string;
    profilePicture?: string;
    id?: string;
  };
  views?: number;
}

// Video veri yapısı
interface Video {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  filename?: string;
  contentType?: string;
  length?: number;
  uploadDate?: string;
  createdAt?: string;
  user?: { username: string; _id: string };
  username?: string;
  url?: string;
  fileId?: string;
  likes?: string[];
  comments?: any[];
  views?: number;
  thumbnail?: string;
  timestamp?: string; // Birleştirme için eklendi
  content?: string; // Birleştirme için eklendi
  image?: string; // Birleştirme için eklendi
  userAvatar?: string; // Birleştirme için eklendi
  location?: string; // Birleştirme için eklendi
}

export default function IndexScreen() {
  const [activeTab, setActiveTab] = useState('kesfet');
  const [searchText, setSearchText] = useState('');
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{url: string, title: string} | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  
  const primaryColor = '#4CAF50';
  const API_URL = getApiUrl();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  // Veritabanından halı sahaları ve etkinlikleri çekme
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'kesfet') {
        fetchPosts();
        fetchVideos();
      } else if (activeTab === 'halisaha') {
        fetchFields();
      } else if (activeTab === 'etkinlikler') {
        fetchEvents();
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
        console.log('Etkinlik bulunamadı');
        setEvents([]);
      }
    } catch (err: any) {
      console.error('Etkinlikleri getirme hatası:', err);
      setError(err.message || 'Etkinlikler yüklenirken bir hata oluştu');
      setEvents([]);
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
        console.log('Gönderi bulunamadı');
        setPosts([]);
      }
    } catch (err: any) {
      console.error('Gönderileri getirme hatası:', err);
      setError(err.message || 'Gönderiler yüklenirken bir hata oluştu');
      // Hata durumunda örnek verileri kullan
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Videoları çekme fonksiyonu
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Axios ile doğrudan istek gönder
      const response = await fetch(`${API_URL}/videos`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Veri kontrolü
      if (data && Array.isArray(data) && data.length > 0) {
        console.log('Videolar başarıyla yüklendi:', data.length);
        setVideos(data);
      } else {
        console.log('Video bulunamadı');
        setVideos([]);
      }
    } catch (err: any) {
      console.error('Videoları getirme hatası:', err);
      setError(err.message || 'Videolar yüklenirken bir hata oluştu');
      setVideos([]);
    } finally {
      setLoading(false);
    }
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
            key={`field-${field.id}-${index}`}
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
          {events.map((event, index) => (
            <Pressable
              key={`event-${event.id || index}`}
              style={styles.eventCard}
              onPress={isLoggedIn ? () => router.push(`/event/${event.id}` as any) : handleRestrictedAction}
            >
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailItem}>
                    <IconSymbol name="calendar" size={14} color="#777" />
                    <ThemedText style={styles.eventDetailText}>{event.date} • {event.time}</ThemedText>
                </View>
                  <View style={styles.eventDetailItem}>
                    <IconSymbol name="mappin" size={14} color="#777" />
                    <ThemedText style={styles.eventDetailText}>{event.location}</ThemedText>
                </View>
                  <View style={styles.eventDetailItem}>
                    <IconSymbol name="person.2" size={14} color="#777" />
                    <ThemedText style={styles.eventDetailText}>{event.participants}/{event.maxParticipants} Katılımcı</ThemedText>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  // Tüm içerikleri birleştiren fonksiyon
  const combineContent = () => {
    // Tüm içerikleri birleştir
    const allContent: (Post | Video)[] = [];
    
    // Videoları ekle
    videos.forEach(video => {
      allContent.push({
        ...video,
        contentType: 'video',
        timestamp: video.uploadDate || video.createdAt || new Date().toISOString()
      });
    });
    
    // Paylaşımları ekle
    posts.forEach(post => {
      allContent.push({
        ...post,
        contentType: 'post',
        timestamp: post.timestamp || new Date().toISOString()
      });
    });
    
    // Tarihe göre sırala (en yeni en üste)
    return allContent.sort((a, b) => {
      // Farklı tarih alanlarını kontrol et ve varsayılan değer kullan
      const getTimestamp = (item: any): number => {
        if (item.timestamp) return new Date(item.timestamp).getTime();
        if (item.createdAt) return new Date(item.createdAt).getTime();
        if (item.uploadDate) return new Date(item.uploadDate).getTime();
        return new Date().getTime(); // Varsayılan olarak şu anki zaman
      };
      
      const dateA = getTimestamp(a);
      const dateB = getTimestamp(b);
      return dateB - dateA;
    });
  };
  
  const renderDiscoverContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Yükleniyor...</ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={50} color="#F44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      );
    }
    
    const allContent = combineContent();

    return (
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              fetchPosts();
              fetchVideos();
            }}
            colors={[primaryColor]}
          />
        }
      >
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Keşfet</ThemedText>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={isLoggedIn ? () => router.push("/(tabs)/sharePost" as any) : handleRestrictedAction}
                activeOpacity={0.7}
                style={styles.actionButton}
              >
                <IconSymbol name="square.and.arrow.up" size={18} color={primaryColor} />
                <ThemedText style={styles.actionButtonText}>Gönderi Paylaş</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          
          {allContent.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Henüz içerik yok</ThemedText>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={isLoggedIn ? () => router.push("/(tabs)/sharePost" as any) : handleRestrictedAction}
              >
                <ThemedText style={styles.emptyButtonText}>Gönderi Paylaş</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.contentList}>
              {allContent.map((item, index) => {
                // Generate a unique key based on type and ID
                const itemKey = `${item.contentType || 'post'}-${item._id || item.id || index}`;
                
                if (item.contentType === 'video') {
                  // Video render
                  return (
                    <View key={itemKey} style={styles.contentCard}>
                    <TouchableOpacity 
                      style={styles.contentCard}
                      onPress={() => {
                        console.log('Video seçildi:', item);
                        // URL'yi düzgün şekilde oluştur
                        let videoUrl = '';
                        
                        // Bilgisayarın IP adresini doğrudan kullan (Kullanıcının IP adresi: 192.168.1.27)
                        const directIP = 'http://192.168.1.27:5000';
                        
                        if (item.url) {
                          // Eğer tam URL ise doğrudan kullan
                          if (item.url.startsWith('http')) {
                            videoUrl = item.url;
                          } else {
                            // Relatif URL ise doğrudan IP adresi ile birleştir
                            videoUrl = `${directIP}${item.url}`;
                          }
                        } else if (item.filename) {
                          // Filename varsa tam yolu oluştur
                          videoUrl = `${directIP}/uploads/videos/${item.filename}`;
                        }
                        
                        console.log('API_URL:', API_URL);
                        console.log('Doğrudan IP:', directIP);
                        console.log('Video URL oluşturuldu:', videoUrl);
                        
                        if (videoUrl) {
                          console.log('Video URL (düzeltilmiş):', videoUrl);
                          // Video modalini aç
                          setSelectedVideo({
                            url: videoUrl,
                            title: item.title || 'Video'
                          });
                          setVideoModalVisible(true);
                        } else {
                          Alert.alert('Hata', 'Video URL bulunamadı');
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.contentHeader}>
                        <View style={styles.userInfo}>
                          <View style={styles.userAvatar}>
                            <IconSymbol name="person.circle.fill" size={30} color="#777" />
                          </View>
                          <View>
                            <ThemedText style={styles.username}>
                              {item.user?.username || item.username || 'Kullanıcı'}
                            </ThemedText>
                            <ThemedText style={styles.timestamp}>
                              {item.uploadDate ? new Date(item.uploadDate).toLocaleDateString('tr-TR') : 
                               item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : 
                               'Tarih bilgisi yok'}
                            </ThemedText>
                          </View>
                        </View>
                        <View style={styles.contentBadge}>
                          <IconSymbol name="video.fill" size={12} color="#FFF" />
                          <ThemedText style={styles.contentBadgeText}>Video</ThemedText>
                        </View>
                      </View>
                      
                      <ThemedText style={styles.contentTitle}>{item.title || 'Video Başlığı'}</ThemedText>
                      {item.description && (
                        <ThemedText style={styles.contentDescription} numberOfLines={2}>
                          {item.description}
                        </ThemedText>
                      )}
                      
                      <View style={styles.videoThumbnail}>
                        <View style={styles.videoThumbnailPlaceholder}>
                          <IconSymbol name="play.circle.fill" size={40} color="#FFF" />
                        </View>
                      </View>
                      
                      <View style={styles.contentFooter}>
                        <View style={styles.contentStats}>
                          <IconSymbol name="eye" size={16} color="#777" />
                          <ThemedText style={styles.statsText}>{item.views || 0}</ThemedText>
                        </View>
                        <View style={styles.contentStats}>
                          <IconSymbol name="heart" size={16} color="#777" />
                          <ThemedText style={styles.statsText}>{Array.isArray(item.likes) ? item.likes.length : (typeof item.likes === 'number' ? item.likes : 0)}</ThemedText>
                        </View>
                        <View style={styles.contentStats}>
                          <IconSymbol name="bubble.right" size={16} color="#777" />
                          <ThemedText style={styles.statsText}>{Array.isArray(item.comments) ? item.comments.length : (typeof item.comments === 'number' ? item.comments : 0)}</ThemedText>
                        </View>
                      </View>
                    </TouchableOpacity>
                    </View>
                  );
                } else {
                  // Post render
                  // Konsola paylaşım verilerini yazdır (hata ayıklama için)
                  console.log('Paylaşım verisi:', JSON.stringify(item, null, 2));
                  
                  // Kullanıcı adı ve profil resmi kontrolü
                  const username = item.username || (item.user?.username) || 'Kullanıcı';
                  // userImage için güvenli bir şekilde kontrol yap
                  let userImage = '';
                  if (item.userAvatar) {
                    userImage = item.userAvatar;
                  } else if (item.user && 'profilePicture' in item.user) {
                    userImage = (item.user as any).profilePicture || '';
                  }
                  
                  // Tarih bilgisi kontrolü
                  const dateString = item.timestamp || item.createdAt || new Date().toISOString();
                  const formattedDate = new Date(dateString).toLocaleDateString('tr-TR');
                  
                  // İçerik kontrolü
                  const content = item.content || 'İçerik bulunamadı';
                  
                  // Doğrudan IP adresi kullan
                  const directIP = 'http://192.168.1.27:5000';
                  
                  return (
                    <View key={itemKey} style={styles.contentCard}>
                    <Pressable 
                      style={styles.contentCard}
                        onPress={() => router.push(`/post/${item._id || item.id}` as any)}
                    >
                      <View style={styles.contentHeader}>
                        <View style={styles.userInfo}>
                          {userImage ? (
                            <Image 
                              source={{ uri: userImage.startsWith('http') ? userImage : `${directIP}${userImage}` }} 
                              style={styles.userAvatarImage} 
                            />
                          ) : (
                            <View style={styles.userAvatar}>
                              <IconSymbol name="person.circle.fill" size={30} color="#777" />
                            </View>
                          )}
                          <View>
                            <ThemedText style={styles.username}>{username}</ThemedText>
                            <ThemedText style={styles.timestamp}>{formattedDate}</ThemedText>
                          </View>
                        </View>
                        <View style={styles.contentBadge}>
                          <IconSymbol name="doc.text.fill" size={12} color="#FFF" />
                          <ThemedText style={styles.contentBadgeText}>Paylaşım</ThemedText>
                        </View>
                      </View>
                      
                      <ThemedText style={styles.contentText}>{content}</ThemedText>
                      
                      {item.image && (
                        <Image 
                          source={{ uri: item.image.startsWith('http') ? item.image : `${directIP}${item.image}` }} 
                          style={styles.contentImage} 
                        />
                      )}
                      
                      <View style={styles.contentFooter}>
                        <View style={styles.contentStats}>
                          <IconSymbol name="heart" size={16} color="#777" />
                          <ThemedText style={styles.statsText}>{item.likes}</ThemedText>
                        </View>
                        <View style={styles.contentStats}>
                          <IconSymbol name="bubble.right" size={16} color="#777" />
                          <ThemedText style={styles.statsText}>{item.comments}</ThemedText>
                        </View>
                        {item.location && (
                          <View style={styles.contentStats}>
                            <IconSymbol name="mappin" size={16} color="#777" />
                            <ThemedText style={styles.statsText}>{item.location}</ThemedText>
                          </View>
                        )}
                      </View>
                    </Pressable>
                    </View>
                  );
                }
              })}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderLatestVideos = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Son Videolar</ThemedText>
        <TouchableOpacity 
          onPress={isLoggedIn ? () => router.push("/videoUpload" as any) : handleRestrictedAction}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.seeAllText}>Video Yükle</ThemedText>
        </TouchableOpacity>
      </View>
      
      {loading && activeTab === 'kesfet' ? (
        <ActivityIndicator size="small" color={primaryColor} style={{marginVertical: 20}} />
      ) : videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>Henüz video yok</ThemedText>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={isLoggedIn ? () => router.push("/videoUpload" as any) : handleRestrictedAction}
          >
            <ThemedText style={styles.emptyButtonText}>Video Yükle</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={videos}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id || item.id || String(Math.random())}
          contentContainerStyle={styles.videoList}
          renderItem={({item}) => (
            <TouchableOpacity 
              key={`video-${item._id || item.id || String(Math.random())}`}
              style={styles.videoCard}
              onPress={() => {
                console.log('Video seçildi:', item);
                // Video URL'sini oluştur
                const videoUrl = item.url || 
                  (item.filename ? `${API_URL}/uploads/videos/${item.filename}` : null);
                
                if (videoUrl) {
                  // Video gösterme işlemi burada yapılacak
                  console.log('Video URL:', videoUrl);
                  Alert.alert('Video', `${item.title} videosunu izlemek için videoUpload ekranına gidin`);
                } else {
                  Alert.alert('Hata', 'Video URL bulunamadı');
                }
              }}
              activeOpacity={0.8}
            >
              <View style={styles.videoThumbnail}>
                <View style={styles.videoThumbnailPlaceholder}>
                  <IconSymbol name="play.circle.fill" size={40} color="#FFF" />
                </View>
                <View style={styles.videoDuration}>
                  <ThemedText style={styles.videoDurationText}>
                    {item.length ? `${Math.floor(item.length / 60)}:${(item.length % 60).toString().padStart(2, '0')}` : 'Video'}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.videoInfo}>
                <ThemedText style={styles.videoTitle} numberOfLines={2}>{item.title || 'Video Başlığı'}</ThemedText>
                <ThemedText style={styles.videoUsername}>
                  {item.user?.username || item.username || 'Kullanıcı'}
                </ThemedText>
                <View style={styles.videoStats}>
                  <IconSymbol name="calendar" size={14} color="#777" />
                  <ThemedText style={styles.videoStatsText}>
                    {item.uploadDate ? new Date(item.uploadDate).toLocaleDateString('tr-TR') : 
                     item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : 
                     'Tarih bilgisi yok'}
                  </ThemedText>
                  <IconSymbol name="heart" size={14} color="#777" style={{marginLeft: 10}} />
                  <ThemedText style={styles.videoStatsText}>{item.likes?.length || 0}</ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  const renderLatestPosts = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Son Paylaşımlar</ThemedText>
        <TouchableOpacity 
          onPress={isLoggedIn ? () => router.push("/posts" as any) : handleRestrictedAction}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.seeAllText}>Tümünü Gör</ThemedText>
        </TouchableOpacity>
      </View>
      
      {loading && activeTab === 'kesfet' ? (
        <ActivityIndicator size="small" color={primaryColor} style={{marginVertical: 20}} />
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>Henüz gönderi yok</ThemedText>
        </View>
      ) : (
        <FlatList
          data={posts.slice(0, 5)}
          keyExtractor={(post) => post._id || post.id || Math.random().toString()}
          renderItem={({item: post}) => {
            // Güvenli url oluşturma fonksiyonu
            const getImageUrl = (path: string | undefined) => {
              if (!path) return 'https://via.placeholder.com/40';
              if (path.startsWith('http')) return path;
              return `${API_URL}${path}`;
            };
            
            return (
              <TouchableOpacity 
                style={styles.postCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/post/${post._id || post.id}` as any)}
          >
            <View style={styles.postHeader}>
                <Image 
                    source={{ 
                      uri: getImageUrl(
                        post.userImage || 
                        (post.user && typeof post.user === 'object' && 'profilePicture' in post.user 
                          ? post.user.profilePicture as string 
                          : undefined)
                      )
                    }} 
                  style={styles.avatarImage}
                />
                  <View style={styles.postUserInfo}>
                    <ThemedText style={styles.postUsername}>
                      {post.username || 
                        (post.user && typeof post.user === 'object' && 'username' in post.user 
                          ? post.user.username as string 
                          : 'İsimsiz Kullanıcı')}
                    </ThemedText>
                    <ThemedText style={styles.postTime}>
                      {post.timestamp || post.createdAt 
                        ? new Date(post.timestamp || post.createdAt || Date.now()).toLocaleDateString('tr-TR') 
                        : 'Bilinmeyen zaman'}
                  </ThemedText>
                </View>
                </View>
                
                <ThemedText style={styles.postContent}>{post.content || ''}</ThemedText>
                
                {post.image && (
                  <Image 
                    source={{ uri: getImageUrl(post.image) }} 
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                )}
                
                {post.video && (
                  <TouchableOpacity
                    style={styles.postVideo}
                    onPress={() => {
                      setSelectedVideo({
                        url: getImageUrl(post.video || ''),
                        title: post.content ? post.content.substring(0, 30) + '...' : 'Video'
                      });
                      setVideoModalVisible(true);
                    }}
                  >
                    <View style={styles.videoThumbnailOverlay}>
                      <IconSymbol name="play.circle.fill" size={40} color="#FFF" />
                  </View>
                  </TouchableOpacity>
                )}
                
                <View style={styles.postFooter}>
                  <View style={styles.postStat}>
                    <IconSymbol name="heart" size={16} color="#777" />
                    <ThemedText style={styles.postStatText}>{post.likes || 0}</ThemedText>
              </View>
                  <View style={styles.postStat}>
                    <IconSymbol name="message" size={16} color="#777" />
                    <ThemedText style={styles.postStatText}>{post.comments || 0}</ThemedText>
            </View>
                </View>
              </TouchableOpacity>
            );
          }}
          scrollEnabled={false}
          style={{width: '100%'}}
        />
      )}
    </View>
  );

  // Video oynatma modalı
  const renderVideoModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={videoModalVisible}
      onRequestClose={() => {
        setVideoModalVisible(false);
        setSelectedVideo(null);
      }}
    >
      <View style={styles.videoModalContainer}>
        <View style={styles.videoModalHeader}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              setVideoModalVisible(false);
              setSelectedVideo(null);
            }}
          >
            <IconSymbol name="xmark" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.videoModalTitle}>{selectedVideo?.title}</ThemedText>
          <View style={{width: 40}} />
        </View>
        
        {selectedVideo && (
          <View style={styles.videoPlayerContainer}>
            <ExpoVideo
              source={{ uri: selectedVideo.url }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              shouldPlay
              onError={(error: any) => {
                console.error('Video oynatma hatası:', error);
                console.error('Hatalı URL:', selectedVideo.url);
                Alert.alert(
                  'Hata', 
                  `Video oynatılamadı: ${error?.error?.message || 'Bilinmeyen hata'}`,
                  [
                    { 
                      text: 'Yeniden Dene', 
                      onPress: () => {
                        // Video URL'sini düzeltmeyi dene - doğrudan IP adresi kullan
                        let fixedUrl = selectedVideo.url;
                        
                        // API_URL yerine doğrudan IP adresi kullan
                        if (fixedUrl.includes(API_URL)) {
                          fixedUrl = fixedUrl.replace(API_URL, 'http://192.168.1.27:5000');
                        }
                        
                        // /api/uploads yolunu /uploads olarak değiştir
                        if (fixedUrl.includes('/api/uploads')) {
                          fixedUrl = fixedUrl.replace('/api/uploads', '/uploads');
                        }
                        
                        console.log('Düzeltilmiş URL ile yeniden deneniyor:', fixedUrl);
                        setSelectedVideo({
                          ...selectedVideo,
                          url: fixedUrl
                        });
                      }
                    },
                    { text: 'Kapat', style: 'cancel' }
                  ]
                );
              }}
              onLoad={() => console.log('Video yüklendi')}
              onPlaybackStatusUpdate={(status: any) => {
                if (status && 'isPlaying' in status) {
                  console.log('Video durumu:', status.isPlaying ? 'Oynatılıyor' : 'Durduruldu');
                }
              }}
            />
          </View>
        )}
      </View>
    </Modal>
  );
  
  return (
    <ThemedView style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      
      {activeTab === 'kesfet' && renderDiscoverContent()}
      {activeTab === 'halisaha' && renderPopularFields()}
      {activeTab === 'etkinlikler' && renderEvents()}
      
      {renderVideoModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  // Keşfet ekranı için yeni stiller
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  actionButtonText: {
    fontSize: 12,
    marginLeft: 4,
    color: primaryColor,
    fontWeight: '500',
  },
  contentList: {
    marginTop: 10,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  contentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: primaryColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contentBadgeText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '500',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  contentDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  contentFooter: {
    flexDirection: 'row',
    marginTop: 10,
  },
  contentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statsText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 4,
  },
  // Video modal stilleri
  videoModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  videoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  videoPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoList: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  videoCard: {
    width: 250,
    marginRight: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: 140,
    backgroundColor: '#eee',
    position: 'relative',
  },
  videoThumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoDurationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  videoUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoStatsText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 4,
  },
  emptyButton: {
    backgroundColor: primaryColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#777',
  },
  postUserInfo: {
    marginLeft: 12,
  },
  postUsername: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  postLocation: {
    fontSize: 12,
    color: '#777',
    marginLeft: 4,
  },
  postTime: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postVideo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEE',
  },
  videoThumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  postFooter: {
    flexDirection: 'row',
    marginTop: 10,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  postStatText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 4,
  },
  eventsContainer: {
    marginTop: 10,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  eventDetails: {
    marginTop: 4,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});
