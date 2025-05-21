import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Manuel IP yapılandırması - Backend sunucunuzun IP'sini buraya girin
// NOT: Eğer backend bağlantısı kurulamıyorsa burayı düzenleyin
const MANUAL_BACKEND_IP = '10.192.90.94';  // Kullanıcının IP adresi

// Backend yapılandırması
const BACKEND_PORT = 5000; // Backend port
const BACKEND_PATH = '/api'; // API yolu

// JWT Secret anahtarı - Önemli: Bu backend/middleware/auth.js ile aynı olmalı
const JWT_SECRET = 'futbolx_super_gizli_anahtar_2025';

// IP adresi öncelik sıralaması (platform bazlı)
const IP_PRIORITIES = {
  ios: ["10.192.90.94", "192.168.1.59", "192.168.1.49", "localhost", "127.0.0.1", "10.0.2.2"], // iOS simulator için
  android: ["10.192.90.94", "192.168.1.59", "192.168.1.49", "10.0.2.2", "localhost", "127.0.0.1"], // Android emulator için
  default: ["10.192.90.94", "192.168.1.59", "192.168.1.49", "localhost", "127.0.0.1"] // Web için
};

// Manuel bağlantı kullanmak için anahtar - Aktif etmek için true yapın
// Eğer algılama çalışmazsa bu değeri true yaparak manuel IP'yi kullanabilirsiniz
const USE_MANUAL_IP = true;

// Farklı ortamlar için baz URL'ler
const API_URLS = {
  development: {
    manual: `http://${MANUAL_BACKEND_IP}:${BACKEND_PORT}${BACKEND_PATH}`,
    wifi: '', // Otomatik olarak doldurulacak
    fallback: `http://localhost:${BACKEND_PORT}${BACKEND_PATH}`, // Fallback
  },
  production: {
    // Canlı ortam için
    default: 'https://your-production-api.com', // Canlı API URL'nizi buraya yazın
  },
};

// AsyncStorage için anahtar
const NETWORK_CONFIG_KEY = '@network_config';

