import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL'sini burada tanımlıyoruz
const API_URL = 'http://10.0.2.2:5000/api'; // Android emülatör için localhost bağlantısı

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
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Giriş başarısız');
      }
      
      // Token ve kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  },

  // Kullanıcı Kaydı
  register: async (username: string, email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, name })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Kayıt başarısız');
      }
      
      // Kayıt başarılı olduğunda token ve kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
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
