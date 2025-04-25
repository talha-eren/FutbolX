import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API URL'sini platform bazlı tanımlıyoruz
let API_URL = '';

// Platform kontrolü yaparak uygun API URL'sini belirle
try {
  if (Platform.OS === 'web') {
    API_URL = 'http://localhost:5000/api'; // Web için localhost
  } else if (Platform.OS === 'android') {
    API_URL = 'http://10.0.2.2:5000/api'; // Android emülatör için
  } else if (Platform.OS === 'ios') {
    API_URL = 'http://localhost:5000/api'; // iOS için
  } else {
    API_URL = 'http://localhost:5000/api'; // Varsayılan
  }
} catch (error) {
  // Platform.OS erişilemezse (örneğin, Node.js ortamında çalışırken)
  API_URL = 'http://localhost:5000/api'; // Varsayılan olarak localhost kullan
  console.log('Platform tespiti yapılamadı, varsayılan API URL kullanılıyor:', API_URL);
}

console.log('API URL:', API_URL);

// Kimlik doğrulama başlıklarını hazırlayan yardımcı fonksiyon
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
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
  register: async (username: string, email: string, password: string, name: string) => {
    try {
      console.log(`API isteği gönderiliyor: ${API_URL}/auth/register`);
      console.log('Kayıt verileri:', { username, email, name });
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, name })
      });

      const data = await response.json();
      console.log('Sunucu yanıtı:', { status: response.status, ok: response.ok, data });
      
      if (!response.ok) {
        // Daha detaylı hata bilgisi
        console.error('Kayıt başarısız:', data);
        
        // Hata mesajını oluştur
        let errorMessage = data.message || 'Kayıt başarısız';
        
        // MongoDB duplicate key hatasını kontrol et
        if (data.message && data.message.includes('duplicate key')) {
          errorMessage = 'Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor';
        }
        
        // Hata nesnesine ek bilgiler ekle
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).response = { data, status: response.status };
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

// Kullanıcı Profil Servisleri
export const userService = {
  // Profil Bilgilerini Getir
  getProfile: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Profil bilgileri alınamadı');
      }
      
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
  },

  // Şifre Değiştir
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Şifre değiştirilemedi');
      }
      
      return data;
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      throw error;
    }
  }
};
