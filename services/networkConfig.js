import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Manuel IP yapılandırması - Backend sunucunuzun IP'sini buraya girin
// NOT: Eğer backend bağlantısı kurulamıyorsa burayı düzenleyin
const MANUAL_BACKEND_IP = '192.168.1.59'; // Bilgisayarınızın veya backend sunucunuzun IP'si

// Backend yapılandırması
const BACKEND_PORT = 5000; // Backend port
const BACKEND_PATH = '/api'; // API yolu

// IP adresi öncelik sıralaması (platform bazlı)
const IP_PRIORITIES = {
  ios: ["192.168.1.59", "localhost", "127.0.0.1", "10.0.2.2"], // iOS simulator için
  android: ["192.168.1.59", "10.0.2.2", "localhost", "127.0.0.1"], // Android emulator için
  default: ["192.168.1.59", "localhost", "127.0.0.1"] // Web için
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
 * Backend bağlantısını test eden fonksiyon
 * @returns {Promise<boolean>} Bağlantı başarılı mı?
 */
export const testBackendConnection = async () => {
  try {
    const baseUrl = await getApiBaseUrl();
    return await pingServer(baseUrl);
  } catch (error) {
    console.error('❌ Backend bağlantı testi başarısız:', error);
    return false;
  }
};

export default {
  getApiBaseUrl,
  getApiUrl,
  testBackendConnection,
  MANUAL_BACKEND_IP
}; 