import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL
export const API_URL = 'https://api.futbolx.app';

// Video meta verileri
export interface VideoMeta {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  userId: string;
  createdAt: string;
  duration?: number;
  views?: number;
  likes?: number;
}

// Video servisi
export const videoService = {
  // Kullanıcının videolarını getir
  listByUser: async (userId: string): Promise<VideoMeta[]> => {
    try {
      // Örnek video verileri
      return [
        {
          id: '1',
          title: 'Gol Vuruşu',
          description: 'Müthiş bir gol vuruşu antrenmanda',
          url: 'https://example.com/video1.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377',
          userId: userId,
          createdAt: new Date().toISOString(),
          duration: 120,
          views: 156,
          likes: 42
        },
        {
          id: '2',
          title: 'Pas Çalışması',
          description: 'Takım arkadaşlarımla pas çalışması',
          url: 'https://example.com/video2.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68',
          userId: userId,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          duration: 95,
          views: 89,
          likes: 18
        }
      ];
    } catch (error) {
      console.error('Video listesi getirme hatası:', error);
      return [];
    }
  },
  
  // Video detaylarını getir
  getById: async (videoId: string): Promise<VideoMeta | null> => {
    try {
      // Örnek video detayları
      return {
        id: videoId,
        title: 'Gol Vuruşu',
        description: 'Müthiş bir gol vuruşu antrenmanda',
        url: 'https://example.com/video1.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377',
        userId: 'user123',
        createdAt: new Date().toISOString(),
        duration: 120,
        views: 156,
        likes: 42
      };
    } catch (error) {
      console.error('Video detayı getirme hatası:', error);
      return null;
    }
  }
};

// Default export for the videoApi module
export default videoService; 