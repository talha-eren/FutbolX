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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.headerText}>Gönderi Paylaş</ThemedText>
          </View>
          
          {/* Form Alanları */}
          <View style={styles.formContainer}>
            {/* Başlık */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Başlık</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Başlık giriniz"
                placeholderTextColor="#888"
                value={title}
                onChangeText={setTitle}
              />
            </View>
            
            {/* Açıklama */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Açıklama</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Açıklama giriniz"
                placeholderTextColor="#888"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>
            
            {/* Kategori */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Kategori</ThemedText>
              <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.categoryItem,
                        category === cat.value && styles.categoryItemSelected
                      ]}
                      onPress={() => setCategory(cat.value)}
                    >
                      <ThemedText 
                        style={[
                          styles.categoryText,
                          category === cat.value && styles.categoryTextSelected
                        ]}
                      >
                        {cat.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            {/* Etiketler */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Etiketler</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Etiketleri virgülle ayırarak giriniz"
                placeholderTextColor="#888"
                value={tags}
                onChangeText={setTags}
              />
            </View>
            
            {/* Yayın Durumu */}
            <View style={styles.inputGroup}>
              <View style={styles.toggleContainer}>
                <ThemedText style={styles.label}>Herkese Açık</ThemedText>
                <TouchableOpacity 
                  style={[styles.toggle, isPublic ? styles.toggleActive : styles.toggleInactive]} 
                  onPress={() => setIsPublic(!isPublic)}
                >
                  <View style={[styles.toggleCircle, isPublic ? styles.toggleCircleRight : styles.toggleCircleLeft]} />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Medya Seçme Butonları */}
            <View style={styles.mediaButtons}>
              <TouchableOpacity 
                style={[styles.mediaButton, mediaType === 'image' ? styles.mediaButtonActive : null]} 
                onPress={pickImage}
              >
                <Ionicons name="image-outline" size={24} color={mediaType === 'image' ? "#3498db" : "#555"} />
                <ThemedText style={styles.mediaButtonText}>Resim</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.mediaButton, mediaType === 'video' ? styles.mediaButtonActive : null]} 
                onPress={pickVideo}
              >
                <Ionicons name="videocam-outline" size={24} color={mediaType === 'video' ? "#3498db" : "#555"} />
                <ThemedText style={styles.mediaButtonText}>Video</ThemedText>
              </TouchableOpacity>
            </View>
            
            {/* Medya Önizleme */}
            {media && (
              <View style={styles.previewContainer}>
                <TouchableOpacity style={styles.clearButton} onPress={clearMedia}>
                  <Ionicons name="close-circle" size={28} color="#ff3b30" />
                </TouchableOpacity>
                
                {mediaType === 'image' ? (
                  <Image source={{ uri: media.uri }} style={styles.mediaPreview} resizeMode="cover" />
                ) : (
                  <Video
                    ref={videoPlayerRef}
                    source={{ uri: media.uri }}
                    style={styles.mediaPreview}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                  />
                )}
              </View>
            )}
            
            {/* Paylaş Butonu */}
            <TouchableOpacity
              style={[
                styles.shareButton,
                (!title.trim() || !description.trim() || !media) ? styles.shareButtonDisabled : null
              ]}
              onPress={sharePost}
              disabled={!title.trim() || !description.trim() || !media || uploading}
            >
              {uploading ? (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <ThemedText style={styles.uploadingText}>Yükleniyor... ({uploadProgress}%)</ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.shareButtonText}>Paylaş</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  categoryItemSelected: {
    backgroundColor: '#3498db',
  },
  categoryText: {
    color: '#333',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 15,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#4cd964',
  },
  toggleInactive: {
    backgroundColor: '#e9e9e9',
  },
  toggleCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: 'white',
  },
  toggleCircleLeft: {
    alignSelf: 'flex-start',
  },
  toggleCircleRight: {
    alignSelf: 'flex-end',
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  mediaButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '45%',
  },
  mediaButtonActive: {
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  mediaButtonText: {
    marginTop: 4,
  },
  previewContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
  },
  shareButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  shareButtonDisabled: {
    backgroundColor: '#b0c4de',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SharePostScreen;

