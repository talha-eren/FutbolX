import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  Image
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FutbolXLogo } from '@/components/FutbolXLogo';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

function LoginScreen() {
  // Temel state ve hooklar
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { login, isLoading: authLoading, error: authError } = useAuth();
  
  // Form state'leri
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Animasyon state'leri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Hata durumunda sallama animasyonu
  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start();
  };
  
  // Renk teması
  const isDark = colorScheme === 'dark';
  const primaryColor = '#1976D2'; // Ana mavi renk
  const secondaryColor = '#0D47A1'; // Koyu mavi
  const accentColor = '#42A5F5'; // Açık mavi
  const backgroundColor = isDark ? '#121212' : '#F5F7FA';
  const cardColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const inputBackgroundColor = isDark ? '#333' : '#F5F5F5';
  const placeholderColor = isDark ? '#AAA' : '#999';
  const errorColor = '#FF5252';

  // Animasyonları başlat
  useEffect(() => {
    // Sayfa yüklenirken animasyonları başlat
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 1200,
        delay: 300,
        useNativeDriver: true
      })
    ]).start();
    
    // Auth hatası varsa login hatasına ayarla
    if (authError) {
      setLoginError(authError);
    }
  }, [fadeAnim, slideAnim, formOpacity, authError]);
  
  // Sayfa yüklenirken yapılacak işlemler
  useEffect(() => {
    console.log('Login sayfası yüklendi');
  }, []);

  // Normal giriş fonksiyonu
  const handleLogin = async () => {
    // Klavyeyi kapat
    Keyboard.dismiss();
    
    // Form doğrulama
    if (!username.trim()) {
      setLoginError('Kullanıcı adı gereklidir');
      shakeAnimation();
      return;
    }
    
    if (!password.trim()) {
      setLoginError('Şifre gereklidir');
      shakeAnimation();
      return;
    }
    
    setIsLoading(true);
    setLoginError(''); // Önceki hataları temizle
    
    try {
      console.log('Giriş isteği gönderiliyor:', { username, password: '***' });
      
      // Giriş yap
      await login(username, password);
      
      console.log('Giriş başarılı, ana sayfaya yönlendiriliyor');
      
      // Doğrudan ana sayfaya yönlendir
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('Giriş yaparken hata:', error.message || error);
      
      // Hata mesajını daha kullanıcı dostu hale getir
      let errorMessage = 'Giriş başarısız';
      
      if (error.message) {
        if (error.message.includes('Geçersiz kullanıcı adı veya şifre')) {
          errorMessage = 'Kullanıcı adı veya şifre hatalı';
        } else if (error.message.includes('Sunucu')) {
          errorMessage = 'Sunucuya bağlanırken bir sorun oluştu';
        } else {
          errorMessage = error.message;
        }
      }
      
      setLoginError(errorMessage);
      shakeAnimation();
    } finally {
      setIsLoading(false);
    }
  };

  // Kayıt sayfasına geçiş
  const goToRegister = () => {
    // Kayıt sayfasına geçerken animasyon
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      router.push('/register');
    });
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={isDark ? 
          ['#0A1929', '#102A43', '#1E3A5F'] : 
          ['#E1F5FE', '#B3E5FC', '#E3F2FD']}
        style={styles.gradientBackground}
      >
        <Animated.View 
          style={[{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }]}
        >
          <ScrollView 
            contentContainerStyle={styles.container} 
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <FutbolXLogo size={120} showText={false} />
              <ThemedText style={styles.title}>FutbolX</ThemedText>
              <ThemedText style={styles.subtitle}>Futbol tutkunlarını buluşturan platform</ThemedText>
            </View>

            <Animated.View 
              style={[styles.formCard, { 
                backgroundColor: cardColor,
                opacity: formOpacity,
                transform: [{ translateY: slideAnim }]
              }]}
            >
              <ThemedText style={styles.formTitle}>Hesabınıza Giriş Yapın</ThemedText>
              
              {/* Hata mesajı */}
              {loginError ? (
                <Animated.View 
                  style={[styles.errorContainer, {
                    transform: [{ translateX: shakeAnim }]
                  }]}
                >
                  <MaterialIcons name="error-outline" size={20} color={errorColor} />
                  <ThemedText style={styles.errorText}>{loginError}</ThemedText>
                </Animated.View>
              ) : null}
              
              {/* Kullanıcı adı input */}
              <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
                <IconSymbol name="person" size={20} color={primaryColor} />
                <TextInput 
                  style={[styles.input, { color: textColor }]}
                  placeholder="Kullanıcı Adı"
                  placeholderTextColor={placeholderColor}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
              
              {/* Şifre input */}
              <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
                <IconSymbol name="lock" size={20} color={primaryColor} />
                <TextInput 
                  style={[styles.input, { color: textColor }]}
                  placeholder="Şifre"
                  placeholderTextColor={placeholderColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 5 }}>
                  <IconSymbol 
                    name={showPassword ? "eye.slash" : "eye"} 
                    size={20} 
                    color={primaryColor} 
                  />
                </TouchableOpacity>
              </View>

              {/* Giriş butonu */}
              <TouchableOpacity 
                style={[styles.button, { 
                  backgroundColor: isLoading || authLoading ? secondaryColor : primaryColor,
                  shadowColor: primaryColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8
                }]}
                onPress={handleLogin}
                disabled={isLoading || authLoading}
              >
                {isLoading || authLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <ThemedText style={styles.buttonText}>Giriş Yap</ThemedText>
                )}
              </TouchableOpacity>

              {/* Şifremi unuttum */}
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={() => router.push('/forgot-password')}
              >
                <ThemedText style={[styles.forgotPassword, { color: primaryColor }]}>
                  Şifremi Unuttum
                </ThemedText>
              </TouchableOpacity>

              {/* Kayıt ol */}
              <View style={styles.registerContainer}>
                <ThemedText style={styles.registerText}>Hesabınız yok mu? </ThemedText>
                <TouchableOpacity onPress={goToRegister}>
                  <ThemedText style={[styles.registerLink, { color: primaryColor }]}>
                    Hemen Kaydolun
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </Animated.View>
            
            <View style={styles.footerContainer}>
              <ThemedText style={styles.footerText}>© 2025 FutbolX - Tüm Hakları Saklıdır</ThemedText>
            </View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  // Ana container
  gradientBackground: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  
  // Logo bölümü
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  
  // Form kartı
  formCard: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Hata mesajı
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  
  // Input alanları
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  
  // Butonlar
  button: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Şifremi unuttum
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Kayıt ol
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Footer
  footerContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
