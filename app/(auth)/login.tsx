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
  Image,
  ImageBackground
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FutbolXLogo } from '@/components/FutbolXLogo';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Futbol sahası arka plan resmi
const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1476&auto=format&fit=crop';

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
  const logoScale = useRef(new Animated.Value(0.8)).current;
  
  // Hata durumunda sallama animasyonu
  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start();
  };
  
  // Renk teması - Yeşil tema
  const isDark = colorScheme === 'dark';
  const primaryColor = '#4CAF50'; // Ana yeşil renk
  const secondaryColor = '#2E7D32'; // Koyu yeşil
  const accentColor = '#8BC34A'; // Açık yeşil
  const backgroundColor = isDark ? '#121212' : '#F5F7FA';
  const cardColor = isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const inputBackgroundColor = isDark ? 'rgba(51, 51, 51, 0.8)' : 'rgba(245, 245, 245, 0.8)';
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
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      })
    ]).start();
    
    // Auth hatası varsa login hatasına ayarla
    if (authError) {
      setLoginError(authError);
    }
  }, [fadeAnim, slideAnim, formOpacity, logoScale, authError]);
  
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
      Alert.alert("Hata", "Lütfen kullanıcı adınızı girin.");
      return;
    }
    
    if (!password.trim()) {
      setLoginError('Şifre gereklidir');
      shakeAnimation();
      Alert.alert("Hata", "Lütfen şifrenizi girin.");
      return;
    }
    
    setIsLoading(true);
    setLoginError(''); // Önceki hataları temizle
    
    try {
      console.log('Giriş isteği gönderiliyor:', { username, password: '***' });
      
      // Giriş animasyonu başlat
      Animated.sequence([
        Animated.timing(logoScale, { toValue: 1.1, duration: 300, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();
      
      // Giriş yap
      await login(username, password);
      
      console.log('Giriş başarılı, ana sayfaya yönlendiriliyor');
      
      // Başarılı animasyon
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -50, duration: 500, useNativeDriver: true })
      ]).start(() => {
        // Animasyon bittikten sonra yönlendir
        router.replace('/(tabs)');
      });
      
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
      
      // Hata animasyonu ve mesajı
      setLoginError(errorMessage);
      shakeAnimation();
      
      // Kullanıcıya hata mesajını göster
      Alert.alert(
        "Giriş Başarısız",
        errorMessage,
        [{ text: "Tamam", style: "cancel" }]
      );
      
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
      <ImageBackground
        source={{ uri: BACKGROUND_IMAGE }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={isDark ? 
            ['rgba(10, 46, 10, 0.9)', 'rgba(27, 77, 27, 0.85)', 'rgba(46, 125, 50, 0.8)'] : 
            ['rgba(232, 245, 233, 0.9)', 'rgba(200, 230, 201, 0.85)', 'rgba(232, 245, 233, 0.8)']}
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
                <Animated.View style={{
                  transform: [
                    { scale: logoScale }
                  ]
                }}>
                  <FutbolXLogo size={120} showText={false} />
                </Animated.View>
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
                <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
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
                      <>
                        <IconSymbol name="arrow.right.circle.fill" size={20} color="white" style={{marginRight: 8}} />
                        <ThemedText style={styles.buttonText}>Giriş Yap</ThemedText>
                      </>
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
                </BlurView>
              </Animated.View>
              
              <View style={styles.footerContainer}>
                <ThemedText style={styles.footerText}>© 2025 FutbolX - Tüm Hakları Saklıdır</ThemedText>
              </View>
            </ScrollView>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  // Ana container
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientBackground: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 24,
  },
  
  // Logo bölümü
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
    fontWeight: '500',
  },
  
  // Form kartı
  formCard: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  
  // Hata mesajı
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  
  // Input alanları
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 60,
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
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Şifremi unuttum
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPassword: {
    fontSize: 15,
    fontWeight: '500',
  },
  
  // Kayıt ol
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 15,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  
  // Footer
  footerContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.7,
  },
});
