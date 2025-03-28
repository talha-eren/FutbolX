import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FutbolXLogo } from '@/components/FutbolXLogo';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const primaryColor = '#4CAF50'; // Ana yeşil renk
  const backgroundColor = colorScheme === 'dark' ? '#121212' : '#FFFFFF';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#333333';
  const inputBackgroundColor = colorScheme === 'dark' ? '#333' : '#F5F5F5';
  const placeholderColor = colorScheme === 'dark' ? '#AAA' : '#999';

  // Giriş fonksiyonu
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // Başarılı giriş sonrası ana sayfaya yönlendir
        router.replace('/(tabs)');
      } else {
        Alert.alert('Hata', 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kayıt sayfasına geçiş
  const goToRegister = () => {
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={[styles.container, { backgroundColor }]} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <FutbolXLogo size={150} showText={false} />
          <ThemedText style={styles.title}>FutbolX</ThemedText>
          <ThemedText style={styles.subtitle}>Futbol tutkunlarını buluşturan platform</ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
            <IconSymbol name="envelope" size={20} color={placeholderColor} />
            <TextInput 
              style={[styles.input, { color: textColor }]}
              placeholder="E-posta adresiniz"
              placeholderTextColor={placeholderColor}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
            <IconSymbol name="lock" size={20} color={placeholderColor} />
            <TextInput 
              style={[styles.input, { color: textColor }]}
              placeholder="Şifreniz"
              placeholderTextColor={placeholderColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <IconSymbol 
                name={showPassword ? "eye.slash" : "eye"} 
                size={20} 
                color={placeholderColor} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: primaryColor, opacity: isLoading || authLoading ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={isLoading || authLoading}
          >
            <ThemedText style={styles.buttonText}>
              {isLoading || authLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity>
            <ThemedText style={styles.forgotPassword}>Şifremi Unuttum</ThemedText>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <ThemedText style={styles.registerText}>Hesabınız yok mu? </ThemedText>
            <TouchableOpacity onPress={goToRegister}>
              <ThemedText style={[styles.registerLink, { color: primaryColor }]}>
                Hemen Kaydolun
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.separator}>
            <View style={[styles.separatorLine, { backgroundColor: placeholderColor }]} />
            <ThemedText style={styles.separatorText}>veya</ThemedText>
            <View style={[styles.separatorLine, { backgroundColor: placeholderColor }]} />
          </View>

          <View style={styles.socialLoginContainer}>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#4267B2' }]}
            >
              <ThemedText style={styles.socialButtonText}>Facebook ile Giriş</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#DB4437' }]}
            >
              <ThemedText style={styles.socialButtonText}>Google ile Giriş</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 55,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    opacity: 0.8,
  },
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
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
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
  socialLoginContainer: {
    gap: 15,
  },
  socialButton: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  socialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
