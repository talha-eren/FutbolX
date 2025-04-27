import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API URL'sini platform bazlı tanımlıyoruz
let API_URL = '';

// Bilgisayarın gerçek IP adresi (ipconfig ile tespit edildi)
const COMPUTER_IP = '192.168.1.27';

// Alternatif IP adresleri (bağlantı sorunları için)
const ALTERNATIVE_IPS = [
  '192.168.1.27',  // Ana IP
  'localhost',     // Localhost
  '10.0.2.2'       // Android emülatör için özel IP
];

// Platform kontrolü yaparak uygun API URL'sini belirle
try {
  if (Platform.OS === 'web') {
    API_URL = 'http://localhost:5000/api'; // Web için localhost
    console.log('Web platformu tespit edildi, localhost kullanılıyor');
  } else if (Platform.OS === 'android') {
    // Android için bilgisayarın gerçek IP adresini kullan
    API_URL = `http://${COMPUTER_IP}:5000/api`;
    console.log(`Android platformu tespit edildi, ${COMPUTER_IP} kullanılıyor`);
  } else if (Platform.OS === 'ios') {
    // iOS için bilgisayarın gerçek IP adresini kullan
    API_URL = `http://${COMPUTER_IP}:5000/api`;
    console.log(`iOS platformu tespit edildi, ${COMPUTER_IP} kullanılıyor`);
  } else {
    // Varsayılan olarak bilgisayarın gerçek IP adresini kullan
    API_URL = `http://${COMPUTER_IP}:5000/api`;
    console.log(`Bilinmeyen platform, varsayılan olarak ${COMPUTER_IP} kullanılıyor`);
  }
} catch (error) {
  // Hata durumunda bilgisayarın gerçek IP adresini kullan
  API_URL = `http://${COMPUTER_IP}:5000/api`;
  console.log('Platform tespiti yapılamadı, varsayılan IP kullanılıyor:', API_URL);
}

// API URL'yi test et ve çalışan bir sunucu bulunamazsa alternatif IP'leri dene
const testApiConnection = async () => {
  for (const ip of ALTERNATIVE_IPS) {
    const testUrl = `http://${ip}:5000/api/health`;
    try {
      console.log(`API bağlantısı test ediliyor: ${testUrl}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(testUrl, { 
        method: 'GET', 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        console.log(`Çalışan API bulundu: ${testUrl}`);
        API_URL = `http://${ip}:5000/api`;
        return true;
      }
    } catch (error) {
      console.log(`${ip} adresine bağlantı başarısız:`, error);
    }
  }
  console.log('Hiçbir API sunucusuna bağlanılamadı, varsayılan adres kullanılacak');
  return false;
};

// Uygulama başladığında API bağlantısını test et
testApiConnection().catch(err => console.error('API bağlantı testi hatası:', err));

console.log('API URL:', API_URL);

// Kimlik doğrulama başlıklarını hazırlayan yardımcı fonksiyon
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// API isteği yapan ve JSON parse hatalarını yöneten genel fonksiyon
const fetchAPI = async (url: string, options: RequestInit = {}) => {
  try {
    console.log(`API isteği gönderiliyor: ${url}`);
    const response = await fetch(url, options);
    
    // Önce yanıtı text olarak al
    const textResponse = await response.text();
    
    // Text yanıtı JSON olarak parse etmeyi dene
    try {
      const jsonData = JSON.parse(textResponse);
      return jsonData;
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      console.error('Sunucu yanıtı:', textResponse);
      throw new Error('Sunucu yanıtı geçerli JSON formatında değil');
    }
  } catch (error) {
    console.error(`API hatası (${url}):`, error);
    throw error;
  }
};

// Örnek veriler - API bağlantısı başarısız olursa kullanılacak
const sampleFields = [
  {
    _id: '1',
    name: 'Yeşil Vadi Halı Saha',
    location: 'Kadıköy, İstanbul',
    price: 350,
    rating: 4.5,
    image: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Hali+Saha',
    availability: 'Müsait'
  },
  {
    _id: '2',
    name: 'Gol Akademi',
    location: 'Beşiktaş, İstanbul',
    price: 400,
    rating: 4.2,
    image: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Hali+Saha',
    availability: 'Dolu'
  },
  {
    _id: '3',
    name: 'Futbol Arena',
    location: 'Ümraniye, İstanbul',
    price: 300,
    rating: 3.8,
    image: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Hali+Saha',
    availability: 'Müsait'
  }
];

const sampleEvents = [
  {
    _id: '1',
    title: 'Dostluk Maçı',
    description: 'Haftalık dostluk maçımıza davetlisiniz',
    location: 'Kadıköy, İstanbul',
    date: '2025-05-01',
    time: '18:00',
    image: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Etkinlik',
    participants: 8,
    maxParticipants: 14
  },
  {
    _id: '2',
    title: 'Amatör Turnuva',
    description: 'Amatör futbolcular için mini turnuva',
    location: 'Beşiktaş, İstanbul',
    date: '2025-05-15',
    time: '16:00',
    image: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Etkinlik',
    participants: 12,
    maxParticipants: 24
  }
];

