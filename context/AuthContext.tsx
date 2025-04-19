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
  login: (username: string, password: string) => Promise<boolean>;
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

  // Giriş fonksiyonu
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Backend API'sine giriş isteği gönder
      const response = await authService.login(username, password);
      
      // Kullanıcı bilgilerini ayarla
      setUser(response.user);
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
    name: string, 
    username: string, 
    email: string, 
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Backend API'sine kayıt isteği gönder
      const response = await authService.register(username, email, password, name);
      
      // Kullanıcı bilgilerini ayarla
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
      
      // Backend API'sine çıkış isteği gönder
      await authService.logout();
      
      // Kullanıcı bilgilerini temizle
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
    logout,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
