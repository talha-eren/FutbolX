import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

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

// Sabit IP adresi - Bilgisayarın gerçek IP adresi (ipconfig ile tespit edildi)
const COMPUTER_IP = '192.168.1.27';
const PORT = '5000';

// Tüm olası IP adresleri (sırayla denenecek)
const ALL_POSSIBLE_IPS = [
  COMPUTER_IP,     // Ana IP - öncelikli
  'localhost',     // Localhost
  '127.0.0.1',     // Localhost alternatifi
  '10.0.2.2',      // Android emülatör için özel IP
  '192.168.1.104',  // Alternatif IP
  '192.168.1.100',  // Alternatif IP
];

// Çalışan API URL'yi saklamak için
let WORKING_API_URL = '';

// Varsayılan API URL'yi platform bazlı ayarla
let BASE_API_URL = '';

// Basitleştirilmiş API URL yapılandırması
if (Platform.OS === 'web') {
  BASE_API_URL = 'http://localhost:5000/api';
  console.log('Web platformu için API URL:', BASE_API_URL);
} else {
  // Android ve iOS için bilgisayarın IP adresini kullan
  BASE_API_URL = `http://${COMPUTER_IP}:${PORT}/api`;
  console.log(`${Platform.OS} platformu için API URL:`, BASE_API_URL);
}

// Axios yapılandırması
const axiosInstance = axios.create({
  timeout: 30000, // 30 saniye
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
});

// İstek interceptor'u
axiosInstance.interceptors.request.use(request => {
  console.log('Axios isteği gönderiliyor:', request.url);
  return request;
});

// Yanıt interceptor'u
axiosInstance.interceptors.response.use(
  response => {
    console.log('Axios yanıtı alındı:', response.status);
    return response;
  },
  error => {
    console.error('Axios hatası:', error.message);
    return Promise.reject(error);
  }
);

// Ag baglantisini kontrol eden fonksiyon
async function checkNetworkConnection(): Promise<boolean> {
  try {
    // Timeout icin AbortController kullan
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Basit bir fetch ile baglanti kontrolu
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'no-cors',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.log('Internet baglantisi kontrolunde hata:', error);
    return false;
  }
}

// API URL'yi dışa aktarmak için fonksiyon
export const getApiUrl = () => {
  // Çalışan bir URL varsa onu döndür
  if (WORKING_API_URL) {
    return WORKING_API_URL;
  }
  return BASE_API_URL;
};

// Alternatif URL'leri deneme fonksiyonu
async function findWorkingApiUrl(): Promise<string> {
  console.log('Alternatif API URLleri deneniyor...');
  
  // Calisan bir URL varsa onu dondur
  if (WORKING_API_URL) {
    console.log('Onceden calistigi bilinen URL kullaniliyor:', WORKING_API_URL);
    return WORKING_API_URL;
  }
  
  // Tüm olası IP'leri dene
  for (const ip of ALL_POSSIBLE_IPS) {
    const testUrl = `http://${ip}:${PORT}/api/health`;
    try {
      console.log(`Test ediliyor: ${testUrl}`);
      const response = await axios.get(testUrl, { timeout: 3000 });
      
      if (response.status === 200) {
        const apiUrl = `http://${ip}:${PORT}/api`;
        console.log(`Calisan API URL bulundu: ${apiUrl}`);
        WORKING_API_URL = apiUrl;
        return apiUrl;
      }
    } catch (err) {
      console.log(`${ip} adresine bağlantı başarısız`);
    }
  }
  
  // Hicbir IP calismiyorsa varsayilani dondur
  console.log('Hicbir alternatif URL calismiyor, varsayilan kullaniliyor:', BASE_API_URL);
  return BASE_API_URL;
}

// Axios isteklerini izleme
axios.interceptors.request.use(request => {
  console.log('Axios isteği gönderiliyor:', request.url);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Axios yanıtı alındı:', response.status);
    return response;
  },
  error => {
    console.error('Axios hatası:', error.message);
    return Promise.reject(error);
  }
);

// Video API endpoint'i
export const API_URL = `${BASE_API_URL}/videos`;