const samplePosts = [
  {
    _id: '1',
    username: 'futbolcu10',
    userImage: 'https://via.placeholder.com/50/4CAF50/FFFFFF?text=User',
    content: 'Bugün harika bir maç yaptık! #futbol #halısaha',
    image: 'https://via.placeholder.com/300/4CAF50/FFFFFF?text=Post',
    video: null,
    likes: 24,
    comments: 5,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    username: 'teknikdirektor',
    userImage: 'https://via.placeholder.com/50/4CAF50/FFFFFF?text=User',
    content: 'Yeni taktikler üzerinde çalışıyoruz. Yakında paylaşacağım.',
    image: null,
    video: null,
    likes: 18,
    comments: 3,
    createdAt: new Date().toISOString()
  }
];

// Kullanıcı Kimlik Doğrulama Servisleri
export const authService = {
  // Kullanıcı Girişi
  login: async (username: string, password: string) => {
    try {
      console.log(`API isteği gönderiliyor: ${API_URL}/auth/login`);
      console.log('Giriş verileri:', { username, passwordLength: password?.length });
      
      // İsteği göndermeden önce parametreleri kontrol et
      if (!username || !password) {
        console.error('Eksik parametreler:', { username: !!username, password: !!password });
        throw new Error('Kullanıcı adı ve şifre gereklidir');
      }
      
      // Şifre uzunluğunu kontrol et
      if (password.length < 6) {
        console.error('Şifre çok kısa');
        throw new Error('Şifre en az 6 karakter olmalıdır');
      }
      
      // API isteğini gönder
      console.log('Fetch isteği gönderiliyor:', `${API_URL}/auth/login`);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      // Yanıtı işle
      console.log('Yanıt alındı, JSON parse ediliyor');
      const data = await response.json();
      console.log('Sunucu yanıtı:', { 
        status: response.status, 
        ok: response.ok, 
        hasToken: !!data.token,
        hasUser: !!data.user,
        message: data.message || 'Mesaj yok'
      });
      
      if (!response.ok) {
        console.error('Giriş başarısız:', data.message);
        throw new Error(data.message || 'Giriş başarısız');
      }
      
      // Token ve kullanıcı verilerini kontrol et
      if (!data.token || !data.user) {
        console.error('Sunucu geçerli yanıt döndürmedi:', data);
        throw new Error('Sunucudan geçerli kullanıcı bilgileri alınamadı');
      }
      
      console.log('Giriş başarılı, token alındı');
      
      // Token ve kullanıcı bilgileri AuthContext tarafından kaydedilecek
      return data;
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  },

  // Kullanıcı Kaydı
  register: async (username: string, email: string, password: string, name: string) => {
    try {
      console.log(`API isteği gönderiliyor: ${API_URL}/auth/register`);
      console.log('Kayıt verileri:', { username, email, name });
      
      const data = await fetchAPI(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, name })
      });
      console.log('Sunucu yanıtı:', data);
      
      if (data.error) {
        // Daha detaylı hata bilgisi
        console.error('Kayıt başarısız:', data);
        
        // Hata mesajını oluştur
        let errorMessage = data.message || 'Kayıt başarısız';
        
        // MongoDB duplicate key hatasını kontrol et
        if (data.message && data.message.includes('duplicate key')) {
          errorMessage = 'Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor';
        }
        
        // Hata nesnesine ek bilgiler ekle
        const enhancedError = new Error(`Kayıt başarısız: ${data.message || 'Bilinmeyen hata'}`);
        (enhancedError as any).response = { data };
        throw enhancedError;
      }
      
      console.log('Kayıt başarılı, token alındı');
      
      // Token ve kullanıcı bilgileri AuthContext tarafından kaydedilecek
      return data;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  },

  // Çıkış Yap
  logout: async () => {
    try {
      // Token ve kullanıcı bilgilerini temizle
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    }
  }
};

// Halı Saha Servisleri - Burada tanımlama yapılmayacak, aşağıda tanımlanacak

// Etkinlik Servisleri - Aşağıda yeniden tanımlanacak

// Gönderi Servisleri - Aşağıda yeniden tanımlanacak

// Kullanıcı Profil Servisleri
export const userService = {
  // Profil Bilgilerini Getir
  getProfile: async () => {
    try {
      const headers = await getAuthHeaders();
      const data = await fetchAPI(`${API_URL}/users/profile`, {
        method: 'GET',
        headers
      });
      return data;
    } catch (error) {
      console.error('Profil getirme hatası:', error);
      throw error;
    }
  },

  // Profil Bilgilerini Güncelle
  updateProfile: async (profileData: any) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Profil güncellenemedi');
      }
      
      // Güncel kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem('user', JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw error;
    }
  }
};

