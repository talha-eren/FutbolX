import React, { useState, useRef } from 'react';
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
  Dimensions
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FutbolXLogo } from '@/components/FutbolXLogo';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  // Temel state ve hooklar
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  // Form state'leri
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Email girişi, 2: Kod doğrulama, 3: Yeni şifre
  const [resetCodeFromServer, setResetCodeFromServer] = useState('');
  
  // Animasyon state'leri
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
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
  
  // Şifre sıfırlama kodu isteme
  const handleRequestResetCode = async () => {
    if (!email.trim()) {
      setError('Email adresi gereklidir');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Emülatörde localhost yerine 10.0.2.2 kullanılmalı
      const apiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/auth/forgot-password' : 'http://localhost:5000/api/auth/forgot-password';
      console.log('Şifre sıfırlama isteği gönderiliyor:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Şifre sıfırlama isteği başarısız');
      }
      
      // Geliştirme için, sunucudan gelen kodu saklıyoruz
      if (data.resetCode) {
        setResetCodeFromServer(data.resetCode);
        console.log('Sıfırlama kodu:', data.resetCode);
      }
      
      // Adım 2'ye geç
      animateToNextStep(2);
      
    } catch (error: any) {
      setError(error.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Şifre sıfırlama
  const handleResetPassword = async () => {
    if (!resetCode.trim()) {
      setError('Sıfırlama kodu gereklidir');
      return;
    }
    
    if (!newPassword.trim()) {
      setError('Yeni şifre gereklidir');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Emülatörde localhost yerine 10.0.2.2 kullanılmalı
      const apiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/auth/reset-password' : 'http://localhost:5000/api/auth/reset-password';
      console.log('Şifre sıfırlama isteği gönderiliyor:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          resetCode, 
          newPassword 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Şifre sıfırlama başarısız');
      }
      
      // Başarılı mesajı göster
      Alert.alert(
        'Başarılı',
        'Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.',
        [
          { 
            text: 'Giriş Yap', 
            onPress: () => router.replace('/login') 
          }
        ]
      );
      
    } catch (error: any) {
      setError(error.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Adımlar arası animasyon
  const animateToNextStep = (nextStep: number) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true
        })
      ]),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 0,
        useNativeDriver: true
      })
    ]).start(() => {
      setStep(nextStep);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    });
  };
  
  // Giriş sayfasına dön
  const goToLogin = () => {
    router.replace('/login');
  };
  
  return (
    <LinearGradient
      colors={isDark ? ['#1E1E1E', '#121212'] : ['#F5F5F5', '#FFFFFF']}
      style={styles.gradientBackground}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo ve Başlık */}
          <View style={styles.logoContainer}>
            <FutbolXLogo size={80} />
            <ThemedText style={styles.title}>FutbolX</ThemedText>
            <ThemedText style={styles.subtitle}>
              {step === 1 ? 'Şifrenizi Sıfırlayın' : 
               step === 2 ? 'Doğrulama Kodu' : 'Yeni Şifre Oluşturun'}
            </ThemedText>
          </View>
          
          {/* Form Kartı */}
          <Animated.View 
            style={[
              styles.formCard, 
              { 
                backgroundColor: cardColor,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Hata mesajı */}
            {error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={20} color={errorColor} />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : null}
            
            {/* Adım 1: Email Girişi */}
            {step === 1 && (
              <>
                <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
                  <MaterialIcons name="email" size={20} color={placeholderColor} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder="Email Adresiniz"
                    placeholderTextColor={placeholderColor}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: primaryColor }]}
                  onPress={handleRequestResetCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <ThemedText style={styles.buttonText}>Sıfırlama Kodu Gönder</ThemedText>
                  )}
                </TouchableOpacity>
              </>
            )}
            
            {/* Adım 2: Kod Doğrulama */}
            {step === 2 && (
              <>
                <ThemedText style={styles.infoText}>
                  Email adresinize bir doğrulama kodu gönderdik. Lütfen bu kodu aşağıya girin.
                </ThemedText>
                
                <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
                  <MaterialIcons name="vpn-key" size={20} color={placeholderColor} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder="Doğrulama Kodu"
                    placeholderTextColor={placeholderColor}
                    value={resetCode}
                    onChangeText={setResetCode}
                    keyboardType="number-pad"
                  />
                </View>
                
                {/* Geliştirme için otomatik kod doldurma */}
                {resetCodeFromServer && (
                  <TouchableOpacity 
                    onPress={() => setResetCode(resetCodeFromServer)}
                    style={styles.devHelper}
                  >
                    <ThemedText style={{ color: primaryColor, fontSize: 12 }}>
                      (Geliştirme: Kodu Otomatik Doldur)
                    </ThemedText>
                  </TouchableOpacity>
                )}
                
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.secondaryButton]}
                    onPress={() => animateToNextStep(1)}
                  >
                    <ThemedText style={[styles.secondaryButtonText, { color: primaryColor }]}>
                      Geri
                    </ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: primaryColor, flex: 1 }]}
                    onPress={() => animateToNextStep(3)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <ThemedText style={styles.buttonText}>Devam Et</ThemedText>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
            
            {/* Adım 3: Yeni Şifre */}
            {step === 3 && (
              <>
                <ThemedText style={styles.infoText}>
                  Lütfen yeni şifrenizi belirleyin.
                </ThemedText>
                
                <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
                  <MaterialIcons name="lock" size={20} color={placeholderColor} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder="Yeni Şifre"
                    placeholderTextColor={placeholderColor}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 5 }}>
                    <MaterialIcons 
                      name={showPassword ? "visibility-off" : "visibility"} 
                      size={20} 
                      color={placeholderColor} 
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.secondaryButton]}
                    onPress={() => animateToNextStep(2)}
                  >
                    <ThemedText style={[styles.secondaryButtonText, { color: primaryColor }]}>
                      Geri
                    </ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: primaryColor, flex: 1 }]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <ThemedText style={styles.buttonText}>Şifremi Sıfırla</ThemedText>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
            
            {/* Giriş Sayfasına Dön */}
            <TouchableOpacity onPress={goToLogin} style={styles.backToLoginContainer}>
              <MaterialIcons name="arrow-back" size={16} color={primaryColor} />
              <ThemedText style={[styles.backToLogin, { color: primaryColor }]}>
                Giriş Sayfasına Dön
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
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
    color: '#FF5252',
  },
  
  // Bilgi metni
  infoText: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
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
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Giriş sayfasına dön
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  backToLogin: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  
  // Geliştirme yardımcısı
  devHelper: {
    alignItems: 'center',
    marginBottom: 10,
  }
});
