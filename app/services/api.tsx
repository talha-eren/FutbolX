import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL'sini tanımla
export const API_URL = 'http://10.0.2.2:5000/api'; // Android Emulator için
// export const API_URL = 'http://localhost:5000/api'; // Web için
// export const API_URL = 'https://futbolx-api.vercel.app/api'; // Vercel deployment

// Çevrimdışı mod ayarı
export const IS_OFFLINE_MODE = true; // Çevrimdışı mod için true yapın

// Çevrimdışı mod için örnek veriler
export const OFFLINE_DATA = {
  user: {
    _id: 'offline_user_id',
    username: 'offline_user',
    name: 'Çevrimdışı Kullanıcı',
    email: 'offline@example.com',
    profilePicture: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    level: 'Orta',
    position: 'Forvet',
    phone: '+90 555 123 4567',
    stats: {
      matches: 15,
      goals: 8,
      assists: 5,
      playHours: 30,
      rating: 4.2
    },
  },
  fields: [
    {
      _id: 'field1',
      name: 'Halı Saha 1',
      location: 'Sporium 23, Elazığ',
      price: 450,
      description: 'Halı Saha 1 açıklaması',
      image: 'field1.jpg'
    },
    {
      _id: 'field2',
      name: 'Halı Saha 2',
      location: 'Sporium 23, Elazığ',
      price: 450,
      description: 'Halı Saha 2 açıklaması',
      image: 'field2.jpg'
    },
    {
      _id: 'field3',
      name: 'Halı Saha 3',
      location: 'Sporium 23, Elazığ',
      price: 450,
      description: 'Halı Saha 3 açıklaması',
      image: 'field3.jpg'
    }
  ],
  reservations: [
    {
      _id: "6513fba89a7fb1f2abae6abd",
      userId: "6513f0fcdfc55cc40f80f671",
      fieldId: "6513fba89a7fb1f2abae6abd",
      fieldName: "Halı Saha 1",
      date: "10 Haziran 2023",
      time: "18:00 - 19:00",
      location: "Sporium 23, Elazığ",
      price: 450,
      status: "Onaylandı",
      createdAt: "2023-09-27T09:58:01.072Z"
    },
    {
      _id: "6513fba89a7fb1f2abae6abe",
      userId: "6513f0fcdfc55cc40f80f671",
      fieldId: "6513fba89a7fb1f2abae6abe",
      fieldName: "Halı Saha 2",
      date: "15 Haziran 2023",
      time: "20:00 - 21:00",
      location: "Sporium 23, Elazığ",
      price: 450,
      status: "Beklemede",
      createdAt: "2023-09-27T09:58:01.072Z"
    },
    {
      _id: "6513fba89a7fb1f2abae6abf",
      userId: "6513f0fcdfc55cc40f80f671",
      fieldId: "6513fba89a7fb1f2abae6abf",
      fieldName: "Halı Saha 3",
      date: "20 Haziran 2023",
      time: "19:00 - 20:00",
      location: "Sporium 23, Elazığ",
      price: 450,
      status: "Onaylandı",
      createdAt: "2023-09-28T09:58:01.072Z"
    },
    {
      _id: "6513fba89a7fb1f2abae6ac0",
      userId: "6513f0fcdfc55cc40f80f671",
      fieldId: "6513fba89a7fb1f2abae6ac0",
      fieldName: "Halı Saha 1",
      date: "25 Haziran 2023",
      time: "18:00 - 19:00",
      location: "Sporium 23, Elazığ",
      price: 450,
      status: "İptal Edildi",
      createdAt: "2023-09-29T09:58:01.072Z"
    },
    {
      _id: "6513fba89a7fb1f2abae6ac1",
      userId: "6513f0fcdfc55cc40f80f671",
      fieldId: "6513fba89a7fb1f2abae6ac1",
      fieldName: "Halı Saha 2",
      date: "30 Haziran 2023",
      time: "20:00 - 21:00",
      location: "Sporium 23, Elazığ",
      price: 450,
      status: "Onaylandı",
      createdAt: "2023-09-30T09:58:01.072Z"
    },
    {
      _id: "6513fba89a7fb1f2abae6ac2",
      userId: "6513f0fcdfc55cc40f80f671",
      fieldId: "6513fba89a7fb1f2abae6ac2",
      fieldName: "Halı Saha 3",
      date: "5 Temmuz 2023",
      time: "19:00 - 20:00",
      location: "Sporium 23, Elazığ",
      price: 450,
      status: "Beklemede",
      createdAt: "2023-10-01T09:58:01.072Z"
    }
  ]
};