// Halı saha servisleri
export const fieldService = {
  // Tüm halı sahaları getir
  getFields: async () => {
    try {
      const data = await fetchAPI(`${API_URL}/fields`);
      console.log('Halı sahalar başarıyla alındı:', data);
      return data;
    } catch (error) {
      console.error('Halı saha getirme hatası:', error);
      console.log('Örnek halı saha verileri kullanılıyor');
      return sampleFields;
    }
  },
  
  // ID'ye göre halı saha getir (getFieldById ve getById birleştirildi)
  getById: async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/fields/${id}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Halı saha detaylarını getirme başarısız');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Get field details error:', error);
      // Hata durumunda örnek veri kullanmayı dene
      try {
        const sampleField = sampleFields.find(field => field._id === id);
        if (sampleField) {
          console.log('Örnek halı saha verisi kullanılıyor:', id);
          return sampleField;
        }
      } catch (e) {
        console.error('Örnek veri bulunamadı:', e);
      }
      
      throw new Error(error.message || 'Halı saha detaylarını getirirken bir hata oluştu');
    }
  }
};

export const eventService = {
  // Tüm etkinlikleri getir
  getAll: async () => {
    try {
      console.log('Etkinlikler getiriliyor...');
      const headers = await getAuthHeaders();
      
      // Güvenli fetch işlemi
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout
      
      try {
        const response = await fetch(`${API_URL}/events`, {
          method: 'GET',
          headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Başarılı yanıt kontrolü
        if (!response.ok) {
          console.error(`API hatası: ${response.status} ${response.statusText}`);
          throw new Error(`Etkinlikleri getirme başarısız: ${response.statusText}`);
        }
        
        // Önce response'un içeriğini text olarak al
        const responseText = await response.text();
        
        // Boş yanıt kontrolü
        if (!responseText || responseText.trim() === '') {
          console.log('API boş yanıt döndü, örnek veriler kullanılıyor');
          return sampleEvents;
        }
        
        // JSON parse etmeyi dene
        try {
          const data = JSON.parse(responseText);
          console.log('Etkinlikler başarıyla alındı:', data.length || 'Veri yok');
          return data;
        } catch (parseError) {
          console.error('JSON parse hatası:', responseText.substring(0, 100));
          console.log('Örnek etkinlik verileri kullanılıyor');
          return sampleEvents;
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Get events error:', error);
      // Örnek veriler döndür
      return [
        {
          id: '1',
          title: 'Dostluk Maçı',
          description: 'Haftalık dostluk maçımıza davetlisiniz',
          location: 'Yıldız Halı Saha, Kadıköy',
          date: '28 Nisan 2025',
          time: '19:00',
          image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop',
          participants: 8,
          maxParticipants: 14
        },
        {
          id: '2',
          title: 'Amatör Turnuva',
          description: 'Ödüllü amatör futbol turnuvası',
          location: 'Gol Park, Beyoğlu',
          date: '5 Mayıs 2025',
          time: '16:00',
          image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1364&auto=format&fit=crop',
          participants: 24,
          maxParticipants: 32
        }
      ];
    }
  },
  
  // Etkinlik detaylarını getir
  getById: async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Etkinlik detaylarını getirme başarısız');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Get event details error:', error);
      throw new Error(error.message || 'Etkinlik detaylarını getirirken bir hata oluştu');
    }
  },
};

// Video servisi
export const videoService = {
  // Tüm videoları getir
  getAll: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/videos`, {
        method: 'GET',
        headers
      });
      
      // Önce response'un içeriğini text olarak al
      const responseText = await response.text();
      
      // JSON parse etmeyi dene
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse hatası:', responseText.substring(0, 100));
        throw new Error('Sunucu yanıtı geçerli JSON formatında değil');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Videoları getirme başarısız');
      }
      
      return data;
    } catch (error: any) {
      console.error('Get videos error:', error);
      // Örnek videolar döndür
      return [
        {
          id: '1',
          title: 'Futbol Teknikleri',
          description: 'Bu videoda temel futbol tekniklerini gösteriyorum.',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-dribbling-a-ball-in-a-stadium-42520-large.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1470&auto=format&fit=crop',
          userId: '1',
          username: 'teknikdirektor',
          createdAt: '2025-04-25T12:00:00Z'
        },
        {
          id: '2',
          title: 'Penaltı Atışı Teknikleri',
          description: 'Penaltı atışlarında başarılı olmak için ipucu ve teknikler.',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-soccer-player-scoring-a-goal-42524-large.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1470&auto=format&fit=crop',
          userId: '2',
          username: 'futbolcu23',
          createdAt: '2025-04-26T14:30:00Z'
        }
      ];
    }
  },
  
  // Video yükle
  upload: async (videoData: FormData) => {
    try {
      console.log('Video yükleme isteği gönderiliyor...');
      
      // Token al
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum açık değil, lütfen giriş yapın');
      }
      
      // FormData için özel bir XMLHttpRequest kullan
      return new Promise((resolve, reject) => {
        // XHR oluştur
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/videos/upload`);
        
        // Authorization header'i ekle
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        
        // Yükleme tamamlandığında
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log('Video başarıyla yüklendi:', data);
              resolve(data);
            } catch (e) {
              console.error('JSON parse hatası:', xhr.responseText.substring(0, 100));
              reject(new Error('Sunucu yanıtı geçerli JSON formatında değil'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || 'Video yükleme başarısız'));
            } catch (e) {
              reject(new Error(`HTTP hata kodu: ${xhr.status}`));
            }
          }
        };
        
        // Hata durumunda
        xhr.onerror = function() {
          console.error('XHR hatası');
          reject(new Error('Ağ bağlantısı hatası'));
        };
        
        // Yükleme ilerleme durumu
        xhr.upload.onprogress = function(event) {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            console.log(`Yükleme ilerlemesi: %${percentComplete}`);
          }
        };
        
        // İsteği gönder
        xhr.send(videoData);
      });
    } catch (error: any) {
      console.error('Upload video error:', error);
      throw new Error(error.message || 'Video yüklenirken bir hata oluştu');
    }
  },
  
  // Video detaylarını getir
  getById: async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/videos/${id}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Video detaylarını getirme başarısız');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Get video details error:', error);
      throw new Error(error.message || 'Video detaylarını getirirken bir hata oluştu');
    }
  },
};

