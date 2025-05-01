import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Dimensions, 
  RefreshControl,
  Pressable,
  Modal
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { useAuth } from '@/context/AuthContext';
import { postService } from '@/services/api';
import { videoService } from '@/services/videoApi';

// Ana renk
const primaryColor = '#4CAF50';
const { width } = Dimensions.get('window');

// Post veri yapısı
interface Post {
  id: string;
  _id?: string;
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
  contentType?: string;
  title?: string;
  description?: string;
  url?: string;
  filename?: string;
  uploadDate?: string;
  createdAt?: string;
  user?: { username: string; _id: string; profilePicture?: string };
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
  user?: { username: string; _id: string; profilePicture?: string };
  username?: string;
  url?: string;
  fileId?: string;
  likes?: string[] | number;
  comments?: any[] | number;
  views?: number;
  thumbnail?: string;
  timestamp?: string;
  content?: string;
  image?: string;
  userAvatar?: string;
  location?: string;
}

// Birleştirilmiş içerik tipi
type ContentItem = (Post | Video) & { 
  contentType: string;
  thumbnail?: string;
  username: string;
  userAvatar?: string;
  likes: number;
  comments: number;
  timestamp: string;
};

// Video modal için tip
interface VideoModalProps {
  url: string;
  title: string;
}

