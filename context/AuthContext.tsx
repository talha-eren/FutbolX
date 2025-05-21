import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';
import { userService } from '../services/api';

interface User {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  username?: string;
  profileImage?: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  level?: string;
  position?: string;
  footPreference?: string;
  favoriteTeams?: string[];
  isAdmin?: boolean;
  stats?: {
    matches: number;
    goals: number;
    assists: number;
    playHours: number;
    rating: number;
  };
  // Diğer kullanıcı özellikleri buraya eklenebilir
}

// Kayıt için profil bilgileri tipi
interface UserProfileData {
  bio?: string;
  location?: string;
  website?: string;
  // Diğer profil özellikleri
}

interface SocialLoginData {
  token: string;
  user: User;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string;
  token: string | null;
  login: (username: string, password: string, social?: boolean, socialData?: SocialLoginData) => Promise<boolean>;
  register: (name: string, username: string, email: string, password: string, profileData?: UserProfileData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Uygulama başladığında AsyncStorage'dan kullanıcı bilgilerini yükle
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const savedToken = await AsyncStorage.getItem('token');
        
        console.log('AuthContext: Kullanıcı verileri yükleniyor...');
        console.log('Token durumu:', savedToken ? 'Token mevcut' : 'Token yok');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('Kullanıcı bilgileri yüklendi:', { id: parsedUser.id, username: parsedUser.username });
          setUser(parsedUser);
        }
        
        if (savedToken) {
          console.log('Token yüklendi:', savedToken.substring(0, 15) + '...');
          setToken(savedToken);
        } else {
          console.warn('Token bulunamadı! Kullanıcı oturum açmamış olabilir.');
        }
      } catch (error) {
        console.error('Kullanıcı verileri yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Kullanıcı verilerini yenile
  const refreshUserData = async (): Promise<void> => {
    try {
      // Mevcut token'ı kontrol et
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Token bulunamadı, veri yenilenemez');
        throw new Error('Token bulunamadı');
      }
      
      // Kullanıcı profil verilerini al
      const response = await userService.getProfile();
      
      // Kullanıcı verisini hazırla
      const updatedUser = {
        id: response._id || response.id,
        name: response.name,
        username: response.username,
        email: response.email,
        profilePicture: response.profilePicture,
        bio: response.bio || '',
        location: response.location || '',
        favoriteTeams: response.favoriteTeams || [],
        stats: response.stats || {},
        level: response.level || '',
        position: response.position || '',
        footPreference: response.footPreference || '',
        // Diğer kullanıcı bilgileri...
      };
      
      // Context state'ini güncelle
      setUser(updatedUser);
    } catch (error: any) {
      console.error('Kullanıcı verileri yenilenemedi:', error);
      
      // Token geçersizse ve 401 hatası alınırsa, otomatik logout yap
      if (error.message && (
        error.message.includes('token') || 
        error.message.includes('Token') || 
        error.message.includes('auth') || 
        error.message.includes('401')
      )) {
        console.log('Token geçersiz, kullanıcı çıkış yapıyor...');
        // Token'ı yenile ve tekrar dene (Burada gerekirse backend'in token 
        // yenileme endpoint'ini çağırabilirsiniz)
        
        // Yenileme başarısız olursa logout
        // await logout();
      }
      
      throw error;
    }
  };

  // Giriş fonksiyonu - Normal ve sosyal giriş destekli
  const login = async (
    username: string,
    password: string,
    social?: boolean,
    socialData?: SocialLoginData
  ): Promise<boolean> => {
      setIsLoading(true);
      setError('');
      
    try {
      console.log('AuthContext: Giriş isteği gönderiliyor...', { username, passwordLength: password.length });
      
      // Backend API'sine giriş isteği gönder
      const response = await authService.login(username, password);
      console.log('AuthContext: authService.login yanıtı ALINDI:', JSON.stringify(response, null, 2));
      
      // Yanıtı kontrol et
      if (!response) {
        throw new Error('Sunucudan yanıt alınamadı.');
      }
      
      if (!response.token || !response.user) {
        console.error('AuthContext: API yanıtında token veya user eksik:', response);
        throw new Error('Geçersiz API yanıtı: Token veya kullanıcı bilgileri eksik.');
      }
      
      // Token'ı ve kullanıcı verilerini sakla
      const token = response.token;
      const user = response.user;
      
      console.log('AuthContext: API yanıtından alınan token (ilk 10 karakter):', token.substring(0, 10));
      console.log('AuthContext: API yanıtından alınan kullanıcı:', {
        id: user.id || user._id,
        username: user.username || user.email
      });
      
      // JWT token'ın sona erme süresini hesapla (varsayılan olarak 24 saat)
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);
      
      // AsyncStorage'e kaydet
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('tokenExpiry', tokenExpiry.toISOString());
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      console.log('AuthContext: Token ve kullanıcı bilgileri AsyncStorage\'e kaydedildi.');
      
      // Context state'ini güncelle
      setIsLoggedIn(true);
      setToken(token);
      setUser(user);
      
      console.log('AuthContext: Giriş başarılı, state güncellendi.');
      return true;
    } catch (error: any) {
      console.error('AuthContext: Giriş işlemi sırasında hata:', error.message || error);
      // Hata durumunda state ve storage temizle
      setIsLoggedIn(false);
      setToken(null);
      setUser(null);
      
      // AsyncStorage'den silinse iyi olur
      try {
        await AsyncStorage.multiRemove(['token', 'tokenExpiry', 'user']);
      } catch (storageError) {
        console.error('AuthContext: AsyncStorage temizleme hatası:', storageError);
      }
      
      setError(error.message || 'Giriş işlemi sırasında bir hata oluştu.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Token durumunu izle ve oturum durumunu güncelle
  useEffect(() => {
    setIsLoggedIn(!!token && !!user);
  }, [token, user]);

  // Kayıt fonksiyonu
  const register = async (
    name: string, 
    username: string, 
    email: string, 
    password: string,
    profileData?: UserProfileData
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log('AuthContext: Kayıt isteği gönderiliyor...', {
        name, username, email, profileData
      });
      
      // Backend API'sine kayıt isteği gönder
      const response = await authService.register(
        username, 
        email, 
        password, 
        name, 
        profileData
      );
      
      console.log('Kayıt başarılı, kullanıcı bilgileri alındı:', response.user);
      
      // Token ve kullanıcı bilgilerini AsyncStorage'a kaydet
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      // Kullanıcı bilgilerini state'e ayarla
      setUser(response.user);
      setToken(response.token);
      return true;
    } catch (error) {
      console.error('Kayıt olurken hata:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Çıkış fonksiyonu
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Backend API'sine çıkış isteği gönder (opsiyonel)
      await authService.logout();
      
      // Token ve kullanıcı bilgilerini AsyncStorage'dan temizle
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Kullanıcı bilgilerini state'den temizle
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Çıkış yaparken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
    user,
    isLoading,
    isLoggedIn,
    error,
        token,
    login,
    register,
    logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
