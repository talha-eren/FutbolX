import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, Image, Platform, TextInput, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Video, ResizeMode } from 'expo-av';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { videoService } from '@/services/videoApi';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { API_URL } from '@/services/api';

// Post tipi tanımı
interface Post {
  id?: string;
  _id?: string;
  content: string;
  image?: string | null;
  video?: string | null;
  createdAt?: string;
  timestamp?: string;
  username?: string;
  userImage?: string;
  user?: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  likes?: number;
  contentType: string;
}

const SharePostScreen = () => {
  const [media, setMedia] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { user, isLoggedIn, token } = useAuth();
  const router = useRouter();

  // User tipini any olarak belirleme
  const currentUser = user as any;

  // Görsel seç
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Dosya boyutu kontrolü (max 10MB)
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        const fileSize = (fileInfo as any).size || 0;
        if (fileInfo.exists && fileSize > 10 * 1024 * 1024) {
          Alert.alert('Dosya çok büyük', 'Lütfen 10MB\'dan küçük bir görsel seçin');
          return;
        }
        
        const assetInfo = {
          uri: result.assets[0].uri,
          name: `image-${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: fileSize,
          mimeType: 'image/jpeg'
        };
        
        setMedia(assetInfo as any);
        setMediaType('image');
        console.log('Seçilen görsel:', assetInfo);
      }
    } catch (error) {
      console.error('Görsel seçme hatası:', error);
      Alert.alert('Hata', 'Görsel seçilirken bir hata oluştu');
    }
  };

  // Video seç
  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Dosya boyutu kontrolü (max 50MB)
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        const fileSize = (fileInfo as any).size || 0;
        if (fileInfo.exists && fileSize > 50 * 1024 * 1024) {
          Alert.alert('Dosya çok büyük', 'Lütfen 50MB\'dan küçük bir video seçin');
          return;
        }
        
        setMedia(result.assets[0]);
        setMediaType('video');
        console.log('Seçilen video:', result.assets[0]);
      }
    } catch (error) {
      console.error('Video seçme hatası:', error);
      Alert.alert('Hata', 'Video seçilirken bir hata oluştu');
    }
  };

  // Medyayı temizle
  const clearMedia = () => {
    setMedia(null);
    setMediaType(null);
  };

  // Gönderi paylaş
  const sharePost = async () => {
    if (!content.trim()) {
      Alert.alert('Lütfen açıklama girin', 'Gönderi açıklaması zorunlu bir alandır');
      return;
    }
    
    if (!isLoggedIn) {
      Alert.alert('Oturum Gerekli', 'Gönderi paylaşmak için giriş yapmalısınız');
      return;
    }
    
    setUploading(true);
    
    // Retry mekanizması için sayaç
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptUpload = async () => {
      try {
        // FormData oluştur
        const formData = new FormData();
        
        // İçerik ve tür ekle
        formData.append('content', content);
        formData.append('contentType', mediaType ? (mediaType === 'video' ? 'video' : 'image') : 'text');
        
        // Medya dosyasını ekle (varsa)
        if (media && media.uri) {
          let mediaUri = media.uri;
          if (Platform.OS === 'ios' && mediaUri.startsWith('file://')) {
            mediaUri = mediaUri.replace('file://', '');
          }
          
          const fileName = media.name || `media-${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
          
          // Dosya nesnesini oluştur
          const mediaFile = {
            uri: mediaUri,
            name: fileName,
            type: media.mimeType || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg')
          };
          
          console.log('Medya dosyası hazırlanıyor:', mediaFile);
          
          // @ts-ignore - React Native'in FormData implementasyonu farklı
          formData.append('media', mediaFile);
        }
        
        console.log('FormData hazır, yükleme başlıyor...');
        console.log('API URL:', API_URL);
        
        // İlerleme göstergesi için Alert
        Alert.alert(
          'Yükleniyor',
          'Gönderi yükleniyor, lütfen bekleyin...',
          [],
          { cancelable: false }
        );
        
        // AbortController ile timeout kontrolü
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          throw new Error('Gönderi yükleme zaman aşımına uğradı');
        }, 60000); // 60 saniye timeout (artırıldı)
        
        // Mobil bağlantı için optimize edilmiş hata ayıklama
        console.log('Gönderi paylaşılıyor (mobile-optimized)...');
        console.log('Kullanılan platform:', Platform.OS);
        
        // API adresinin doğru olduğundan emin ol
        const postUrl = `${API_URL}/posts`;
        console.log('POST isteği adresi:', postUrl);
        
        // Gönderi paylaş
        const response = await fetch(postUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error('POST isteği başarısız, durum kodu:', response.status);
          
          // Yanıt içeriğini kontrol et
          const errorText = await response.text();
          console.error('Hata yanıtı:', errorText);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { message: 'Sunucu yanıtı işlenemedi' };
          }
          
          throw new Error(errorData.message || `Gönderi paylaşma hatası (${response.status})`);
        }
        
        // Yanıt içeriğini kontrol et
        const responseText = await response.text();
        let data;
        
        try {
          // Boş yanıt kontrolü
          if (!responseText.trim()) {
            throw new Error('Sunucu boş yanıt döndü');
          }
          
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Yanıt parse hatası:', parseError);
          throw new Error('Sunucu yanıtı işlenemedi. Gönderi paylaşılmış olabilir, lütfen ana sayfayı kontrol edin.');
        }
        
        console.log('Gönderi başarıyla paylaşıldı:', data);
        
        // İlerleme alertı otomatik kapanacak
        
        setUploadSuccess(true);
        Alert.alert(
          'Başarılı', 
          'Gönderi başarıyla paylaşıldı.',
          [
            { 
              text: 'Tamam', 
              onPress: () => {
                // Ana sayfaya yönlendir
                router.replace('/(tabs)');
              }
            }
          ]
        );
        
        // Formu sıfırla
        setMedia(null);
        setMediaType(null);
        setContent('');
        
      } catch (err: any) {
        console.error('Gönderi paylaşma hatası:', err);
        
        // İlerleme alertı otomatik kapanacak
        
        // Network hatası veya timeout mesajlarını kontrol et
        const errorMessage = err.message || '';
        const isNetworkError = 
          errorMessage.includes('Network request failed') || 
          errorMessage.includes('timeout') || 
          errorMessage.includes('zaman aşımı') || 
          errorMessage.includes('connection') ||
          errorMessage.includes('bağlantı') ||
          err.name === 'AbortError';
        
        // MulterError durumunu kontrol et
        const isMulterError = errorMessage.includes('MulterError') || errorMessage.includes('Unexpected field');
        
        // Timeout hatası veya ağ hatası durumunda tekrar dene
        if (isNetworkError && retryCount < maxRetries) {
          retryCount++;
          Alert.alert(
            'Bağlantı Hatası', 
            `Bağlantı zaman aşımına uğradı. Tekrar deneniyor... (${retryCount}/${maxRetries})`,
            [{ text: 'Tamam' }]
          );
          await new Promise(resolve => setTimeout(resolve, 2000)); // Kısa bir bekletme
          return attemptUpload(); // Tekrar dene
        }
        
        // Kullanıcı dostu hata mesajı
        let userMessage = 'Gönderi paylaşılamadı. ';
        
        if (isNetworkError) {
          userMessage += 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
        } else if (isMulterError) {
          userMessage += 'Dosya yükleme hatası. Lütfen farklı bir dosya deneyin veya sadece metin paylaşın.';
        } else {
          userMessage += (err?.message || 'Bilinmeyen bir hata oluştu.');
        }
        
        Alert.alert('Paylaşma hatası', userMessage);
      }
    };
    
    try {
      await attemptUpload();
    } finally {
      setUploading(false);
    }
  };
  
  // Gönderileri çekme fonksiyonu
  const fetchPosts = async () => {
    if (!isLoggedIn || !currentUser) return; // Kullanıcı giriş yapmamışsa veya kullanıcı bilgisi yoksa gönderileri listeleme
    
    setLoading(true);
    try {
      console.log('Gönderiler getiriliyor...');
      
      const userId = currentUser._id || currentUser.id;
      if (!userId) {
        console.error('Kullanıcı ID\'si bulunamadı');
        setPosts([]);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/posts/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Gönderiler alınamadı');
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        console.log(`${data.length} gönderi başarıyla yüklendi`);
        setPosts(data);
      } else {
        // Veritabanında gönderi yoksa boş dizi kullan
        setPosts([]);
      }
    } catch (err: any) {
      console.error('Gönderi listeleme hatası:', err);
      Alert.alert('Listeleme hatası', err?.message || 'Gönderiler yüklenirken bir hata oluştu');
      setPosts([]); // Hata durumunda boş dizi göster
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
    }
  }, [isLoggedIn]);

  // Yükleme başarılı olduysa anasayfaya yönlendir
  useEffect(() => {
    if (uploadSuccess) {
      // Kısa bir gecikme ile yönlendir (Alert'in görüntülenmesi için)
      const timer = setTimeout(() => {
        router.push('/(tabs)');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#388E3C']}
        style={styles.headerGradient}
      >
        <ThemedText style={styles.headerText}>Gönderi Paylaş</ThemedText>
      </LinearGradient>
      
      <ScrollView style={styles.formContainer}>
        <View style={styles.formSection}>
          <ThemedText style={styles.label}>Açıklama (Zorunlu)</ThemedText>
          <TextInput
            style={styles.contentInput}
            placeholder="Gönderiniz hakkında bir şeyler yazın..."
            placeholderTextColor="#999"
            multiline
            value={content}
            onChangeText={setContent}
          />
        </View>
        
        <View style={styles.mediaSection}>
          <ThemedText style={styles.label}>Medya Ekle (İsteğe bağlı)</ThemedText>
          <View style={styles.mediaButtonsRow}>
            <TouchableOpacity 
              style={[styles.mediaButton, mediaType === 'image' ? styles.mediaButtonActive : null]} 
              onPress={pickImage}
              disabled={uploading || mediaType === 'video'}
            >
              <IconSymbol name="photo" size={24} color={mediaType === 'image' ? "#FFFFFF" : "#4CAF50"} />
              <ThemedText style={[styles.mediaButtonText, mediaType === 'image' ? styles.mediaButtonTextActive : null]}>Görsel</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.mediaButton, mediaType === 'video' ? styles.mediaButtonActive : null]} 
              onPress={pickVideo}
              disabled={uploading || mediaType === 'image'}
            >
              <IconSymbol name="video" size={24} color={mediaType === 'video' ? "#FFFFFF" : "#4CAF50"} />
              <ThemedText style={[styles.mediaButtonText, mediaType === 'video' ? styles.mediaButtonTextActive : null]}>Video</ThemedText>
            </TouchableOpacity>
            
            {(mediaType === 'image' || mediaType === 'video') && (
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={clearMedia}
                disabled={uploading}
              >
                <IconSymbol name="trash" size={24} color="#FF5252" />
                <ThemedText style={styles.clearButtonText}>Temizle</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          
          {media && (
            <View style={styles.selectedMedia}>
              <IconSymbol name="checkmark.circle" size={20} color="#4CAF50" />
              <ThemedText style={styles.selectedText}>
                {mediaType === 'image' ? 'Görsel seçildi' : 'Video seçildi'}: {media.name}
              </ThemedText>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.shareButton, (!content.trim()) && styles.disabledButton]}
          onPress={sharePost}
          disabled={uploading || !content.trim()}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <IconSymbol name="arrow.right.square" size={22} color="#FFFFFF" />
              <ThemedText style={styles.shareButtonText}>Gönderiyi Paylaş</ThemedText>
            </>
          )}
        </TouchableOpacity>
        
        <View style={styles.recentPostsSection}>
          <ThemedText style={styles.sectionTitle}>Son Gönderileriniz</ThemedText>
          
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
          ) : posts.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="doc.text" size={48} color="#CCCCCC" />
              <ThemedText style={styles.emptyText}>Henüz gönderi paylaşmadınız</ThemedText>
            </View>
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item) => item._id || item.id || Math.random().toString()}
              renderItem={({ item }) => (
                <View style={styles.postItem}>
                  <View style={styles.postHeader}>
                    <Image 
                      source={{ uri: item.user?.profilePicture || 'https://via.placeholder.com/50' }} 
                      style={styles.userAvatar} 
                    />
                    <View style={styles.postInfo}>
                      <ThemedText style={styles.username}>{item.user?.username || item.username || 'Kullanıcı'}</ThemedText>
                      <ThemedText style={styles.timestamp}>{new Date(item.createdAt || item.timestamp || '').toLocaleDateString()}</ThemedText>
                    </View>
                  </View>
                  
                  <ThemedText style={styles.postContent}>{item.content}</ThemedText>
                  
                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.postImage} />
                  )}
                  
                  {item.video && (
                    <TouchableOpacity 
                      style={styles.videoThumbnail}
                      onPress={() => {
                        setSelectedVideoUrl(item.video || '');
                        setModalVisible(true);
                      }}
                    >
                      <Image 
                        source={{ uri: 'https://via.placeholder.com/300x150?text=Video+Preview' }} 
                        style={styles.videoPlaceholder} 
                      />
                      <View style={styles.playButton}>
                        <IconSymbol name="play.fill" size={32} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
      
      {/* Video Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <IconSymbol name="xmark.circle.fill" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          
          {selectedVideoUrl && (
            <Video
              source={{ uri: selectedVideoUrl }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
            />
          )}
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
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  mediaSection: {
    marginBottom: 24,
  },
  mediaButtonsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  mediaButtonActive: {
    backgroundColor: '#4CAF50',
  },
  mediaButtonText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#4CAF50',
  },
  mediaButtonTextActive: {
    color: '#FFFFFF',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#FF5252',
  },
  selectedMedia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  selectedText: {
    marginLeft: 8,
    flex: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  recentPostsSection: {
    marginTop: 16,
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loader: {
    marginVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    color: '#757575',
    textAlign: 'center',
  },
  postItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postInfo: {
    marginLeft: 12,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
  },
  postContent: {
    marginBottom: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  videoPlayer: {
    width: '100%',
    height: 300,
  },
});

export default SharePostScreen;
