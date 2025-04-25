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
  Keyboard
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

export default function LoginScreen() {
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
  const primaryColor = '#4CAF50'; // Ana yeşil renk
  const secondaryColor = '#388E3C'; // Koyu yeşil
  const accentColor = '#8BC34A'; // Açık yeşil
  const backgroundColor = isDark ? '#121212' : '#FFFFFF';
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
  
  // Giriş fonksiyonu - veritabanıyla daha iyi entegre
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
      
      // SADECE TEST KULLANICISI İÇİN ÖZEL KONTROL
      if (username === 'ttt' && (password === 'ttt' || password === 'ttt123456')) {
        console.log('Test kullanıcısı algılandı, özel giriş yapılıyor');
      }
      
      // Giriş yap
      const success = await login(username, password);
      
      if (success) {
        console.log('Giriş başarılı, ana sayfaya yönlendiriliyor');
        
        // Başarılı giriş animasyonu
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 500,
          useNativeDriver: true
        }).start(() => {
          // Ana sayfaya yönlendir
          router.replace('/');
        });
      }
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
          ['#0F2027', '#203A43', '#2C5364'] : 
          ['#F0F2F0', '#E5E8E8', '#FFFFFF']}
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
              <FutbolXLogo size={150} showText={false} />
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
              {/* Hata mesajı */}
              {loginError ? (
                <Animated.View style={styles.errorContainer}>
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
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <ThemedText style={[styles.forgotPassword, { color: accentColor }]}>
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

              {/* Ayırıcı */}
              <View style={styles.separator}>
                <View style={[styles.separatorLine, { backgroundColor: placeholderColor }]} />
                <ThemedText style={styles.separatorText}>veya</ThemedText>
                <View style={[styles.separatorLine, { backgroundColor: placeholderColor }]} />
              </View>

              {/* Sosyal giriş butonları */}
              <View style={styles.socialLoginContainer}>
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: '#4267B2' }]}
                  onPress={() => console.log('Facebook ile giriş')}
                >
                  <MaterialIcons name="facebook" size={20} color="white" style={styles.socialIcon} />
                  <ThemedText style={styles.socialButtonText}>Facebook ile Giriş Yap</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: '#DB4437' }]}
                  onPress={() => console.log('Google ile giriş')}
                >
                  <MaterialIcons name="mail" size={20} color="white" style={styles.socialIcon} />
                  <ThemedText style={styles.socialButtonText}>Google ile Giriş Yap</ThemedText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

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
  
  // Ayırıcı
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    paddingHorizontal: 10,
    fontSize: 14,
    opacity: 0.7,
  },
  
  // Sosyal giriş butonları
  socialLoginContainer: {
    gap: 15,
    marginTop: 10,
  },
  socialButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
