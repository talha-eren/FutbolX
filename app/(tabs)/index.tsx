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
  filePath?: string; // MongoDB'deki filePath alanı
  postType?: string; // MongoDB'deki postType alanı
  category?: string; // MongoDB'deki category alanı
  duration?: number; // Video süresi için
  length?: number; // Video uzunluğu için alternatif alan
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
  fileName?: string; // MongoDB'deki fileName alanı için
  contentType?: string;
  length?: number;
  uploadDate?: string;
  createdAt?: string;
  user?: { username: string; _id: string };
  username?: string;
  url?: string;
  webUrl?: string; // Web kaynaklı videolar için URL
  web_url?: string; // Alternatif web URL formatı
  fileId?: string;
  likes?: string[];
  comments?: any[];
  views?: number;
  thumbnail?: string;
  filePath?: string; // MongoDB'deki filePath alanı
  timestamp?: string; // Birleştirme için eklendi
  content?: string; // Birleştirme için eklendi
  image?: string; // Birleştirme için eklendi
  userAvatar?: string; // Birleştirme için eklendi
  location?: string; // Birleştirme için eklendi
  postType?: string; // MongoDB'deki postType alanı
  category?: string; // MongoDB'deki category alanı
  duration?: number; // Video süresi alanı
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
  const { isLoggedIn, token } = useAuth();
  
  const primaryColor = '#4CAF50';
  const API_URL = getApiUrl();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  // Veritabanından halı sahaları ve etkinlikleri çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`======== Veri çekme başlatılıyor (${activeTab}) ========`);
        
        if (activeTab === 'kesfet') {
          fetchPosts();
          fetchVideos();
        } else if (activeTab === 'halisaha') {
          fetchFields();
        } else if (activeTab === 'etkinlikler') {
          fetchEvents();
        }
      } catch (error: any) {
        console.error(`Veri çekme hatası: ${error?.message || 'Bilinmeyen hata'}`);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    };
    
    fetchData();
    
    // Component temizlendiğinde yükleniyor durumunu sıfırla
    return () => {
      setLoading(false);
    };
  }, [activeTab]);
  
  // Halı sahaları çekme fonksiyonu - Bu fonksiyon artık matches endpoint'inden veri çekecek
  const fetchFields = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Farklı IP'leri denemek için IP adresleri listesi
      const ipAddresses = ['192.168.1.90', '192.168.1.59', '192.168.1.27', '192.168.1.49'];
      let matchesData = [];
      let connected = false;
      
      // Her bir IP'yi sırayla dene
      for (const ip of ipAddresses) {
        if (connected) break;
        
        try {
          console.log(`Halı sahalar için ${ip} IP'sine bağlanmayı deniyorum...`);
          const apiUrl = `http://${ip}:5000/api/matches`;
          
          // Kısa timeout ile bağlantı dene
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniye timeout
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            signal: controller.signal as any
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data)) {
              matchesData = data;
              console.log(`Bağlantı başarılı: ${ip}, ${data.length} maç verisi alındı`);
              connected = true;
              break;
            }
          }
        } catch (ipError: any) {
          console.log(`${ip} bağlantı hatası:`, ipError.message);
          // Hata durumunda bir sonraki IP'yi dene
          continue;
        }
      }
      
      // Eğer hiçbir IP üzerinden bağlantı sağlanamadıysa
      if (!connected) {
        console.log('Hiçbir IP adresi üzerinden bağlantı sağlanamadı');
        // Yedek veri: Örnek halı sahalar
        matchesData = [
          {
            _id: 'sample1',
            fieldName: 'Yeşil Vadi Halı Saha',
            location: 'Kadıköy, İstanbul',
            price: 600,
            image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
            playersJoined: 8,
            totalPlayers: 10
          },
          {
            _id: 'sample2',
            fieldName: 'Galatasaray Futbol Akademisi',
            location: 'Florya, İstanbul',
            price: 800,
            image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop',
            playersJoined: 5,
            totalPlayers: 12
          }
        ];
        console.log('Örnek halı saha verileri kullanılıyor');
      }
      
      if (matchesData && Array.isArray(matchesData) && matchesData.length > 0) {
        // Maç verilerini halı saha formatına dönüştür
        const fieldsFromMatches = matchesData.map(match => ({
          id: match._id || match.id,
          name: match.fieldName,
          location: match.location,
          price: match.price,
          rating: 4.5, // Sabit değer veya hesaplanabilir
          image: match.image,
          availability: match.playersJoined < match.totalPlayers ? 'Müsait' : 'Dolu'
        }));
        
        // Benzersiz halı sahaları elde et (aynı saha birden fazla maçta olabilir)
        const uniqueFields = fieldsFromMatches.reduce<Field[]>((acc, current) => {
          const x = acc.find(item => item.name === current.name);
          if (!x) {
            return [...acc, current];
          } else {
            return acc;
          }
        }, []);
        
        setFields(uniqueFields);
      } else {
        setFields([]);
      }
    } catch (err: any) {
      console.error('Halı sahaları getirme hatası:', err);
      setError(err.message || 'Halı sahaları yüklenirken bir hata oluştu');
      
      // Hata durumunda örnek veriler göster
      setFields([
        {
          id: 'example1',
          name: 'Örnek Halı Saha',
          location: 'Kadıköy, İstanbul',
          price: 550,
          rating: 4.8,
          image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
          availability: 'Müsait'
        },
        {
          id: 'example2',
          name: 'Örnek Futbol Akademisi',
          location: 'Beşiktaş, İstanbul',
          price: 650,
          rating: 4.6,
          image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop',
          availability: 'Müsait'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Etkinlikleri çekme fonksiyonu
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Farklı IP'leri denemek için IP adresleri listesi
      const ipAddresses = ['192.168.1.90', '192.168.1.59', '192.168.1.27', '192.168.1.49'];
      let eventsData = [];
      let connected = false;
      
      // Her bir IP'yi sırayla dene
      for (const ip of ipAddresses) {
        if (connected) break;
        
        try {
          console.log(`Etkinlikler için ${ip} IP'sine bağlanmayı deniyorum...`);
          const apiUrl = `http://${ip}:5000/api/events`;
          
          // Kısa timeout ile bağlantı dene
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniye timeout
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            signal: controller.signal as any
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data)) {
              eventsData = data;
              console.log(`Bağlantı başarılı: ${ip}, ${data.length} etkinlik verisi alındı`);
              connected = true;
              break;
            }
          }
        } catch (ipError: any) {
          console.log(`${ip} bağlantı hatası:`, ipError.message);
          // Hata durumunda bir sonraki IP'yi dene
          continue;
        }
      }
      
      // Eğer hiçbir IP üzerinden bağlantı sağlanamadıysa
      if (!connected) {
        console.log('Hiçbir IP adresi üzerinden etkinlik verileri alınamadı');
        // Yedek veri: Örnek etkinlikler
        eventsData = [
          {
            id: 'sample-event-1',
            title: 'Halı Saha Turnuvası',
            date: new Date().toLocaleDateString('tr-TR'),
            time: '19:00',
            location: 'Kadıköy, İstanbul',
            image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
            participants: 12,
            maxParticipants: 20
          },
          {
            id: 'sample-event-2',
            title: 'Futbol Atölyesi',
            date: new Date(Date.now() + 86400000).toLocaleDateString('tr-TR'),
            time: '14:00',
            location: 'Beşiktaş, İstanbul',
            image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1064&auto=format&fit=crop',
            participants: 8,
            maxParticipants: 15
          }
        ];
        console.log('Örnek etkinlik verileri kullanılıyor');
      }
      
      // Veri kontrolü
      if (eventsData && Array.isArray(eventsData) && eventsData.length > 0) {
        console.log('Etkinlikler başarıyla yüklendi:', eventsData.length);
        setEvents(eventsData);
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
      
      // Farklı IP'leri denemek için IP adresleri listesi
      const ipAddresses = ['192.168.1.90', '192.168.1.59', '192.168.1.27', '192.168.1.49'];
      let postsData = [];
      let connected = false;
      
      // Her bir IP'yi sırayla dene
      for (const ip of ipAddresses) {
        if (connected) break;
        
        try {
          console.log(`Gönderiler için ${ip} IP'sine bağlanmayı deniyorum...`);
          const apiUrl = `http://${ip}:5000/api/posts`;
          
          // Kısa timeout ile bağlantı dene
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniye timeout
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            signal: controller.signal as any
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data)) {
              postsData = data;
              console.log(`Bağlantı başarılı: ${ip}, ${data.length} gönderi verisi alındı`);
              connected = true;
              break;
            }
          }
        } catch (ipError: any) {
          console.log(`${ip} bağlantı hatası:`, ipError.message);
          // Hata durumunda bir sonraki IP'yi dene
          continue;
        }
      }
      
      // Eğer hiçbir IP üzerinden bağlantı sağlanamadıysa
      if (!connected) {
        console.log('Hiçbir IP adresi üzerinden gönderi verileri alınamadı');
        // Yedek veri: Örnek gönderiler
        postsData = [
          {
            _id: 'sample-post-1',
            content: 'Bugün harika bir antrenman yaptık!',
            image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1470&auto=format&fit=crop',
            username: 'FutbolSever',
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            likes: 12,
            comments: 3,
            filePath: '/uploads/posts/sample-post-1.mp4',
            postType: 'video',
            category: 'Sports'
          },
          {
            _id: 'sample-post-2',
            content: 'Yeni formamız harika görünüyor!',
            image: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?q=80&w=1470&auto=format&fit=crop',
            username: 'FutbolFan',
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            likes: 8,
            comments: 1,
            filePath: '/uploads/posts/sample-post-2.mp4',
            postType: 'video',
            category: 'Sports'
          }
        ];
        console.log('Örnek gönderi verileri kullanılıyor');
      }
      
      // Veri kontrolü
      if (postsData && Array.isArray(postsData) && postsData.length > 0) {
        console.log('Gönderiler başarıyla yüklendi:', postsData.length);
        setPosts(postsData);
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
  
  // Video URL'lerini düzeltme fonksiyonu
  const updateVideoUrls = (videos: Video[]): Video[] => {
    return videos.map(video => {
      // MongoDB'den gelen video verisi için özel işlem
      if (video.filePath && !video.url) {
        video.url = video.filePath;
      }
      
      // MongoDB thumbnail alanı varsa
      if (video.thumbnail && !video.thumbnail.startsWith('http')) {
        video.thumbnail = getImageUrl(video.thumbnail);
      }
      
      // Web URL'den kaynaklı videolar için webUrl alanını belirle
      if (!video.webUrl && !video.web_url) {
        if (video.url && video.url.includes('youtube.com')) {
          video.webUrl = video.url;
        } else if (video.url && video.url.includes('vimeo.com')) {
          video.webUrl = video.url;
        } else if (video.url && (video.url.includes('http://') || video.url.includes('https://'))) {
          // URL bir web adresi ise web_url olarak ata
          if (!video.url.includes('192.168.')) {
            video.webUrl = video.url;
          }
        }
      }
      
      return video;
    });
  };

  // Videoları çekme fonksiyonu
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Farklı IP'leri denemek için IP adresleri listesi
      const ipAddresses = ['192.168.1.90', '192.168.1.59', '192.168.1.27', '192.168.1.49'];
      let videosData: Video[] = [];
      let connected = false;
      
      // Her bir IP'yi sırayla dene
      for (const ip of ipAddresses) {
        if (connected) break;
        
        try {
          console.log(`Videolar için ${ip} IP'sine bağlanmayı deniyorum...`);
          const apiUrl = `http://${ip}:5000/api/videos`;
          
          // Kısa timeout ile bağlantı dene
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniye timeout
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            signal: controller.signal as any
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data)) {
              // URL'leri düzeltme işlemi
              videosData = updateVideoUrls(data);
              console.log(`Bağlantı başarılı: ${ip}, ${data.length} video verisi alındı`);
              connected = true;
              break;
            }
          }
        } catch (ipError: any) {
          console.log(`${ip} bağlantı hatası:`, ipError.message);
          // Hata durumunda bir sonraki IP'yi dene
          continue;
        }
      }
      
      // Eğer hiçbir IP üzerinden bağlantı sağlanamadıysa
      if (!connected) {
        console.log('Hiçbir IP adresi üzerinden video verileri alınamadı');
        // Yedek veri: Örnek videolar
        videosData = [
          {
            _id: 'sample-video-1',
            title: 'Futbol Teknikleri',
            description: 'Temel futbol teknikleri gösterimi',
            username: 'FutbolEğitmeni',
            uploadDate: new Date().toISOString(),
            likes: [],
            views: 156,
            webUrl: 'https://www.youtube.com/watch?v=nePmkpPaKhQ', // Örnek web video
            fileName: 'sample-video-1.mp4',
            contentType: 'video',
            length: 120,
            user: { username: 'FutbolEğitmeni', _id: 'user1' },
            category: 'Sports',
            duration: 120
          },
          {
            _id: 'sample-video-2',
            title: 'Penaltı Atışları',
            description: 'Profesyonel penaltı teknikleri',
            username: 'FutbolAkademisi',
            uploadDate: new Date().toISOString(),
            likes: [],
            views: 342,
            webUrl: 'https://www.youtube.com/watch?v=njAHmSvgXQk', // Örnek web video
            fileName: 'sample-video-2.mp4',
            contentType: 'video',
            length: 180,
            user: { username: 'FutbolAkademisi', _id: 'user2' },
            category: 'Sports',
            duration: 180
          }
        ];
        console.log('Örnek video verileri kullanılıyor');
      }
      
      // Veri kontrolü
      if (videosData && Array.isArray(videosData) && videosData.length > 0) {
        console.log('Videolar başarıyla yüklendi:', videosData.length);
        setVideos(videosData);
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
        <FlatList
          data={fields}
          horizontal={false}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
          keyExtractor={(item, index) => `field-${item.id}-${index}`}
          style={{ maxHeight: 500 }} // Dikey kaydırma için yükseklik sınırı
          renderItem={({ item: field, index }) => (
            <Pressable 
              key={`field-${field.id}-${index}`}
              style={[
                styles.fieldCard,
                { marginBottom: 10 }, // Yatay margin yerine dikey margin
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
          )}
        />
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
        <FlatList
          data={events}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => `event-${item.id || index}`}
          style={{maxHeight: 400}} // Scrollable bir alanda daha fazla etkinlik görüntülenir
          renderItem={({item: event, index}) => (
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
          )}
        />
      )}
    </View>
  );

  // Tüm içerikleri birleştiren fonksiyon
  const combineContent = () => {
    // Tüm içerikleri birleştir
    const allContent: (Post | Video)[] = [];
    
    // Videoları ekle
    videos.forEach(video => {
      // MongoDB alanlarını kontrol et ve eksik alanları doldur
      const videoItem: Video = {
        ...video,
        contentType: 'video',
        timestamp: video.uploadDate || video.createdAt || new Date().toISOString()
      };
      
      // Video önizleme görselini ayarla
      if (video.thumbnail && !videoItem.image) {
        videoItem.image = getImageUrl(video.thumbnail);
      }
      
      allContent.push(videoItem);
    });
    
    // Paylaşımları ekle
    posts.forEach(post => {
      // MongoDB alanlarını kontrol et ve eksik alanları doldur
      const postItem: Post = {
        ...post,
        contentType: 'post',
        timestamp: post.timestamp || post.createdAt || new Date().toISOString()
      };
      
      // Görsel URL'sini doğru formatta ayarla
      if (post.image && !post.image.startsWith('http')) {
        postItem.image = getImageUrl(post.image);
      }
      
      // FilePath varsa ve image yoksa, filePath'i image olarak kullan
      if (post.filePath && !post.image) {
        postItem.image = getImageUrl(post.filePath);
      }
      
      allContent.push(postItem);
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
  
  // Görsel URL'sini güvenli bir şekilde oluştur
  const getImageUrl = (path: string | undefined): string => {
    if (!path) return 'https://via.placeholder.com/300x200?text=Resim+Yok';
    
    try {
      console.log("Görsel yolu:", path);
      
      // Sabit IP adresi - networkConfig'den alınan değeri kullanalım
      const baseUrl = 'http://192.168.1.90:5000';
      
      // Eğer tam URL ise doğrudan kullan
      if (path.startsWith('http')) {
        return path;
      }
      
      // MongoDB'den gelen /uploads/ yolları için özel işlem
      if (path.includes('/uploads/')) {
        // NSURLErrorDomain hatasını önlemek için başlangıç slash'ı kaldır
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const fullUrl = `${baseUrl}/${cleanPath}`;
        console.log("Uploads yolundan URL oluşturuldu:", fullUrl);
        return fullUrl;
      }
      
      // Default thumbnail için
      if (path === 'default-thumbnail.jpg' || path.includes('default-thumbnail')) {
        const fullUrl = `${baseUrl}/uploads/images/default-thumbnail.jpg`;
        console.log("Default thumbnail URL oluşturuldu:", fullUrl);
        return fullUrl;
      }
      
      // Diğer tüm göreceli yollar için
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      const fullUrl = `${baseUrl}/${cleanPath}`;
      console.log("Genel URL oluşturuldu:", fullUrl);
      return fullUrl;
    } catch (error) {
      console.error('Görsel URL oluşturma hatası:', error);
      return 'https://via.placeholder.com/300x200?text=Hatalı+URL';
    }
  };
  
  // Video URL'sini güvenli bir şekilde oluştur
  const getVideoUrl = (item: any): string => {
    try {
      // Sabit tek bir IP adresi kullan
      const baseUrl = 'http://192.168.1.90:5000';
      
      console.log("Video öğesi:", JSON.stringify(item));
      
      // MongoDB'den gelen filePath alanı varsa
      if (item.filePath) {
        // NSURLErrorDomain hatasını önlemek için URL'yi doğru formatta oluştur
        // Önce herhangi bir başlangıç slash'ını kaldır
        const cleanPath = item.filePath.startsWith('/') ? item.filePath.substring(1) : item.filePath;
        const url = `${baseUrl}/${cleanPath}`;
        console.log("FilePath'den URL oluşturuldu:", url);
        return url;
      }

      // MongoDB'deki thumbnail alanı için
      if (item.thumbnail && item.thumbnail !== 'default-thumbnail.jpg') {
        // NSURLErrorDomain hatasını önlemek için URL'yi doğru formatta oluştur
        const cleanPath = item.thumbnail.startsWith('/') ? item.thumbnail.substring(1) : item.thumbnail;
        const url = `${baseUrl}/${cleanPath}`;
        console.log("Thumbnail'dan URL oluşturuldu:", url);
        return url;
      }
      
      // URL doğrudan varsa kullan
      if (item.url) {
        // URL zaten tam ise (http veya https ile başlıyorsa) doğrudan kullan
        if (item.url.startsWith('http')) {
          return item.url;
        }
        
        // URL göreceli ise (/ ile başlıyorsa) tam URL oluştur
        const cleanPath = item.url.startsWith('/') ? item.url.substring(1) : item.url;
        const url = `${baseUrl}/${cleanPath}`;
        console.log("URL'den tam URL oluşturuldu:", url);
        return url;
      }
      
      // Filename (veya fileName) varsa URL oluştur
      if (item.filename || item.fileName) {
        const filename = item.filename || item.fileName;
        const url = `${baseUrl}/uploads/videos/${filename}`;
        console.log("Filename'den URL oluşturuldu:", url);
        return url;
      }
      
      // Web videolar için (YouTube, Vimeo, vb.)
      if (item.webUrl || item.web_url) {
        return item.webUrl || item.web_url;
      }
      
      // Yedek video (MongoDB bulunamadığında)
      return 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
    } catch (error) {
      console.error('Video URL oluşturma hatası:', error);
      return 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
    }
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
    console.log('Tüm içerikler:', allContent.length, 'adet bulundu');

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
                
                // Her içerik için içerik tipini belirle (MongoDB'den gelen veriler için)
                if (!item.contentType) {
                  if (item.postType === 'image' || (item.filePath && item.filePath.includes('/images/'))) {
                    item.contentType = 'post';
                  } else if (item.postType === 'video' || (item.filePath && item.filePath.includes('/videos/')) 
                          || item.duration || item.length) {
                    item.contentType = 'video';
                  }
                }
                
                // Konsola bilgi yazdırma (hata ayıklama için)
                console.log(`İçerik ${index}:`, item.contentType, item._id || item.id, item.title || item.content);
                
                if (item.contentType === 'video') {
                  // Video render
                  return (
                    <View key={itemKey} style={styles.contentCard}>
                    <TouchableOpacity 
                      style={styles.contentCard}
                      onPress={() => {
                        console.log('Video seçildi:', item);
                        
                        // Video URL'sini oluştur
                        const videoUrl = getVideoUrl(item);
                        console.log('Video URL oluşturuldu:', videoUrl);
                        
                        if (videoUrl) {
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
                        {(item as Video).thumbnail ? (
                          <Image 
                            source={{ uri: getImageUrl((item as Video).thumbnail) }} 
                            style={styles.videoThumbnailImage} 
                            resizeMode="cover"
                          />
                        ) : (item as Video).filePath ? (
                          // FilePath'i thumbnail olarak kullanabiliriz
                          <Image 
                            source={{ uri: getImageUrl((item as Video).filePath) }} 
                            style={styles.videoThumbnailImage} 
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.videoThumbnailPlaceholder}>
                            <IconSymbol name="play.circle.fill" size={40} color="#FFF" />
                          </View>
                        )}
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
                  // console.log('Paylaşım verisi:', JSON.stringify(item, null, 2));
                  
                  // Kullanıcı adı ve profil resmi kontrolü
                  const username = item.username || (item.user?.username) || 'Kullanıcı';
                  
                  // Kullanıcı profil resmi için URL oluşturma
                  let userImageUrl = '';
                  if (item.userAvatar) {
                    userImageUrl = getImageUrl(item.userAvatar);
                  } else if (item.user && 'profilePicture' in item.user) {
                    userImageUrl = getImageUrl((item.user as any).profilePicture);
                  }
                  
                  // Tarih bilgisi kontrolü
                  const dateString = item.timestamp || item.createdAt || new Date().toISOString();
                  const formattedDate = new Date(dateString).toLocaleDateString('tr-TR');
                  
                  // İçerik kontrolü
                  const content = item.content || item.description || 'İçerik bulunamadı';
                  
                  // MongoDB'den gelen görsel URL'si
                  let imageUrl = '';
                  if (item.filePath) {
                    // FilePath doğrudan kullan
                    imageUrl = getImageUrl(item.filePath);
                  } else if (item.image) {
                    // Normal image alanı
                    imageUrl = getImageUrl(item.image);
                  }
                  
                  return (
                    <View key={itemKey} style={styles.contentCard}>
                    <Pressable 
                      style={styles.contentCard}
                        onPress={() => router.push(`/post/${item._id || item.id}` as any)}
                    >
                      <View style={styles.contentHeader}>
                        <View style={styles.userInfo}>
                          {userImageUrl ? (
                            <Image 
                              source={{ uri: userImageUrl }} 
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
                      
                      {imageUrl && (
                        <Image 
                          source={{ uri: imageUrl }} 
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
                const videoUrl = getVideoUrl(item);
                
                if (videoUrl) {
                  console.log('Video URL:', videoUrl);
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
              <View style={styles.videoThumbnail}>
                {item.thumbnail ? (
                  <Image 
                    source={{ uri: getImageUrl(item.thumbnail) }} 
                    style={styles.videoThumbnailImage} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.videoThumbnailPlaceholder}>
                    <IconSymbol name="play.circle.fill" size={40} color="#FFF" />
                  </View>
                )}
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
            {selectedVideo.url.includes('youtube.com') ? (
              // YouTube video için WebView
              <View style={styles.webViewContainer}>
                <ThemedText style={styles.webVideoMessage}>
                  YouTube videosu: Bu video tarayıcıda açılmalıdır
                </ThemedText>
                <TouchableOpacity
                  style={styles.openBrowserButton}
                  onPress={() => {
                    Linking.openURL(selectedVideo.url).catch(err => {
                      console.error('Tarayıcı açma hatası:', err);
                      Alert.alert('Hata', 'Video tarayıcıda açılamadı.');
                    });
                  }}
                >
                  <ThemedText style={styles.openBrowserButtonText}>Tarayıcıda Aç</ThemedText>
                </TouchableOpacity>
              </View>
            ) : selectedVideo.url.includes('vimeo.com') || 
                selectedVideo.url.includes('facebook.com') || 
                (selectedVideo.url.includes('http') && !selectedVideo.url.includes('192.168.')) ? (
              // Diğer web videolar için WebView
              <View style={styles.webViewContainer}>
                <ThemedText style={styles.webVideoMessage}>
                  Web videosu: Bu video tarayıcıda açılmalıdır
                </ThemedText>
                <TouchableOpacity
                  style={styles.openBrowserButton}
                  onPress={() => {
                    Linking.openURL(selectedVideo.url).catch(err => {
                      console.error('Tarayıcı açma hatası:', err);
                      Alert.alert('Hata', 'Video tarayıcıda açılamadı.');
                    });
                  }}
                >
                  <ThemedText style={styles.openBrowserButtonText}>Tarayıcıda Aç</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              // Standart video oynatıcı
              <>
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
                    
                    // Orijinal URL'yi saklayalım
                    const originalUrl = selectedVideo.url;
                    
                    // Orijinal URL'yi loglayalım
                    console.log("HATA OLUŞAN ORİJİNAL URL:", originalUrl);
                    
                    // URL'de tipik hataları düzeltmeyi deneyelim
                    let fixedUrl = originalUrl;
                    
                    // Başında veya sonunda boşluk varsa temizle
                    fixedUrl = fixedUrl.trim();
                    
                    // Çift slash var mı kontrol et ve düzelt
                    if (fixedUrl.includes('//uploads')) {
                      fixedUrl = fixedUrl.replace('//uploads', '/uploads');
                    }
                    
                    // URL'de yanlış oluşturulmuş slash kombinasyonları düzelt
                    while (fixedUrl.includes('//')) {
                      fixedUrl = fixedUrl.replace('//', '/');
                    }
                    
                    // http:/ gibi bir hata varsa düzelt
                    if (fixedUrl.startsWith('http:/')) {
                      fixedUrl = 'http://' + fixedUrl.substring(6);
                    }
                    
                    // http/: gibi bir hata varsa düzelt
                    if (fixedUrl.startsWith('http/:')) {
                      fixedUrl = 'http://' + fixedUrl.substring(6);
                    }
                    
                    // Eğer URL değiştiyse yeni URL ile yeniden dene
                    if (fixedUrl !== originalUrl) {
                      console.log('Düzeltilmiş URL ile yeniden deneniyor:', fixedUrl);
                      setSelectedVideo({
                        ...selectedVideo,
                        url: fixedUrl
                      });
                      return;
                    }
                    
                    // URL formatını değiştirelim - başka bir IP adresi deneyelim
                    if (originalUrl.includes('192.168.1.59')) {
                      const newUrl = originalUrl.replace('192.168.1.59', '192.168.1.90');
                      console.log('Alternatif IP ile yeniden deneniyor:', newUrl);
                      setSelectedVideo({
                        ...selectedVideo,
                        url: newUrl
                      });
                      return;
                    }
                    
                    // Diğer düzeltmeleri deneyelim
                    Alert.alert(
                      'Video Oynatma Hatası',
                      `Video oynatılırken hata oluştu: ${error?.error?.message || 'Bilinmeyen hata'}\n\nURL: ${originalUrl}`,
                      [
                        { 
                          text: 'URL\'yi Düzelt ve Yeniden Dene', 
                          onPress: () => {
                            // IP adresini değiştirerek dene
                            const serverIp = '192.168.1.27'; // Farklı bir IP adresi dene
                            const pathPart = originalUrl.split('5000')[1];
                            if (pathPart) {
                              const cleanPath = pathPart.startsWith('/') ? pathPart.substring(1) : pathPart;
                              const newUrl = `http://${serverIp}:5000/${cleanPath}`;
                              
                              console.log('Farklı IP ile yeniden deneniyor:', newUrl);
                              setSelectedVideo({
                                ...selectedVideo,
                                url: newUrl
                              });
                            }
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
                
                {/* Alternatif oynatıcı düğmesi */}
                <TouchableOpacity
                  style={styles.alternativePlayerButton}
                  onPress={() => {
                    // Tarayıcıda açarak deneme
                    Linking.openURL(selectedVideo.url).catch(err => {
                      console.error('Tarayıcı açma hatası:', err);
                      Alert.alert('Hata', 'Video tarayıcıda açılamadı.');
                    });
                  }}
                >
                  <ThemedText style={styles.alternativePlayerButtonText}>
                    Tarayıcıda Aç
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
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
    borderRadius: 8,
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
  webViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  webVideoMessage: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  openBrowserButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  openBrowserButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  alternativePlayerButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  alternativePlayerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
