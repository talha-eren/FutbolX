import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API URL'sini platform bazlı tanımlıyoruz
export let API_URL = '';
export let IS_OFFLINE_MODE = false;

// Bilgisayarın gerçek IP adresi (ipconfig ile tespit edildi)
const COMPUTER_IP = '192.168.1.27';

// Backend portu
const BACKEND_PORT = 5000;

// Alternatif IP adresleri (bağlantı sorunları için)
const ALTERNATIVE_IPS = [
  '10.0.2.2',        // Android emülatör için özel IP
  '192.168.1.27',    // Ana IP
  '192.168.1.49',    // Expo log'undan tespit edilen IP (Metro sunucusu IP'si)
  'localhost',       // Localhost
  '127.0.0.1',       // Localhost alternatifi
  '192.168.1.1',     // Router IP'si
  '192.168.0.1',     // Alternatif router IP'si
];

// Platforma göre API URL'sini belirle
try {
  // Önce Expo Metro sunucusunun IP'sini almaya çalış - bu genellikle en iyi çözümdür
  // Bu IP, telefonun ve bilgisayarın aynı ağda olduğunu varsayar
  const METRO_IP = '192.168.1.49'; // Expo loglarında görünen IP
  
  if (Platform.OS === 'android') {
    // Android emülatör için özel IP kullan
    API_URL = `http://10.0.2.2:${BACKEND_PORT}/api`;
    console.log(`Android emülatör tespit edildi, 10.0.2.2 IP kullanılıyor`);
  } else if (Platform.OS === 'ios') {
    // iOS için Metro IP'sini kullan
    API_URL = `http://${METRO_IP}:${BACKEND_PORT}/api`;
    console.log(`iOS platformu tespit edildi, Metro IP kullanılıyor: ${METRO_IP}`);
  } else if (Platform.OS === 'web') {
    // Web için localhost
    API_URL = `http://localhost:${BACKEND_PORT}/api`;
    console.log('Web platformu tespit edildi, localhost kullanılıyor');
  } else {
    // Diğer tüm platformlar için varsayılan IP
    API_URL = `http://${COMPUTER_IP}:${BACKEND_PORT}/api`;
    console.log(`Bilinmeyen platform, varsayılan olarak ${COMPUTER_IP} kullanılıyor`);
  }
} catch (error) {
  // Hata durumunda bilgisayarın gerçek IP adresini kullan
  API_URL = `http://${COMPUTER_IP}:${BACKEND_PORT}/api`;
  console.log('Platform tespiti yapılamadı, varsayılan IP kullanılıyor:', API_URL);
}

// Çevrimdışı mod için örnek veriler
export const OFFLINE_DATA = {
  user: {
    _id: "offline-user-id",
    username: "test_user",
    email: "test@example.com",
    name: "Test Kullanıcı",
    profilePicture: "https://via.placeholder.com/150",
    level: "Orta",
    position: "Forvet",
    stats: {
      matches: 15,
      goals: 8,
      assists: 5,
      playHours: 30,
      rating: 4.2
    },
    isAdmin: false
  },
  posts: [
    {
      _id: "offline-post-1",
      content: "Bugün harika bir antrenman yaptık!",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1470&auto=format&fit=crop",
      user: {
        _id: "offline-user-id",
        username: "test_user",
        profilePicture: "https://via.placeholder.com/150"
      },
      likes: 12,
      comments: 3,
      createdAt: new Date().toISOString()
    },
    {
      _id: "offline-post-2",
      content: "Yeni ayakkabılarım ile ilk maç",
      image: "https://images.unsplash.com/photo-1542541864-c0e546f4b689?q=80&w=1470&auto=format&fit=crop",
      user: {
        _id: "offline-user-id",
        username: "test_user",
        profilePicture: "https://via.placeholder.com/150"
      },
      likes: 8,
      comments: 1,
      createdAt: new Date(Date.now() - 86400000).toISOString() // 1 gün önce
    }
  ],
  fields: [
    {
      _id: "offline-field-1",
      id: "offline-field-1",
      fieldName: "Yeşil Vadi Halı Saha",
      location: "Kadıköy, İstanbul",
      rating: 4.7,
      price: 600,
      image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop",
      availability: "Müsait"
    },
    {
      _id: "offline-field-2",
      id: "offline-field-2",
      fieldName: "Galatasaray Futbol Akademisi",
      location: "Florya, İstanbul",
      rating: 4.8,
      price: 800,
      image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1470&auto=format&fit=crop",
      availability: "Müsait"
    }
  ],
  matches: [
    {
      _id: "offline-match-1",
      id: "offline-match-1",
      fieldName: "Yeşil Vadi Halı Saha",
      location: "Kadıköy, İstanbul",
      date: new Date().toLocaleDateString(),
      time: "19:00",
      price: 60,
      organizer: {
        _id: "offline-user-id",
        username: "test_user",
        profilePicture: "https://via.placeholder.com/150"
      },
      playersJoined: 6,
      totalPlayers: 10,
      level: "Orta",
      image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1471&auto=format&fit=crop",
      isPrivate: false
    }
  ]
};