// Token yardımcı fonksiyonları
const formatToken = (token) => {
  if (!token) return null;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

/**
 * Verilen URL'ye sağlık kontrolü yapar
 * @param {string} baseUrl - Test edilecek API URL
 * @returns {Promise<boolean>} - URL'nin erişilebilir olup olmadığı
 */
const pingServer = async (baseUrl) => {
  try {
    // Birden fazla olası endpoint'i dene
    const healthEndpoints = [
      '/health',
      '/status',
      '/ping',
      '/api/health',
      '/api/status',
      '/api/ping',
      '/auth/status',
      '/auth/health',
      ''  // Kök endpoint
    ];
    
    for (const endpoint of healthEndpoints) {
      const testUrl = baseUrl + endpoint;
      console.log(`❓ API testi: ${testUrl}`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // Daha kısa timeout
        
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Herhangi bir yanıt başarılı kabul edilebilir (API çalışıyor demektir)
        if (response.status < 500) {
          console.log(`✅ Başarılı bağlantı: ${testUrl} (Status: ${response.status})`);
          return true;
        }
      } catch (innerError) {
        // Bu endpoint'e ulaşılamadı, diğerini dene
        console.log(`❌ Endpoint çalışmıyor: ${testUrl} - ${innerError.message}`);
      }
    }
    
    // Hiçbir endpoint çalışmadı
    console.log(`❌ Hiçbir sağlık endpoint'i çalışmıyor: ${baseUrl}`);
    return false;
  } catch (error) {
    console.log(`❌ ${baseUrl} adresine bağlantı başarısız: [${error}]`);
    return false;
  }
};

/**
 * Cihazın veya WiFi routerının olası IP adreslerini sıralar
 * @returns {string[]} - Olası IP adresleri listesi
 */
const getCommonIPAddresses = () => {
  // Yaygın WiFi router IP'leri
  const routerIPs = ["192.168.1.1", "192.168.0.1", "10.0.0.1"];
  
  // Olası backend IP'leri - burada özel olası IP'ler tanımlanabilir
  const possibleBackendIPs = [
    MANUAL_BACKEND_IP,
    "192.168.1.90", // Güncel doğru IP
    "192.168.1.59", // Eski IP
    "192.168.1.49", // Daha eski IP
    "192.168.1.100",
    "192.168.1.101",
    "192.168.1.102", 
    "192.168.1.103",
    "192.168.1.104",
    "192.168.1.105"
  ];
  
  // Yerel ağ aralıkları - son okteti değiştirerek olası IP'leri oluşturur
  const localIPs = [];
  
  // 192.168.1.x aralığı
  for (let i = 1; i <= 10; i++) { // Daha az IP kontrolü için 10'a kadar
    localIPs.push(`192.168.1.${i}`);
  }
  
  return [...possibleBackendIPs, ...routerIPs, ...localIPs];
};

/**
 * WiFi IP adresini algılayıp API URL'yi oluşturan fonksiyon
 * @returns {Promise<string>} API Base URL
 */
export const getApiBaseUrl = async () => {
  // Üretim ortamındaysa, sabit API URL'yi döndür
  if (process.env.NODE_ENV === 'production') {
    return API_URLS.production.default;
  }
  
  // Manuel IP kullanılsın mı? (USE_MANUAL_IP true ise doğrudan IP'yi kullan)
  if (USE_MANUAL_IP) {
    console.log(`⚙️ Manuel IP kullanılıyor: ${MANUAL_BACKEND_IP}`);
    const manualUrl = API_URLS.development.manual;
    console.log(`🔗 Manuel API URL: ${manualUrl}`);
    
    // Doğrudan manuel URL'yi döndür, test etmeye gerek yok
    try {
      // Başarılı bağlantıyı cache'le
      await AsyncStorage.setItem(
        NETWORK_CONFIG_KEY,
        JSON.stringify({ baseUrl: manualUrl, timestamp: Date.now() })
      );
      
      return manualUrl;
    } catch (error) {
      console.log(`⚠️ Cache kaydetme hatası (önemli değil): ${error}`);
      return manualUrl; // Yine de manuel URL'yi döndür
    }
  }

  const platform = Platform.OS || 'default';
  console.log(`📱 ${platform} platformu tespit edildi`);

  try {
    // Önceden kaydedilmiş bir yapılandırma var mı kontrol et
    const savedConfig = await AsyncStorage.getItem(NETWORK_CONFIG_KEY);
    
    if (savedConfig) {
      const { baseUrl, timestamp } = JSON.parse(savedConfig);
      // Son 5 dakika içinde kaydedilmiş bir yapılandırma varsa onu kullan
      if (Date.now() - timestamp < 300000) { // 5 dakika = 300000 ms
        console.log(`🔄 Son 5 dakika içinde kaydedilmiş API URL kullanılıyor: ${baseUrl}`);
        return baseUrl;
      }
    }

    // Ağ bilgilerini al
    const netInfo = await NetInfo.fetch();
    let baseUrl = null;
    
    // Olası IP adresi listesi
    const ipAddresses = [];
    
    // 1. Expo Metro IP'sini ekle (genellikle cihazın gerçek IP'si)
    if (typeof process !== 'undefined' && process.env && process.env.EXPO_METRO_HOST) {
      const metroIP = process.env.EXPO_METRO_HOST.replace(/[^0-9.]/g, ''); // Sadece IP kısmını al
      if (metroIP && metroIP.match(/\d+\.\d+\.\d+\.\d+/)) {
        console.log(`📡 Expo Metro IP: ${metroIP}`);
        ipAddresses.push(metroIP);
      }
    }
    
    // Manuel IP'yi her zaman dene
    if (MANUAL_BACKEND_IP && !ipAddresses.includes(MANUAL_BACKEND_IP)) {
      ipAddresses.unshift(MANUAL_BACKEND_IP); // Listeye ön taraftan ekle (öncelikli)
    }
    
    // 2. NetInfo'dan cihazın IP adresini al (eğer varsa)
    if (netInfo.isConnected && netInfo.type === 'wifi' && netInfo.details?.ipAddress) {
      const deviceIP = netInfo.details.ipAddress;
      console.log(`📱 Cihaz IP: ${deviceIP}`);
      if (!ipAddresses.includes(deviceIP)) {
        ipAddresses.push(deviceIP);
      }
    }
    
    // 3. Platform bazlı özel IP adreslerini ekle
    if (IP_PRIORITIES[platform]) {
      ipAddresses.push(...IP_PRIORITIES[platform]);
    }
    
    // 4. Yaygın router ve yerel ağ IP'lerini ekle
    const commonIPs = getCommonIPAddresses();
    ipAddresses.push(...commonIPs);
    
    // Tekrarlayan IP'leri çıkar
    const uniqueIPs = [...new Set(ipAddresses)];
    
    console.log(`🔍 Deneyeceğim IP'ler: ${JSON.stringify(uniqueIPs.slice(0, 5))}...`);
    
    // Manuel IP'yi önce dene
    if (MANUAL_BACKEND_IP) {
      console.log(`🔧 Önce manuel IP adresi deneniyor: ${MANUAL_BACKEND_IP}`);
      const manualBaseUrl = `http://${MANUAL_BACKEND_IP}:${BACKEND_PORT}${BACKEND_PATH}`;
      
      try {
        if (await pingServer(manualBaseUrl)) {
          baseUrl = manualBaseUrl;
          console.log(`✅ Manuel IP bağlantısı başarılı: ${baseUrl}`);
          
          // Başarılı bağlantıyı cache'le
          await AsyncStorage.setItem(
            NETWORK_CONFIG_KEY,
            JSON.stringify({ baseUrl, timestamp: Date.now() })
          );
          
          return baseUrl;
        }
      } catch (error) {
        console.log(`❌ Manuel IP (${MANUAL_BACKEND_IP}) bağlantısı başarısız: [${error}]`);
      }
    }
    
    // Tüm IP'leri sırayla dene
    for (const ip of uniqueIPs) {
      const currentBaseUrl = `http://${ip}:${BACKEND_PORT}${BACKEND_PATH}`;
      try {
        if (await pingServer(currentBaseUrl)) {
          baseUrl = currentBaseUrl;
          
          // Başarılı bağlantıyı cache'le
          await AsyncStorage.setItem(
            NETWORK_CONFIG_KEY,
            JSON.stringify({ baseUrl, timestamp: Date.now() })
          );
          
          return baseUrl;
        }
      } catch (error) {
        console.log(`❌ ${ip} adresine bağlantı başarısız: [${error}]`);
      }
    }
    
    // Hiçbir IP'ye bağlanamadıysa fallback URL'ye dön
    console.log(`⚠️ Hiçbir API sunucusuna bağlanılamadı, manuel IP kullanılıyor`);
    // Manuel URL'ye dön
    baseUrl = API_URLS.development.manual;
    console.log(`🔗 Manuel olarak şu IP kullanılacak: ${baseUrl}`);
    return baseUrl;
    
  } catch (error) {
    console.error('❌ API base URL alınırken hata:', error);
    const fallbackUrl = API_URLS.development.manual;
    console.log(`⚠️ Hata nedeniyle manuel URL kullanılıyor: ${fallbackUrl}`);
    return fallbackUrl;
  }
};

/**
 * Tam API endpoint URL'sini oluşturan yardımcı fonksiyon
 * @param {string} endpoint - API endpoint ("/users", "/auth/login" gibi)
 * @returns {Promise<string>} Tam API URL'si
 */
export const getApiUrl = async (endpoint) => {
  const baseUrl = await getApiBaseUrl();
  
  // "/api/auth/login" gibi tam endpoint path verilmişse düzelt
  if (endpoint.startsWith(BACKEND_PATH)) {
    endpoint = endpoint.replace(BACKEND_PATH, '');
  }
  
  // Endpoint zaten / ile başlıyorsa veya baseUrl zaten / ile bitiyorsa
  // çift slash oluşmasını önle
  if (endpoint.startsWith('/') && baseUrl.endsWith('/')) {
    return `${baseUrl}${endpoint.substring(1)}`;
  }
  if (!endpoint.startsWith('/') && !baseUrl.endsWith('/')) {
    return `${baseUrl}/${endpoint}`;
  }
  return `${baseUrl}${endpoint}`;
};

/**
 * Backend bağlantısını test eder
 * @returns {Promise<boolean>} Bağlantı durumu
 */
export const testBackendConnection = async () => {
  try {
    const baseUrl = await getApiBaseUrl();
    console.log(`Backend bağlantısı test ediliyor: ${baseUrl}`);
    
    // AsyncStorage'dan token'ı al (varsa)
    let token = null;
    try {
      token = await AsyncStorage.getItem('token');
    } catch (tokenError) {
      console.log('Token okunamadı:', tokenError);
    }
    
    // Eğer token varsa, doğruluğunu kontrol et
    if (token) {
      try {
        // Token'ın 'Bearer ' öneki varsa kaldır
        const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
        
        // Token kontrolü (varsa ve geçerliyse bir şey yapma)
        // Bu kısım sadece loglaması için
        console.log(`Token doğruluğu test ediliyor (${tokenValue.substring(0, 15)}...)`);
      } catch (jwtError) {
        console.log('Token doğrulama hatası:', jwtError);
      }
    }
    
    // Backend API'sine istek at
    const healthCheck = await pingServer(baseUrl);
    
    return healthCheck;
  } catch (error) {
    console.error('Backend bağlantı testi hatası:', error);
    return false;
  }
};

/**
 * Görsel URL'sini güvenli bir şekilde oluştur
 * @param {string|undefined} path Görsel yolu
 * @returns {string} Tam görsel URL'si
 */
const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/300x200?text=Resim+Yok';
  
  try {
    // Sabit IP adresi kullan (daha önce tanımlanmış MANUAL_BACKEND_IP)
    const baseUrl = `http://${MANUAL_BACKEND_IP}:${BACKEND_PORT}`;
    
    // Eğer tam URL ise doğrudan kullan
    if (path.startsWith('http')) {
      return path;
    }
    
    // MongoDB'den gelen /uploads/ yolları için özel işlem
    if (path.includes('/uploads/')) {
      // NSURLErrorDomain hatasını önlemek için başlangıç slash'ı kaldır
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      return `${baseUrl}/${cleanPath}`;
    }
    
    // Default thumbnail için
    if (path === 'default-thumbnail.jpg' || path.includes('default-thumbnail')) {
      return `${baseUrl}/uploads/images/default-thumbnail.jpg`;
    }
    
    // Diğer tüm göreceli yollar için
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${baseUrl}/${cleanPath}`;
  } catch (error) {
    console.error('Görsel URL oluşturma hatası:', error);
    return 'https://via.placeholder.com/300x200?text=Hatalı+URL';
  }
};

/**
 * Video URL'sini güvenli bir şekilde oluştur
 * @param {object} item Video öğesi 
 * @returns {string} Tam video URL'si
 */
const getVideoUrl = (item) => {
  try {
    if (!item) return '';
    
    // Sabit IP adresi kullan (daha önce tanımlanmış MANUAL_BACKEND_IP)
    const baseUrl = `http://${MANUAL_BACKEND_IP}:${BACKEND_PORT}`;
    
    // Web videolar için (YouTube, Vimeo, vb.)
    if (item.webUrl || item.web_url) {
      return item.webUrl || item.web_url;
    }
    
    // MongoDB'den gelen filePath alanı varsa
    if (item.filePath) {
      // NSURLErrorDomain hatasını önlemek için URL'yi doğru formatta oluştur
      const cleanPath = item.filePath.startsWith('/') ? item.filePath.substring(1) : item.filePath;
      return `${baseUrl}/${cleanPath}`;
    }
    
    // URL doğrudan varsa kullan
    if (item.url) {
      // URL zaten tam ise (http veya https ile başlıyorsa) doğrudan kullan
      if (item.url.startsWith('http')) {
        return item.url;
      }
      
      // URL göreceli ise tam URL oluştur
      const cleanPath = item.url.startsWith('/') ? item.url.substring(1) : item.url;
      return `${baseUrl}/${cleanPath}`;
    }
    
    // Filename (veya fileName) varsa URL oluştur
    if (item.filename || item.fileName) {
      const filename = item.filename || item.fileName;
      return `${baseUrl}/uploads/videos/${filename}`;
    }
    
    // Yedek video (Hiçbir URL bulunamadığında)
    return '';
  } catch (error) {
    console.error('Video URL oluşturma hatası:', error);
    return '';
  }
};

// networkConfig modülünü dışa aktar
module.exports = {
  MANUAL_BACKEND_IP,
  BACKEND_PORT,
  BACKEND_PATH,
  JWT_SECRET,
  getApiBaseUrl,
  getApiUrl,
  testBackendConnection,
  formatToken,
  getImageUrl,
  getVideoUrl
}; 