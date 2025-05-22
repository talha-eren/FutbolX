import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, Image, Platform, TextInput, ScrollView, Dimensions, KeyboardAvoidingView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Video, ResizeMode } from 'expo-av';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
// @ts-ignore
import networkConfig from '@/services/networkConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '@/components/ui/Card';

// Post tipi tanımı
interface Post {
  id?: string;
  _id?: string;
  content: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string;
  isPublic?: boolean;
  image?: string | null;
  video?: string | null;
  createdAt?: string;
  timestamp?: string;
  username?: string;
  userImage?: string;
  user?: {
    _id: string;
    id: string;
    username: string;
    profilePicture: string;
  };
  likes?: number;
  contentType: string;
  post_type?: string;
}

const SharePostScreen = () => {
  const [media, setMedia] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const { user, isLoggedIn, token, refreshUserData, login } = useAuth();
  const router = useRouter();
  const videoPlayerRef = useRef<Video>(null);

  const API_URL = `http://${networkConfig.MANUAL_BACKEND_IP}:${networkConfig.BACKEND_PORT || 5000}/api`;

  const currentUser = user as any;

  useEffect(() => {
    // Token ve kullanıcı verilerini güncelle
    refreshUserData();
    if (isLoggedIn) {
      fetchPosts();
    }
    
    return () => {
      setTitle('');
      setDescription('');
      setCategory('');
      setTags('');
      setIsPublic(true);
      setMedia(null);
      setMediaType(null);
      setPosts([]);
    };
  }, [isLoggedIn]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        const fileSize = (fileInfo as any).size || 0;
        if (fileInfo.exists && fileSize > 10 * 1024 * 1024) {
          Alert.alert('Dosya Çok Büyük', 'Lütfen 10MB\'dan küçük bir görsel seçin.');
          return;
        }
        
        const assetInfo = {
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || `image-${Date.now()}.jpg`,
          type: result.assets[0].mimeType || 'image/jpeg',
          size: fileSize,
          mimeType: result.assets[0].mimeType || 'image/jpeg',
        };
        
        setMedia(assetInfo as any);
        setMediaType('image');
        console.log('Seçilen görsel:', assetInfo);
      }
    } catch (error) {
      console.error('Görsel seçme hatası:', error);
      Alert.alert('Hata', 'Görsel seçilirken bir hata oluştu.');
    }
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.size && asset.size > 50 * 1024 * 1024) {
          Alert.alert('Dosya Çok Büyük', 'Lütfen 50MB\'dan küçük bir video seçin.');
          return;
        }
        setMedia(asset);
        setMediaType('video');
        console.log('Seçilen video:', asset);
        setPreviewVisible(true);
      }
    } catch (error) {
      console.error('Video seçme hatası:', error);
      Alert.alert('Hata', 'Video seçilirken bir hata oluştu.');
    }
  };

  const clearMedia = () => {
    setMedia(null);
    setMediaType(null);
    setPreviewVisible(false);
  };
  
  const createFormData = () => {
    const formData = new FormData();
    
    // Yeni alanlar eklendi
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('isPublic', isPublic ? 'true' : 'false');
    formData.append('post_type', mediaType || 'text');
    
    if (media && media.uri) {
      let mediaUri = media.uri;
      
      // iOS için file:// önekini kaldır
      if (Platform.OS === 'ios' && mediaUri.startsWith('file://')) {
        mediaUri = mediaUri.substring(7);
      }

      const fileName = media.name || `media-${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
      const fileType = media.mimeType || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg');

      // Medya dosyası için özel nesne oluştur
      const mediaFile = {
        uri: mediaUri,
        name: fileName,
        type: fileType,
      };
      
      // FormData'ya medya ekle (React Native'in FormData implementasyonu için)
      formData.append('file', mediaFile as any);
      
      console.log('Medya dosyası hazırlandı:', {
        uri: mediaUri.substring(0, 30) + '...',
        name: fileName,
        type: fileType,
        size: media.size ? `${Math.round(media.size / 1024)} KB` : 'bilinmiyor'
      });
    }
    
    return formData;
  };

  const sharePost = async () => {
    if (!title.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen bir başlık yazın.');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen bir açıklama yazın.');
      return;
    }
    
    if (!mediaType && !media) {
      Alert.alert('Eksik Bilgi', 'Lütfen bir medya dosyası seçin.');
      return;
    }
    
    if (!isLoggedIn) {
      Alert.alert('Giriş Gerekli', 'Gönderi paylaşmak için giriş yapmanız gerekmektedir.');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    let progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 5, 85));
    }, 300);

    try {
      // Token kontrolü ve yenileme
      await refreshUserData();
      const bearerToken = await getTokenWithBearer();

      if (!bearerToken) {
        clearInterval(progressInterval);
        setUploading(false);
        Alert.alert('Doğrulama Hatası', 'Kimlik doğrulama anahtarı bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }
      
      console.log('Token hazırlandı:', bearerToken.substring(0, 15) + '...');
      
      // Form data oluştur
      const formData = createFormData();
      
      // POST isteği gönder
      const postUrl = `${API_URL}/posts`;
      console.log(`POST isteği: ${postUrl}`);
      
      try {
        console.log('XHR ile yükleme deneniyor...');
        
        // XMLHttpRequest ile yükle (daha güvenilir)
        const xhr = new XMLHttpRequest();
        xhr.open('POST', postUrl);
        
        // Headers ayarla - ÖNEMLİ: Tüm olası token formatlarını dene
        xhr.setRequestHeader('Authorization', bearerToken);
        
        // Token'ı farklı formatlarda da gönder (uyumluluk için)
        // x-auth-token header'ı (Bearer öneksiz)
        const rawToken = bearerToken.replace('Bearer ', '');
        xhr.setRequestHeader('x-auth-token', rawToken);
        
        // x-token header'ı
        xhr.setRequestHeader('x-token', rawToken);
        
        // Token logları
        console.log('Token headerları ayarlandı:');
        console.log('- Authorization:', bearerToken.substring(0, 20) + '...');
        console.log('- x-auth-token:', rawToken.substring(0, 20) + '...');
        
        xhr.onload = function() {
        clearInterval(progressInterval);
        
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('Gönderi başarıyla paylaşıldı:', xhr.responseText);
          
          setUploadProgress(100);
          setUploadSuccess(true);
          Alert.alert('Başarılı', 'Gönderiniz başarıyla paylaşıldı!');
          
          setTitle('');
          setDescription('');
          setCategory('');
          setTags('');
          clearMedia();
          fetchPosts();
          
          setTimeout(() => {
            setUploadSuccess(false);
            router.push('/(tabs)');
          }, 1500);
        } else {
            console.error(`API Hatası (${xhr.status}):`, xhr.responseText);
        
            // Hata mesajını analiz et
            let errorMessage = 'Gönderi paylaşılırken bir hata oluştu';
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              if (errorResponse.message) {
                errorMessage = errorResponse.message;
                
                // Token hatası ise yeniden login olmasını öner
                if (errorMessage.includes('token') || errorMessage.includes('Token') || xhr.status === 401) {
              Alert.alert(
                    'Oturum Hatası', 
                    'Oturumunuz sona ermiş olabilir. Tekrar giriş yapmak ister misiniz?',
                    [
                      {
                        text: 'Hayır',
                        style: 'cancel'
                      },
                      {
                        text: 'Evet',
                        onPress: () => {
                          AsyncStorage.removeItem('token');
                          router.replace('/(auth)/login');
                        }
                      }
                    ]
                  );
                  setUploading(false);
                  setUploadProgress(0);
                  return;
                }
              }
            } catch (e) {
              console.log('Hata yanıtı JSON olarak ayrıştırılamadı');
            }
            
            Alert.alert('Hata', errorMessage);
            setUploading(false);
            setUploadProgress(0);
              }
            };
            
            xhr.onerror = function() {
          clearInterval(progressInterval);
          console.error('XHR Hatası');
          Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanırken bir hata oluştu.');
          setUploading(false);
          setUploadProgress(0);
            };
            
            xhr.upload.onprogress = function(event) {
              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete > 90 ? 90 : percentComplete);
              }
            };
            
        xhr.send(formData);
      } catch (error) {
        clearInterval(progressInterval);
        console.error('Gönderi paylaşma hatası:', error);
        Alert.alert('Hata', 'Gönderi paylaşılırken bir hata oluştu.');
        setUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Gönderi paylaşma hazırlık hatası:', error);
      Alert.alert('Hata', 'Gönderi paylaşmaya hazırlanırken bir hata oluştu.');
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  const fetchPosts = async () => {
    if (!isLoggedIn || !(currentUser?.id || currentUser?._id)) {
      console.log('Kullanıcı giriş yapmamış veya ID yok, gönderiler getirilemiyor.');
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      const userId = currentUser?.id || currentUser?._id;
      if (!userId) {
        console.error('Kullanıcı ID\'si bulunamadı, gönderiler getirilemiyor.');
        setPosts([]);
        setLoading(false);
        Alert.alert('Listeleme Hatası', 'Kullanıcı ID\'si bulunamadı. Lütfen tekrar deneyin.');
        return;
      }
      
      // Token kontrolü ve yenileme
      await refreshUserData();
      const bearerToken = await getTokenWithBearer();

      if (!bearerToken) {
        console.warn('fetchPosts: Token bulunamadı. Tekrar giriş gerekebilir.');
        setPosts([]);
        setLoading(false);
        Alert.alert('Oturum Sorunu', 'Token alınamadı. Lütfen tekrar giriş yapmayı deneyin.');
        return;
      }
      
      console.log(`Kullanıcının (${userId}) gönderileri getiriliyor...`);
      setLoading(true);

      try {
        const response = await fetch(`${API_URL}/posts`, {
        method: 'GET',
        headers: {
            'Authorization': bearerToken,
            'x-auth-token': bearerToken.replace('Bearer ', ''),
            'x-token': bearerToken.replace('Bearer ', ''),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
          const errorText = await response.text();
          console.error(`Gönderiler alınamadı: ${response.status}`, errorText);
          
          // Token hatası ise yeniden login olmasını öner
          if (response.status === 401) {
            Alert.alert(
              'Oturum Hatası', 
              'Oturumunuz sona ermiş olabilir. Tekrar giriş yapmak ister misiniz?',
              [
                {
                  text: 'Hayır',
                  style: 'cancel'
                },
                {
                  text: 'Evet',
                  onPress: () => {
                    AsyncStorage.removeItem('token');
                    router.replace('/(auth)/login');
                  }
                }
              ]
            );
            setPosts([]);
            setLoading(false);
            return;
          }
          
          throw new Error(`Gönderiler alınamadı: ${response.status}`);
      }
      
      const data = await response.json();
      if (data && Array.isArray(data)) {
          const userPosts = data.filter(post => {
            const postUserId = post.user?.id || post.user?._id || post.author;
            return postUserId === userId;
          });
          
          console.log(`Tüm içerikler: ${data.length} adet bulundu`);
          console.log(`${userPosts.length} adet kullanıcıya ait gönderi bulundu.`);
          setPosts(userPosts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      } else {
          console.log('Gönderi bulunamadı veya geçersiz format.');
        setPosts([]);
      }
    } catch (err: any) {
        console.error('Gönderi listeleme API hatası:', err);
        Alert.alert('Listeleme Hatası', 'Gönderiler yüklenirken bir hata oluştu.');
        setPosts([]);
      }
    } catch (err: any) {
      console.error('fetchPosts fonksiyonunda hata:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Kategori seçenekleri
  const categories = [
    { value: 'antrenman', label: 'Antrenman' },
    { value: 'taktik', label: 'Taktik' },
    { value: 'beslenme', label: 'Beslenme' },
    { value: 'ekipman', label: 'Ekipman' },
    { value: 'maç', label: 'Maç' },
    { value: 'diğer', label: 'Diğer' }
  ];

  // Token düzeltme yardımcı fonksiyonu
  const getTokenWithBearer = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return null;
      
      // Token logları - bu durumu debug edelim
      console.log('Ham token alındı:', token.substring(0, 20) + '...');
      
      // Mobil-web uyumsuzluğunu gidermek için token içindeki çift tırnakları temizle
      let cleanToken = token;
      if (token.includes('"')) {
        cleanToken = token.replace(/"/g, '');
        console.log('Token içindeki çift tırnaklar temizlendi');
      }
      
      // Eğer token zaten 'Bearer ' ile başlıyorsa aynen döndür
      if (cleanToken.startsWith('Bearer ')) {
        console.log('Token zaten Bearer öneki içeriyor');
        return cleanToken;
      }
      
      // Değilse 'Bearer ' ekleyip döndür
      const bearerToken = `Bearer ${cleanToken}`;
      console.log('Bearer öneki eklendi:', bearerToken.substring(0, 20) + '...');
      return bearerToken;
    } catch (error) {
      console.error('Token işleme hatası:', error);
      return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
    >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Yeşil arka plan bölümü */}
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.headerGradient}
          >
            <ThemedText style={styles.headerTitle}>Gönderi Paylaş</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Fotoğraf, video veya düşüncelerinizi paylaşın
            </ThemedText>
          </LinearGradient>
          
          <Card style={styles.formCard}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Başlık</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Gönderiniz için bir başlık yazın"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
              />
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Açıklama</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Gönderiniz hakkında açıklama yazın"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Kategori</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Kategori belirtin (ör. Halı Saha, Antrenman)"
                placeholderTextColor="#999"
                value={category}
                onChangeText={setCategory}
              />
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Etiketler</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Virgülle ayırarak etiketler ekleyin"
                placeholderTextColor="#999"
                value={tags}
                onChangeText={setTags}
              />
            </View>
            
            <View style={styles.mediaButtons}>
                <TouchableOpacity 
                style={[styles.mediaButton, mediaType === 'image' && styles.activeMediaButton]}
                onPress={pickImage}
              >
                <IconSymbol name="photo" size={24} color={mediaType === 'image' ? 'white' : '#4CAF50'} />
                <ThemedText style={mediaType === 'image' ? styles.activeMediaButtonText : styles.mediaButtonText}>
                  Fotoğraf
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mediaButton, mediaType === 'video' && styles.activeMediaButton]}
                onPress={pickVideo}
              >
                <IconSymbol name="video" size={24} color={mediaType === 'video' ? 'white' : '#4CAF50'} />
                <ThemedText style={mediaType === 'video' ? styles.activeMediaButtonText : styles.mediaButtonText}>
                  Video
                </ThemedText>
                </TouchableOpacity>
              </View>

            {media && (
              <View style={styles.mediaPreview}>
                <TouchableOpacity style={styles.removeMediaButton} onPress={clearMedia}>
                  <IconSymbol name="xmark.circle.fill" size={24} color="#FF3B30" />
                </TouchableOpacity>

                {mediaType === 'image' && (
                  <Image source={{ uri: media.uri }} style={styles.previewImage} />
                )}

                {mediaType === 'video' && (
                  <TouchableOpacity
                    style={styles.videoPreviewButton}
                    onPress={() => setSelectedVideoUrl(media.uri)}
                  >
                    <Image 
                      source={require('../../assets/images/default-avatar.png')}
                      style={styles.videoThumbnail}
                    />
                    <View style={styles.playButton}>
                      <IconSymbol name="play.fill" size={24} color="white" />
            </View>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            <View style={styles.visibilityContainer}>
              <ThemedText style={styles.visibilityLabel}>Görünürlük:</ThemedText>
              <TouchableOpacity 
                style={[styles.visibilityOption, isPublic && styles.visibilityOptionActive]}
                onPress={() => setIsPublic(true)}
              >
                <IconSymbol 
                  name="globe" 
                  size={18} 
                  color={isPublic ? 'white' : '#4CAF50'} 
                />
                <ThemedText style={isPublic ? styles.visibilityTextActive : styles.visibilityText}>
                  Herkese Açık
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.visibilityOption, !isPublic && styles.visibilityOptionActive]}
                onPress={() => setIsPublic(false)}
              >
                <IconSymbol 
                  name="lock" 
                  size={18} 
                  color={!isPublic ? 'white' : '#4CAF50'} 
                />
                <ThemedText style={!isPublic ? styles.visibilityTextActive : styles.visibilityText}>
                  Sadece Ben
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            {/* Paylaş butonu yukarı taşındı */}
            <TouchableOpacity
              style={[styles.shareButton, { opacity: loading ? 0.7 : 1 }]}
              onPress={sharePost}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <IconSymbol name="square.and.arrow.up" size={20} color="white" />
                  <ThemedText style={styles.shareButtonText}>Paylaş</ThemedText>
                </>
              )}
                </TouchableOpacity>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Video önizleme için modal */}
      <Modal
        visible={!!selectedVideoUrl}
        transparent={true}
        onRequestClose={() => setSelectedVideoUrl(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedVideoUrl(null)}
          >
            <IconSymbol name="xmark.circle.fill" size={30} color="white" />
          </TouchableOpacity>
          {selectedVideoUrl && (
                  <Video
                    ref={videoPlayerRef}
              source={{ uri: selectedVideoUrl }}
              style={styles.videoPlayer}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
              isLooping
              shouldPlay
                  />
                )}
              </View>
      </Modal>
            
      {/* Yükleme durumu modali */}
      <Modal visible={uploading} transparent={true} animationType="fade">
        <View style={styles.uploadingModalContainer}>
          <View style={styles.uploadingModalContent}>
            {uploadSuccess ? (
              <View style={styles.successContainer}>
                <IconSymbol name="checkmark.circle" size={60} color="#4CAF50" />
                <ThemedText style={styles.successText}>Paylaşım Başarılı!</ThemedText>
            <TouchableOpacity
                  style={styles.successButton}
                  onPress={() => {
                    setUploading(false);
                    setUploadSuccess(false);
                    // Formu temizle
                    setTitle('');
                    setDescription('');
                    setCategory('');
                    setTags('');
                    setMedia(null);
                    setMediaType(null);
                    // Gönderileri yenile
                    fetchPosts();
                    // Ana sayfaya yönlendir
                    router.push('/(tabs)');
                  }}
                >
                  <ThemedText style={styles.successButtonText}>Tamam</ThemedText>
                </TouchableOpacity>
                </View>
              ) : (
              <>
                <ActivityIndicator size="large" color="#4CAF50" />
                <ThemedText style={styles.uploadingText}>Gönderiniz yükleniyor...</ThemedText>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${uploadProgress}%` }
                    ]}
                  />
                </View>
                <ThemedText style={styles.progressText}>{uploadProgress}%</ThemedText>
              </>
            )}
          </View>
        </View>
      </Modal>
        </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  formCard: {
    marginTop: -20,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    // Gölgelendirme
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  mediaButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginRight: 10,
  },
  activeMediaButton: {
    backgroundColor: '#4CAF50',
  },
  mediaButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
  },
  activeMediaButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: 'white',
  },
  mediaPreview: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
  },
  videoPreviewButton: {
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  visibilityLabel: {
    marginRight: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  visibilityOptionActive: {
    backgroundColor: '#4CAF50',
  },
  visibilityText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#4CAF50',
  },
  visibilityTextActive: {
    marginLeft: 6,
    fontSize: 12,
    color: 'white',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 999,
  },
  videoPlayer: {
    width: '100%',
    height: 300,
  },
  uploadingModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  uploadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginTop: 15,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 14,
    color: '#555',
  },
  successContainer: {
    alignItems: 'center',
    padding: 10,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 20,
  },
  successButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  successButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SharePostScreen;

