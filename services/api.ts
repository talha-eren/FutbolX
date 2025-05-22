import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
// @ts-ignore
import { getApiUrl, getApiBaseUrl } from './networkConfig';

// API URL'sini platform bazlı tanımlıyoruz
export let API_URL = '';
export let IS_OFFLINE_MODE = false;

// Bilgisayarın gerçek IP adresi (ipconfig ile tespit edildi)
const COMPUTER_IP = '192.168.1.27';

// Backend portu
const BACKEND_PORT = 5000;

// Alternatif IP adresleri (bağlantı sorunları için)
const ALTERNATIVE_IPS = [
  'localhost',       // Localhost (Öncelikli)
  '127.0.0.1',       // Localhost alternatifi
  '10.192.90.94',    // Otomatik algılanan IP
  '10.0.2.2',        // Android emülatör için özel IP
  '192.168.1.27',    // Ana IP
];

// Platforma göre API URL'sini belirle
try {
  // Önce Expo Metro sunucusunun IP'sini almaya çalış - bu genellikle en iyi çözümdür
  // Bu IP, telefonun ve bilgisayarın aynı ağda olduğunu varsayar
  const METRO_IP = '192.168.1.27'; // Değiştirildi
  
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
    API_URL = `http://localhost:${BACKEND_PORT}/api`;
    console.log(`Bilinmeyen platform, varsayılan olarak localhost kullanılıyor`);
  }
} catch (error) {
  // Hata durumunda localhost değerini kullan
  API_URL = `http://localhost:${BACKEND_PORT}/api`;
  console.log('Platform tespiti yapılamadı, varsayılan IP kullanılıyor:', API_URL);
}

