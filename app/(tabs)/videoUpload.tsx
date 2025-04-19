import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { videoService } from '../services/videoApi';
import VideoPlayer from '../../components/VideoPlayer';
import { Modal } from 'react-native';

const VideoUploadScreen = () => {
  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideo(result.assets[0]);
    }
  };

  const uploadVideo = async () => {
    if (!video) {
      Alert.alert('Lütfen bir video seçin');
      return;
    }
    setLoading(true);
    try {
      await videoService.upload(video.uri, title, description);
      Alert.alert('Video başarıyla yüklendi!');
      setVideo(null);
      setTitle('');
      setDescription('');
      fetchVideos();
    } catch (err) {
      Alert.alert('Yükleme hatası', err.message);
    }
    setLoading(false);
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const list = await videoService.list();
      setVideos(list);
    } catch (err) {
      Alert.alert('Listeleme hatası', err.message);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Video Yükle</Text>
      <Button title="Video Seç" onPress={pickVideo} />
      {video && <Text style={styles.selected}>Seçilen: {video.name}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Başlık"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Açıklama"
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Yükle" onPress={uploadVideo} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="#4CAF50" />}
      <Text style={styles.header}>Yüklenen Videolar</Text>
      <FlatList
        data={videos}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.videoItem}>
            <Text style={styles.videoTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
            <TouchableOpacity
              onPress={async () => {
                setLoading(true);
                try {
                  // Video dosyasının URL'sini oluştur
                  const url = `${videoService.API_URL}/download/${item.fileId}`;
                  setSelectedVideoUrl(url);
                  setModalVisible(true);
                } catch (err) {
                  Alert.alert('Video alınamadı', err.message);
                }
                setLoading(false);
              }}
              style={styles.watchBtn}
            >
              <Text style={styles.watchBtnText}>İzle</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      {/* Video izleme modali */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          {selectedVideoUrl && <VideoPlayer uri={selectedVideoUrl} />}
          <Button title="Kapat" onPress={() => setModalVisible(false)} color="#fff" />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginVertical: 16 },
  selected: { color: 'green', marginVertical: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginVertical: 8 },
  videoItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  videoTitle: { fontWeight: 'bold' },
  watchBtn: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 6, marginTop: 6, alignSelf: 'flex-start' },
  watchBtnText: { color: '#fff' },
});

export default VideoUploadScreen;
