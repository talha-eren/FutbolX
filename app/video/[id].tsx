import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '@/constants/Api';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
// formatDistanceToNow ve tr yerine basit bir tarih formatlama kullanacağız
const formatDistanceToNow = (date: Date, options?: any) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'az önce';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} ay önce`;
  return `${Math.floor(diffInSeconds / 31536000)} yıl önce`;
};
import { primaryColor } from '@/constants/Colors';
import CommentSection from '@/components/comments/CommentSection';
import { useAuth } from '@/context/AuthContext';

// Video tipi
type Video = {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  user: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  tags?: string[];
};

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const videoRef = useRef<ExpoVideo>(null);
  const router = useRouter();
  const { isLoggedIn, token, user } = useAuth();

  // Videoyu getir
  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/videos/${id}`);
        setVideo(response.data);
        
        // Kullanıcı giriş yapmışsa, videoyu beğenip beğenmediğini kontrol et
        if (isLoggedIn && user) {
          try {
            const likeResponse = await axios.get(`${API_URL}/videos/${id}/checkLike`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setIsLiked(likeResponse.data.liked);
          } catch (error) {
            console.error('Beğeni durumu kontrol edilemedi:', error);
          }
        }
        
        // Görüntülenme sayısını artır
        try {
          await axios.post(`${API_URL}/videos/${id}/view`);
        } catch (viewError) {
          console.error('Görüntülenme sayısı artırılamadı:', viewError);
        }
      } catch (error) {
        console.error('Video getirme hatası:', error);
        setError('Video yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, isLoggedIn, token, user]);

  // Videoyu beğen/beğenmekten vazgeç
  const handleLikeVideo = async () => {
    if (!isLoggedIn) {
      Alert.alert('Uyarı', 'Videoyu beğenmek için giriş yapmalısınız.');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/videos/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Beğeni durumunu ve sayısını güncelle
      setIsLiked(!isLiked);
      if (video) {
        setVideo({
          ...video,
          likes: isLiked ? video.likes - 1 : video.likes + 1
        });
      }
    } catch (error) {
      console.error('Video beğenme hatası:', error);
      Alert.alert('Hata', 'Video beğenilemedi. Lütfen daha sonra tekrar deneyin.');
    }
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date);
    } catch (error) {
      return 'Bilinmeyen tarih';
    }
  };

  // Yorum eklendiğinde yorum sayısını güncelle
  const handleCommentAdded = () => {
    if (video) {
      setVideo({
        ...video,
        comments: video.comments + 1
      });
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={styles.loadingText}>Video yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !video) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <ThemedText style={styles.errorText}>{error || 'Video bulunamadı.'}</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Geri Dön</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Üst bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {video.title}
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Video oynatıcı */}
        <View style={styles.videoContainer}>
          <ExpoVideo
            ref={videoRef}
            source={{ uri: video.url }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            useNativeControls
            style={styles.video}
          />
        </View>

        {/* Video bilgileri */}
        <View style={styles.videoInfo}>
          <ThemedText style={styles.videoTitle}>{video.title}</ThemedText>
          <View style={styles.statsRow}>
            <ThemedText style={styles.statsText}>
              {video.views} görüntülenme • {formatDate(video.createdAt)}
            </ThemedText>
          </View>

          {/* Etkileşim butonları */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLikeVideo}>
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={isLiked ? "#F44336" : "#757575"} 
              />
              <ThemedText style={styles.actionText}>{video.likes}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setShowComments(!showComments)}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#757575" />
              <ThemedText style={styles.actionText}>{video.comments}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={24} color="#757575" />
              <ThemedText style={styles.actionText}>Paylaş</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Kullanıcı bilgileri */}
          <View style={styles.userInfo}>
            <TouchableOpacity 
              style={styles.userContainer}
              onPress={() => router.push(`/profile/${video.user._id}` as any)}
            >
              <View style={styles.userAvatar}>
                {video.user.profilePicture ? (
                  <Image source={{ uri: video.user.profilePicture }} style={styles.avatarImage} />
                ) : (
                  <ThemedText style={styles.avatarText}>
                    {video.user.username.charAt(0).toUpperCase()}
                  </ThemedText>
                )}
              </View>
              <ThemedText style={styles.username}>{video.user.username}</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Video açıklaması */}
          {video.description && (
            <View style={styles.descriptionContainer}>
              <ThemedText style={styles.descriptionText}>
                {video.description}
              </ThemedText>
            </View>
          )}

          {/* Etiketler */}
          {video.tags && video.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {video.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Yorumlar bölümü */}
        {showComments && (
          <View style={styles.commentsContainer}>
            <CommentSection 
              contentId={video._id} 
              contentType="video" 
              onCommentAdded={handleCommentAdded}
            />
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: primaryColor,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#757575',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#757575',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#757575',
  },
  commentsContainer: {
    borderTopWidth: 8,
    borderTopColor: '#F0F0F0',
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
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    marginBottom: 20,
    textAlign: 'center',
  },
});