// Çevrimdışı mod için örnek veriler
export const OFFLINE_DATA = {
  user: {
    _id: "offline-user-id",
    username: "test_user",
    email: "test@example.com",
    name: "Test Kullanıcı",
    firstName: "Test",
    lastName: "Kullanıcı",
    profilePicture: "https://via.placeholder.com/150",
    level: "Orta",
    position: "Forvet",
    footballExperience: "Orta",
    preferredFoot: "Sağ",
    favoriteTeam: "Galatasaray",
    height: 175,
    weight: 70,
    location: "İstanbul",
    phone: "+90 555 123 4567",
    bio: "Futbol tutkunu",
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
          signal: controller.signal as any
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
  const METRO_IP = '192.168.1.27'; // Değiştirildi
  console.log(`Önce güncel backend IP adresi deneniyor: ${METRO_IP}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(`http://${METRO_IP}:${BACKEND_PORT}/api/health`, {
      method: 'GET',
      signal: controller.signal as any
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
  
  let successfulUrl: string | null = null;
  
  for (const ip of testIps) {
    const testUrl = `http://${ip}:${BACKEND_PORT}/api/health`;
    try {
      console.log(`API bağlantısı test ediliyor: ${testUrl}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(testUrl, { 
        method: 'GET', 
        signal: controller.signal as any
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
      API_URL = `http://localhost:${BACKEND_PORT}/api`; // Diğer platformlar için
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
    
    const baseUrl = await getApiBaseUrl();
    console.log('Kontrol için kullanılan API URL:', baseUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout süresini 8 saniyeye çıkardık
    
    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal as any,
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
        IS_OFFLINE_MODE = true;
        return true;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.log('API bağlantı hatası:', error);
      
      IS_OFFLINE_MODE = true;
      return true;
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

// Auth header hazırlama fonksiyonu
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('getAuthHeaders: Token bulunamadı, headers boş dönüyor');
      return { 'Content-Type': 'application/json' };
    }
    
    // Token'ın 'Bearer ' öneki yoksa ekle
    const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    console.log('getAuthHeaders: Bearer token ile istek gönderiliyor. İlk 15 karakter:', tokenWithBearer.substring(0, 15) + '...');
    
    return {
      'Authorization': tokenWithBearer,
      'x-auth-token': token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('getAuthHeaders: Token alınırken hata:', error);
    return { 'Content-Type': 'application/json' };
  }
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
      console.log(`API isteği gönderiliyor: /auth/login`);
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
      const url = await getApiUrl('/auth/login');
      console.log('Fetch isteği gönderiliyor:', url);
      
      // Timeout ve abort controller için
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 saniye timeout
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password }),
          // @ts-ignore -- AbortSignal tip uyumsuzluğunu çözmek için
          signal: controller.signal as any
        });

        clearTimeout(timeoutId);
        
        // Yanıt HTTP durum kodunu loglayalım
        console.log(`Login yanıt alındı (HTTP ${response.status})`, {
          ok: response.ok,
          statusText: response.statusText,
          url: response.url
        });
        
        // Tüm yanıt içeriğini önce metin olarak alıp loglayalım
        const rawResponse = await response.text();
        console.log(`Sunucu yanıt uzunluğu: ${rawResponse.length} karakter`);
        
        // Yanıtı JSON olarak ayrıştırmaya çalış
        let data;
        try {
          data = JSON.parse(rawResponse) as {
            token?: string;
            user?: any;
            message?: string;
          };
          console.log('Sunucu yanıtı:', { 
            status: response.status, 
            ok: response.ok, 
            hasToken: !!data.token,
            hasUser: !!data.user,
            message: data.message || 'Mesaj yok'
          });
        } catch (jsonError) {
          console.error('JSON ayrıştırma hatası:', jsonError);
          console.log('Ham yanıt içeriği (ilk 100 karakter):', rawResponse.substring(0, 100));
          throw new Error('Sunucu yanıtı ayrıştırılamadı (JSON hatası)');
        }
        
        if (!response.ok) {
          console.error('Giriş başarısız:', data.message);
          throw new Error(data.message || `Giriş başarısız (${response.status})`);
        }
        
        // Token ve kullanıcı verilerini kontrol et
        if (!data.token || !data.user) {
          console.error('Sunucu geçerli yanıt döndürmedi:', data);
          throw new Error('Sunucudan geçerli kullanıcı bilgileri alınamadı');
        }
        
        // Token formatını kontrol et (basit bir JWT kontrol)
        const tokenParts = data.token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Geçersiz token formatı:', { token: data.token.substring(0, 10) + '...' });
          throw new Error('Sunucudan geçersiz token formatı alındı');
        }
        
        // Decoded token payload'ı kontrol etmek ve exp (bitiş zamanı) bilgisini almak için
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expiration = payload.exp ? new Date(payload.exp * 1000) : null;
          
          console.log('Token bilgileri:', {
            iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'Yok',
            exp: expiration ? expiration.toISOString() : 'Yok',
            sub: payload.sub || payload.id || 'Yok',
            validFor: expiration ? `${Math.floor((expiration.getTime() - Date.now()) / 1000 / 60)} dakika` : 'Bilinmiyor'
          });
          
          // User ID ve token sub alanının eşleştiğini kontrol et
          const userId = data.user.id || data.user._id;
          if (payload.sub && payload.sub !== userId && payload.id !== userId) {
            console.warn('Token subject ile kullanıcı ID uyuşmazlığı:', {
              tokenSub: payload.sub,
              tokenId: payload.id,
              userId
            });
          }
        } catch (tokenError) {
          console.warn('Token payload ayrıştırılamadı, ama devam edilecek:', tokenError);
        }
        
        console.log('Giriş başarılı, token alındı');
        console.log('Kullanıcı bilgileri:', {
          id: data.user.id || data.user._id,
          username: data.user.username,
          email: data.user.email
        });
        
        // Token ve kullanıcı bilgileri AuthContext tarafından kaydedilecek
        return data;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        // Fetch API'den kaynaklanan özel hata türlerini işle
        if (fetchError.name === 'AbortError') {
          console.error('Fetch isteği zaman aşımına uğradı');
          throw new Error('Sunucu yanıt vermedi (zaman aşımı)');
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Giriş hatası:', error?.message || error);
      throw error;
    }
  },

  // Kullanıcı Kaydı
  register: async (username: string, email: string, password: string, name: string, profileData?: any) => {
    try {
      console.log(`API isteği gönderiliyor: /auth/register`);
      console.log('Kayıt verileri:', { username, email, name, profileData });
      
      // Web projesindeki başarılı formata uygun veri yapısı
      const registerData = {
        // Temel kullanıcı bilgileri
        username,
        email,
        password,
        name,
        
        // Profil bilgileri - web projesindeki gibi düz yapıda
        firstName: profileData?.firstName || name.split(' ')[0] || '',
        lastName: profileData?.lastName || (name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : ''),
        position: profileData?.position || '',
        level: profileData?.footballExperience || profileData?.level || 'Başlangıç',
        footPreference: profileData?.preferredFoot || 'Sağ',
        
        // Ek profil bilgileri - ihtiyaç olursa
        bio: profileData?.bio || '',
        location: profileData?.location || '',
        phone: profileData?.phone || '',
        
        // Eski formatla uyumluluk için
        footballExperience: profileData?.footballExperience || profileData?.level || 'Başlangıç',
      };
      
      console.log('Sunucuya gönderilecek kayıt verileri:', JSON.stringify(registerData, null, 2));
      
      const url = await getApiUrl('/auth/register');
      
      // API isteğini gönder - timeout ve retry mekanizması ile
      let data;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          // Abort controller ile timeout kontrolü
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 saniye timeout
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData),
            signal: controller.signal as any
          });
          
          clearTimeout(timeoutId);
          
          // HTTP yanıt kodunu kontrol et
          console.log(`Kayıt yanıtı alındı (HTTP ${response.status})`, {
            ok: response.ok,
            statusText: response.statusText
          });
          
          // Yanıtı text olarak al
          const responseText = await response.text();
          console.log(`Sunucu yanıt uzunluğu: ${responseText.length} karakter`);
          
          // JSON parse et
          try {
            data = JSON.parse(responseText);
            console.log('Sunucu yanıtı:', data);
            break; // Başarılı yanıt, döngüden çık
          } catch (parseError) {
            console.error('JSON parse hatası:', parseError);
            console.log('Ham yanıt:', responseText.substring(0, 200));
            
            // Yanıt parse edilemedi, manuel yanıt oluştur
            if (response.ok) {
              // Başarılı yanıt ama JSON değil
              data = { 
                success: true,
                message: 'Kayıt başarılı (JSON parse hatası)',
                token: responseText.includes('token') ? responseText.match(/token["\s:=]+([^"'\s,}]+)/)?.[1] : null,
                user: {
                  username,
                  email,
                  name,
                  ...profileData
                }
              };
              break;
            } else {
              // Başarısız yanıt
              throw new Error(`Sunucu yanıtı geçerli JSON formatında değil: ${responseText.substring(0, 100)}`);
            }
          }
        } catch (fetchError: any) {
          console.error(`Kayıt isteği hatası (deneme ${retryCount + 1}/${maxRetries + 1}):`, fetchError.message || fetchError);
          
          if (retryCount === maxRetries) {
            throw fetchError; // Son deneme başarısız, hatayı fırlat
          }
          
          // Kısa bir beklemeden sonra tekrar dene
          await new Promise(resolve => setTimeout(resolve, 1000));
          retryCount++;
        }
      }
      
      console.log('Kayıt yanıtı alındı:', JSON.stringify(data, null, 2));
      
      // Sunucudan gelen yanıtı kontrol et
      if (!data.user) {
        console.warn('Sunucudan gelen yanıtta user nesnesi bulunamadı!');
        
        // Kullanıcı nesnesini manuel olarak oluştur
        data.user = {
          // Temel bilgiler - kayıt verilerinden al
          username,
          email,
          name,
          
          // Profil bilgileri - registerData'dan al
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          position: registerData.position,
          level: registerData.level,
          footPreference: registerData.footPreference,
          footballExperience: registerData.footballExperience,
          bio: registerData.bio,
          location: registerData.location,
          height: profileData?.height || 0,
          weight: profileData?.weight || 0
        };
        
        // ID'yi token'dan çıkarmayı dene
        if (data.token) {
          try {
            const tokenParts = data.token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              if (payload.id) {
                data.user._id = payload.id;
                console.log('ID token\'dan çıkarıldı:', payload.id);
              }
            }
          } catch (e) {
            console.error('Token parse hatası:', e);
          }
        }
      }
      
      // Kayıt sonrası profil verilerini güncelleme işlemi
      if (data.token && (data.user._id || data.user.id)) {
        try {
          // Kullanıcı ID'si ve token'ı al
          const userId = data.user._id || data.user.id;
          const token = data.token;
          
          console.log('Profil verilerini güncelleme işlemi başlatılıyor...', { userId });
          
          // Profil verilerini güncelleme isteği - doğrudan profile endpoint'ini kullan
          const updateUrl = await getApiUrl(`/users/profile`);
          
          // Güncellenecek profil verileri - sunucu loglarına göre düzenlendi
          const updatedData = { 
            // Sunucu loglarında görülen çalışan alanlar
            level: profileData.level || profileData.footballExperience || 'Başlangıç',
            footPreference: profileData.footPreference || profileData.preferredFoot || 'Sağ',
            position: profileData.position || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
            phone: profileData.phone || '',
            
            // Diğer profil alanları
            favoriteTeam: profileData.favoriteTeam || '',
            footballExperience: profileData.footballExperience || profileData.level || 'Başlangıç',
            preferredFoot: profileData.preferredFoot || profileData.footPreference || 'Sağ',
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            height: profileData?.height || 0,
            weight: profileData?.weight || 0
          };
          
          console.log('Profil güncelleme verileri:', updatedData);
          
          // PUT isteği gönder - token'ı hem header'da hem de body'de gönder
          fetch(updateUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-auth-token': token
            },
            body: JSON.stringify({
              ...updatedData,
              token // Token'ı body'de de gönder
            })
          })
          .then(response => {
            console.log('Profil güncelleme yanıt status:', response.status);
            return response.text();
          })
          .then(text => {
            try {
              // Yanıtı JSON olarak parse etmeyi dene
              const updatedUser = JSON.parse(text);
              console.log('Profil başarıyla güncellendi:', updatedUser);
              
              // Güncellenmiş kullanıcı verilerini data.user'a aktar
              if (updatedUser) {
                Object.assign(data.user, updatedUser);
              }
            } catch (e) {
              console.log('JSON parse hatası, ham yanıt:', text);
            }
          })
          .catch(error => {
            console.error('Profil güncelleme hatası:', error);
            
            // Hata durumunda alternatif endpoint dene
            console.log('Alternatif endpoint deneniyor...');
            
            // Alternatif endpoint için ayrı bir işlev
            const tryAlternativeEndpoint = async () => {
              try {
                const altUrl = await getApiUrl(`/users/${userId}`);
                const altResponse = await fetch(altUrl, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-auth-token': token
                  },
                  body: JSON.stringify({
                    ...updatedData,
                    token // Token'ı body'de de gönder
                  })
                });
                
                const altText = await altResponse.text();
                console.log('Alternatif endpoint yanıtı:', altText);
              } catch (err) {
                console.error('Alternatif endpoint hatası:', err);
              }
            };
            
            // Alternatif endpoint'i çağır
            tryAlternativeEndpoint();
          });
        } catch (updateError) {
          console.error('Profil güncelleme işlemi sırasında hata:', updateError);
          // Güncelleme hatası olsa bile kayıt işlemine devam et
        }
      }
      
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
      console.log('Kullanıcı verileri:', JSON.stringify(data.user, null, 2));
      
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

