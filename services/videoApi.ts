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
export const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api/videos'
  : 'http://10.192.23.58:5000/api/videos'; // IP adresini backend sunucunuzun IP'si ile değiştirin

export const videoService = {
  upload: async (videoUri: string, title: string, description: string) => {
    const token = await AsyncStorage.getItem('token');
    const formData = new FormData();
    // @ts-ignore - React Native'in FormData implementasyonu standart web FormData'dan farklı
    // ve dosya eklemek için özel bir format kullanıyor
    formData.append('video', {
      uri: videoUri,
      type: 'video/mp4',
      name: `${Date.now()}.mp4`,
    });
    formData.append('title', title);
    formData.append('description', description);

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
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
