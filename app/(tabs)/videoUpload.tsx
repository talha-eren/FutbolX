import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, Image, Platform, TextInput } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Video, ResizeMode } from 'expo-av';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { videoService } from '@/services/api';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Video tipi tanımı
interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  userId: string;
  username: string;
  createdAt: string;
}

const VideoUploadScreen = () => {
  const [video, setVideo] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Dosya boyutu kontrolü (max 50MB)
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        if (fileInfo.exists && fileInfo.size > 50 * 1024 * 1024) {
          Alert.alert('Dosya çok büyük', 'Lütfen 50MB\'dan küçük bir video seçin');
          return;
        }
        
        setVideo(result.assets[0]);
        console.log('Seçilen video:', result.assets[0]);
      }
    } catch (error) {
      console.error('Video seçme hatası:', error);
      Alert.alert('Hata', 'Video seçilirken bir hata oluştu');
    }
  };

  const uploadVideo = async () => {
    if (!video) {
      Alert.alert('Lütfen bir video seçin');
      return;
    }
    
    if (!title.trim()) {
      Alert.alert('Lütfen bir başlık girin');
      return;
    }
    
    if (!isLoggedIn) {
      Alert.alert('Oturum Gerekli', 'Video yüklemek için giriş yapmalısınız');
      return;
    }
    
    setUploading(true);
    try {
      // FormData oluştur
      const formData = new FormData();
      
      // Video dosyasını ekle
      if (video && video.uri) {
        const videoFile = {
          uri: video.uri,
          name: video.name || `video-${Date.now()}.mp4`,
          type: video.mimeType || 'video/mp4'
        };
        
        // @ts-ignore - React Native'in FormData implementasyonu farklı
        formData.append('video', videoFile);
      } else {
        throw new Error('Video dosyası seçilemedi');
      }
      
      // Diğer bilgileri ekle
      formData.append('title', title);
      formData.append('description', description);
      
      // Video yükleme - api.ts'deki videoService.upload FormData bekliyor
      const response = await videoService.upload(formData);
      console.log('Video yükleme yanıtı:', response);
      
      Alert.alert('Başarılı', 'Video başarıyla yüklendi!');
      setVideo(null);
      setTitle('');
      setDescription('');
      
      // Videoyu listeye ekle
      fetchVideos();
    } catch (err: any) {
      console.error('Video yükleme hatası:', err);
      Alert.alert('Yükleme hatası', err?.message || 'Video yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const fetchVideos = async () => {
    if (!isLoggedIn) return; // Kullanıcı giriş yapmamışsa videoları listeleme
    
    setLoading(true);
    try {
      const data = await videoService.getAll();
      if (data && Array.isArray(data)) {
        setVideos(data);
      } else {
        // Veritabanında video yoksa boş dizi kullan
        setVideos([]);
      }
    } catch (err: any) {
      console.error('Video listeleme hatası:', err);
      Alert.alert('Listeleme hatası', err?.message || 'Videolar yüklenirken bir hata oluştu');
      setVideos([]); // Hata durumunda boş dizi göster
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchVideos();
    }
  }, [isLoggedIn]);

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#388E3C']}
        style={styles.headerGradient}
      >
        <ThemedText style={styles.headerText}>Video Yükle</ThemedText>
      </LinearGradient>
      
      <View style={styles.uploadSection}>
        <TouchableOpacity 
          style={styles.pickButton} 
          onPress={pickVideo}
          activeOpacity={0.8}
          disabled={uploading}
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />
          <ThemedText style={styles.buttonText}>Video Seç</ThemedText>
        </TouchableOpacity>
        
        {video && (
          <View style={styles.selectedFile}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <ThemedText style={styles.selectedText}>Seçilen: {video.name}</ThemedText>
          </View>
        )}
        
        <TextInput
          style={styles.input}
          placeholder="Başlık"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#757575"
          editable={!uploading}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Açıklama"
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={3}
          placeholderTextColor="#757575"
          editable={!uploading}
        />
        
        <TouchableOpacity 
          style={[styles.uploadButton, (!video || uploading) && styles.disabledButton]} 
          onPress={uploadVideo}
          disabled={!video || uploading}
          activeOpacity={0.8}
        >
          <MaterialIcons name="file-upload" size={20} color="#FFFFFF" />
          <ThemedText style={styles.buttonText}>
            {uploading ? 'Yükleniyor...' : 'Yükle'}
          </ThemedText>
        </TouchableOpacity>
        
        {uploading && (
          <ActivityIndicator style={styles.loader} size="large" color="#4CAF50" />
        )}
      </View>
      
      <View style={styles.divider} />
      
      <ThemedText style={styles.sectionTitle}>Videolarım</ThemedText>
      
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
      ) : videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="videocam-off" size={48} color="#BDBDBD" />
          <ThemedText style={styles.emptyText}>Henüz yüklediğiniz video bulunmuyor.</ThemedText>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.videoItem}>
              <View style={styles.videoInfo}>
                <ThemedText style={styles.videoTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.videoDescription} numberOfLines={2}>
                  {item.description}
                </ThemedText>
                <ThemedText style={styles.videoDate}>
                  {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.watchBtn}
                onPress={() => {
                  setSelectedVideoUrl(item.url);
                  setModalVisible(true);
                }}
              >
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <ThemedText style={styles.watchBtnText}>İzle</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          style={styles.videoList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <Modal
        animationType="fade"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {selectedVideoUrl && (
            <Video
              source={{ uri: selectedVideoUrl }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
            />
          )}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              setModalVisible(false);
              setSelectedVideoUrl(null);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#FFFFFF" />
            <ThemedText style={styles.closeButtonText}>Kapat</ThemedText>
          </TouchableOpacity>
        </View>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  uploadSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  selectedText: {
    color: '#388E3C',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    fontSize: 15,
    color: '#212121',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#388E3C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
    opacity: 0.7,
  },
  loader: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginHorizontal: 16,
    marginVertical: 16,
    letterSpacing: 0.3,
  },
  videoList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  videoItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoInfo: {
    flex: 1,
    marginRight: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  videoDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  watchBtn: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  watchBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    position: 'absolute',
    bottom: 40,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  videoPlayer: {
    width: '100%',
    height: '80%',
  },
  videoDate: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
});

export default VideoUploadScreen;