// API URL'yi test et ve çalışan bir sunucu bulunamazsa alternatif IP'leri dene
const testApiConnection = async () => {
  console.log(`Platform: ${Platform.OS}, API bağlantı testi başlatılıyor...`);
  
  // Öncelikle AsyncStorage'dan son çalışan API URL'sini kontrol et
  try {
    const lastWorkingApi = await AsyncStorage.getItem('lastWorkingApiUrl');
    if (lastWorkingApi) {
      console.log(`Son çalışan API URL: ${lastWorkingApi}, önce bunu deniyorum`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 saniye timeout
      
      try {
        const response = await fetch(`${lastWorkingApi}/health`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`Son çalışan API tekrar doğrulandı: ${lastWorkingApi}`);
          API_URL = lastWorkingApi;
          IS_OFFLINE_MODE = false;
          return true;
        }
      } catch (error) {
        console.log('Son çalışan API artık çalışmıyor:', error);
      }
    }
  } catch (error) {
    console.log('AsyncStorage hatası:', error);
  }
  
  // Metro IP'sini önce dene
  const METRO_IP = '192.168.1.49'; // Expo loglarından
  console.log(`Önce Metro IP adresi deneniyor: ${METRO_IP}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(`http://${METRO_IP}:${BACKEND_PORT}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log(`Metro IP ile bağlantı başarılı: ${METRO_IP}`);
      API_URL = `http://${METRO_IP}:${BACKEND_PORT}/api`;
      await AsyncStorage.setItem('lastWorkingApiUrl', API_URL);
      IS_OFFLINE_MODE = false;
      return true;
    }
  } catch (error) {
    console.log(`Metro IP (${METRO_IP}) bağlantısı başarısız:`, error);
  }
  
  // Platform bazlı test sıralaması
  let testIps = [...ALTERNATIVE_IPS];
  
  // Android için özel sıralama
  if (Platform.OS === 'android') {
    testIps = ['10.0.2.2', ...testIps.filter(ip => ip !== '10.0.2.2')];
    console.log('Android için özel IP sıralaması kullanılıyor:', testIps);
  }
  
  // iOS için özel sıralama
  if (Platform.OS === 'ios') {
    testIps = [METRO_IP, COMPUTER_IP, ...testIps.filter(ip => ip !== METRO_IP && ip !== COMPUTER_IP)];
    console.log('iOS için özel IP sıralaması kullanılıyor:', testIps);
  }
  
  let successfulUrl = null;
  
  for (const ip of testIps) {
    const testUrl = `http://${ip}:${BACKEND_PORT}/api/health`;
    try {
      console.log(`API bağlantısı test ediliyor: ${testUrl}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(testUrl, { 
        method: 'GET', 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`Çalışan API bulundu: ${testUrl}`);
        successfulUrl = `http://${ip}:${BACKEND_PORT}/api`;
        API_URL = successfulUrl;
        
        // Başarılı API URL'sini kaydet
        try {
          await AsyncStorage.setItem('lastWorkingApiUrl', successfulUrl);
          console.log('Çalışan API URL kaydedildi:', successfulUrl);
        } catch (storageError) {
          console.log('API URL kaydedilemedi:', storageError);
        }
        
        IS_OFFLINE_MODE = false;
        break;
      }
    } catch (error) {
      console.log(`${ip} adresine bağlantı başarısız:`, error);
    }
  }
  
  if (successfulUrl) {
    console.log(`API URL başarıyla ayarlandı: ${successfulUrl}`);
    IS_OFFLINE_MODE = false;
    return true;
  } else {
    console.log('Hiçbir API sunucusuna bağlanılamadı, çevrimdışı mod etkinleştiriliyor');
    
    // Varsayılan IP'yi platform bazlı ayarla
    if (Platform.OS === 'android') {
      API_URL = `http://10.0.2.2:${BACKEND_PORT}/api`; // Android emülatör için
    } else if (Platform.OS === 'ios') {
      API_URL = `http://${METRO_IP}:${BACKEND_PORT}/api`; // iOS için
    } else {
      API_URL = `http://${COMPUTER_IP}:${BACKEND_PORT}/api`; // Diğer platformlar için
    }
    
    console.log(`${Platform.OS} için varsayılan olarak şu IP kullanılacak (çevrimdışı mod): ${API_URL}`);
    
    IS_OFFLINE_MODE = true;
  return false;
  }
};

