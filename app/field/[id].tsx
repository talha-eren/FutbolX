import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { primaryColor, secondaryColor } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/services/networkConfig';

// API URL
const API_URL = 'http://192.168.1.59:5000/api';

interface Field {
  _id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  availability: string;
  description: string;
  features: string[];
}

export default function FieldDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isLoggedIn, logout } = useAuth();
  
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    
  // Halı saha detaylarını getirme
  useEffect(() => {
    const fetchFieldDetails = async () => {
      try {
        setLoading(true);
        
        const apiUrl = await getApiUrl(`/fields/${id}`);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Halı saha detayları alınamadı');
        }
        
        const data = await response.json() as Field;
        setField(data);
      } catch (err: any) {
        setError(err.message || 'Bir hata oluştu');
        console.error('Halı saha detayı getirme hatası:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchFieldDetails();
    }
  }, [id]);
  
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={styles.loadingText}>Yükleniyor...</ThemedText>
      </ThemedView>
    );
  }
  
  if (error || !field) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={50} color="#F44336" />
        <ThemedText style={styles.errorText}>{error || 'Halı saha bulunamadı'}</ThemedText>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Geri Dön</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      {/* Üst Menü */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={primaryColor} />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Halı Saha Detayı</ThemedText>
        
        <View style={styles.headerRightButtons}>
          {isLoggedIn ? (
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => {
                Alert.alert(
                  'Çıkış Yap',
                  'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
                  [
                    { text: 'İptal', style: 'cancel' },
                    { 
                      text: 'Çıkış Yap', 
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await logout();
                          router.push('/' as any);
                          Alert.alert('Başarılı', 'Başarıyla çıkış yapıldı.');
                        } catch (error) {
                          console.error('Çıkış yaparken hata:', error);
                          Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
                        }
                      } 
                    }
                  ]
                );
              }}
            >
              <Ionicons name="log-out" size={24} color="#F44336" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => router.push('/login' as any)}
            >
              <Ionicons name="log-in" size={24} color={primaryColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Halı Saha Resmi */}
        <Image 
          source={{ uri: field.image.startsWith('http') ? field.image : `${API_URL}${field.image}` }} 
          style={styles.image} 
          resizeMode="cover"
        />
        
        {/* Halı Saha Bilgileri */}
        <View style={styles.infoContainer}>
          <ThemedText style={styles.name}>{field.name}</ThemedText>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={18} color={primaryColor} />
            <ThemedText style={styles.location}>{field.location}</ThemedText>
          </View>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <ThemedText style={styles.rating}>{field.rating.toFixed(1)}</ThemedText>
          </View>
          
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>{field.price} ₺</ThemedText>
            <ThemedText style={styles.priceUnit}>/ saat</ThemedText>
          </View>
          
          <ThemedText style={styles.description}>{field.description}</ThemedText>
          
          {/* Özellikler */}
          {field.features.length > 0 && (
            <View style={styles.featuresContainer}>
              <ThemedText style={styles.featuresTitle}>Özellikler</ThemedText>
              <View style={styles.featuresList}>
                {field.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <MaterialIcons name="check-circle" size={16} color={primaryColor} />
                    <ThemedText style={styles.featureText}>{feature}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Harita Bölümü */}
          <View style={styles.mapContainer}>
            <ThemedText style={styles.mapTitle}>Konum</ThemedText>
            <View style={styles.map}>
              <ThemedText style={styles.mapPlaceholder}>
                Bu halı sahanın konum bilgisi burada görüntülenecektir.
              </ThemedText>
            </View>
          </View>
          
          {/* İletişim Bilgileri */}
          <View style={styles.contactContainer}>
            <ThemedText style={styles.contactTitle}>İletişim</ThemedText>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <ThemedText style={styles.contactButtonText}>Telefon ile Ara</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
              <ThemedText style={styles.contactButtonText}>Mesaj Gönder</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    marginLeft: 5,
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: primaryColor,
  },
  priceUnit: {
    marginLeft: 5,
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 5,
    fontSize: 14,
  },
  mapContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  map: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  mapPlaceholder: {
    textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
  },
  contactContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  contactButtonText: {
    marginLeft: 10,
    fontSize: 14,
  },
});
