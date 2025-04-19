import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const API_URL = 'http://localhost:5000/api/videos';

export const videoService = {
  upload: async (videoUri, title, description) => {
    const token = await AsyncStorage.getItem('token');
    const formData = new FormData();
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
