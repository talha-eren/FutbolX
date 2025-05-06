import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '@/constants/Api';
import { useAuth } from '@/context/AuthContext';
import CommentItem from './CommentItem';
import { primaryColor } from '@/constants/Colors';

// Yorum tipi
export type Comment = {
  _id: string;
  contentId: string;
  contentType: 'post' | 'video';
  user: string;
  username: string;
  userImage?: string;
  text: string;
  likes: number;
  createdAt: string;
};

type CommentSectionProps = {
  contentId: string;
  contentType: 'post' | 'video';
  onCommentAdded?: () => void;
};

const CommentSection: React.FC<CommentSectionProps> = ({ contentId, contentType, onCommentAdded }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isLoggedIn, token, user } = useAuth();

  // Yorumları getir
  const fetchComments = async () => {
    if (!contentId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/comments/${contentType}/${contentId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Yorumları getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde yorumları getir
  useEffect(() => {
    fetchComments();
  }, [contentId, contentType]);

  // Yorum gönder
  const handleSubmitComment = async () => {
    if (!isLoggedIn) {
      Alert.alert('Uyarı', 'Yorum yapabilmek için giriş yapmalısınız.');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_URL}/comments`,
        {
          contentId,
          contentType,
          text: newComment.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Yeni yorumu listeye ekle
      setComments([response.data, ...comments]);
      setNewComment('');
      
      // Yorum eklendiğinde callback'i çağır
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Yorum gönderme hatası:', error);
      Alert.alert('Hata', 'Yorumunuz gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Yorumu beğen
  const handleLikeComment = async (commentId: string) => {
    if (!isLoggedIn) {
      Alert.alert('Uyarı', 'Beğenmek için giriş yapmalısınız.');
      return;
    }

    try {
      await axios.put(
        `${API_URL}/comments/like/${commentId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Beğeni sayısını güncelle
      setComments(comments.map(comment => 
        comment._id === commentId 
          ? { ...comment, likes: comment.likes + 1 } 
          : comment
      ));
    } catch (error) {
      console.error('Yorum beğenme hatası:', error);
    }
  };

  // Yorumu sil
  const handleDeleteComment = async (commentId: string, userId: string) => {
    if (!isLoggedIn) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/comments/${commentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Yorumu listeden kaldır
      setComments(comments.filter(comment => comment._id !== commentId));
      
      // Yorum silindiğinde callback'i çağır
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Yorum silme hatası:', error);
      Alert.alert('Hata', 'Yorum silinemedi. Lütfen daha sonra tekrar deneyin.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Yorumlar</ThemedText>
      
      {/* Yorum yazma alanı */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Yorumunuzu yazın..."
          placeholderTextColor="#999"
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            (!newComment.trim() || submitting) && styles.sendButtonDisabled
          ]} 
          onPress={handleSubmitComment}
          disabled={!newComment.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Yorumlar listesi */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : comments.length > 0 ? (
        <FlatList
          data={comments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <CommentItem 
              comment={item} 
              onLike={() => handleLikeComment(item._id)}
              onDelete={() => handleDeleteComment(item._id, item.user)}
            />
          )}
          contentContainerStyle={styles.commentsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            Henüz yorum yok. İlk yorumu sen yap!
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 50,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F9F9F9',
    color: '#333',
  },
  sendButton: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: primaryColor,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#AAAAAA',
  },
  commentsList: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default CommentSection;
