import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { FutbolXLogo } from '@/components/FutbolXLogo';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const primaryColor = '#4CAF50'; // Ana yeşil renk
  const backgroundColor = colorScheme === 'dark' ? '#121212' : '#FFFFFF';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#333333';
  const inputBackgroundColor = colorScheme === 'dark' ? '#333' : '#F5F5F5';
  const placeholderColor = colorScheme === 'dark' ? '#AAA' : '#999';

  // Kayıt fonksiyonu
  const handleRegister = async () => {
    // Form doğrulama
    if (!fullName || !username || !email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);
    
    try {
      // AuthContext'in register fonksiyonunu kullan
      const success = await register(fullName, username, email, password);
      
      if (success) {
        Alert.alert(
          'Başarılı', 
          'Kaydınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.',
          [{ text: 'Tamam', onPress: () => router.push('/login') }]
        );
      } else {
        Alert.alert('Hata', 'Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Kayıt yapılırken bir hata oluştu.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Giriş sayfasına geçiş
  const goToLogin = () => {
    router.push('/login');
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
          <ThemedText style={styles.title}>FutbolX'e Katılın</ThemedText>
          <ThemedText style={styles.subtitle}>Futbol dünyasında yeni bir macera sizi bekliyor</ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
            <IconSymbol name="person" size={20} color={placeholderColor} />
            <TextInput 
              style={[styles.input, { color: textColor }]}
              placeholder="Ad Soyad"
              placeholderTextColor={placeholderColor}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
            <IconSymbol name="at" size={20} color={placeholderColor} />
            <TextInput 
              style={[styles.input, { color: textColor }]}
              placeholder="Kullanıcı Adı"
              placeholderTextColor={placeholderColor}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
            <IconSymbol name="envelope" size={20} color={placeholderColor} />
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

          <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
            <IconSymbol name="lock" size={20} color={placeholderColor} />
            <TextInput 
              style={[styles.input, { color: textColor }]}
              placeholder="Şifre"
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

          <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
            <IconSymbol name="lock" size={20} color={placeholderColor} />
            <TextInput 
              style={[styles.input, { color: textColor }]}
              placeholder="Şifre Tekrarı"
              placeholderTextColor={placeholderColor}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <IconSymbol 
                name={showConfirmPassword ? "eye.slash" : "eye"} 
                size={20} 
                color={placeholderColor} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: primaryColor, opacity: isLoading || authLoading ? 0.7 : 1 }]}
            onPress={handleRegister}
            disabled={isLoading || authLoading}
          >
            <ThemedText style={styles.buttonText}>
              {isLoading || authLoading ? 'Kaydolunuyor...' : 'Kaydol'}
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>Zaten hesabınız var mı? </ThemedText>
            <TouchableOpacity onPress={goToLogin}>
              <ThemedText style={[styles.loginLink, { color: primaryColor }]}>
                Giriş Yapın
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
              <ThemedText style={styles.socialButtonText}>Facebook ile Kaydol</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#DB4437' }]}
            >
              <ThemedText style={styles.socialButtonText}>Google ile Kaydol</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.termsContainer}>
            <ThemedText style={styles.termsText}>
              Kaydolarak, FutbolX'in {' '}
              <ThemedText style={[styles.termsLink, { color: primaryColor }]}>
                Kullanım Şartları
              </ThemedText>
              {' '} ve {' '}
              <ThemedText style={[styles.termsLink, { color: primaryColor }]}>
                Gizlilik Politikası
              </ThemedText>
              'nı kabul etmiş olursunuz.
            </ThemedText>
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
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
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
  termsContainer: {
    marginTop: 25,
    marginBottom: 10,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
  },
  termsLink: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