// Halı saha servisleri
export const fieldService = {
  // Tüm halı sahaları getir
  getFields: async () => {
    try {
      const url = await getApiUrl('/fields');
      const data = await fetchAPI(url);
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
      const url = await getApiUrl(`/fields/${id}`);
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
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
        const url = await getApiUrl('/events');
        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal as any
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
      const url = await getApiUrl(`/events/${id}`);
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
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
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 saniye timeout (artırıldı)
      
      try {
        const url = await getApiUrl('/videos');
        console.log(`Video isteği URL: ${url}`);
        
        // Kullanıcı ID'sini ekle (eğer oturum açıksa)
        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');
        let userId = '';
        
        if (user) {
          try {
            const userData = JSON.parse(user);
            userId = userData.id || userData._id || '';
          } catch (e) {
            console.log('Kullanıcı verisi parse edilemedi:', e);
          }
        }
        
        // URL'ye kullanıcı ID'si ekle (isteğe bağlı)
        const apiUrl = userId ? `${url}?user=${userId}` : url;
        
        const response = await fetch(apiUrl, {
        method: 'GET',
          headers: {
            ...headers,
            'Authorization': token ? `Bearer ${token}` : ''
          },
          signal: controller.signal as any
        });
        
        clearTimeout(timeoutId); // Zamanı iptal et
      
      if (!response.ok) {
          const errorData = await response.json() as { message?: string };
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
        if (fetchError.message === 'Network request failed' || fetchError.message.includes('Network')) {
          console.log('Ağ hatası, varsayılan veriler kullanılıyor');
          return [];
        }
        
        console.error('Video getirme hatası:', fetchError);
        return [];
      }
    } catch (error: any) {
      console.error('Videoları getirme hatası:', error);
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
      
      // API URL'sini al
      const baseUrl = await getApiBaseUrl();
      const uploadUrl = `${baseUrl}/videos/upload`;
      
      // FormData için özel bir XMLHttpRequest kullan
      return new Promise((resolve, reject) => {
        // XHR oluştur
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        
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
      const url = await getApiUrl(`/videos/${id}`);
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
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
      
      try {
        const url = await getApiUrl('/posts');
        console.log('Gönderi isteği URL:', url);
          
          const response = await fetch(url, {
            method: 'GET',
            headers,
          signal: controller.signal as any
          });
          
          // Başarılı yanıt kontrolü
          if (!response.ok) {
          console.log(`API hatası: ${response.status} ${response.statusText}`);
          throw new Error(`Gönderi listesi alınamadı: ${response.statusText}`);
          }
          
          // Önce response'un içeriğini text olarak al
          const responseText = await response.text();
          
          // Boş yanıt kontrolü
          if (!responseText || responseText.trim() === '') {
          console.log(`API boş yanıt döndü`);
          return [];
          }
          
          // JSON parse etmeyi dene
          try {
            const data = JSON.parse(responseText);
          console.log('Gönderiler başarıyla alındı:', data.length || 'Veri yok');
            
            // Başarılı olduğunda timeout'u temizle
            clearTimeout(timeoutId);
            return data;
          } catch (parseError) {
          console.error(`JSON parse hatası:`, responseText.substring(0, 100));
          clearTimeout(timeoutId);
          return [];
          }
        } catch (error) {
      clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('Gönderi listeleme hatası:', error);
      return [];
    }
  },
  
  // Gönderi paylaş (yeni)
  create: async (postData: FormData) => {
    try {
      console.log('Gönderi paylaşma isteği gönderiliyor...');
      
      // Token al
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum açık değil, lütfen giriş yapın');
      }
      
      // API URL'sini al
      const baseUrl = await getApiBaseUrl();
      const uploadUrl = `${baseUrl}/posts`;
      console.log('Gönderi yükleme URL:', uploadUrl);
      
      // Retry mekanizması
      let retryCount = 0;
      const maxRetries = 3;
      
      const attemptUpload = async (): Promise<any> => {
        // XHR oluştur
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', uploadUrl);
          
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
      
      const url = await getApiUrl(`/posts/user/${userId}`);
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
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
      const url = await getApiUrl(`/posts/${postId}/like`);
      const response = await fetch(url, {
        method: 'POST',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
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
      const url = await getApiUrl(`/posts/${postId}`);
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || 'Gönderi silme başarısız');
      }
      
      return true;
    } catch (error: any) {
      console.error('Delete post error:', error);
      throw new Error(error.message || 'Gönderi silinirken bir hata oluştu');
    }
  }
};

// Kullanıcı Profil Servisleri
export const userService = {
  // Profil Bilgilerini Getir
  getProfile: async () => {
    try {
      const headers = await getAuthHeaders();
      const url = await getApiUrl('/users/profile');
      const data = await fetchAPI(url, {
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
      
      // Tüm profil alanlarını içeren veri hazırlayalım - sunucu loglarına göre düzenlendi
      const updatedData = { 
        // Sunucu loglarında görülen çalışan alanlar
        level: profileData.level || profileData.footballExperience || 'Başlangıç',
        footPreference: profileData.footPreference || profileData.preferredFoot || 'Sağ',
        position: profileData.position || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        phone: profileData.phone || '',
        
        // Diğer profil alanları
        favoriteTeam: profileData.favoriteTeam || '',
        footballExperience: profileData.footballExperience || profileData.level || 'Başlangıç',
        preferredFoot: profileData.preferredFoot || profileData.footPreference || 'Sağ',
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        height: profileData.height || 0,
        weight: profileData.weight || 0
      };
      
      console.log('Profil güncelleme verileri (userService):', updatedData);
      
      // İsteği yapalım - token'ı hem header'da hem de body'de gönder
      const url = await getApiUrl('/users/profile');
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          ...headers,
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        },
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

// Axios isteği yapan fonksiyonu yerine fetch kullanan bir fonksiyon tanımlıyoruz
interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}

const axiosLikeRequest = async (endpoint: string, options: RequestOptions = {}) => {
  try {
    const url = await getApiUrl(endpoint);
    console.log(`API isteği gönderiliyor: ${url}`);
    
    // Token ekle (eğer varsa)
    const token = await AsyncStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    
    // Fetch ile GET isteği
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      ...(options.data ? { body: JSON.stringify(options.data) } : {}),
      signal: controller.signal as any
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API hata: ${response.status} - ${errorText}`);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    // JSON yanıt
    const data = await response.json();
    return { data, status: response.status, headers: response.headers };
  } catch (error) {
    console.error(`Axios benzeri istek hatası (${endpoint}):`, error);
    throw error;
  }
};

// İlk uygulama açılışında çevrimdışı mod kontrolünü yap
checkOfflineMode().catch(err => {
  console.error('Çevrimdışı mod kontrolü hatası:', err);
  IS_OFFLINE_MODE = true;
});

// Çevrimdışı mod kontrolünü düzenli aralıklarla yap
setInterval(async () => {
  try {
    await checkOfflineMode();
  } catch (error) {
    console.error('Otomatik çevrimdışı mod kontrolü hatası:', error);
  }
}, 1 * 60 * 1000); // 1 dakikada bir kontrol et (15 dakika yerine daha sık)
