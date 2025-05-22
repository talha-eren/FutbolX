import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
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
  phone?: string;
  stats?: {
    matches: number;
    goals: number;
    assists: number;
    playHours: number;
    rating: number;
  };
  // Veritabanından gelen ek alanlar
  firstName?: string;
  lastName?: string;
  footballExperience?: string;
  preferredFoot?: string;
  favoriteTeam?: string;
  height?: number;
  weight?: number;
  createdAt?: string;
  updatedAt?: string;
  // Diğer kullanıcı özellikleri buraya eklenebilir
}

// Kayıt için profil bilgileri tipi
interface UserProfileData {
  bio?: string;
  location?: string;
  website?: string;
  firstName?: string;
  lastName?: string;
  footballExperience?: string;
  preferredFoot?: string;
  favoriteTeam?: string;
  height?: number;
  weight?: number;
  phone?: string;
  position?: string;
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
      console.log('Sunucudan alınan kullanıcı verileri:', response);
      
      // Kullanıcı verisini hazırla - tüm alanları dahil et
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
        phone: response.phone || '',
        
        // Önemli profil alanları - bunların veritabanında olduğundan emin oluyoruz
        firstName: response.firstName || response.name || '',
        lastName: response.lastName || '',
        footballExperience: response.footballExperience || response.level || '',
        preferredFoot: response.preferredFoot || response.footPreference || '',
        favoriteTeam: response.favoriteTeam || '',
        height: response.height || 0,
        weight: response.weight || 0,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      };
      
      console.log('Güncellenmiş kullanıcı verileri:', {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        favoriteTeam: updatedUser.favoriteTeam,
        footballExperience: updatedUser.footballExperience,
        preferredFoot: updatedUser.preferredFoot,
        height: updatedUser.height,
        weight: updatedUser.weight
      });
      
      // Context state'ini güncelle
      setUser(updatedUser);
      
      // AsyncStorage'e güncel kullanıcı verilerini kaydet
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
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
      
      // Bilgilendirme mesajı göster
      if (Platform.OS !== 'web') {
        // Web'de Alert kullanma
        Alert.alert(
          "Giriş Yapılıyor",
          "Lütfen bekleyin...",
          [],
          { cancelable: false }
        );
      }
      
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
        username: user.username || user.email,
        favoriteTeam: user.favoriteTeam,
        footballExperience: user.footballExperience,
        preferredFoot: user.preferredFoot,
        height: user.height,
        weight: user.weight
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
      
      // Kullanıcı verilerini sunucudan yenile
      try {
        console.log('Giriş sonrası kullanıcı verileri yenileniyor...');
        await refreshUserData();
        console.log('Kullanıcı verileri başarıyla yenilendi');
      } catch (refreshError) {
        console.log('Kullanıcı verileri yenilenirken hata:', refreshError);
        // Hata olsa bile devam et
      }
      
      // Başarılı giriş mesajı
      if (Platform.OS !== 'web') {
        Alert.alert(
          "Giriş Başarılı",
          `Hoş geldiniz, ${user.name || username}!`,
          [{ text: "Tamam", style: "default" }]
        );
      }
      
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
      
      // Profil verilerini kontrol et ve varsayılan değerler ata
      const enhancedProfileData = {
        ...profileData,
        firstName: profileData?.firstName || name.split(' ')[0] || '',
        lastName: profileData?.lastName || (name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : ''),
        footballExperience: profileData?.footballExperience || 'Başlangıç',
        preferredFoot: profileData?.preferredFoot || 'Sağ',
        favoriteTeam: profileData?.favoriteTeam || '',
        height: profileData?.height ? Number(profileData.height) : 0,
        weight: profileData?.weight ? Number(profileData.weight) : 0,
        position: profileData?.position || '',
        level: profileData?.footballExperience || 'Başlangıç',
        footPreference: profileData?.preferredFoot || 'Sağ'
      };
      
      console.log('KAYIT - Zenginleştirilmiş profil verileri:', enhancedProfileData);
      
      // Backend API'sine kayıt isteği gönder
      let response: any = { token: null, user: null };
      
      try {
        const apiResponse = await authService.register(
          username, 
          email, 
          password, 
          name, 
          enhancedProfileData
        );
        
        console.log('KAYIT YANITI ALINDI:', apiResponse);
        
        if (apiResponse) {
          response = apiResponse;
        }
      } catch (apiError) {
        console.error('API kayıt hatası:', apiError);
        // Hata durumunda varsayılan response kullanılır
      }
      
      // Sunucudan gelen yanıtı kontrol et
      if (!response || !response.user) {
        console.warn('Sunucudan gelen yanıtta user nesnesi bulunamadı, manuel oluşturulacak');
        
        // Response nesnesini oluştur
        if (!response) {
          response = { token: null, user: null };
        }
        
        // User nesnesini oluştur
        if (!response.user) {
          response.user = {
            username,
            email,
            name,
            // Profil bilgileri
            ...enhancedProfileData
          };
        }
      }
      
      console.log('KAYIT BAŞARILI - Kullanıcı bilgileri:', response.user);
      
      // Kullanıcı verisini zenginleştir - sunucudan gelen veriler ile birleştir
      // Öncelik sunucudan gelen verilerde, yoksa kendi gönderdiğimiz verileri kullan
      const enrichedUser: any = {
        // Temel bilgiler
        id: response.user?._id || response.user?.id || '',
        name: response.user?.name || name,
        username: response.user?.username || username,
        email: response.user?.email || email,
        
        // Profil bilgileri - önce sunucudan gelen, yoksa bizim gönderdiğimiz
        firstName: response.user?.firstName || enhancedProfileData.firstName,
        lastName: response.user?.lastName || enhancedProfileData.lastName,
        footballExperience: response.user?.footballExperience || enhancedProfileData.footballExperience,
        preferredFoot: response.user?.preferredFoot || enhancedProfileData.preferredFoot,
        favoriteTeam: response.user?.favoriteTeam || enhancedProfileData.favoriteTeam,
        height: response.user?.height || enhancedProfileData.height,
        weight: response.user?.weight || enhancedProfileData.weight,
        position: response.user?.position || enhancedProfileData.position,
        level: response.user?.level || response.user?.footballExperience || enhancedProfileData.footballExperience,
        footPreference: response.user?.footPreference || response.user?.preferredFoot || enhancedProfileData.preferredFoot,
        
        // Diğer bilgiler
        bio: response.user?.bio || enhancedProfileData.bio || '',
        location: response.user?.location || enhancedProfileData.location || '',
        phone: response.user?.phone || enhancedProfileData.phone || '',
        
        // İstatistikler
        stats: response.user?.stats || {
          matches: 0,
          goals: 0,
          assists: 0,
          playHours: 0,
          rating: 0
        }
      };
      
      console.log('KAYIT - ZENGİNLEŞTİRİLMİŞ KULLANICI VERİLERİ:', {
        id: enrichedUser.id,
        name: enrichedUser.name,
        favoriteTeam: enrichedUser.favoriteTeam,
        footballExperience: enrichedUser.footballExperience,
        preferredFoot: enrichedUser.preferredFoot,
        height: enrichedUser.height,
        weight: enrichedUser.weight
      });
      
      // Token ve kullanıcı bilgilerini AsyncStorage'a kaydet
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        setToken(response.token);
      } else {
        console.warn('Token bulunamadı, kayıt işlemi eksik olabilir');
      }
      
      await AsyncStorage.setItem('user', JSON.stringify(enrichedUser));
      
      // Kullanıcı bilgilerini state'e ayarla
      setUser(enrichedUser);
      setIsLoggedIn(!!response.token);
      
      // Kullanıcı verilerini sunucudan yenile - verilerin doğru kaydedildiğinden emin olmak için
      if (response.token) {
        try {
          console.log('Kullanıcı verileri sunucudan yenileniyor...');
          await refreshUserData();
          console.log('Kullanıcı verileri başarıyla yenilendi');
          
          // Profil verilerini manuel olarak güncelle
          try {
            console.log('Profil verilerini manuel olarak güncelleme...');
            
            // Profil verilerini güncelleme isteği için hazırla - sunucu loglarına göre düzenlendi
            const updateProfileData = {
              // Sunucu loglarında görülen çalışan alanlar
              level: enhancedProfileData.footballExperience || 'Başlangıç',
              footPreference: enhancedProfileData.preferredFoot || 'Sağ',
              position: enhancedProfileData.position || '',
              bio: enhancedProfileData.bio || '',
              location: enhancedProfileData.location || '',
              phone: enhancedProfileData.phone || '',
              
              // Diğer profil alanları
              favoriteTeam: enhancedProfileData.favoriteTeam || '',
              footballExperience: enhancedProfileData.footballExperience || enhancedProfileData.level || 'Başlangıç',
              preferredFoot: enhancedProfileData.preferredFoot || enhancedProfileData.footPreference || 'Sağ',
              firstName: enhancedProfileData.firstName || '',
              lastName: enhancedProfileData.lastName || '',
              height: enhancedProfileData.height || 0,
              weight: enhancedProfileData.weight || 0
            };
            
            console.log('Manuel profil güncelleme verileri:', updateProfileData);
            
            // Profil güncelleme
            const updatedProfile = await userService.updateProfile(updateProfileData);
            console.log('Profil manuel olarak güncellendi:', updatedProfile);
            
            // Güncellenmiş verileri state'e aktar
            setUser(prev => ({
              ...prev,
              ...updateProfileData, // Önce gönderdiğimiz verileri ekle
              ...updatedProfile     // Sonra sunucudan dönen verileri ekle (üzerine yazar)
            }));
            
            // AsyncStorage'e güncelle
            await AsyncStorage.setItem('user', JSON.stringify({
              ...enrichedUser,
              ...updateProfileData, // Önce gönderdiğimiz verileri ekle
              ...updatedProfile     // Sonra sunucudan dönen verileri ekle (üzerine yazar)
            }));
            
          } catch (updateError) {
            console.error('Manuel profil güncelleme hatası:', updateError);
            // Hata olsa bile devam et
          }
        } catch (refreshError) {
          console.log('Kullanıcı verileri yenilenirken hata:', refreshError);
          // Hata olsa bile devam et
        }
      }
      
      // Başarılı kayıt mesajı
      Alert.alert(
        "Kayıt Başarılı",
        "FutbolX'e hoş geldiniz! Hesabınız başarıyla oluşturuldu.",
        [{ text: "Tamam", style: "default" }]
      );
      
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
