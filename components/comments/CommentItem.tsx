import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
// Basit tarih formatlama fonksiyonu
const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'az önce';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} ay önce`;
  return `${Math.floor(diffInSeconds / 31536000)} yıl önce`;
};

// Comment tipi
type Comment = {
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

type CommentItemProps = {
  comment: Comment;
  onLike: () => void;
  onDelete: () => void;
};

const CommentItem: React.FC<CommentItemProps> = ({ comment, onLike, onDelete }) => {
  const { user } = useAuth();
  
  // Yorumun tarihini formatla
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date);
    } catch (error) {
      return 'Bilinmeyen tarih';
    }
  };

  // Kullanıcı avatarı için ilk harfi al
  const getInitial = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  return (
    <View style={styles.container}>
      {/* Kullanıcı avatarı */}
      <View style={styles.avatarContainer}>
        {comment.userImage ? (
          <Image source={{ uri: comment.userImage }} style={styles.avatar} />
        ) : (
          <View style={styles.initialAvatar}>
            <ThemedText style={styles.initialText}>{getInitial(comment.username)}</ThemedText>
          </View>
        )}
      </View>

      {/* Yorum içeriği */}
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.username}>{comment.username}</ThemedText>
          <ThemedText style={styles.date}>{formatDate(comment.createdAt)}</ThemedText>
        </View>

        <ThemedText style={styles.commentText}>{comment.text}</ThemedText>

        {/* Yorum aksiyonları */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={onLike}>
            <Ionicons name="heart-outline" size={18} color="#757575" />
            <ThemedText style={styles.actionText}>{comment.likes}</ThemedText>
          </TouchableOpacity>

          {/* Kullanıcı kendi yorumunu silebilir */}
          {user && user.id === comment.user && (
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={18} color="#757575" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  initialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
});

export default CommentItem;
