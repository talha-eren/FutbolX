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

const { width } = Dimensions.get('window');

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

export default function ExploreScreen() {
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
    const getImageUrl = (imagePath: string) => {
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      // API base URL ile birleştir - networkConfig'den al
      return `http://${process.env.EXPO_PUBLIC_BACKEND_IP || '192.168.1.73'}:${process.env.EXPO_PUBLIC_BACKEND_PORT || '5000'}${imagePath}`;
    };

    const getVideoUrl = (videoPath: string) => {
      if (videoPath.startsWith('http')) {
        return videoPath;
      }
      
      // Veritabanında video path'ler /public/uploads/videos/ formatında
      const baseUrl = `http://${process.env.EXPO_PUBLIC_BACKEND_IP || '192.168.1.73'}:${process.env.EXPO_PUBLIC_BACKEND_PORT || '5000'}`;

      // Eğer path zaten / ile başlıyorsa direkt ekle, yoksa / ekle
      const fullUrl = videoPath.startsWith('/') ? baseUrl + videoPath : baseUrl + '/' + videoPath;
      
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
          
          {/* Video Etiketi */}
          {item.video && (
            <View style={styles.videoTag}>
              <ThemedText style={styles.videoTagText}>Video</ThemedText>
            </View>
          )}
        
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

        {/* Medya İçeriği */}
        {item.image && (
          <Image 
            source={{ uri: getImageUrl(item.image) }} 
            style={styles.postImage}
            resizeMode="cover"
            onError={(error) => {
              console.log('Resim yükleme hatası:', error.nativeEvent.error);
            }}
          />
        )}

        {/* Video İçeriği */}
        {item.video && (
          <View style={styles.videoContainer}>
            {/* MOV dosyası uyarısı ve alternatif gösterim */}
            {item.video.toLowerCase().includes('.mov') ? (
              <View style={styles.movWarningContainer}>
                <View style={styles.movWarningHeader}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FF9800" />
                  <ThemedText style={styles.movWarningTitle}>MOV Video Dosyası</ThemedText>
                </View>
                <ThemedText style={styles.movWarningText}>
                  Bu video MOV formatında olduğu için mobil cihazlarda oynatılamayabilir.
                </ThemedText>
                <ThemedText style={styles.videoPathText}>
                  📁 Dosya: {item.video.split('/').pop() || 'video dosyası'}
          </ThemedText>
              <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => {
                    if (item.video) {
                      const videoUrl = getVideoUrl(item.video);
                      Alert.alert(
                        'Video İndirme', 
                        `Bu videoyu indirmek için aşağıdaki URL'yi kullanabilirsiniz:\n\n${videoUrl}`,
                        [
                          { text: 'Tamam', style: 'default' },
                          { 
                            text: 'URL Kopyala', 
                            onPress: () => {
                              // URL'yi clipboard'a kopyalama burada yapılabilir
                              console.log('Video URL kopyalandı:', videoUrl);
                            }
                          }
                        ]
                      );
                    }
                  }}
                >
                  <IconSymbol name="arrow.down.circle" size={20} color="white" />
                  <ThemedText style={styles.downloadButtonText}>Video URL'si Al</ThemedText>
              </TouchableOpacity>
        </View>
      ) : (
              /* Normal video oynatıcı - MP4 ve diğer desteklenen formatlar için */
              <View style={styles.videoPlayerContainer}>
                <Video
                  source={{ uri: getVideoUrl(item.video) }}
                  style={styles.postVideo}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                  isLooping={false}
                  onError={(error) => {
                    console.log('❌ Video yükleme hatası:', error);
                    if (item.video) {
                      const videoUrl = getVideoUrl(item.video);
                      console.log('🔗 Hatalı video URL:', videoUrl);
                      Alert.alert('Video Hatası', `Video oynatılamadı!\n\nDosya: ${item.video.split('/').pop() || 'video dosyası'}\n\nHata: Video formatı desteklenmiyor olabilir.`);
                    }
                  }}
                  onLoad={(status: any) => {
                    console.log('✅ Video yüklendi:', status);
                  }}
                  onLoadStart={() => {
                    console.log('🔄 Video yüklenmeye başladı:', item.video);
                  }}
                  onPlaybackStatusUpdate={(status: any) => {
                    if (status.isLoaded && status.error) {
                      console.log('📹 Video playback error:', status.error);
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
            <View style={styles.statItem}>
              <IconSymbol name="eye" size={16} color="#666" />
              <ThemedText style={styles.statText}>2</ThemedText>
            </View>
            
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => toggleLike(item._id, false)}
            >
              <IconSymbol name="heart" size={16} color="#666" />
              <ThemedText style={styles.statText}>{item.likes}</ThemedText>
            </TouchableOpacity>
            
              <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push(`/comments/${item._id}` as any)}
            >
              <IconSymbol name="bubble.left" size={16} color="#666" />
              <ThemedText style={styles.statText}>{item.comments}</ThemedText>
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
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#66BB6A']}
        style={styles.header}
      >
        {/* Logo ve Başlık */}
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <ThemedText style={styles.logoIcon}>⚽</ThemedText>
            <ThemedText style={styles.logoText}>FutbolX</ThemedText>
          </View>
        </View>
        
        {/* Keşfet Başlığı ve Gönderi Sayısı */}
        <View style={styles.exploreHeader}>
          <ThemedText style={styles.exploreTitle}>Keşfet</ThemedText>
          <ThemedText style={styles.exploreSubtitle}>
            Futbol topluluğundan son paylaşımlar ({posts.length} gönderi)
          </ThemedText>
        </View>
        
        {/* Gönderi Paylaş Butonu */}
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => router.push('/(tabs)/sharePost')}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color="white" />
          <ThemedText style={styles.shareButtonText}>Gönderi Paylaş</ThemedText>
        </TouchableOpacity>
      </LinearGradient>

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
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  exploreHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  exploreTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  exploreSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  shareButton: {
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: 'white',
  },
  postsContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  postCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
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
  postImage: {
    width: '100%',
    height: 200,
    marginBottom: 12,
  },
  videoContainer: {
    width: '100%',
    height: 250,
    marginBottom: 12,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  postVideo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  videoTag: {
    padding: 4,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 4,
    marginRight: 8,
  },
  videoTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
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
  movWarningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 8,
  },
  movWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  movWarningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#FF9800',
  },
  movWarningText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    opacity: 0.8,
  },
  videoPathText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
    opacity: 0.7,
  },
  downloadButton: {
    padding: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  videoPlayerContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  videoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoInfoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
});
