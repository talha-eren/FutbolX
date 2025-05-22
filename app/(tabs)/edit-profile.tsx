import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { userService } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const [userData, setUserData] = useState({
    name: '',
    username: '',
    email: '',
    bio: '',
    location: '',
    favoriteTeams: [] as string[],
    level: '',
    position: '',
    footPreference: '',
    phone: '',
    stats: {
      matches: 0,
      goals: 0,
      assists: 0,
      playHours: 0,
      rating: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshUserData } = useAuth();
  const router = useRouter();
  
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getProfile();
      setUserData({
        name: data.name || '',
        username: data.username || '',
        email: data.email || '',
        bio: data.bio || '',
        location: data.location || '',
        favoriteTeams: data.favoriteTeams || [],
        level: data.level || '',
        position: data.position || '',
        footPreference: data.footPreference || '',
        phone: data.phone || '',
        stats: data.stats || {
          matches: 0,
          goals: 0,
          assists: 0,
          playHours: 0,
          rating: 0,
        },
      });
    } catch (err) {
      console.error('Profil bilgileri yüklenemedi:', err);
      setError('Profil bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      Alert.alert('Hata', 'Profil bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await userService.updateProfile(userData);
      await refreshUserData();
      
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (err) {
      setError('Profil güncellenirken bir hata oluştu.');
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const updateField = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText style={styles.title}>Profil Düzenle</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.formContainer}>
            <ThemedText style={styles.sectionTitle}>Profil Bilgileri</ThemedText>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Ad Soyad</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder="Adınız ve soyadınız"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Kullanıcı Adı</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.username}
                onChangeText={(text) => updateField('username', text)}
                placeholder="Kullanıcı adınız"
                placeholderTextColor="#999"
                editable={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>E-posta</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.email}
                onChangeText={(text) => updateField('email', text)}
                placeholder="E-posta adresiniz"
                placeholderTextColor="#999"
                keyboardType="email-address"
                editable={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Konum</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.location}
                onChangeText={(text) => updateField('location', text)}
                placeholder="İlçe, Şehir"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Telefon</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder="+90 5XX XXX XX XX"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Seviye</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.level}
                onChangeText={(text) => updateField('level', text)}
                placeholder="Amatör, Orta, İleri"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Pozisyon</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.position}
                onChangeText={(text) => updateField('position', text)}
                placeholder="Kaleci, Defans, Orta Saha, Forvet"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Ayak Tercihi</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.footPreference}
                onChangeText={(text) => updateField('footPreference', text)}
                placeholder="Sağ, Sol, Her ikisi"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Hakkında</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={userData.bio}
                onChangeText={(text) => updateField('bio', text)}
                placeholder="Kendiniz hakkında kısa bilgi"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <ThemedText style={styles.sectionTitle}>İstatistikler</ThemedText>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Toplam Maç Sayısı</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.stats?.matches?.toString() || "0"}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setUserData(prev => ({
                    ...prev,
                    stats: {
                      ...(prev.stats || {}),
                      matches: num
                    }
                  }));
                }}
                placeholder="Maç sayısı"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Gol Sayısı</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.stats?.goals?.toString() || "0"}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setUserData(prev => ({
                    ...prev,
                    stats: {
                      ...(prev.stats || {}),
                      goals: num
                    }
                  }));
                }}
                placeholder="Gol sayısı"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Asist Sayısı</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.stats?.assists?.toString() || "0"}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setUserData(prev => ({
                    ...prev,
                    stats: {
                      ...(prev.stats || {}),
                      assists: num
                    }
                  }));
                }}
                placeholder="Asist sayısı"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Oynadığın Saat</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.stats?.playHours?.toString() || "0"}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setUserData(prev => ({
                    ...prev,
                    stats: {
                      ...(prev.stats || {}),
                      playHours: num
                    }
                  }));
                }}
                placeholder="Oynama saati"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Puanın</ThemedText>
              <TextInput
                style={styles.input}
                value={userData.stats?.rating?.toString() || "0"}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setUserData(prev => ({
                    ...prev,
                    stats: {
                      ...(prev.stats || {}),
                      rating: num
                    }
                  }));
                }}
                placeholder="Puan (0-100)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            
            <TouchableOpacity
              style={[styles.formSaveButton, { backgroundColor: tintColor, opacity: loading ? 0.6 : 1 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText style={styles.saveButtonText}>PROFİLİ KAYDET</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSaveButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfWidth: {
    width: '48%',
  },
}); 