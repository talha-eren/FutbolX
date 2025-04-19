import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Button, StyleSheet, Modal, TextInput } from 'react-native';
import { videoService, API_URL, VideoMeta, VideoComment } from '../../services/videoApi';
import VideoPlayer from '../../components/VideoPlayer';

const FeedScreen = () => {
  const [videos, setVideos] = useState<VideoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [comments, setComments] = useState<VideoComment[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const list = await videoService.list();
        setVideos(list);
      } catch (err) {
        Alert.alert('Hata', 'Videolar alınamadı.');
      }
      setLoading(false);
    };
    fetchVideos();
  }, []);

  const renderItem = ({ item }: { item: VideoMeta }) => (
    <View style={styles.videoItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Text style={styles.username}>Yükleyen: {item.user?.username}</Text>
      <Text style={{ color: '#4CAF50', marginBottom: 2 }}> Beğen {item.likes?.length || 0}   Yorum {item.comments?.length || 0}</Text>
      <TouchableOpacity
        style={styles.watchBtn}
        onPress={() => {
          setSelectedVideoUrl(`${API_URL}/download/${item.fileId}`);
          setModalVisible(true);
        }}
      >
        <Text style={styles.watchBtnText}>İzle</Text>
      </TouchableOpacity>
      {/* Sosyal butonlar */}
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn} onPress={async () => {
          try {
            await videoService.like(item._id);
            const fetchVideos = async () => {
              setLoading(true);
              try {
                const list = await videoService.list();
                setVideos(list);
              } catch (err) {
                Alert.alert('Hata', 'Videolar alınamadı.');
              }
              setLoading(false);
            };
            fetchVideos();
          } catch (err) {
            Alert.alert('Hata', 'Beğeni başarısız.');
          }
        }}>
          <Text> Beğen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} onPress={() => {
          setSelectedVideoId(item._id);
          setComments(item.comments || []);
          setCommentModalVisible(true);
        }}>
          <Text> Yorum</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} onPress={async () => {
          Alert.alert('Video Sil', 'Bu videoyu silmek istediğine emin misin?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: async () => {
                try {
                  await videoService.delete(item._id);
                  const fetchVideos = async () => {
                    setLoading(true);
                    try {
                      const list = await videoService.list();
                      setVideos(list);
                    } catch (err) {
                      Alert.alert('Hata', 'Videolar alınamadı.');
                    }
                    setLoading(false);
                  };
                  fetchVideos();
                } catch (err) {
                  Alert.alert('Hata', 'Video silinemedi veya yetkiniz yok.');
                }
              }
            }
          ]);
        }}>
          <Text> Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ana Akış - Tüm Videolar</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
      {/* Video izleme modalı */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          {selectedVideoUrl && <VideoPlayer uri={selectedVideoUrl} />}
          <Button title="Kapat" onPress={() => setModalVisible(false)} color="#fff" />
        </View>
      </Modal>
      {/* Yorum modalı */}
      <Modal visible={commentModalVisible} animationType="slide" onRequestClose={() => setCommentModalVisible(false)}>
        <View style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Yorumlar</Text>
          <FlatList
            data={comments}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>{typeof item.user === 'string' ? item.user : item.user?.username}</Text>
                <Text>{item.text}</Text>
                <Text style={{ color: '#888', fontSize: 12 }}>{new Date(item.date).toLocaleString('tr-TR')}</Text>
              </View>
            )}
            style={{ marginBottom: 16 }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 4 }}>Yorum ekle:</Text>
              <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 4 }}>
                <TextInput
                  style={{ minHeight: 32 }}
                  onChangeText={setCommentText}
                  value={commentText}
                  multiline
                  placeholder="Yorum yaz..."
                />
              </View>
            </View>
            <Button
              title="Gönder"
              onPress={async () => {
                if (!commentText.trim() || !selectedVideoId) return;
                try {
                  await videoService.comment(selectedVideoId, commentText);
                  setCommentText('');
                  setCommentModalVisible(false);
                  const fetchVideos = async () => {
                    setLoading(true);
                    try {
                      const list = await videoService.list();
                      setVideos(list);
                    } catch (err) {
                      Alert.alert('Hata', 'Videolar alınamadı.');
                    }
                    setLoading(false);
                  };
                  fetchVideos();
                } catch (err) {
                  Alert.alert('Hata', 'Yorum eklenemedi.');
                }
              }}
              color="#4CAF50"
            />
          </View>
          <Button title="Kapat" onPress={() => setCommentModalVisible(false)} color="#888" />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  videoItem: { marginBottom: 28, padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 10 },
  title: { fontWeight: 'bold', fontSize: 16 },
  username: { color: '#888', fontSize: 12, marginBottom: 8 },
  watchBtn: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 6, marginTop: 8, alignSelf: 'flex-start' },
  watchBtnText: { color: '#fff' },
  socialRow: { flexDirection: 'row', marginTop: 10 },
  socialBtn: { marginRight: 18 },
});

export default FeedScreen;