// Çevrimdışı modu kontrol etme
export const checkOfflineMode = async () => {
  // Sunucuya ping at
  try {
    console.log('Çevrimdışı mod kontrolü yapılıyor...');
    console.log('Kontrol için kullanılan API URL:', API_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout süresini 8 saniyeye çıkardık
    
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        // Önbelleği devre dışı bırak
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('API sunucusu çalışıyor, çevrimiçi mod aktif');
        IS_OFFLINE_MODE = false;
        return false;
      } else {
        console.log('API sunucusu yanıt verdi ama durum kodu başarısız:', response.status);
        // Alternatif IP'leri tekrar dene
        const connectionResult = await testApiConnection();
        IS_OFFLINE_MODE = !connectionResult;
        return !connectionResult;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.log('API bağlantı hatası:', error);
      
      // API test ile alternatif IP'leri dene
      console.log('Alternatif IP adreslerini deniyorum...');
      const connectionResult = await testApiConnection();
      
      IS_OFFLINE_MODE = !connectionResult;
      return !connectionResult;
    }
  } catch (error) {
    console.log('Sunucu bağlantısı yok, çevrimdışı mod etkinleştirildi');
    IS_OFFLINE_MODE = true;
    return true;
  }
};

// Uygulama başladığında API bağlantısını test et
testApiConnection().catch(err => {
  console.error('API bağlantı testi hatası:', err);
  IS_OFFLINE_MODE = true;
});

// Çevrimdışı mod kontrolünü günlük olarak çağırıyoruz
// Sadece açık uygulamada 15 dakikada bir kontrol ediyoruz
setInterval(async () => {
  if (IS_OFFLINE_MODE) {
    console.log('Çevrimdışı mod kontrolü yapılıyor (otomatik)...');
    const isStillOffline = await checkOfflineMode();
    if (!isStillOffline) {
      console.log('Bağlantı geri geldi, çevrimiçi moda geçiliyor...');
    }
  }
}, 15 * 60 * 1000); // 15 dakika

// Uygulama her aktif olduğunda API bağlantısını tekrar kontrol edelim
// AppState kullanılarak yapılabilir - burada örnek gösterim, entegrasyonu gerekir
// import { AppState } from 'react-native';
// AppState.addEventListener('change', (nextAppState) => {
//   if (nextAppState === 'active') {
//     testApiConnection().catch(console.error);
//   }
// });

