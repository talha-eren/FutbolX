import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  fullName: string;
  email: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

// @ts-ignore
const AuthContext = createContext<AuthContextType>();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Uygulama başladığında localStorage'dan kullanıcı bilgilerini yükle
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

  // Giriş fonksiyonu
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerçek uygulamada burada API'ye istek gönderilir
      // Şimdilik önceden tanımlanmış bir kullanıcı ile devam ediyoruz
      const mockUser: User = {
        id: '1',
        fullName: 'Test Kullanıcı',
        email: email,
        username: 'testuser'
      };
      
      // Kullanıcı bilgilerini yerel depolamaya kaydet
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('Giriş yaparken hata:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Kayıt fonksiyonu
  const register = async (
    fullName: string, 
    username: string, 
    email: string, 
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerçek uygulamada burada API'ye istek gönderilir
      // Şimdilik başarılı bir kayıt simüle ediyoruz
      const newUser: User = {
        id: Date.now().toString(),
        fullName,
        email,
        username
      };
      
      // Normalde giriş yapmadan önce doğrulama gerekebilir
      // Şimdilik kayıt sonrası otomatik giriş yapılmaz
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
      // Kullanıcı bilgilerini yerel depolamadan sil
      await AsyncStorage.removeItem('user');
      setUser(null);
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
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