export const videoService = {
  upload: async (formData: FormData) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum açık değil, lütfen giriş yapın');
      }

      console.log('Video yükleme isteği gönderiliyor');
      
      // FormData içeriğini kontrol et
      if (formData) {
        try {
          // @ts-ignore
          for (let pair of formData._parts) {
            console.log('FormData içeriği:', pair[0], pair[1] ? 'Veri var' : 'Veri yok');
          }
        } catch (e: any) {
          console.log('FormData içeriği görüntülenemiyor:', e.message);
        }
      }
      
      // Özel headers oluştur
      const headers: any = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        // Content-Type header'i FormData ile otomatik ayarlanacak
      };
      
      // Platform kontrolü
      if (Platform.OS === 'ios') {
        // iOS için özel ayarlar
        console.log('iOS platformu için özel ayarlar yapılıyor');
        
        // iOS'ta FormData'nın doğru şekilde işlenmesi için
        headers['Content-Type'] = 'multipart/form-data';
      }
      
      console.log('API URL:', `${API_URL}/upload`);
      console.log('Headers:', headers);
      
      // Axios ile yükleme - özel ayarlarla
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers,
        timeout: 120000, // 120 saniye (2 dakika)
        maxContentLength: Infinity, // Büyük dosyalar için
        maxBodyLength: Infinity, // Büyük dosyalar için
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
        console.error('Axios hata detayları:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        
        // Ağ hatası için özel mesaj
        if (error.message.includes('Network Error')) {
          throw new Error('Ağ hatası: Lütfen internet bağlantınızı kontrol edin ve bilgisayarınızın mobil cihazınızla aynı ağda olduğundan emin olun.');
        }
        
        throw new Error(`Video yüklenirken hata: ${errorMsg}`);
      }
      throw error;
    }
  },

  list: async () => {
    try {
      // Doğrudan IP adresi kullanarak deneme yap
      const directUrl = `http://192.168.1.27:5000/api/videos`;
      console.log(`List metodu: Doğrudan IP ile deneniyor: ${directUrl}`);
      
      const headers = {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      
      const response = await axios.get(directUrl, {
        timeout: 30000, // 30 saniye
        headers
      });
      
      console.log('List metodu: Videolar başarıyla alındı:', response.data.length || 0, 'video');
      return response.data;
    } catch (error: any) {
      console.error('List metodu hatası:', error.message);
      // Alternatif URL'leri dene
      try {
        return await videoService.tryAlternativeUrls('/videos');
      } catch (altError) {
        console.error('Tüm alternatifler başarısız oldu');
        // Boş dizi döndür, hata fırlatma
        return [];
      }
    }
  },
  
  // Alternatif URL'leri deneme fonksiyonu
  tryAlternativeUrls: async (endpoint: string) => {
    // Alternatif IP adresleri için deneme yap
    for (const ip of ALL_POSSIBLE_IPS) {
      try {
        const alternativeUrl = `http://${ip}:${PORT}/api${endpoint}`;
        console.log(`Alternatif URL deneniyor: ${alternativeUrl}`);
        
        const response = await axios.get(alternativeUrl, {
          timeout: 5000, // Hızlı bağlantı denemesi için kısa timeout
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.status === 200) {
          console.log(`Başarılı bağlantı: ${alternativeUrl}`);
          // Çalışan URL'yi kaydet
          WORKING_API_URL = `http://${ip}:${PORT}/api`;
          return response.data;
        }
      } catch (err) {
        console.log(`${ip} adresine bağlantı başarısız`);
      }
    }
    throw new Error('Hiçbir alternatif URL çalışmıyor');
  },

  // Tum videolari getir (getAll metodu)
  getAll: async () => {
    try {
      // Ag baglantisini kontrol et
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        console.error('Internet baglantisi yok!');
        Alert.alert(
          'Bağlantı Hatası', 
          'İnternet bağlantınızı kontrol edin ve tekrar deneyin.'
        );
        return [];
      }
      
      // Calisan API URL'yi bul
      let apiBaseUrl = WORKING_API_URL || BASE_API_URL;
      
      // Eger daha once calisan bir URL yoksa, calisani bulmaya calis
      if (!WORKING_API_URL) {
        try {
          apiBaseUrl = await findWorkingApiUrl();
          console.log('Calisan API URL bulundu ve kullaniliyor:', apiBaseUrl);
        } catch (err) {
          console.warn('Calisan API URL bulunamadi, varsayilan kullaniliyor');
        }
      }
      
      const token = await AsyncStorage.getItem('token');
      const videosUrl = `${apiBaseUrl}/videos`;
      console.log(`Tum videolari getirme istegi gonderiliyor: ${videosUrl}`);
      
      const headers: any = {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      try {
        // Axios instance kullanarak istek yap
        const response = await axiosInstance.get(videosUrl, {
          headers,
          timeout: 30000 // 30 saniye
        });
        
        console.log('Videolar basariyla alindi:', response.data.length || 0, 'video');
        return response.data;
      } catch (error: any) {
        console.warn(`${videosUrl} ile baglanti basarisiz: ${error.message}`);
        
        // Dogrudan IP adresi kullanarak dene
        const directUrl = `http://${COMPUTER_IP}:${PORT}/api/videos`;
        console.log(`Dogrudan IP ile deneniyor: ${directUrl}`);
        
        try {
          const response = await axiosInstance.get(directUrl, { headers });
          console.log('Dogrudan IP ile videolar alindi:', response.data.length || 0, 'video');
          // Calisan URL'yi kaydet
          WORKING_API_URL = `http://${COMPUTER_IP}:${PORT}/api`;
          return response.data;
        } catch (directError: any) {
          console.warn(`Dogrudan IP ile baglanti basarisiz: ${directError.message}`);
          
          // Son care olarak alternatif URL'leri dene
          console.log('Alternatif URLler deneniyor...');
          try {
            return await videoService.tryAlternativeUrls('/videos');
          } catch (altError) {
            console.error('Tum alternatifler basarisiz oldu');
            throw new Error('Video verileri alinamadi: Sunucuya baglanilamiyor');
          }
        }
      }
    } catch (error: any) {
      console.error('Videolari getirme hatasi:', error.message);
      if (axios.isAxiosError(error)) {
        console.error('Axios hata detaylari:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
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