console.log('API URL:', API_URL);
console.log(`${Platform.OS} platformu için API URL: ${API_URL}`);

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
  register: async (username: string, email: string, password: string, name: string, profileData?: any) => {
    try {
      console.log(`API isteği gönderiliyor: ${API_URL}/auth/register`);
      console.log('Kayıt verileri:', { username, email, name, profileData });
      
      // Profil bilgilerini ekle
      const registerData = {
        username,
        email,
        password,
        name,
        location: profileData?.location || '',
        level: profileData?.level || '',
        position: profileData?.position || '',
        footPreference: profileData?.footPreference || '',
        bio: profileData?.bio || '',
        stats: profileData?.stats || {
          matches: 0,
          goals: 0,
          assists: 0,
          playHours: 0,
          rating: 0
        }
      };
      
      const data = await fetchAPI(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
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
      
      console.log('Profil güncelleniyor:', profileData);
      
      // Önce token kontrolü yapalım
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      }
      
      // stats alanı için özel işlem yapalım
      const updatedData = { ...profileData };
      
      // İsteği yapalım
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedData)
      });

      // Önce response'un içeriğini text olarak al
      const responseText = await response.text();
      
      // Boş yanıt kontrolü
      if (!responseText || responseText.trim() === '') {
        throw new Error('Sunucudan yanıt alınamadı');
      }
      
      // JSON parse etmeyi dene
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse hatası:', responseText.substring(0, 100));
        throw new Error('Sunucu yanıtı geçerli JSON formatında değil');
      }
      
      if (!response.ok) {
        console.error('Profil güncelleme başarısız:', data.message || response.statusText);
        throw new Error(data.message || 'Profil güncellenemedi');
      }
      
      // Güncel kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem('user', JSON.stringify(data));
      
      console.log('Profil başarıyla güncellendi:', data);
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
      return []; // Boş dizi döndür
    }
  },
  
  // ID'ye göre halı saha getir
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
          console.log('API boş yanıt döndü');
          return [];
        }
        
        // JSON parse etmeyi dene
        try {
          const data = JSON.parse(responseText);
          console.log('Etkinlikler başarıyla alındı:', data.length || 'Veri yok');
          return data;
        } catch (parseError) {
          console.error('JSON parse hatası:', responseText.substring(0, 100));
          return [];
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Get events error:', error);
      return []; // Boş dizi döndür
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
      console.log('Videolar getiriliyor...');
      const headers = await getAuthHeaders();
      
      // Abort Controller ile timeout kontrolü
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout
      
      try {
      const response = await fetch(`${API_URL}/videos`, {
        method: 'GET',
          headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId); // Zamanı iptal et
      
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Videoları getirme başarısız');
      }
      
        const data = await response.json();
      return data;
      } catch (error) {
        const fetchError = error as Error;
        
        // AbortError (timeout) durumunda boş dizi döndür
        if (fetchError.name === 'AbortError') {
          console.log('Video isteği zaman aşımına uğradı, varsayılan veriler kullanılıyor');
          return [];
        }
        
        // Network hatalarında boş dizi döndür
        if (fetchError.message === 'Network request failed') {
          console.log('Ağ hatası, varsayılan veriler kullanılıyor');
          return [];
        }
        
        console.error('Video getirme hatası:', fetchError);
        return [];
      }
    } catch (error: any) {
      console.error('Get videos error:', error);
      
      // Network hatasında boş dizi döndür
      if (error.message === 'Network request failed') {
        console.log('Ağ hatası, varsayılan veriler kullanılıyor');
        return [];
      }
      
      return []; // Boş dizi döndür
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
      // console.log('Gönderiler getiriliyor...');
      const headers = await getAuthHeaders();
      
      // Güvenli fetch işlemi
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout (artırıldı)
      
      // Denenecek URL'ler
      const urlsToTry = [];
      
      // Platform'a göre URL'leri hazırla
      if (Platform.OS === 'android') {
        urlsToTry.push(`http://10.0.2.2:${BACKEND_PORT}/api/posts`);
        urlsToTry.push(`http://10.0.2.2:5000/api/posts`);
      } else {
        urlsToTry.push(`${API_URL}/posts`);
        urlsToTry.push(`http://localhost:5000/api/posts`);
      }
      
      // IP adresine göre alternatif URL'ler
      urlsToTry.push(`http://192.168.1.27:${BACKEND_PORT}/api/posts`);
      urlsToTry.push(`http://192.168.1.27:5000/api/posts`);
      
      // Her URL'yi sırayla dene
      let lastError: any = null;
      
      for (const url of urlsToTry) {
        try {
          // console.log('Gönderi API URL deneniyor:', url);
          
          const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: controller.signal
          });
          
          // Başarılı yanıt kontrolü
          if (!response.ok) {
            // console.log(`URL ${url} için API hatası: ${response.status} ${response.statusText}`);
            continue; // Sonraki URL'yi dene
          }
          
          // Önce response'un içeriğini text olarak al
          const responseText = await response.text();
          
          // Boş yanıt kontrolü
          if (!responseText || responseText.trim() === '') {
            // console.log(`URL ${url} için API boş yanıt döndü, sonraki deneniyor`);
            continue; // Sonraki URL'yi dene
          }
          
          // JSON parse etmeyi dene
          try {
            const data = JSON.parse(responseText);
            // console.log('Gönderiler başarıyla alındı:', data.length || 'Veri yok');
            // console.log('Gönderiler başarıyla yüklendi:', data.length);
            
            // Başarılı olduğunda timeout'u temizle
            clearTimeout(timeoutId);
            return data;
          } catch (parseError) {
            // console.error(`URL ${url} için JSON parse hatası:`, responseText.substring(0, 100));
            continue; // Sonraki URL'yi dene
          }
        } catch (error) {
          lastError = error;
          // console.log(`URL ${url} için fetch hatası:`, (error as Error).message);
          continue; // Sonraki URL'yi dene
        }
      }
      
      // Tüm URL'ler denendikten sonra hala başarısızsa
      clearTimeout(timeoutId);
      console.error('Gönderi listeleme hatası:', lastError);
      throw new Error('Gönderiler alınamadı');
    } catch (error) {
      console.error('Gönderi listeleme hatası:', error);
      return [];
    }
  },
  
  // Gönderi paylaş (yeni)
  create: async (postData: FormData) => {
    try {
      console.log('Gönderi paylaşma isteği gönderiliyor...');
      console.log('Kullanılan API URL:', API_URL);
      
      // Token al
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum açık değil, lütfen giriş yapın');
      }
      
      // Retry mekanizması
      let retryCount = 0;
      const maxRetries = 3;
      
      const attemptUpload = async (): Promise<any> => {
        // XHR oluştur
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${API_URL}/posts`);
          
          // Authorization header'i ekle
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          
          // Daha uzun timeout ayarla
          xhr.timeout = 60000; // 60 saniye
          
          // Yükleme tamamlandığında
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                console.log('Gönderi başarıyla paylaşıldı:', data);
                resolve(data);
              } catch (e) {
                console.error('JSON parse hatası:', xhr.responseText.substring(0, 100));
                reject(new Error('Sunucu yanıtı geçerli JSON formatında değil'));
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(new Error(errorData.message || 'Gönderi paylaşma başarısız'));
              } catch (e) {
                reject(new Error(`HTTP hata kodu: ${xhr.status}`));
              }
            }
          };
          
          // Timeout durumunda
          xhr.ontimeout = function() {
            console.error('XHR isteği zaman aşımına uğradı');
            if (retryCount < maxRetries) {
              console.log(`Yükleme tekrar deneniyor (${retryCount + 1}/${maxRetries})...`);
              retryCount++;
              setTimeout(() => {
                attemptUpload().then(resolve).catch(reject);
              }, 1000);
            } else {
              reject(new Error('Gönderi yükleme zaman aşımına uğradı. Lütfen daha güçlü bir ağ bağlantısında tekrar deneyin.'));
            }
          };
          
          // Hata durumunda
          xhr.onerror = function() {
            console.error('XHR hatası');
            if (retryCount < maxRetries) {
              console.log(`Bağlantı hatası sonrası yükleme tekrar deneniyor (${retryCount + 1}/${maxRetries})...`);
              retryCount++;
              setTimeout(() => {
                attemptUpload().then(resolve).catch(reject);
              }, 1000);
            } else {
              reject(new Error('Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol ediniz.'));
            }
          };
          
          // Yükleme ilerleme durumu
          xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              console.log(`Yükleme ilerlemesi: %${percentComplete}`);
            }
          };
          
          // İsteği gönder
          xhr.send(postData);
        });
      };
      
      return await attemptUpload();
    } catch (error: any) {
      console.error('Upload post error:', error);
      throw new Error(error.message || 'Gönderi paylaşılırken bir hata oluştu');
    }
  },
  
  // Kullanıcının gönderilerini getir
  getUserPosts: async (userId: string) => {
    try {
      console.log(`${userId} ID'li kullanıcının gönderileri getiriliyor...`);
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_URL}/posts/user/${userId}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kullanıcı gönderilerini getirme başarısız');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Get user posts error:', error);
      return []; // Boş dizi döndür
    }
  },
  
  // Gönderi beğen
  likePost: async (postId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gönderi beğenme başarısız');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Like post error:', error);
      throw new Error(error.message || 'Gönderi beğenirken bir hata oluştu');
    }
  },
  
  // Gönderiyi sil
  deletePost: async (postId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gönderi silme başarısız');
      }
      
      return true;
    } catch (error: any) {
      console.error('Delete post error:', error);
      throw new Error(error.message || 'Gönderi silinirken bir hata oluştu');
    }
  }
};