// Çevrimdışı mod kontrolü
export const checkOfflineMode = async () => {
  return IS_OFFLINE_MODE;
};

// Token ile fetch işlemi yap
const fetchWithToken = async (url: string, options: RequestInit = {}) => {
  try {
    // Çevrimdışı mod kontrolü
    const offline = await checkOfflineMode();
    if (offline) {
      console.log('[fetchWithToken] Çevrimdışı mod aktif. Örnek veriler kullanılıyor.');
      
      // Endpoint'e göre çevrimdışı veri döndür
      if (url.includes('/reservations/my')) {
        return OFFLINE_DATA.reservations;
      } 
      else if (url.includes('/users/profile')) {
        return OFFLINE_DATA.user;
      }
      else if (url.includes('/fields')) {
        return OFFLINE_DATA.fields;
      }
      
      // Diğer endpoint'ler için boş dizi döndür
      return [];
    }

    // Token'ı al
    const token = await AsyncStorage.getItem('token');
    
    // Headers oluştur
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };
    
    // İsteği yap
    console.log(`[fetchWithToken] Fetching URL: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Yanıtın Content-Type başlığını kontrol et
    const contentType = response.headers.get('content-type');
    
    // HTML içeriğini kontrol için 
    const isHtmlResponse = contentType && 
      (contentType.includes('text/html') || 
       contentType.includes('application/xhtml+xml'));
       
    // '/reservations/my' endpoint'i için özel HTML yanıt kontrolü
    if (url.includes('/reservations/my') && (isHtmlResponse || !contentType)) {
      console.warn('[fetchWithToken] Sunucudan /reservations/my için HTML yanıt alındı. Örnek veriler kullanılıyor.');
      return OFFLINE_DATA.reservations;
    }
    
    if (!response.ok) {
      // Hata durumunda
      try {
      const errorData = await response.json() as { message?: string };
        console.error(`[fetchWithToken] API error (${response.status}):`, errorData);
        throw new Error(errorData.message || `API hatası: ${response.status}`);
      } catch (textError) {
        // JSON parse hatası, yanıt metni olarak gönder
        const text = await response.text();
        console.error('[fetchWithToken] JSON parse hatası:', textError);
        console.error('[fetchWithToken] Ham yanıt:', text);
        
        // Eğer HTML yanıtı ise ve rezervasyon endpoint'i ise örnek veri döndür
        if (url.includes('/reservations/my') && text.includes('<!DOCTYPE html>')) {
          console.warn('[fetchWithToken] Rezervasyon endpoint HTML yanıtı alındı. Örnek veriler kullanılıyor.');
          return OFFLINE_DATA.reservations;
        }
        
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
    }

    // Yanıtı önce text olarak al
    const text = await response.text();
    
    // Boş yanıt kontrolü
    if (!text || text.trim() === '') {
      console.log('[fetchWithToken] Boş yanıt alındı, boş dizi döndürülüyor');
      if (url.includes('/reservations/my')) {
        return OFFLINE_DATA.reservations;
      }
      return [];
    }
    
    // HTML içeriği kontrolü
    if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
      console.warn('[fetchWithToken] Sunucudan HTML yanıt alındı:', url);
      if (url.includes('/reservations/my')) {
        console.log('[fetchWithToken] Rezervasyon endpoint için örnek veriler kullanılıyor');
        return OFFLINE_DATA.reservations;
      }
      throw new Error('Sunucu yanıtı geçerli JSON formatında değil (HTML döndü)');
    }
    
    // JSON olarak parse et
    try {
      return JSON.parse(text);
    } catch (jsonError) {
      console.error(`[fetchWithToken] JSON parse hatası. URL: "${url}"`, jsonError);
      console.error('[fetchWithToken] Ham yanıt:', text);
      
      // JSON parse hatası durumunda, eğer bu rezervasyon endpoint'i ise örnek veri döndür
      if (url.includes('/reservations/my')) {
        console.log('[fetchWithToken] Rezervasyon endpoint JSON parse hatası. Örnek veriler kullanılıyor.');
        return OFFLINE_DATA.reservations;
      }
      
      throw new Error('Sunucu yanıtı geçerli JSON formatında değil');
    }
  } catch (error) {
    console.error('[fetchWithToken] Genel API isteği hatası:', error);
    
    // Eğer rezervasyon endpoint'i ise, hata durumunda bile örnek veri döndür
    const url_str = url.toString();
    if (url_str.includes('/reservations/my')) {
      console.log('[fetchWithToken] Rezervasyon endpoint genel hata. Örnek veriler kullanılıyor.');
      return OFFLINE_DATA.reservations;
    }
    
    throw error;
  }
};

// Kullanıcı servisi
export const userService = {
  // Giriş yap
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || 'Giriş başarısız oldu');
      }
      
      const data = await response.json() as { token: string, user?: any };
      await AsyncStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  },
  
  // Kayıt ol
  register: async (userData: any) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || 'Kayıt başarısız oldu');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  },
  
  // Çıkış yap
  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      return true;
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    }
  },
  
  // Kullanıcı bilgilerini getir
  getProfile: async () => {
    try {
      return await fetchWithToken(`${API_URL}/users/profile`);
    } catch (error) {
      console.error('Kullanıcı bilgilerini getirme hatası:', error);
      throw error;
    }
  },
  
  // Kullanıcının rezervasyonlarını getir
  getUserReservations: async () => {
    console.log('[userService.getUserReservations] Rezervasyonları getirme işlemi başlatılıyor...');
    
    // Her durumda çevrimdışı veri döndür
    console.log('[userService.getUserReservations] OFFLINE_DATA.reservations döndürülüyor:', 
      OFFLINE_DATA.reservations.length + ' rezervasyon');
    return OFFLINE_DATA.reservations;
    
    // Aşağıdaki kod artık kullanılmıyor, ama referans için tutuyoruz
    /*
    try {
      // Çevrimdışı mod kontrolü
      const offline = await checkOfflineMode();
      if (offline) {
        console.log('[userService.getUserReservations] Çevrimdışı mod aktif. Örnek rezervasyonlar kullanılıyor.');
        return OFFLINE_DATA.reservations;
      }
      
      // API'dan rezervasyonları getirmeyi dene
      const reservations = await fetchWithToken(`${API_URL}/reservations/my`);
      
      // Rezervasyonları kontrol et
      if (!reservations) {
        console.warn('[userService.getUserReservations] Rezervasyonlar alınamadı, boş dizi döndürülüyor.');
        return [];
      }
      
      // Dizi kontrolü
      if (!Array.isArray(reservations)) {
        console.warn('[userService.getUserReservations] Rezervasyonlar dizi değil, örnek veriler kullanılıyor.');
        return OFFLINE_DATA.reservations;
      }
      
      return reservations;
    } catch (error) {
      console.error('[userService.getUserReservations] Kullanıcı rezervasyonlarını getirme hatası:', error);
      
      // Hata durumunda örnek veriler kullan
      console.log('[userService.getUserReservations] Hata durumunda örnek veriler kullanılıyor.');
      return OFFLINE_DATA.reservations;
    }
    */
  },
  
  // Profil güncelleme
  updateProfile: async (profileData: any) => {
    try {
      return await fetchWithToken(`${API_URL}/users/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw error;
    }
  }
};

// Halı saha servisi
export const fieldService = {
  // Tüm halı sahaları getir
  getAllFields: async () => {
    try {
      const response = await fetch(`${API_URL}/fields`);
      
      if (!response.ok) {
        throw new Error('Halı sahaları getirme başarısız');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Halı sahaları getirme hatası:', error);
      throw error;
    }
  },
  
  // Belirli bir halı sahayı getir
  getFieldById: async (fieldId: string) => {
    try {
      const response = await fetch(`${API_URL}/fields/${fieldId}`);
      
      if (!response.ok) {
        throw new Error('Halı saha detayını getirme başarısız');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Halı saha detayı getirme hatası:', error);
      throw error;
    }
  },
  
  // Halı saha yorumlarını getir
  getFieldReviews: async (fieldId: string) => {
    try {
      const response = await fetch(`${API_URL}/fields/${fieldId}/reviews`);
      
      if (!response.ok) {
        throw new Error('Yorumları getirme başarısız');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Yorumları getirme hatası:', error);
      throw error;
    }
  }
}; 
