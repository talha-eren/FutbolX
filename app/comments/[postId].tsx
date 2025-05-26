import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/services/networkConfig';

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

// Post tipi tanımı
interface Post {
  _id: string;
  user?: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  username: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export default function CommentsScreen() {
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = '#4CAF50';
  const cardBgColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  // Gönderi bilgilerini yükle
  const loadPost = async () => {
    try {
      if (!token) return;
      
      const response = await fetch(await getApiUrl(`/posts/${postId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data: any = await response.json();
        setPost(data);
      }
    } catch (error) {
      console.error('Gönderi yüklenirken hata:', error);
    }
  };

  // Yorumları yükle
  const loadComments = async () => {
    try {
      if (!token) return;
      
      console.log('📝 Yorumlar yükleniyor, postId:', postId);
      
      const response = await fetch(await getApiUrl(`/comments/post/${postId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Yorumlar yüklenemedi');
      }
      
      const data: any = await response.json();
      console.log('✅ Yorumlar yüklendi:', data.length, 'adet yorum');
      
      setComments(data);
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Yorumlar yüklenirken bir hata oluştu');
    }
  };

  // Yorum ekle
  const addComment = async () => {
    if (!newComment.trim() || !token || !user) {
      Alert.alert('Hata', 'Yorum yazmanız gerekiyor');
      return;
    }

    setSubmitting(true);
    try {
      console.log('💬 Yeni yorum ekleniyor:', newComment);
      
      const response = await fetch(await getApiUrl('/comments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contentId: postId,
          contentType: 'post',
          text: newComment
        })
      });

      if (!response.ok) {
        throw new Error('Yorum eklenemedi');
      }

      const data: any = await response.json();
      console.log('✅ Yorum başarıyla eklendi:', data);
      
      // Yeni yorumu listeye ekle (en üste)
      const newCommentObj: Comment = {
        _id: data.comment._id,
        contentId: postId as string,
        contentType: 'post',
        user: user._id || '',
        username: user.username || '',
        userImage: user.profilePicture || '',
        text: newComment,
        likes: 0,
        createdAt: new Date().toISOString()
      };
      
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
      
      // Post'un yorum sayısını güncelle
      if (post) {
        setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
      }
      
    } catch (error) {
      console.error('Yorum eklenirken hata:', error);
      Alert.alert('Hata', 'Yorum eklenirken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadPost(), loadComments()]);
      setLoading(false);
    };
    
    loadData();
  }, [postId, token]);

  // Yenile
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPost(), loadComments()]);
    setRefreshing(false);
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };

  // Avatar oluştur
  const generateAvatar = (username: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const colorIndex = username.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Yorumlar</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Yorumlar yükleniyor...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[primaryColor, '#45a049']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="white" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Yorumlar</ThemedText>
        <ThemedText style={styles.commentCount}>
          {comments.length} yorum
        </ThemedText>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Post Özeti */}
        {post && (
          <View style={[styles.postSummary, { backgroundColor: cardBgColor, borderColor }]}>
            <View style={styles.postHeader}>
              <View style={[styles.avatar, { backgroundColor: generateAvatar(post.username) }]}>
                <ThemedText style={styles.avatarText}>
                  {post.username.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.postInfo}>
                <ThemedText style={styles.username}>{post.username}</ThemedText>
                <ThemedText style={styles.postDate}>{formatDate(post.createdAt)}</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.postContent} numberOfLines={3}>
              {post.content}
            </ThemedText>
          </View>
        )}

        {/* Yorumlar Listesi */}
        <ScrollView
          style={styles.commentsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="bubble.left" size={48} color="#ccc" />
              <ThemedText style={styles.emptyText}>Henüz yorum yok</ThemedText>
              <ThemedText style={styles.emptySubtext}>İlk yorumu sen yap!</ThemedText>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment._id} style={[styles.commentCard, { backgroundColor: cardBgColor, borderColor }]}>
                <View style={styles.commentHeader}>
                  <View style={[styles.commentAvatar, { backgroundColor: generateAvatar(comment.username) }]}>
                    <ThemedText style={styles.commentAvatarText}>
                      {comment.username.charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={styles.commentInfo}>
                    <ThemedText style={styles.commentUsername}>{comment.username}</ThemedText>
                    <ThemedText style={styles.commentDate}>{formatDate(comment.createdAt)}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.commentText}>{comment.text}</ThemedText>
              </View>
            ))
          )}
        </ScrollView>

        {/* Yorum Ekleme */}
        <View style={[styles.addCommentContainer, { backgroundColor: cardBgColor, borderColor }]}>
          <View style={[styles.commentAvatar, { backgroundColor: generateAvatar(user?.username || 'U') }]}>
            <ThemedText style={styles.commentAvatarText}>
              {(user?.username || 'U').charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.commentInput, { color: textColor, borderColor }]}
              placeholder="Yorumunuzu yazın..."
              placeholderTextColor="#999"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: newComment.trim() ? primaryColor : '#ccc' }]}
              onPress={addComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <IconSymbol name="paperplane.fill" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  commentCount: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  postSummary: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  postDate: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.4,
  },
  commentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentInfo: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 1,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 44,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 