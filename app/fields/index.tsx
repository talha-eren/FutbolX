import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { primaryColor, secondaryColor, backgroundColor, textColor } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { getApiUrl, getApiBaseUrl } from '@/services/networkConfig';
import { useAuth } from '@/context/AuthContext';

interface Field {
  _id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  availability: string;
}

export default function FieldsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [baseApiUrl, setBaseApiUrl] = useState<string>('');
  
  // API base URL'yi al
  useEffect(() => {
    const fetchBaseUrl = async () => {
      try {
        const baseUrl = await getApiBaseUrl();
        setBaseApiUrl(baseUrl);
      } catch (err) {
        console.error('Base URL alınamadı:', err);
      }
    };
    
    fetchBaseUrl();
  }, []);
  
  // Halı sahaları getir
  const fetchFields = async () => {
    try {
      setLoading(true);
      
      const apiUrl = await getApiUrl('/fields');
      console.log('Halı saha listesi isteği URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Halı sahalar alınamadı');
      }
      
      const data = await response.json() as Field[];
      setFields(data);
      setFilteredFields(data);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      console.error('Halı saha listeleme hatası:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Sayfa yüklendiğinde halı sahaları getir
  useEffect(() => {
    fetchFields();
  }, []);
  
  // Arama işlemi
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFields(fields);
    } else {
      const filtered = fields.filter(field => 
        field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFields(filtered);
    }
  }, [searchQuery, fields]);
  
  // Yenileme işlemi
  const handleRefresh = () => {
    setRefreshing(true);
    fetchFields();
  };

  // Görsel URL'sini düzelt
  const getImageUrl = (image: string) => {
    if (!image) return 'https://via.placeholder.com/300';
    if (image.startsWith('http')) return image;
    return `${baseApiUrl}${image}`;
  };
  
  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={styles.loadingText}>Halı sahalar yükleniyor...</ThemedText>
      </ThemedView>
    );
  }
  
  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={50} color="#F44336" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchFields}
        >
          <ThemedText style={styles.retryButtonText}>Tekrar Dene</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={primaryColor} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Halı Sahalar</ThemedText>
        </View>
      </View>
      
      {/* Arama Kutusu */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#757575" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Halı saha veya konum ara..."
          placeholderTextColor="#9E9E9E"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#757575" />
          </TouchableOpacity>
        )}
      </View>
      
      {filteredFields.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="football-outline" size={80} color="#BDBDBD" />
          <ThemedText style={styles.emptyText}>
            {searchQuery.length > 0 
              ? `"${searchQuery}" için sonuç bulunamadı`
              : 'Henüz halı saha bulunmuyor'}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredFields}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.fieldCard}
              onPress={() => router.push(`/field/${item._id}` as any)}
            >
              <Image 
                source={{ uri: getImageUrl(item.image) }} 
                style={styles.fieldImage} 
                resizeMode="cover"
              />
              
              <View style={styles.fieldInfo}>
                <ThemedText style={styles.fieldName}>{item.name}</ThemedText>
                
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={16} color={primaryColor} />
                  <ThemedText style={styles.location}>{item.location}</ThemedText>
                </View>
                
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <ThemedText style={styles.rating}>{item.rating.toFixed(1)}</ThemedText>
                </View>
                
                <View style={styles.priceContainer}>
                  <ThemedText style={styles.price}>{item.price} ₺</ThemedText>
                  <ThemedText style={styles.priceUnit}>/ saat</ThemedText>
                </View>
                
                <TouchableOpacity 
                  style={styles.bookButton}
                  onPress={() => router.push(`/field/${item._id}` as any)}
                >
                  <ThemedText style={styles.bookButtonText}>Rezervasyon Yap</ThemedText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: textColor,
  },
  clearButton: {
    padding: 4,
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
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  fieldCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldImage: {
    width: '100%',
    height: 180,
  },
  fieldInfo: {
    padding: 16,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  location: {
    marginLeft: 5,
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
  },
  priceUnit: {
    marginLeft: 5,
    fontSize: 14,
  },
  bookButton: {
    backgroundColor: primaryColor,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