// Post servisi (Akış sayfası için)
export const postService = {
  // Tüm gönderileri getir
  getAll: async () => {
    try {
      console.log('Gönderiler getiriliyor...');
      const headers = await getAuthHeaders();
      
      // Güvenli fetch işlemi
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout
      
      try {
        const response = await fetch(`${API_URL}/posts`, {
          method: 'GET',
          headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Başarılı yanıt kontrolü
        if (!response.ok) {
          console.error(`API hatası: ${response.status} ${response.statusText}`);
          throw new Error(`Gönderileri getirme başarısız: ${response.statusText}`);
        }
        
        // Önce response'un içeriğini text olarak al
        const responseText = await response.text();
        
        // Boş yanıt kontrolü
        if (!responseText || responseText.trim() === '') {
          console.log('API boş yanıt döndü, örnek gönderiler kullanılıyor');
          return samplePosts;
        }
        
        // JSON parse etmeyi dene
        try {
          const data = JSON.parse(responseText);
          console.log('Gönderiler başarıyla alındı:', data.length || 'Veri yok');
          return data;
        } catch (parseError) {
          console.error('JSON parse hatası:', responseText.substring(0, 100));
          console.log('Örnek gönderi verileri kullanılıyor');
          return samplePosts;
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Get posts error:', error);
      // Örnek veriler döndür
      return [
        {
          id: '1',
          username: 'futbolcu23',
          userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          content: 'Bugün harika bir maç oldu! Takım olarak mükemmel oynadık.',
          image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=1449&auto=format&fit=crop',
          likes: 24,
          comments: 5,
          timestamp: '2 saat önce',
          tags: ['futbol', 'maç', 'galibiyet'],
          location: 'Yıldız Halı Saha'
        },
        {
          id: '2',
          username: 'teknikdirektor',
          userAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
          content: 'Yeni antrenman programımızı paylaşıyorum. Bu hareketleri günlük rutininize ekleyin!',
          video: 'https://assets.mixkit.co/videos/preview/mixkit-man-training-with-a-soccer-ball-in-a-stadium-42529-large.mp4',
          image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1469&auto=format&fit=crop',
          likes: 56,
          comments: 8,
          timestamp: '5 saat önce',
          tags: ['futbol', 'dostlukmaçı'],
          location: 'Gol Park'
        },
        {
          id: '3',
          username: 'futbolsever',
          userAvatar: 'https://randomuser.me/api/portraits/women/28.jpg',
          content: 'Kadınlar ligi maçından kareler. Mükemmel bir atmosferdi!',
          image: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1470&auto=format&fit=crop',
          likes: 102,
          comments: 14,
          timestamp: '1 gün önce',
          location: 'Kadıköy Stadyumu'
        }
      ];
    }
  },
  
  // Gönderi oluştur
  create: async (postData: any) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gönderi oluşturma başarısız');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Create post error:', error);
      throw new Error(error.message || 'Gönderi oluşturulurken bir hata oluştu');
    }
  },
};