export default function DiscoverScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoModalProps | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  
  // İçerikleri çek
  useEffect(() => {
    fetchContent();
  }, []);
  
  // İçerikleri çekme fonksiyonu
  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Tüm içerikler getiriliyor...');
      
      // Paralel olarak verileri çek
      const [postsResponse, videosResponse] = await Promise.all([
        postService.getAll(),
        videoService.getAll()
      ]);
      
      console.log('Gönderiler:', postsResponse?.length || 0, 'adet');
      console.log('Videolar:', videosResponse?.length || 0, 'adet');
      
      // Verileri kontrol et ve boş değilse güncelle
      if (Array.isArray(postsResponse)) {
        setPosts(postsResponse);
      } else {
        console.warn('Gönderiler dizisi değil veya boş');
        setPosts([]);
      }
      
      if (Array.isArray(videosResponse)) {
        setVideos(videosResponse);
      } else {
        console.warn('Videolar dizisi değil veya boş');
        setVideos([]);
      }
    } catch (err: any) {
      console.error('İçerik çekme hatası:', err.message);
      setError('İçerikler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Misafir kullanıcıları login'e yönlendirme
  const handleRestrictedAction = () => {
    Alert.alert(
      'Giriş Yapın',
      'Bu özelliği kullanmak için giriş yapmanız gerekiyor.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => router.push('/login' as any) }
      ]
    );
  };
  
  // Tüm içerikleri birleştiren fonksiyon
  const combineContent = (): ContentItem[] => {
    // Postları dönüştür
    const formattedPosts = posts.map(post => {
      // Post verilerini kontrol et ve eksik alanları tamamla
      const postWithDefaults = {
        ...post,
        contentType: 'post',
        username: post.username || (post.user?.username) || 'Kullanıcı',
        userAvatar: post.userAvatar || (post.user?.profilePicture) || '',
        likes: post.likes || 0,
        comments: post.comments || 0,
        timestamp: post.timestamp || post.createdAt || new Date().toISOString()
      };
      
      return postWithDefaults;
    });
    
    // Videoları dönüştür
    const formattedVideos = videos.map(video => {
      // Video verilerini kontrol et ve eksik alanları tamamla
      const videoWithDefaults = {
        ...video,
        contentType: 'video',
        username: video.username || (video.user?.username) || 'Kullanıcı',
        userAvatar: video.userAvatar || (video.user?.profilePicture) || '',
        likes: Array.isArray(video.likes) ? video.likes.length : (typeof video.likes === 'number' ? video.likes : 0),
        comments: Array.isArray(video.comments) ? video.comments.length : (typeof video.comments === 'number' ? video.comments : 0),
        timestamp: video.timestamp || video.createdAt || video.uploadDate || new Date().toISOString(),
        // Video thumbnail'ı için varsayılan değer
        thumbnail: video.thumbnail || 'https://via.placeholder.com/300/CCCCCC/808080?text=Video'
      };
      
      return videoWithDefaults;
    });
    
    // Tüm içerikleri birleştir ve tarihe göre sırala
    const allContent = [...formattedPosts, ...formattedVideos];
    
    console.log('Birleştirilmiş içerik sayısı:', allContent.length);
    
    return allContent.sort((a, b) => {
      const timeA = getTimestamp(a);
      const timeB = getTimestamp(b);
      return timeB - timeA; // Yeniden eskiye sırala
    });
  };
  
  // Farklı tarih alanlarını kontrol et ve varsayılan değer kullan
  const getTimestamp = (item: any): number => {
    const dateStr = item.timestamp || item.createdAt || item.uploadDate;
    return dateStr ? new Date(dateStr).getTime() : 0;
  };
  
  // İçerikleri rastgele boyutlarda göstermek için
  const getItemSize = (index: number) => {
    // Her 5 öğeden biri büyük, her 7 öğeden biri geniş olsun
    if (index % 5 === 0) return 'large';
    if (index % 7 === 0) return 'wide';
    return 'normal';
  };
  
  // Video için tıklama işlevi
  const handleVideoPress = (item: ContentItem) => {
    // Doğrudan IP adresi kullan
    const directIP = 'http://192.168.1.27:5000';
    let videoUrl = '';
    
    if (item.url) {
      videoUrl = item.url.startsWith('http') ? item.url : `${directIP}${item.url}`;
    } else if (item.filename) {
      videoUrl = `${directIP}/uploads/videos/${item.filename}`;
    }
    
    if (videoUrl) {
      setSelectedVideo({
        url: videoUrl,
        title: item.title || 'Video'
      });
      setVideoModalVisible(true);
    } else {
      Alert.alert('Hata', 'Video URL bulunamadı');
    }
  };
  
  // Video oynatma modalı
  const renderVideoModal = () => {
    if (!selectedVideo) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={videoModalVisible}
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <View style={styles.videoModalContainer}>
          <View style={styles.videoModalHeader}>
            <TouchableOpacity 
              onPress={() => setVideoModalVisible(false)}
              style={styles.videoModalCloseButton}
            >
              <IconSymbol name="xmark" size={22} color="#212121" />
            </TouchableOpacity>
            <ThemedText style={styles.videoModalTitle}>{selectedVideo.title}</ThemedText>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.videoContainer}>
            <ExpoVideo
              source={{ uri: selectedVideo.url }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              useNativeControls
              style={styles.video}
              onError={(error) => {
                console.error('Video oynatma hatası:', error);
                Alert.alert(
                  'Video Oynatılamadı',
                  'Video oynatılırken bir hata oluştu. Tekrar denemek ister misiniz?',
                  [
                    { text: 'İptal', style: 'cancel' },
                    { 
                      text: 'Tekrar Dene', 
                      onPress: () => {
                        // Modalı kapatıp tekrar aç (yeniden yükleme etkisi)
                        setVideoModalVisible(false);
                        setTimeout(() => {
                          setVideoModalVisible(true);
                        }, 500);
                      } 
                    }
                  ]
                );
              }}
            />
          </View>
        </View>
      </Modal>
    );
  };
  
  // Ana render fonksiyonu
  return (
    <ThemedView style={styles.container}>
      <View style={styles.discoverHeader}>
        <ThemedText style={styles.discoverTitle}>Keşfet</ThemedText>
        <TouchableOpacity 
          onPress={isLoggedIn ? () => router.push("/videoUpload" as any) : handleRestrictedAction}
          activeOpacity={0.7}
          style={styles.uploadButton}
        >
          <IconSymbol name="plus" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Yükleniyor...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={50} color="#F44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchContent}
          >
            <ThemedText style={styles.retryButtonText}>Tekrar Dene</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {combineContent().length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="photo.on.rectangle.angled" size={50} color="#BDBDBD" />
              <ThemedText style={styles.emptyText}>Henüz içerik yok</ThemedText>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={isLoggedIn ? () => router.push("/videoUpload" as any) : handleRestrictedAction}
              >
                <ThemedText style={styles.emptyButtonText}>İçerik Paylaş</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={combineContent()}
              numColumns={3}
              keyExtractor={(item, index) => `discover-${item._id || item.id || index}`}
              renderItem={({ item, index }) => {
                // Doğrudan IP adresi kullan
                const directIP = 'http://192.168.1.27:5000';
                const itemSize = getItemSize(index);
                
                // İçerik türüne göre görsel URL'si belirle
                let imageUrl = '';
                let isVideo = false;
                
                if (item.contentType === 'video') {
                  isVideo = true;
                  // Video thumbnail'i oluştur
                  imageUrl = item.thumbnail || 'https://via.placeholder.com/300/CCCCCC/808080?text=Video';
                } else if (item.image) {
                  // Post resmi
                  imageUrl = item.image.startsWith('http') ? item.image : `${directIP}${item.image}`;
                } else {
                  // Varsayılan resim
                  imageUrl = 'https://via.placeholder.com/300/EFEFEF/808080?text=FutbolX';
                }
                
                return (
                  <Pressable 
                    style={[styles.gridItem, 
                      itemSize === 'large' && styles.gridItemLarge,
                      itemSize === 'wide' && styles.gridItemWide
                    ]}
                    onPress={() => {
                      if (isVideo) {
                        handleVideoPress(item);
                      } else {
                        isLoggedIn 
                          ? router.push(`/post/${item._id || item.id}` as any) 
                          : handleRestrictedAction();
                      }
                    }}
                  >
                    <Image 
                      source={{ uri: imageUrl }}
                      style={styles.gridItemImage}
                      resizeMode="cover"
                    />
                    
                    {/* İçerik tipi göstergesi */}
                    {isVideo && (
                      <View style={styles.videoIndicator}>
                        <IconSymbol name="play.fill" size={14} color="#FFF" />
                      </View>
                    )}
                    
                    {/* İstatistik göstergesi */}
                    <View style={styles.gridItemOverlay}>
                      <View style={styles.gridItemStats}>
                        <IconSymbol name="heart.fill" size={14} color="#FFF" />
                        <ThemedText style={styles.gridItemStatsText}>
                          {Array.isArray(item.likes) ? item.likes.length : (typeof item.likes === 'number' ? item.likes : 0)}
                        </ThemedText>
                      </View>
                      <View style={styles.gridItemStats}>
                        <IconSymbol name="bubble.right.fill" size={14} color="#FFF" />
                        <ThemedText style={styles.gridItemStatsText}>
                          {Array.isArray(item.comments) ? item.comments.length : (typeof item.comments === 'number' ? item.comments : 0)}
                        </ThemedText>
                      </View>
                    </View>
                    
                    {/* Kullanıcı bilgisi */}
                    <View style={styles.gridItemUserInfo}>
                      <ThemedText style={styles.gridItemUsername} numberOfLines={1}>
                        {item.user?.username || item.username || 'Kullanıcı'}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    fetchContent();
                  }}
                  colors={[primaryColor]}
                />
              }
            />
          )}
        </>
      )}
      
      {renderVideoModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  discoverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  discoverTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
  },
  uploadButton: {
    backgroundColor: primaryColor,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: primaryColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: primaryColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  gridContainer: {
    padding: 1,
  },
  gridItem: {
    flex: 1/3,
    aspectRatio: 1,
    margin: 1,
    backgroundColor: '#EEEEEE',
    position: 'relative',
    overflow: 'hidden',
  },
  gridItemLarge: {
    flex: 2/3,
  },
  gridItemWide: {
    flex: 2/3,
  },
  gridItemImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItemStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  gridItemStatsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gridItemUserInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 6,
  },
  gridItemUsername: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  videoModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  videoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    textAlign: 'center',
  },
  videoModalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 300,
  },
});
