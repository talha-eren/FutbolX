import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  profilePicture?: string;
  favoriteTeams?: string[];
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string;
  login: (username: string | null, password: string | null, socialLoginData?: any) => Promise<boolean>;
  register: (name: string, username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

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

  useEffect(() => {
    // Uygulama başladığında AsyncStorage'dan kullanıcı bilgilerini yükle
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Kullanıcı verileri yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Kullanıcı verilerini yenileme fonksiyonu
  const refreshUserData = async (): Promise<void> => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Kullanıcı verileri yenilenirken hata:', error);
    }
  };

  // Giriş fonksiyonu - Normal ve sosyal giriş destekli
  const login = async (username: string | null, password: string | null, socialLoginData?: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError('');
      
      // Sosyal giriş kontrolü
      if (socialLoginData) {
        console.log('AuthContext: Sosyal giriş verileri işleniyor...');
        
        // Sosyal giriş verilerini doğrudan kullan
        const response = socialLoginData;
        
        if (!response.token || !response.user) {
          const errorMsg = 'Sosyal giriş verileri geçersiz';
          console.error('Geçersiz sosyal giriş verileri:', response);
          setError(errorMsg);
          throw new Error(errorMsg);
        }
        
        console.log('Sosyal giriş başarılı, kullanıcı bilgileri alındı:', { id: response.user.id, username: response.user.username });
        
        // Token ve kullanıcı bilgilerini AsyncStorage'a kaydet
        try {
          await AsyncStorage.setItem('token', response.token);
          await AsyncStorage.setItem('user', JSON.stringify(response.user));
          console.log('Sosyal giriş kullanıcı bilgileri kaydedildi');
        } catch (storageError) {
          console.error('AsyncStorage hatası:', storageError);
          // Depolama hatası olsa bile devam et
        }
        
        // Kullanıcı bilgilerini state'e ayarla
        setUser(response.user);
        return true;
      }
      
      // Normal giriş için parametreleri kontrol et
      if (!username || !password) {
        const errorMsg = 'Kullanıcı adı ve şifre gereklidir';
        console.error('Eksik parametreler:', { username: !!username, password: !!password });
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Şifre uzunluğunu kontrol et
      if (password.length < 6) {
        const errorMsg = 'Şifre en az 6 karakter olmalıdır';
        console.error('Şifre çok kısa');
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('AuthContext: Giriş isteği gönderiliyor...', { username, passwordLength: password.length });
      
      // Backend API'sine giriş isteği gönder
      const response = await authService.login(username, password);
      
      // Yanıtı kontrol et
      if (!response) {
        const errorMsg = 'Sunucudan yanıt alınamadı';
        console.error('Yanıt alınamadı');
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!response.token || !response.user) {
        const errorMsg = 'Sunucudan geçerli yanıt alınamadı';
        console.error('Geçersiz yanıt formatı:', response);
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Giriş başarılı, kullanıcı bilgileri alındı:', { id: response.user.id, username: response.user.username });
      
      // Token ve kullanıcı bilgilerini AsyncStorage'a kaydet
      try {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        console.log('Kullanıcı bilgileri kaydedildi');
      } catch (storageError) {
        console.error('AsyncStorage hatası:', storageError);
        // Depolama hatası olsa bile devam et
      }
      
      // Kullanıcı bilgilerini state'e ayarla
      setUser(response.user);
      return true;
    } catch (error: any) {
      console.error('Giriş yaparken hata:', error?.message || error);
      // Hata fırlat, böylece UI tarafında yakalanabilir
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Kayıt fonksiyonu
  const register = async (
    name: string, 
    username: string, 
    email: string, 
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log('AuthContext: Kayıt isteği gönderiliyor...');
      // Backend API'sine kayıt isteği gönder
      const response = await authService.register(username, email, password, name);
      
      console.log('Kayıt başarılı, kullanıcı bilgileri alındı:', response.user);
      
      // Token ve kullanıcı bilgilerini AsyncStorage'a kaydet
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      // Kullanıcı bilgilerini state'e ayarla
      setUser(response.user);
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
      
      console.log('Çıkış başarılı, kullanıcı oturumu kapatıldı');
    } catch (error) {
      console.error('Çıkış yaparken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isLoggedIn: !!user,
    error,
    login,
    register,
    logout,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
