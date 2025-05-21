import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Keyboard,
  Animated,
  Dimensions
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FutbolXLogo } from '@/components/FutbolXLogo';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading: authLoading, error: authError } = useAuth();
  
  // Form state'leri
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  
  // Animasyon state'leri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Renk teması
  const primaryColor = '#1976D2'; // Ana mavi renk
  const secondaryColor = '#0D47A1'; // Koyu mavi
  const accentColor = '#42A5F5'; // Açık mavi
  const backgroundColor = '#F5F7FA';
  const cardColor = '#FFFFFF';
  const textColor = '#333333';
  const inputBackgroundColor = '#F5F5F5';
  const placeholderColor = '#999';
  const errorColor = '#FF5252';
  
  // Hata durumunda sallama animasyonu
  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start();
  };
  
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
    
    // Auth hatası varsa kayıt hatasına ayarla
    if (authError) {
      setRegisterError(authError);
    }
  }, [fadeAnim, slideAnim, formOpacity, authError]);
  
  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  const handleRegister = async () => {
    // Klavyeyi kapat
    Keyboard.dismiss();
    
    // Form doğrulama
    if (!username.trim()) {
      setRegisterError('Kullanıcı adı gereklidir');
      shakeAnimation();
      return;
    }
    
    if (!email.trim()) {
      setRegisterError('E-posta adresi gereklidir');
      shakeAnimation();
      return;
    }
    
    if (!validateEmail(email)) {
      setRegisterError('Geçerli bir e-posta adresi girin');
      shakeAnimation();
      return;
    }
    
    if (!password.trim()) {
      setRegisterError('Şifre gereklidir');
      shakeAnimation();
      return;
    }
    
    if (password.length < 6) {
      setRegisterError('Şifre en az 6 karakter olmalıdır');
      shakeAnimation();
      return;
    }
    
    if (password !== confirmPassword) {
      setRegisterError('Şifreler eşleşmiyor');
      shakeAnimation();
      return;
    }
    
    setIsLoading(true);
    setRegisterError(''); // Önceki hataları temizle
    
    try {
      console.log('Kayıt isteği gönderiliyor:', { username, email, password: '***' });
      
      // Kayıt işlemi
      await register(
        username,
        username,
        email,
        password,
        {
          location: '',
          bio: ''
        }
      );
      
      console.log('Kayıt başarılı, giriş sayfasına yönlendiriliyor');
      
      // Giriş sayfasına yönlendir
      router.replace('/login');
      
    } catch (error: any) {
      console.error('Kayıt yaparken hata:', error.message || error);
      
      let errorMessage = 'Kayıt başarısız';
      
      if (error.message) {
        if (error.message.includes('Kullanıcı adı zaten alınmış')) {
          errorMessage = 'Bu kullanıcı adı zaten kullanılıyor';
        } else if (error.message.includes('E-posta zaten alınmış')) {
          errorMessage = 'Bu e-posta adresi zaten kullanılıyor';
        } else if (error.message.includes('Sunucu')) {
          errorMessage = 'Sunucuya bağlanırken bir sorun oluştu';
        } else {
          errorMessage = error.message;
        }
      }
      
      setRegisterError(errorMessage);
      shakeAnimation();
    } finally {
      setIsLoading(false);
    }
  };
  
  const goToLogin = () => {
    // Giriş sayfasına geçerken animasyon
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      router.replace('/login');
    });
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#E1F5FE', '#B3E5FC', '#E3F2FD']}
        style={styles.gradientBackground}
      >
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <ScrollView 
            contentContainerStyle={styles.container} 
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <FutbolXLogo size={100} showText={false} />
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
              <ThemedText style={styles.formTitle}>Yeni Hesap Oluşturun</ThemedText>
              
              {/* Hata mesajı */}
              {registerError ? (
                <Animated.View 
                  style={[styles.errorContainer, {
                    transform: [{ translateX: shakeAnim }]
                  }]}
                >
                  <MaterialIcons name="error-outline" size={20} color={errorColor} />
                  <ThemedText style={styles.errorText}>{registerError}</ThemedText>
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
              
              {/* E-posta input */}
              <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
                <IconSymbol name="envelope" size={20} color={primaryColor} />
                <TextInput 
                  style={[styles.input, { color: textColor }]}
                  placeholder="E-posta Adresi"
                  placeholderTextColor={placeholderColor}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
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
              
              {/* Şifre onay input */}
              <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
                <IconSymbol name="lock" size={20} color={primaryColor} />
                <TextInput 
                  style={[styles.input, { color: textColor }]}
                  placeholder="Şifrenizi Onaylayın"
                  placeholderTextColor={placeholderColor}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 5 }}>
                  <IconSymbol 
                    name={showConfirmPassword ? "eye.slash" : "eye"} 
                    size={20} 
                    color={primaryColor} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Kayıt butonu */}
              <TouchableOpacity 
                style={[styles.button, { 
                  backgroundColor: isLoading || authLoading ? secondaryColor : primaryColor,
                  shadowColor: primaryColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8
                }]}
                onPress={handleRegister}
                disabled={isLoading || authLoading}
              >
                {isLoading || authLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <ThemedText style={styles.buttonText}>Kaydol</ThemedText>
                )}
              </TouchableOpacity>
              
              {/* Giriş yap */}
              <View style={styles.loginContainer}>
                <ThemedText style={styles.loginText}>Zaten hesabınız var mı? </ThemedText>
                <TouchableOpacity onPress={goToLogin}>
                  <ThemedText style={[styles.loginLink, { color: primaryColor }]}>
                    Giriş Yapın
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
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
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
  
  // Giriş yap
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
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
