import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface VideoComment {
  user: { username: string } | string;
  text: string;
  date: string;
}

export interface VideoMeta {
  _id: string;
  title: string;
  description: string;
  fileId: string;
  user: { username: string };
  likes: string[];
  comments: VideoComment[];
}

// Mobil cihazlar için IP adresi, web için localhost kullan
// Bilgisayarın gerçek IP adresi (ipconfig ile tespit edildi)
const COMPUTER_IP = '192.168.1.27';

export const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api/videos'
  : `http://${COMPUTER_IP}:5000/api/videos`; // Bilgisayarın gerçek IP adresi kullanılıyor

export const videoService = {
  upload: async (videoUri: string, title: string, description: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum açık değil, lütfen giriş yapın');
      }
      
      // FormData oluştur
      const formData = new FormData();
      
      // Video dosyasını ekle
      const videoFile = {
        uri: videoUri,
        type: 'video/mp4',
        name: `video-${Date.now()}.mp4`,
      };
      
      // @ts-ignore - React Native'in FormData implementasyonu standart web FormData'dan farklı
      formData.append('video', videoFile);
      formData.append('title', title);
      formData.append('description', description);

      console.log('Video yükleme isteği gönderiliyor:', { title, description });
      
      // Axios ile yükleme - Content-Type header'i belirtmiyoruz
      const response = await axios.post(`${API_URL}/videos/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type header'i eklemeyin, FormData ile çalışırken sorun çıkarıyor
        },
        // İlerleme durumunu izle
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Yükleme ilerlemesi: %${percentCompleted}`);
          } else {
            console.log(`Yükleme devam ediyor: ${progressEvent.loaded} byte`);
          }
        },
      });
      
      console.log('Video başarıyla yüklendi:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Video yükleme hatası:', error);
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.message || error.message;
        throw new Error(`Video yüklenirken hata: ${errorMsg}`);
      }
      throw error;
    }
  },

  list: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  listByUser: async (userId: string): Promise<VideoMeta[]> => {
    const response = await axios.get(`${API_URL}?user=${userId}`);
    return response.data;
  },

  download: async (fileId: string) => {
    const response = await axios.get(`${API_URL}/download/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  delete: async (videoId: string) => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/${videoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  like: async (videoId: string) => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(`${API_URL}/${videoId}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  comment: async (videoId: string, text: string) => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(`${API_URL}/${videoId}/comment`, { text }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
