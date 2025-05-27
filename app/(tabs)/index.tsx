import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
  RefreshControl
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/services/networkConfig';
import { Video, ResizeMode } from 'expo-av';

// NetworkConfig fonksiyonlarını CommonJS require ile import et
const { getImageUrl, getVideoUrl } = require('@/services/networkConfig');

const { width, height } = Dimensions.get('window');

// Gönderi tipi tanımı
interface Post {
  _id: string;
  title: string;
  description: string;
  content: string;
  image?: string;
  video?: string;
  post_type: 'text' | 'image' | 'video';
  contentType: 'text' | 'image' | 'video';
  likes: number;
  comments: number;
  username: string;
  userImage?: string;
  user?: { 
    _id: string;
    username: string;
    profilePicture?: string;
  };
  createdAt: string;
  isPublic: boolean;
}

// Yorum tipi tanımı
interface Comment {
  _id: string;
  contentId: string;
  contentType: 'post' | 'video';
  user: string;
  username: string;
  userImage?: string;
  text: string;
  likes: number;
  createdAt: string;
}

export default function IndexScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = '#4CAF50'; // Yeşil tema
  const cardBgColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const router = useRouter();
  const { token, user } = useAuth();

  // Gönderileri API'den çek
  const fetchPosts = async () => {
    try {
      setError(null);
      
      if (!token) {
        setError('Oturum açmanız gerekiyor');
      return;
    }
    
      const postsUrl = await getApiUrl('/posts');
      console.log('🔗 Posts API URL:', postsUrl);

      const response = await fetch(postsUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Gönderiler yüklenirken hata oluştu: ${response.status}`);
      }

      const data: any = await response.json();
      console.log('✅ Frontend\'e gelen gönderiler:', data.length);
      console.log('📝 İlk 3 gönderi örneği:', data.slice(0, 3).map((p: any) => ({
        id: p._id,
        title: p.title,
        hasImage: !!p.image,
        hasVideo: !!p.video,
        username: p.username,
        contentType: p.contentType
      })));
      
      // Video ve resim URL'lerini kontrol et
      const mediaInfo = data.map((p: any) => ({
        id: p._id,
        imageUrl: p.image ? `http://192.168.1.73:5000${p.image}` : null,
        videoUrl: p.video ? `http://192.168.1.73:5000${p.video}` : null
      })).filter((p: any) => p.imageUrl || p.videoUrl);
      
      console.log('🎬 Medya URL\'leri:', mediaInfo.slice(0, 3));
      
      setPosts(data);
      
    } catch (error) {
      console.error('❌ Gönderiler yüklenirken hata:', error);
      setError('Gönderiler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sayfa yüklendiğinde gönderileri çek
  useEffect(() => {
    fetchPosts();
  }, [token]);

  // Yenileme
  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  // Gönderiyi beğen/beğenmekten vazgeç
  const toggleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (!token) {
        Alert.alert('Hata', 'Oturum açmanız gerekiyor');
        return;
      }

      const endpoint = isLiked ? 'unlike' : 'like';
      const response = await fetch(await getApiUrl(`/posts/${postId}/${endpoint}`), {
        method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Beğeni işlemi başarısız');
      }

      const data: any = await response.json();
      
      // Gönderileri güncelle
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { ...post, likes: data.likes }
            : post
        )
      );

    } catch (error) {
      console.error('Beğeni hatası:', error);
      Alert.alert('Hata', 'Beğeni işlemi sırasında bir hata oluştu');
    }
  };

  // Gönderiyi sil
  const deletePost = async (postId: string) => {
    try {
      if (!token) {
        Alert.alert('Hata', 'Oturum açmanız gerekiyor');
        return;
      }

      Alert.alert(
        'Gönderiyi Sil',
        'Bu gönderiyi silmek istediğinizden emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              const response = await fetch(await getApiUrl(`/posts/${postId}`), {
                method: 'DELETE',
          headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (!response.ok) {
                throw new Error('Gönderi silinirken hata oluştu');
              }

              // Gönderiyi listeden kaldır
              setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
              Alert.alert('Başarılı', 'Gönderi başarıyla silindi');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Gönderi silme hatası:', error);
      Alert.alert('Hata', 'Gönderi silinirken bir hata oluştu');
    }
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      return 'Az önce';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} saat önce`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  // Gönderi kartı render
  const renderPostCard = ({ item }: { item: Post }) => {
    const getImageUrlSafe = (imagePath: string) => {
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      // NetworkConfig'den import edilen fonksiyonu kullan
      return getImageUrl(imagePath);
    };

    const getVideoUrlSafe = (videoPath: string) => {
      if (videoPath.startsWith('http')) {
        return videoPath;
      }
      
      // NetworkConfig'den import edilen fonksiyonu kullan
      const videoItem = { filePath: videoPath };
      const fullUrl = getVideoUrl(videoItem);
      
      console.log('🎬 Video URL oluşturuluyor:');
      console.log('📁 Video path:', videoPath);
      console.log('🔗 Full URL:', fullUrl);
      
      return fullUrl;
    };

      return (
      <View style={[styles.postCard, { backgroundColor: cardBgColor, borderColor }]}>
        {/* Kullanıcı Bilgileri */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              {item.userImage ? (
                <Image source={{ uri: item.userImage }} style={styles.avatarImage} />
              ) : (
                <ThemedText style={styles.avatarText}>
                  {(item.username || 'U').charAt(0).toUpperCase()}
                </ThemedText>
              )}
            </View>
            <View style={styles.userDetails}>
              <ThemedText style={styles.username}>{item.username || 'Kullanıcı'}</ThemedText>
              <ThemedText style={styles.postDate}>{formatDate(item.createdAt)}</ThemedText>
            </View>
          </View>
          
          {/* Silme butonu (sadece kendi gönderileri için) */}
          {user && item.user && item.user._id === user._id && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deletePost(item._id)}
            >
              <IconSymbol name="trash" size={20} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>

        {/* Gönderi İçeriği */}
        {item.title && (
          <ThemedText style={styles.postTitle}>{item.title}</ThemedText>
        )}
        
        {item.description && (
          <ThemedText style={styles.postDescription}>{item.description}</ThemedText>
        )}

        {/* Medya İçeriği - Tam Ekran */}
        {item.image && (
          <TouchableOpacity 
            style={styles.fullScreenImageContainer}
            onPress={() => {
              // Resmi tam ekran göster
              Alert.alert('Resim', 'Tam ekran resim görüntüleme özelliği eklenecek');
            }}
          >
            <Image 
              source={{ uri: getImageUrlSafe(item.image) }} 
              style={styles.fullScreenImage}
              resizeMode="cover"
              onError={(error) => {
                console.log('Resim yükleme hatası:', error.nativeEvent.error);
              }}
            />
          </TouchableOpacity>
        )}

        {/* Video İçeriği - Hata Kontrolü ile */}
        {item.video && (
          <View style={styles.fullScreenVideoContainer}>
            {/* Video formatı kontrolü */}
            {item.video.toLowerCase().includes('.mov') || 
             item.video.toLowerCase().includes('.avi') || 
             item.video.toLowerCase().includes('.wmv') ? (
              <View style={styles.unsupportedVideoContainer}>
                <View style={styles.videoPlaceholder}>
                  <IconSymbol name="play.circle.fill" size={64} color="#4CAF50" />
                  <ThemedText style={styles.videoPlaceholderTitle}>Video Mevcut</ThemedText>
                  <ThemedText style={styles.videoPlaceholderText}>
                    Bu video formatı mobil cihazlarda desteklenmiyor
                  </ThemedText>
                  <ThemedText style={styles.videoFileName}>
                    📁 {item.video?.split('/').pop() || 'video dosyası'}
                  </ThemedText>
                </View>
              </View>
            ) : (
              /* Desteklenen video formatları için oynatıcı */
              <View style={styles.videoPlayerWrapper}>
                <Video
                  source={{ uri: getVideoUrlSafe(item.video) }}
                  style={styles.fullScreenVideo}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                  isLooping={false}
                  onError={(error) => {
                    console.log('❌ Video hatası (sessiz):', error);
                    // Hata mesajını gösterme, sadece log'la
                  }}
                  onLoad={(status: any) => {
                    console.log('✅ Video yüklendi');
                  }}
                  onLoadStart={() => {
                    console.log('🔄 Video yüklenmeye başladı');
                  }}
                  onPlaybackStatusUpdate={(status: any) => {
                    // Hata durumunda sessizce handle et
                    if (status.isLoaded && status.error) {
                      console.log('📹 Video playback error (sessiz):', status.error);
                    }
                  }}
                />
              </View>
            )}
          </View>
        )}

        {/* Alt Bilgiler */}
        <View style={styles.postFooter}>
          {/* Görüntülenme, Beğeni, Yorum Sayıları */}
          <View style={styles.statsContainer}>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => toggleLike(item._id, false)}
            >
              <IconSymbol name="heart" size={20} color="#E91E63" />
              <ThemedText style={styles.statText}>{item.likes}</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => router.push(`/comments/${item._id}` as any)}
            >
              <IconSymbol name="bubble.left" size={20} color="#2196F3" />
              <ThemedText style={styles.statText}>{item.comments}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => {
                Alert.alert('Paylaş', 'Paylaşım özelliği eklenecek');
              }}
            >
              <IconSymbol name="square.and.arrow.up" size={20} color="#4CAF50" />
              <ThemedText style={styles.statText}>Paylaş</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Gönderiler yükleniyor...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#F44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
                <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: primaryColor }]}
            onPress={fetchPosts}
                >
            <ThemedText style={styles.retryButtonText}>Tekrar Dene</ThemedText>
                </TouchableOpacity>
              </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Gönderi Listesi */}
      <FlatList
        data={posts}
        renderItem={renderPostCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.postsContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="photo.on.rectangle" size={64} color={textColor + '40'} />
            <ThemedText style={styles.emptyText}>
              Henüz gönderi bulunmuyor
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postsContainer: {
    paddingTop: 60, // Status bar için üst boşluk
  },
  postCard: {
    backgroundColor: 'white',
    marginBottom: 2, // Kartlar arası minimal boşluk
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0.5,
    minHeight: height * 0.6, // Minimum ekran yüksekliğinin %60'ı
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  fullScreenImageContainer: {
    width: '100%',
    height: height * 0.4, // Ekran yüksekliğinin %40'ı
    marginBottom: 12,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenVideoContainer: {
    width: '100%',
    height: height * 0.4, // Ekran yüksekliğinin %40'ı
    marginBottom: 12,
    backgroundColor: '#000',
  },
  videoPlayerWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  unsupportedVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  videoPlaceholder: {
    alignItems: 'center',
  },
  videoPlaceholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: 'white',
  },
  videoPlaceholderText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    opacity: 0.8,
    color: 'white',
  },
  videoFileName: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
});
